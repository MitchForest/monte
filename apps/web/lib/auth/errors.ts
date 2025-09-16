const friendlyStatusMessages: Record<number, string> = {
  401: "We couldn't verify those credentials. Double-check your email and password or create an account.",
  403: "You don't have access to this workspace yet. Ask your administrator for an invite.",
};

const friendlyTextMessages: Record<string, string> = {
  unauthorized: friendlyStatusMessages[401],
  forbidden: friendlyStatusMessages[403],
  "invalid credentials": friendlyStatusMessages[401],
  "invalid email or password": friendlyStatusMessages[401],
};

const getFriendlyMessage = (input: string | null | undefined): string | null => {
  if (!input) {
    return null;
  }

  const normalized = input.trim().toLowerCase();
  if (normalized.length === 0) {
    return null;
  }

  if (friendlyTextMessages[normalized]) {
    return friendlyTextMessages[normalized];
  }

  return null;
};

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const friendlyFromError = getFriendlyMessage(
    error instanceof Error ? error.message : null,
  );
  if (friendlyFromError) {
    return friendlyFromError;
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.length > 0) {
      return message;
    }
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      error?: unknown;
      message?: unknown;
      statusText?: unknown;
      status?: unknown;
    };

    if (typeof candidate.status === "number") {
      const friendly = friendlyStatusMessages[candidate.status];
      if (friendly) {
        return friendly;
      }
    }

    const nestedError = candidate.error;
    if (typeof nestedError === "string") {
      const message = nestedError.trim();
      const friendly = getFriendlyMessage(message);
      if (friendly) {
        return friendly;
      }
      if (message.length > 0) {
        return message;
      }
    }

    if (nestedError && typeof nestedError === "object") {
      const nestedMessage = (nestedError as { message?: unknown }).message;
      if (typeof nestedMessage === "string") {
        const message = nestedMessage.trim();
        const friendly = getFriendlyMessage(message);
        if (friendly) {
          return friendly;
        }
        if (message.length > 0) {
          return message;
        }
      }
    }

    if (typeof candidate.message === "string") {
      const message = candidate.message.trim();
      const friendly = getFriendlyMessage(message);
      if (friendly) {
        return friendly;
      }
      if (message.length > 0) {
        return message;
      }
    }

    if (typeof candidate.statusText === "string") {
      const message = candidate.statusText.trim();
      const friendly = getFriendlyMessage(message);
      if (friendly) {
        return friendly;
      }
      if (message.length > 0) {
        return message;
      }
    }
  }

  return fallback;
}
