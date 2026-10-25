export const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—');
export function fmtDuration(min) {
  if (min == null) return '—';
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m}m`;
}
export function fmtAgo(iso, now = Date.now()) {
  if (!iso) return '—';
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
export const pad = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0');
export function splitHMS(totalSec) {
  const t = Math.max(0, Math.floor(totalSec));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}
export const clock = (totalSec) => { const { d, h, m, s } = splitHMS(totalSec); const hh = d * 24 + h; return hh ? `${pad(hh)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`; };
