import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface LoadingContextValue {
  isLoading: boolean;
  loadingMessage: string;
  startLoading: (message?: string) => () => void;
  withLoading: <T>(fn: () => Promise<T>, message?: string) => Promise<T | undefined>;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Cooking something up...");

  const startLoading = useCallback((message = "Cooking something up...") => {
    setLoadingMessage(message);
    setCount((c) => c + 1);
    return () => {
      setCount((c) => Math.max(0, c - 1));
    };
  }, []);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>, message = "Cooking something up..."): Promise<T | undefined> => {
      const stop = startLoading(message);
      try {
        return await fn();
      } catch {
        // Errors are already handled by the caller's onError / toast callbacks.
        // We just need to ensure stop() runs so the overlay always hides.
        return undefined;
      } finally {
        stop();
      }
    },
    [startLoading]
  );

  return (
    <LoadingContext.Provider
      value={{ isLoading: count > 0, loadingMessage, startLoading, withLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}
