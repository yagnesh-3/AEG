const PREFIX = 'aeg:';

/**
 * localStorage is a per-viewer convenience here — every read and write is
 * guarded so the app renders correctly when storage is unavailable.
 */
export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the in-memory state still stands */
  }
}

export function clearState(): void {
  try {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* nothing to clear */
  }
}
