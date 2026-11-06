import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

/**
 * v2 data hook. Returns the unwrapped `data` payload and `meta` envelope.
 * `path` null / `enabled:false` skips the request.
 */
export function useApi(path, role = 'admin', { enabled = true } = {}) {
  const active = !!path && enabled;
  const [state, setState] = useState({ data: null, meta: null, error: null, loading: active });
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!path || !enabled) {
      setState({ data: null, meta: null, error: null, loading: false });
      return;
    }
    const n = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const raw = await api(path, { role });
      if (n !== seq.current) return;
      setState({
        data: raw?.data ?? raw,
        meta: raw?.meta ?? null,
        error: null,
        loading: false,
      });
    } catch (e) {
      if (n === seq.current) setState((s) => ({ ...s, error: e, loading: false }));
    }
  }, [path, role, enabled]);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
