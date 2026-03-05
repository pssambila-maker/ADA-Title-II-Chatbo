import { getConfig } from "./config.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

class Logger {
    private minLevel: LogLevel;

    constructor() {
        this.minLevel = (getConfig().logLevel as LogLevel) || "info";
    }

    private shouldLog(level: LogLevel): boolean {
        return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel];
    }

    private formatMessage(level: LogLevel, message: string, data?: Record<string, unknown>): string {
        const timestamp = new Date().toISOString();
        const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        if (data) {
            return `${base} ${JSON.stringify(data)}`;
        }
        return base;
    }

    debug(message: string, data?: Record<string, unknown>): void {
        if (this.shouldLog("debug")) {
            console.debug(this.formatMessage("debug", message, data));
        }
    }

    info(message: string, data?: Record<string, unknown>): void {
        if (this.shouldLog("info")) {
            console.info(this.formatMessage("info", message, data));
        }
    }

    warn(message: string, data?: Record<string, unknown>): void {
        if (this.shouldLog("warn")) {
            console.warn(this.formatMessage("warn", message, data));
        }
    }

    error(message: string, data?: Record<string, unknown>): void {
        if (this.shouldLog("error")) {
            console.error(this.formatMessage("error", message, data));
        }
    }
}

export const logger = new Logger();
