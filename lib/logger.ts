/* eslint-disable no-console */
interface LogContext {
  [key: string]: unknown;
}

type LogLevelType = "info" | "warn" | "error" | "debug";

const isDev = process.env.NODE_ENV === "development";
const isClient = typeof window !== "undefined";

function formatMessage(
  level: LogLevelType,
  message: string,
  context?: LogContext,
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";

  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

function shouldLog(level: LogLevelType): boolean {
  if (!isDev && (level === "debug" || level === "info")) return false;

  return true;
}

function logToConsole(
  level: LogLevelType,
  message: string,
  context?: LogContext,
): void {
  if (!shouldLog(level)) return;

  const formattedMessage = formatMessage(level, message, context);

  switch (level) {
    case "error":
      console.error(formattedMessage);
      break;
    case "warn":
      console.warn(formattedMessage);
      break;
    case "info":
      console.info(formattedMessage);
      break;
    case "debug":
      console.debug(formattedMessage);
      break;
  }
}

function sendToMonitoring(
  level: LogLevelType,
  _message: string,
  _context?: LogContext,
): void {
  if (!isDev && level === "error" && isClient) {
    return;
  }
}

export const logger = {
  info: (message: string, context?: LogContext) =>
    logToConsole("info", message, context),

  warn: (message: string, context?: LogContext) => {
    logToConsole("warn", message, context);
    sendToMonitoring("warn", message, context);
  },

  error: (message: string, context?: LogContext) => {
    logToConsole("error", message, context);
    sendToMonitoring("error", message, context);
  },

  debug: (message: string, context?: LogContext) =>
    logToConsole("debug", message, context),

  auth: {
    login: (success: boolean, context?: LogContext) => {
      const message = success ? "User login successful" : "User login failed";
      const level: LogLevelType = success ? "info" : "warn";

      logger[level](message, context);
    },

    logout: (context?: LogContext) => {
      logger.info("User logout", context);
    },

    tokenRefresh: (success: boolean, context?: LogContext) => {
      const message = success
        ? "Token refresh successful"
        : "Token refresh failed";
      const level: LogLevelType = success ? "debug" : "error";

      logger[level](message, context);
    },

    securityEvent: (event: string, context?: LogContext) => {
      logger.warn(`Security event: ${event}`, context);
    },
  },

  api: {
    request: (
      method: string,
      url: string,
      status: number,
      duration?: number,
    ) => {
      const message = `${method} ${url} - ${status}`;
      const level: LogLevelType = status >= 400 ? "error" : "debug";

      logger[level](message, { method, url, status, duration });
    },

    error: (method: string, url: string, error: any) => {
      logger.error(`API Error: ${method} ${url}`, {
        method,
        url,
        error: error.message || error,
        stack: error.stack,
      });
    },
  },
};

export type { LogContext, LogLevelType };
