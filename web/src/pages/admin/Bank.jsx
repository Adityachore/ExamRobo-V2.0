import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Database, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { Badge, Banner, Button, Card, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Select, Skeleton, Tabs, Textarea, useToast, cx } from '../../components/ui.jsx';

const emptyVariant = { stem: '', options: ['', '', '', ''], correct: null };

// The colour of a difficulty is a display concern, so it lives here. The
// levels themselves come from the API (the server owns the scale).
const DIFFICULTY_TONE = { 1: 'ok', 2: 'ok', 3: 'blue', 4: 'warn', 5: 'danger' };

function VariantForm({ open, onClose, title, description, category, setCategory, categories, onSubmit }) {
  const [v, setV] = useState(emptyVariant);
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const reset = () => { setV(emptyVariant); setErrs({}); setErr(''); };

  const submit = async (e) => {
    e.preventDefault();
    const x = {};
    if (setCategory && !category) x.category = 'Choose a category.';
    if (!v.stem.trim()) x.stem = 'Question text is required.';
    if (v.options.some((o) => !o.trim())) x.options = 'All four options are required.';
    if (v.correct == null) x.correct = 'Mark exactly one correct option.';
    setErrs(x); setErr('');
    if (Object.keys(x).length) return;
    setBusy(true);
    try { await onSubmit(v); reset(); onClose(); } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={() => { onClose(); }} title={title} description={description} size="lg">
      <form onSubmit={submit} noValidate className="space-y-4">
        {err && <Banner tone="error">{err}</Banner>}
        {setCategory && <Field label="Category" error={errs.category}>{(p) => <Select {...p} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Select category…</option>{categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}</Select>}</Field>}
        <Field label="Question" error={errs.stem} hint="Each variant is self-contained: it needs its own full question text and options.">{(p) => <Textarea {...p} rows={2} value={v.stem} onChange={(e) => setV({ ...v, stem: e.target.value })} />}</Field>
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium">Options — select the correct one</legend>
          <div className="space-y-2">
            {v.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" aria-label={`Option ${'ABCD'[i]} is correct`} checked={v.correct === i} onChange={() => setV({ ...v, correct: i })} className="h-4 w-4 accent-blue-600" />
                <span className="w-4 text-sm text-muted" aria-hidden>{'ABCD'[i]}</span>
                <Input aria-label={`Option ${'ABCD'[i]}`} value={o} onChange={(e) => setV({ ...v, options: v.options.map((x, j) => (j === i ? e.target.value : x)) })} />
              </div>
            ))}
          </div>
          {(errs.options || errs.correct) && <p role="alert" className="mt-2 text-xs text-danger">{errs.options || errs.correct}</p>}
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="secondary" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button type="submit" loading={busy}>{setCategory ? 'Add question' : 'Add variant'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// The competency of a question: the skill it measures, how hard it is and the
// domain (the category) it belongs to. The question text itself never changes
// - this is the only way a question is edited after it was created.
function CompetencyForm({ question, skills, difficulties, categories, onClose, onSubmit }) {
  const [skill, setSkill] = useState(question?.skill?.code || '');
  const [difficulty, setDifficulty] = useState(String(question?.difficulty ?? 3));
  const [category, setCategory] = useState(question?.category || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await onSubmit({ skill: skill || null, difficulty: Number(difficulty), category: category || null });
      onClose();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!question} onClose={onClose} title="Tag competency" description="The skill this question measures, how hard it is and the domain it belongs to. Papers keep their own copy, so re-tagging never rewrites an exam that already ran.">
      <form onSubmit={submit} noValidate className="space-y-4">
        {err && <Banner tone="error">{err}</Banner>}
        <Field label="Skill">{(p) => (
          <Select {...p} value={skill} onChange={(e) => setSkill(e.target.value)}>
            <option value="">Not tagged</option>
            {(skills || []).map((g) => (
              <optgroup key={g.category} label={g.category}>
                {g.items.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </optgroup>
            ))}
          </Select>
        )}</Field>
        <Field label="Difficulty" hint="1 is foundation, 5 is expert.">{(p) => (
          <Select {...p} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {(difficulties || []).map((d) => <option key={d.level} value={d.level}>{d.level} — {d.label}</option>)}
          </Select>
        )}</Field>
        <Field label="Domain (category)" hint="The technical domain the question belongs to. Students pick their domain in the exam.">{(p) => (
          <Select {...p} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Not set</option>
            {(categories || []).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </Select>
        )}</Field>
        <div className="flex justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function QuestionCard({ q, open, onToggle, onAddVariant, onDeleteVariant, onTag }) {
  const n = q.variants.length;
  return (
    <Card>
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        {open ? <ChevronDown size={16} className="mt-0.5 text-muted" aria-hidden /> : <ChevronRight size={16} className="mt-0.5 text-muted" aria-hidden />}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{q.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone="blue">{q.category}</Badge>
            {q.skill
              ? <Badge tone="neutral" icon={<Tag size={11} />}>{q.skill.name}</Badge>
              : <Badge tone="warn">Not tagged</Badge>}
            <Badge tone={DIFFICULTY_TONE[q.difficulty] || 'neutral'}>{q.difficulty_label}</Badge>
            <span className="tnum text-xs text-muted">{n} {n === 1 ? 'variant' : 'variants'}</span>
            {n < 3 && <Badge tone="warn">Add variants — only {n} of 3 required</Badge>}
          </div>
        </div>
      </button>
      {open && (
        <div className="space-y-3 border-t border-line px-4 py-3">
          {n < 3 && <Banner tone="warn" live={false}>With fewer than 3 variants, students may see the same wording as each other, which makes sharing answers easier. Add self-contained variants to reduce that risk.</Banner>}
          {q.variants.map((v, i) => (
            <div key={v.id} className="rounded-lg border border-line p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium"><span className="text-muted">Variant {i + 1} · </span>{v.stem}</p>
                <Button variant="ghost" size="sm" aria-label={`Delete variant ${i + 1}`} onClick={() => onDeleteVariant(q, v, i)}><Trash2 size={14} />Delete</Button>
              </div>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {v.options.map((o, k) => (
                  <li key={k} className={cx('flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm', k === v.correct ? 'border-green-200 bg-ok-soft' : 'border-line')}>
                    <span className="text-muted">{'ABCD'[k]}</span><span className="flex-1">{o}</span>{k === v.correct && <Badge tone="ok">Correct</Badge>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => onAddVariant(q)} disabled={n >= 4}><Plus size={14} />Add variant</Button>
              <Button variant="secondary" size="sm" onClick={() => onTag(q)}><Tag size={14} />Tag competency</Button>
            </div>
            <span className="text-xs text-muted">{n >= 4 ? 'Maximum of 4 variants reached. ' : ''}Editing variants isn't available yet — the API has no update endpoint.</span>
          </div>
        </div>
      )}
    </Card>
  );
}

function AddSkillForm({ open, onClose, categories, onSubmit }) {
  const [f, setF] = useState({ code: '', name: '', category: '', description: '' });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const x = {};
    if (!f.code.trim()) x.code = 'Code is required.';
    if (!f.name.trim()) x.name = 'Name is required.';
    if (!f.category) x.category = 'Category is required.';
    setErrs(x); setErr('');
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      await onSubmit(f);
      setF({ code: '', name: '', category: '', description: '' });
      onClose();
    } catch (ex) {
      setErr(ex.message);
      if (ex.data?.fields) setErrs(ex.data.fields);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add skill" description="A skill is what a question measures. The code is the stable key: lowercase, digits and underscores.">
      <form onSubmit={submit} noValidate className="space-y-4">
        {err && <Banner tone="error">{err}</Banner>}
        <Field label="Code" error={errs.code} hint="For example: logical_reasoning">{(p) => <Input {...p} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />}</Field>
        <Field label="Name" error={errs.name}>{(p) => <Input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</Field>
        <Field label="Category" error={errs.category}>{(p) => (
          <Select {...p} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option value="">Select category…</option>
            {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </Select>
        )}</Field>
        <Field label="Description">{(p) => <Textarea {...p} rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />}</Field>
        <div className="flex justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>Add skill</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Bank() {
  const toast = useToast();
  const [tab, setTab] = useState('questions');
  const cats = useFetch('/bank/categories');
  const skillData = useFetch('/bank/skills');
  const [cat, setCat] = useState('');
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const filter = useMemo(() => {
    const p = new URLSearchParams();
    if (cat) p.set('category', cat);
    if (skill) p.set('skill', skill);
    if (difficulty) p.set('difficulty', difficulty);
    const s = p.toString();
    return `/bank/questions${s ? `?${s}` : ''}`;
  }, [cat, skill, difficulty]);
  const qs = useFetch(filter);
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState(new Set());
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [variantFor, setVariantFor] = useState(null);
  const [tagFor, setTagFor] = useState(null);
  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState('');
  const [addSkill, setAddSkill] = useState(false);
  const [delSkill, setDelSkill] = useState(null);
  const [delSkillBusy, setDelSkillBusy] = useState(false);
  const [delSkillErr, setDelSkillErr] = useState('');

  const list = useMemo(() => (qs.data?.questions || []).filter((q) => !search || q.title.toLowerCase().includes(search.toLowerCase())), [qs.data, search]);
  const refresh = () => { qs.reload(); cats.reload(); skillData.reload(); };
  const toggle = (id) => setOpenIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // The skills grouped by category, for the select and the taxonomy list.
  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of skillData.data?.skills || []) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category).push(s);
    }
    return [...map.entries()].map(([category, items]) => ({ category, items }));
  }, [skillData.data]);

  const confirmDelete = async () => {
    setDelBusy(true); setDelErr('');
    try { await api(`/bank/variants/${del.v.id}`, { method: 'DELETE', role: 'admin' }); toast('Variant deleted.'); setDel(null); refresh(); }
    catch (e) { setDelErr(e.message); } finally { setDelBusy(false); }
  };

  const confirmDeleteSkill = async () => {
    setDelSkillBusy(true); setDelSkillErr('');
    try { await api(`/bank/skills/${delSkill.id}`, { method: 'DELETE', role: 'admin' }); toast('Skill deleted.'); setDelSkill(null); refresh(); }
    catch (e) { setDelSkillErr(e.message); } finally { setDelSkillBusy(false); }
  };

  const totalAll = (cats.data?.categories || []).reduce((a, c) => a + c.count, 0);

  return (
    <>
      <PageHeader title="Question bank" description="Each logical question needs 3–4 self-contained variants. Correct answers are shown here only; students never receive them."
        actions={tab === 'questions'
          ? <Button onClick={() => { setNewCat(cat); setAdding(true); }}><Plus size={16} />Add question</Button>
          : <Button onClick={() => setAddSkill(true)}><Plus size={16} />Add skill</Button>} />
      <div className="mb-4">
        <Tabs label="Bank section" value={tab} onChange={setTab} items={[['questions', 'Questions'], ['skills', 'Skills']]} />
      </div>

      {tab === 'skills' ? (
        <div className="space-y-3">
          {skillData.error && <Banner tone="error" action={<Button size="sm" variant="secondary" onClick={skillData.reload}>Retry</Button>}>{skillData.error.message}</Banner>}
          {skillData.loading && !skillData.data && <Card className="space-y-3 p-4"><Skeleton /><Skeleton className="w-2/3" /><Skeleton /></Card>}
          {skillData.data && grouped.length === 0 && (
            <Card><EmptyState icon={<Tag size={20} />} title="No skills yet" action={<Button onClick={() => setAddSkill(true)}><Plus size={16} />Add skill</Button>}>
              A skill is what a question measures. Add one to tag the questions with.
            </EmptyState></Card>
          )}
          {grouped.map((g) => (
            <Card key={g.category}>
              <div className="border-b border-line px-4 py-2.5">
                <p className="text-[13px] font-medium">{g.category}</p>
              </div>
              <ul className="divide-y divide-line">
                {g.items.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted"><code>{s.code}</code> · {s.question_count} question{s.question_count === 1 ? '' : 's'}</p>
                      {s.description && <p className="mt-0.5 text-xs text-muted">{s.description}</p>}
                    </div>
                    <Button variant="ghost" size="sm" aria-label={`Delete skill ${s.name}`} onClick={() => { setDelSkillErr(''); setDelSkill(s); }}><Trash2 size={14} />Delete</Button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
          <Card className="h-fit p-2">
            <nav aria-label="Categories">
              <button onClick={() => setCat('')} aria-current={!cat} className={cx('flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm', !cat ? 'bg-primary-soft font-medium text-primary' : 'hover:bg-slate-50')}>All <span className="tnum text-xs text-muted">{totalAll}</span></button>
              {cats.loading && !cats.data && <div className="space-y-2 p-3"><Skeleton /><Skeleton /><Skeleton /></div>}
              {cats.error && <p className="p-3 text-xs text-danger">Could not load categories.</p>}
              {(cats.data?.categories || []).map((c) => (
                <button key={c.name} onClick={() => setCat(c.name)} aria-current={cat === c.name} className={cx('flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm', cat === c.name ? 'bg-primary-soft font-medium text-primary' : 'hover:bg-slate-50')}>{c.name}<span className="tnum text-xs text-muted">{c.count}</span></button>
              ))}
            </nav>
          </Card>

          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-48 flex-1"><Search size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden /><Input aria-label="Search questions" placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" /></div>
              <Select aria-label="Filter by skill" value={skill} onChange={(e) => setSkill(e.target.value)} className="w-56">
                <option value="">All skills</option>
                {grouped.map((g) => (
                  <optgroup key={g.category} label={g.category}>
                    {g.items.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </optgroup>
                ))}
              </Select>
              <Select aria-label="Filter by difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-44">
                <option value="">All difficulties</option>
                {(skillData.data?.difficulties || []).map((d) => <option key={d.level} value={d.level}>{d.level} — {d.label}</option>)}
              </Select>
            </div>
            {qs.loading && !qs.data && <Card className="space-y-3 p-4"><Skeleton /><Skeleton className="w-2/3" /><Skeleton /></Card>}
            {qs.error && <Banner tone="error" action={<Button size="sm" variant="secondary" onClick={qs.reload}>Retry</Button>}>{qs.error.message}</Banner>}
            {qs.data && list.length === 0 && <Card><EmptyState icon={<Database size={20} />} title={search ? 'No matching questions' : 'No questions in this category'} action={!search && <Button onClick={() => { setNewCat(cat); setAdding(true); }}><Plus size={16} />Add question</Button>}>{search ? 'Try a different search.' : 'Add the first question to start building this category.'}</EmptyState></Card>}
            {list.map((q) => <QuestionCard key={q.id} q={q} open={openIds.has(q.id)} onToggle={() => toggle(q.id)} onAddVariant={setVariantFor} onDeleteVariant={(qq, v, i) => { setDelErr(''); setDel({ q: qq, v, i }); }} onTag={setTagFor} />)}
          </div>
        </div>
      )}

      <VariantForm open={adding} onClose={() => setAdding(false)} title="Add question" description="Creates a logical question with its first variant. Add 2–3 more variants afterwards." category={newCat} setCategory={setNewCat} categories={cats.data?.categories || []}
        onSubmit={async (v) => { await api('/bank/questions', { method: 'POST', role: 'admin', body: { category: newCat, variant: v } }); toast('Question added. Add at least 2 more variants.'); refresh(); }} />
      <VariantForm open={!!variantFor} onClose={() => setVariantFor(null)} title="Add variant" description={variantFor ? `For: ${variantFor.title}` : ''}
        onSubmit={async (v) => { await api(`/bank/questions/${variantFor.id}/variants`, { method: 'POST', role: 'admin', body: v }); toast('Variant added.'); refresh(); }} />
      <CompetencyForm key={tagFor?.id || 'none'} question={tagFor} skills={grouped} difficulties={skillData.data?.difficulties} categories={cats.data?.categories || []} onClose={() => setTagFor(null)}
        onSubmit={async (body) => { await api(`/bank/questions/${tagFor.id}/competency`, { method: 'POST', role: 'admin', body }); toast('Competency saved.'); refresh(); }} />
      <AddSkillForm open={addSkill} onClose={() => setAddSkill(false)} categories={cats.data?.categories || []}
        onSubmit={async (f) => { await api('/bank/skills', { method: 'POST', role: 'admin', body: f }); toast('Skill added.'); refresh(); }} />
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete} loading={delBusy} error={delErr} danger confirmLabel="Delete variant" title="Delete this variant?"
        description={del ? `Variant ${del.i + 1} of “${del.q.title}” will be removed. This cannot be undone.` : ''}>
        {del && del.q.variants.length <= 3 && <Banner tone="warn" live={false}>This question will have {del.q.variants.length - 1} variants left, below the required 3.</Banner>}
      </ConfirmDialog>
      <ConfirmDialog open={!!delSkill} onClose={() => setDelSkill(null)} onConfirm={confirmDeleteSkill} loading={delSkillBusy} error={delSkillErr} danger confirmLabel="Delete skill" title="Delete this skill?"
        description={delSkill ? `“${delSkill.name}” (${delSkill.code}) will be removed from the taxonomy.` : ''}>
        {delSkill?.question_count > 0 && <Banner tone="warn" live={false}>This skill is used by {delSkill.question_count} question(s) and cannot be deleted. Tag them with another skill first.</Banner>}
      </ConfirmDialog>
    </>
  );
}
