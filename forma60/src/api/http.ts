export type CacheOptions = {
  key: string;
  ttlMs?: number;
};

const DEFAULT_TTL = 30 * 60 * 1000;

function readCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: T };
    if (Date.now() - parsed.at > ttlMs) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), value }));
  } catch {
    /* storage unavailable — ignore */
  }
}

export async function fetchJson<T>(
  url: string,
  timeoutMs: number,
  cache?: CacheOptions,
): Promise<T> {
  const ttl = cache?.ttlMs ?? DEFAULT_TTL;
  if (cache) {
    const hit = readCache<T>(cache.key, ttl);
    if (hit !== null) return hit;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const value = (await response.json()) as T;
    if (cache) writeCache(cache.key, value);
    return value;
  } finally {
    clearTimeout(timer);
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
