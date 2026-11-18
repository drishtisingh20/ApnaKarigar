import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Runs `load` every time the screen gains focus, so lists refresh after you
 * publish something or sign in. Pass a function wrapped in useCallback.
 * `data` keeps the previous result while reloading (no flicker).
 */
export function useAsync<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setError(null);
      load()
        .then((result) => alive && setData(result))
        .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : 'Error'))
        .finally(() => alive && setLoading(false));
      return () => {
        alive = false;
      };
    }, [load, attempt])
  );

  const reload = useCallback(() => {
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  return { data, error, loading, reload };
}
