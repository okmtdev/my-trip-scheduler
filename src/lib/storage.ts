import { TripData, createDefaultTripData } from './types';

const STORAGE_KEY = 'my-trip-scheduler-data';

export function loadTripData(): TripData {
  if (typeof window === 'undefined') {
    return createDefaultTripData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as TripData;
      if (data.id && data.families && data.events) {
        return data;
      }
    }
  } catch {
    // ignore parse errors
  }

  return createDefaultTripData();
}

export function saveTripData(data: TripData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function clearTripData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
