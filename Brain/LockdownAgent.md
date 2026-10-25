# ExamRobo Windows Lockdown Agent — Design (Phase 2, not built)

Status: **design only.** The build is T-960 and is blocked on the decisions in
`Brain/Issue.md`. Phase 1 of the product stays website-only (R-034, Denied
Rules).

## 1. Why this exists

The browser cannot do three things that an exam room needs:

| Gap | Why the browser cannot close it |
|---|---|
| The OS screenshot / screen capture | `PrintScreen`, `Win+Shift+S`, the Xbox Game Bar, OBS and a phone camera are outside the page. A page can only ask the user not to press the key. |
| The second device | A second laptop on another network, a phone, a capture card — none of it is visible to the page. The page sees one socket; the account can be signed in somewhere else and the page cannot tell. |
| The operating system itself | The student can open Task Manager, kill the browser, unplug the network, or run the whole exam from a virtual machine. |

The Phase-1 web hardening (R-030) covers the *accidental* case and moves every
decision to the server. The agent covers the *managed exam machine* case: it
is a small supervised Windows program that the exam client launches, which
enforces the controls locally and reports what it saw.

**The agent never grades, never submits and never decides.** It enforces
locally and reports. The server's policy engine still decides the outcome, so
an agent that is missing, crashed or tampered with changes what the *proctor*
sees, not what the server believes.

## 2. What it is

- A single Windows executable, `ExamRoboAgent.exe`, ~1–2 MB, no runtime
  dependency (C++ or Rust; a .NET runtime is not acceptable on a locked exam
  image).
- Runs as a **per-user session agent** (not a service — a service cannot
  interact with the user's desktop). Started by the exam client, it lives
  until the exam ends and then exits.
- Started with a one-time session token: `ExamRoboAgent.exe --session <token>
  --api <base-url> --policy <policy-id>`.
- Holds a per-machine key pair. The private key never leaves the machine; the
  public key is registered with the server when the machine is enrolled.

## 3. The control surface

Each control is listed with the Windows mechanism, the failure mode and the
event it would report. The exact registry keys and API names must be
confirmed against the target Windows build during implementation — the
mechanism column is the contract, the key names are an implementation detail.

| # | Control | Mechanism | Failure mode | Event |
|---|---|---|---|---|
| C1 | Block the screenshot key | Low-level keyboard hook (`WH_KEYBOARD_LL`) swallowing `VK_SNAPSHOT`, `Win+Shift+S`, `Win+Ctrl+Shift+S` | A determined user with a hardware hook bypasses it | `agent_blocked` |
| C2 | Kill capture tools | `Win32_ProcessStartTrace` → terminate Snipping Tool, Xbox Game Bar, OBS, ShareX, Process Explorer | The tool can be started and killed in the same tick | `agent_blocked` |
| C3 | Task Manager | `DisableTaskMgr` policy + terminating `taskmgr.exe` and `ProcessHacker`/`SystemInformer` | `Ctrl+Alt+Del` still reaches the shell; the agent can hide the shell but not the SAS screen | `agent_blocked` |
| C4 | Clipboard | Clipboard policy (history + content) disabled for the session, plus per-window clipboard ownership | Clipboard history of another app may survive the policy | `agent_blocked` |
| C5 | Single display | `QueryDisplayConfig` → enumerate the active display paths; block the projector hotkey (`Win+P`) and refuse a second path | A hardware capture card or a phone is invisible to the OS | `display_change` (existing kind) |
| C6 | Window lockdown | The agent owns a topmost, borderless, always-on-top window over the exam shell, re-asserting itself if it loses focus | A full-screen game or a video can sit on top of it | `agent_violation` |
| C7 | Virtual machine | `Win32_ComputerSystem.Manufacturer` / `Model` against the known hypervisor list | A hostile VM hides its manufacturer string | `agent_violation` |
| C8 | Remote session | `WTSEnumerateSessions` → an active RDP/console-switch session means the student is not at the machine | A second local user session on the same box is allowed by default | `agent_violation` |
| C9 | USB / HID | Enumerate `Win32_PnPEntity` for keyboard, mouse and HID devices appearing after the exam started | A phone over USB without HID is not detected | `agent_violation` (log tier) |
| C10 | Network pinning | WFP filter: only the exam API and the DNS resolver are reachable | Needs a callout driver for a strict allow-list; a usermode proxy is the cheap version | `agent_violation` |
| C11 | Process inventory | A signed allow-list of the processes that may run during the exam; a new process is terminated and reported | A process that is already running before the exam is not caught | `agent_violation` |
| C12 | Heartbeat | The agent pings the server every 5 s; 15 s of silence is a dead agent | A suspended process cannot be distinguished from a crashed one | `agent_terminated` |

**Mandatory vs best-effort.** Each control is declared `mandatory` or
`best_effort` in the policy. A mandatory control that cannot be established
(agent missing, C1/C3/C4 unavailable) blocks the exam from starting. A
best-effort control that fails only produces an event. This distinction is
what makes the agent usable on a mixed fleet of lab machines.

## 4. Architecture

```
  browser (web/src)                agent (ExamRoboAgent.exe)        server
  ────────────────                 ──────────────────────         ──────
  Exam.jsx
    │ launches with a one-time token
    ├──────────────────────────────▶  starts, applies the policy
    │                                    │  named pipe IPC
    │  ◀── agent status (is it there?) ─┤
    │                                    │
    │                                    └──── WebSocket /ws?role=agent ──▶  integrity policy
                                         heartbeats, events, commands        (the only decider)
```

- **Browser → agent:** a named pipe `\\.\pipe\examrobo-<session>`. The browser
  only asks two things: "are you there?" and "what did you just block?". The
  pipe is ACL-restricted to the logged-in user and the session token is
  required on every message.
- **Agent → server:** its **own** WebSocket, `/ws?token=<session>&role=agent`.
  It is separate from the browser socket on purpose: the agent keeps reporting
  when the browser is closed or crashed, which is exactly the case the proctor
  needs to see.
- **Server → agent:** commands over the same socket — `status`, `heartbeat`,
  `enforce <control>`, `end_session`.

## 5. Handshake and attestation

1. The student signs in → the API returns the session token.
2. The browser starts the agent with that token.
3. The agent connects to `/ws?role=agent` and sends
   `{ type: 'agent_hello', machine_id, agent_version, controls: [...] }`.
4. The server replies with a random nonce.
5. The agent signs the nonce with the machine key and replies
   `{ type: 'agent_attest', signature }`.
6. The server verifies the signature against the enrolled public key, marks
   the session `agent_present: true` and records the control list.

If the handshake does not arrive within 30 s of the exam start and the policy
declares the agent mandatory, the server raises `agent_missing` — a Tier-A
lock under the Phase-2 policy.

**The attestation proves which machine ran the agent, not that the agent was
unmodified.** A student with admin rights on the exam machine can replace the
binary. The mitigation is not technical: the exam machine image is managed by
the exam administrator, the student account is a standard user, and the agent's
job is to make casual cheating expensive, not to defeat an attacker with
administrative rights on the machine.

## 6. New policy kinds (Phase 2)

The Phase-1 registry in `server/services/integrity.js` is not changed by this
document. When the agent is built, these kinds are added — and the database
CHECK constraint is widened by a new migration, as always:

| Kind | Tier | Meaning |
|---|---|---|
| `agent_missing` | A | The mandatory agent did not attach |
| `agent_terminated` | A | The agent died mid-exam |
| `capture_tool` | B | A screen-capture tool was started and killed |
| `task_manager` | B | The task manager was started and killed |
| `vm_detected` | A | The exam is running inside a virtual machine |
| `remote_session` | A | An RDP session was attached to the machine |
| `usb_device` | C | A new HID device appeared |
| `network_blocked` | C | A connection to a non-allowed destination was refused |

## 7. Failure handling

| Situation | Behaviour |
|---|---|
| The agent never starts | The browser shows "the exam cannot start on this machine" and does not call `/exam/start`. The server sees no session. |
| The agent is killed mid-exam | The heartbeat stops; after 15 s the server raises `agent_terminated` (Tier A) and the exam is locked. |
| The agent loses the named pipe but keeps the socket | The browser shows a degraded banner; the server is unaffected. |
| The server is unreachable | The agent keeps enforcing locally and buffers its events (a bounded ring buffer, 1000 events) and replays them on reconnect. |
| The machine is locked or the session is signed out | The agent exits with the session. |

## 8. What it still does not solve

- A phone filming the screen.
- A second device on a different network with the same account — the server's
  `second_session` signal catches the sign-in, but the exam content on the
  second device cannot be recalled.
- A modified browser that never tells the server what it is doing. (The server
  decides, so the *strike* is the same — but a student who patches the client
  can avoid seeing the warning.)
- A hostile administrator, a kernel driver, or a machine that is not the
  managed one. The threat model is "a standard user on a managed exam
  machine".

## 9. Build plan

| Step | Deliverable | Size |
|---|---|---|
| 1 | The skeleton: a process that starts, holds the pipe, connects the socket, heartbeats, and exits with the session | 1 day |
| 2 | The server side: the `role=agent` socket, the handshake, the attestation, the `agent_present` flag | 1 day |
| 3 | C1 + C3 + C4 (screenshot, task manager, clipboard) — the three that matter most | 2 days |
| 4 | C5 + C7 + C8 (display, VM, remote) — detection only, no new enforcement | 2 days |
| 5 | C2 + C6 + C11 (process kill, window lockdown, process inventory) | 3 days |
| 6 | C10 (network pinning) — needs a WFP callout driver, so it is its own project | 3–5 days |
| 7 | The Phase-2 policy kinds, the migration, the proctor UI, the end-to-end tests | 2 days |

The agent must be signed and enrolled. The enrollment tooling (generate a
machine key, register it, ship the binary) is part of step 1, because without
it nothing can be attested.

## 10. Decisions needed before the build

1. Which controls are `mandatory` and which are `best_effort` per exam event?
   (A policy field on `exam_events`.)
2. What happens when a mandatory control is unavailable: refuse to start, or
   start and flag?
3. Who enrolls the exam machines, and how is the agent updated — a managed
   image rebuild, or an auto-updater?
4. Is the agent acceptable to the exam centre's IT policy? (A process that
   terminates other processes needs a reason.)
5. Does the agent have to be invisible to the student, or is a visible "Exam
   Mode" indicator acceptable? (A visible indicator is much better for the
   candidate's own sense of fairness.)
6. C10 (network pinning) is a driver: is it in scope at all, or is a plain
   "the browser can only reach the exam" assumption enough?
