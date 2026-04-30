import { createDefaultState } from '../domain/defaults';
import type { AppState } from '../types';

const STORAGE_KEY = 'sprint-review-show-v1';

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.teams?.length) return createDefaultState();
    return parsed;
  } catch {
    return createDefaultState();
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // noop fallback: app continues in-memory only
  }
};

export const exportStateJson = (state: AppState): string => JSON.stringify(state, null, 2);

export const importStateJson = (raw: string): AppState => {
  const parsed = JSON.parse(raw) as AppState;
  if (!parsed.teams || !parsed.session || !parsed.adminSettings || !parsed.scriptPlan) {
    throw new Error('Некорректный формат JSON');
  }
  return parsed;
};
