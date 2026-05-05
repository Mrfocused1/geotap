const CANCELLED = new Error('debounce cancelled');

/**
 * Returns a debounced wrapper that resolves with the result of the
 * latest invocation after `delayMs` of inactivity. Earlier promises
 * resolve to the latest call's result so callers can `await` safely.
 * Calling cancel() rejects all pending promises with a stable sentinel.
 */
export function debounceAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  delayMs: number
): {
  call: (...args: TArgs) => Promise<TResult>;
  cancel: () => void;
} {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingResolvers: Array<{
    resolve: (v: TResult) => void;
    reject: (e: unknown) => void;
  }> = [];

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const resolvers = pendingResolvers;
    pendingResolvers = [];
    resolvers.forEach((r) => r.reject(CANCELLED));
  };

  const call = (...args: TArgs) =>
    new Promise<TResult>((resolve, reject) => {
      pendingResolvers.push({ resolve, reject });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        const resolvers = pendingResolvers;
        pendingResolvers = [];
        fn(...args).then(
          (v) => resolvers.forEach((r) => r.resolve(v)),
          (e) => resolvers.forEach((r) => r.reject(e))
        );
      }, delayMs);
    });

  return { call, cancel };
}

export { CANCELLED as DEBOUNCE_CANCELLED };
