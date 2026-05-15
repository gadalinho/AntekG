import { SavedStateSchema } from '@/types/GameState';
import type { SavedState } from '@/types/GameState';

const STORAGE_KEY = 'world_explorer_save';

export function loadSavedState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    const result = SavedStateSchema.safeParse(parsed);

    if (!result.success) {
      console.warn('Uszkodzony zapis gry — resetuję postęp.', result.error.issues);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return result.data;
  } catch (err) {
    console.warn('Błąd odczytu localStorage:', err);
    return null;
  }
}

export function saveState(state: SavedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Błąd zapisu do localStorage:', err);
  }
}

export function clearSavedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Błąd czyszczenia localStorage:', err);
  }
}
