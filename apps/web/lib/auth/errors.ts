export function getAuthErrorMessage(error: unknown, fallback: string): string {
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
    };

    const nestedError = candidate.error;
    if (typeof nestedError === "string") {
      const message = nestedError.trim();
      if (message.length > 0) {
        return message;
      }
    }

    if (nestedError && typeof nestedError === "object") {
      const nestedMessage = (nestedError as { message?: unknown }).message;
      if (typeof nestedMessage === "string") {
        const message = nestedMessage.trim();
        if (message.length > 0) {
          return message;
        }
      }
    }

    if (typeof candidate.message === "string") {
      const message = candidate.message.trim();
      if (message.length > 0) {
        return message;
      }
    }

    if (typeof candidate.statusText === "string") {
      const message = candidate.statusText.trim();
      if (message.length > 0) {
        return message;
      }
    }
  }

  return fallback;
}
