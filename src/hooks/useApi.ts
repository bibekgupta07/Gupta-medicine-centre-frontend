"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showErrorToast?: boolean;
  autoLoad?: boolean;
}

interface UseApiReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T>>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    initialData = ([] as unknown) as T,
    onSuccess,
    onError,
    showErrorToast = true,
    autoLoad = true,
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const message = extractErrorMessage(err);
        setError(message);
        if (showErrorToast) toast.error(message);
        onError?.(message);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    if (autoLoad) load();
    return () => { mountedRef.current = false; };
  }, [load, autoLoad]);

  return { data, loading, error, reload: load, setData };
}

export function useSubmit<TArgs extends unknown[], TResult = unknown>(
  action: (...args: TArgs) => Promise<TResult>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: TResult) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setLoading(true);
    try {
      const result = await action(...args);
      if (options.successMessage) toast.success(options.successMessage);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const message = extractErrorMessage(err);
      toast.error(options.errorMessage || message);
      options.onError?.(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [action, options.successMessage, options.errorMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  return { execute, loading };
}

function extractErrorMessage(err: unknown): string {
  const error = err as { response?: { data?: { detail?: string | Array<{ msg: string }> } }; message?: string };
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  return error.message || "Something went wrong";
}
