import { useState, useCallback } from 'react';
import { ApiException, handleApiError } from '../api/errorHandler';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiException | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const apiError = handleApiError(error as any);
      setState({ data: null, loading: false, error: apiError });
      return null;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// Hook for multiple API calls
export const useMultipleApi = <T = any>(
  apiFunctions: Array<(...args: any[]) => Promise<T>>
) => {
  const [state, setState] = useState<{
    data: Array<T | null>;
    loading: boolean;
    error: ApiException | null;
  }>({
    data: [],
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<Array<T | null>> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const results = await Promise.all(
        apiFunctions.map(fn => fn(...args))
      );
      setState({ data: results, loading: false, error: null });
      return results;
    } catch (error) {
      const apiError = handleApiError(error as any);
      setState({ data: [], loading: false, error: apiError });
      return [];
    }
  }, [apiFunctions]);

  const reset = useCallback(() => {
    setState({ data: [], loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
