const STORAGE_KEY = 'monte.pendingInvitationId';

const isBrowser = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

export const setPendingInvitationId = (invitationId: string) => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, invitationId);
  } catch (error) {
    console.warn('Unable to persist pending invitation id', error);
  }
};

export const getPendingInvitationId = (): string | null => {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read pending invitation id', error);
    return null;
  }
};

export const clearPendingInvitationId = () => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear pending invitation id', error);
  }
};

export const popPendingInvitationId = (): string | null => {
  const value = getPendingInvitationId();
  if (value) {
    clearPendingInvitationId();
  }
  return value;
};

export const hasPendingInvitation = (): boolean => getPendingInvitationId() !== null;

export const PENDING_INVITATION_STORAGE_KEY = STORAGE_KEY;
