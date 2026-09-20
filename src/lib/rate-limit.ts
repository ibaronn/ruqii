export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const store = (globalThis as Record<string, unknown>).__rateLimiter as
    | Map<string, number[]>
    | undefined;
  if (!store) {
    (globalThis as Record<string, unknown>).__rateLimiter = new Map<
      string,
      number[]
    >();
  }
  const map = (globalThis as Record<string, unknown>).__rateLimiter as Map<
    string,
    number[]
  >;
  const now = Date.now();
  const hits = (map.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const oldest = hits[0];
    map.set(key, hits);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }
  hits.push(now);
  map.set(key, hits);
  return { ok: true, retryAfter: 0 };
}