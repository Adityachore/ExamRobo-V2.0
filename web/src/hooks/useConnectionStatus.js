import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

const DEFAULT_INTERVAL = 15_000;

export function useConnectionStatus({ intervalMs = DEFAULT_INTERVAL } = {}) {
  const [status, setStatus] = useState(() => ({
    state: typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'checking',
    lastOk: null,
    error: '',
  }));
  const seq = useRef(0);

  const check = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus((s) => ({ ...s, state: 'offline', error: 'This device is offline.' }));
      return;
    }
    const n = ++seq.current;
    try {
      await api('/health');
      if (n === seq.current) setStatus({ state: 'online', lastOk: Date.now(), error: '' });
    } catch (e) {
      if (n !== seq.current) return;
      setStatus((s) => ({
        ...s,
        state: e.status === 0 ? 'offline' : 'degraded',
        error: e.message || '',
      }));
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, Math.max(5_000, intervalMs));
    const online = () => check();
    const offline = () => setStatus((s) => ({ ...s, state: 'offline', error: 'This device is offline.' }));
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, [check, intervalMs]);

  return { ...status, check };
}
