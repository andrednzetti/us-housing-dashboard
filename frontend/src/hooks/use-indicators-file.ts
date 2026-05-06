/**
 * Hook que carrega `data/indicators.json` na montagem do componente.
 *
 * Path-aware: usa `import.meta.env.BASE_URL` para funcionar em qualquer
 * subpath de deploy (Vercel preview na raiz, GitHub Pages em
 * `/us-housing-dashboard/`, etc.).
 *
 * Cancellation pattern: a flag `cancelled` no closure do effect protege
 * contra `setState` após unmount — evita warning React e race entre
 * dois fetches em strict mode (dois mounts seguidos no dev).
 *
 * @example
 *   const { data, loading, error } = useIndicatorsFile();
 *   if (loading) return <Loading />;
 *   if (error) return <ErrorBox error={error} />;
 *   return <Dashboard data={data!} />;
 */

import { useEffect, useState } from 'react';
import type { IndicatorsFile } from '../types';

export interface UseIndicatorsFileResult {
  /** Payload resolvido. `null` enquanto loading/error. */
  data: IndicatorsFile | null;
  /** True até a Promise resolver (sucesso ou erro). */
  loading: boolean;
  /** Não-null se a request falhou (HTTP != 2xx ou JSON inválido). */
  error: Error | null;
}

export function useIndicatorsFile(): UseIndicatorsFileResult {
  const [data, setData] = useState<IndicatorsFile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}data/indicators.json`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ao buscar ${url}`);
        }
        return response.json() as Promise<IndicatorsFile>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
