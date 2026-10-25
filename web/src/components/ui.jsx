import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { Check, CircleAlert, Info, LoaderCircle, ShieldCheck, TriangleAlert, X } from 'lucide-react';

export const cx = (...a) => a.filter(Boolean).join(' ');

export function Logo({ className }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5 font-semibold tracking-tight text-ink', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-primary text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.7)]"><ShieldCheck size={17} aria-hidden /></span>
      <span>ExamRobo</span>
    </span>
  );
}

export function Spinner({ size = 16, className }) {
  return <LoaderCircle size={size} className={cx('er-spin', className)} aria-hidden />;
}

const BTN = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary-hover disabled:bg-blue-300 disabled:shadow-none',
  secondary: 'border border-line bg-white text-body hover:border-primary/30 hover:bg-primary-soft disabled:text-slate-400',
  danger: 'bg-danger text-white hover:bg-red-600 disabled:bg-red-300',
  ghost: 'text-muted hover:bg-primary-soft hover:text-ink disabled:text-slate-300',
  link: 'text-primary hover:underline px-0 py-0 h-auto',
};
export function Button({ variant = 'primary', loading, children, className, size = 'md', ...p }) {
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={cx('inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors', size === 'sm' ? 'h-9 px-3 text-[13px]' : size === 'lg' ? 'h-12 px-5 text-[15px]' : 'h-11 px-4 text-sm', BTN[variant], className)}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

export function Field({ label, error, hint, children, id }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fid} className="block text-[13px] font-medium text-body">{label}</label>
      {typeof children === 'function' ? children({ id: fid, 'aria-invalid': !!error, 'aria-describedby': error ? `${fid}-err` : hint ? `${fid}-hint` : undefined }) : children}
      {hint && !error && <p id={`${fid}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${fid}-err`} role="alert" className="text-xs text-danger-ink">{error}</p>}
    </div>
  );
}
const inputCls = 'w-full rounded-md border border-line bg-white px-3 text-[15px] text-ink placeholder:text-muted/70 transition-colors hover:border-slate-300 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger-soft/30 disabled:bg-slate-50 disabled:text-muted';
export const Input = (p) => <input {...p} className={cx(inputCls, 'h-11', p.className)} />;
export const Select = (p) => <select {...p} className={cx(inputCls, 'h-11 pr-8', p.className)} />;
export const Textarea = (p) => <textarea {...p} className={cx(inputCls, 'py-2.5 leading-relaxed', p.className)} />;

const BADGE = {
  neutral: 'bg-slate-100 text-slate-600',
  blue: 'bg-primary-soft text-blue-700',
  ok: 'bg-ok-soft text-ok-ink',
  warn: 'bg-warn-soft text-warn-ink',
  danger: 'bg-danger-soft text-danger-ink',
};
export function Badge({ tone = 'neutral', icon, children, className }) {
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium', BADGE[tone], className)}>{icon}{children}</span>;
}

const BANNER = {
  error: ['border-red-200 bg-danger-soft text-danger-ink', CircleAlert],
  warn: ['border-amber-200 bg-warn-soft text-warn-ink', TriangleAlert],
  info: ['border-blue-100 bg-primary-soft text-blue-800', Info],
  ok: ['border-green-200 bg-ok-soft text-ok-ink', Check],
};
export function Banner({ tone = 'error', title, children, action, className, live = true }) {
  const [cls, Icon] = BANNER[tone];
  return (
    <div role={live ? (tone === 'error' || tone === 'warn' ? 'alert' : 'status') : undefined} className={cx('flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm', cls, className)}>
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{title && <p className="font-medium">{title}</p>}{children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}</div>
      {action}
    </div>
  );
}

export const Skeleton = ({ className }) => <div className={cx('er-skel h-4', className)} aria-hidden />;

export function EmptyState({ icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-ice text-primary">{icon}</div>}
      <p className="font-medium text-ink">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const Card = ({ className, children, ...p }) => <div {...p} className={cx('rounded-xl border border-line bg-white shadow-card', className)}>{children}</div>;

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }) {
  const ref = useRef(null);
  const titleId = useId();
  const descId = useId();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const el = ref.current;
    const focusables = () => [...el.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
    (focusables()[0] || el).focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) { e.stopPropagation(); onClose?.(); }
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) { e.preventDefault(); return; }
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); prev?.focus?.(); };
  }, [open, onClose, dismissible]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && dismissible && onClose?.()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined} tabIndex={-1}
        className={cx('w-full rounded-2xl border border-line bg-white shadow-float', size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md')}>
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && <p id={descId} className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {dismissible && <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-md p-1.5 text-muted transition-colors hover:bg-primary-soft hover:text-ink"><X size={16} /></button>}
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line bg-canvas/50 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Drawer ---------- */
export function Drawer({ open, onClose, title, description, children, footer, size = 'md', dismissible = true, className }) {
  const ref = useRef(null);
  const titleId = useId();
  const descId = useId();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const el = ref.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => [...el.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
    (focusables()[0] || el).focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) { e.stopPropagation(); onClose?.(); }
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) { e.preventDefault(); return; }
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, onClose, dismissible]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && dismissible && onClose?.()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined} tabIndex={-1}
        className={cx('flex h-full w-full flex-col border-l border-line bg-white shadow-float', size === 'sm' ? 'max-w-xs' : size === 'lg' ? 'max-w-md' : 'max-w-[340px]', className)}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && <p id={descId} className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {dismissible && <button type="button" onClick={onClose} aria-label="Close panel" className="rounded-md p-1.5 text-muted transition-colors hover:bg-primary-soft hover:text-ink"><X size={18} /></button>}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-line bg-canvas/50 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, loading, error, children }) {
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} dismissible={!loading} title={title} description={description} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>}>
      {error && <Banner tone="error" className="mb-3">{error}</Banner>}
      {children}
    </Modal>
  );
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, message, tone }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className={cx('pointer-events-auto flex items-start gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-sm shadow-float', t.tone === 'error' ? 'border-red-200' : 'border-green-200')}>
            {t.tone === 'error' ? <CircleAlert size={16} className="mt-0.5 text-danger-ink" aria-hidden /> : <Check size={16} className="mt-0.5 text-ok-ink" aria-hidden />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Table helpers ---------- */
export function TableWrap({ children }) {
  return <div role="region" aria-label="Scrollable table" tabIndex={0} className="relative overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">{children}</table></div>;
}
export const Th = ({ children, className }) => <th scope="col" className={cx('whitespace-nowrap border-b border-line bg-canvas/70 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted', className)}>{children}</th>;
export const Td = ({ children, className, ...p }) => <td {...p} className={cx('border-b border-line px-4 py-3 align-middle', className)}>{children}</td>;

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 5 }) {
  return (
    <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4">{Array.from({ length: cols }, (_, j) => <Skeleton key={j} className="h-4 flex-1" />)}</div>
      ))}
    </div>
  );
}

/* ---------- Tabs ---------- */
// A segmented control. `items` is a list of [key, text] pairs.
export function Tabs({ items, value, onChange, label }) {
  return (
      <div role="tablist" aria-label={label} className="inline-flex rounded-md border border-line bg-white p-0.5">
      {items.map(([k, text]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={cx('rounded-[4px] px-3 py-1 text-[13px] font-medium', value === k ? 'bg-primary-soft text-primary' : 'text-muted hover:text-ink')}>{text}</button>
      ))}
    </div>
  );
}

