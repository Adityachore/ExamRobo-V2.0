import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

/** Small data hook: { data, error, loading, reload }. `path` null = skip. Stale responses are ignored. */
export function useFetch(path, role = 'admin') {
  const [state, setState] = useState({ data: null, error: null, loading: !!path });
  const seq = useRef(0);
  const load = useCallback(async () => {
    if (!path) { setState({ data: null, error: null, loading: false }); return; }
    const n = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api(path, { role });
      if (n === seq.current) setState({ data, error: null, loading: false });
    } catch (e) {
      if (n === seq.current) setState((s) => ({ data: s.data, error: e, loading: false }));
    }
  }, [path, role]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
