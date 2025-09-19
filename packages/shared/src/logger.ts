type LogLevel = "debug" | "info" | "warn" | "error";

type LogMetadata = Record<string, unknown> | undefined;

type LogPayload = {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: LogMetadata;
};

function serialise(payload: LogPayload): string {
  return `${JSON.stringify(payload)}\n`;
}

function write(level: LogLevel, message: string, metadata?: LogMetadata): void {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (metadata && Object.keys(metadata).length > 0) {
    payload.metadata = metadata;
  }

  const stream = level === "error" ? process.stderr : process.stdout;
  stream.write(serialise(payload));
}

export const logger = {
  debug(message: string, metadata?: LogMetadata): void {
    write("debug", message, metadata);
  },
  info(message: string, metadata?: LogMetadata): void {
    write("info", message, metadata);
  },
  warn(message: string, metadata?: LogMetadata): void {
    write("warn", message, metadata);
  },
  error(message: string, metadata?: LogMetadata): void {
    write("error", message, metadata);
  },
} as const;

export type Logger = typeof logger;
