import { DemoEvent, DemoEventPayload } from './events';

const STORAGE_KEY = 'monte:demo-events';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStoredEvents = (): DemoEvent[] => {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DemoEvent[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const writeStoredEvents = (events: DemoEvent[]) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.warn('Unable to persist analytics events', error);
  }
};

export const createLocalEventRecorder = () => {
  return (payload: DemoEventPayload) => {
    const event: DemoEvent = {
      ...payload,
      timestamp: Date.now(),
    };
    if (isBrowser) {
      const existing = readStoredEvents();
      existing.push(event);
      writeStoredEvents(existing.slice(-500));
    }
    if (import.meta.env.DEV) {
      console.debug('[analytics]', event);
    }
  };
};

export const listStoredEvents = () => readStoredEvents();

export const clearStoredEvents = () => {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
};
