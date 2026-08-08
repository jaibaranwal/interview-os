"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const IS_DEV = process.env.NODE_ENV !== 'production';
class Logger {
    static info(message, data) {
        const extra = data ? ` ${JSON.stringify(data)}` : '';
        console.log(`[INFO] ${new Date().toISOString()} - ${message}${extra}`);
    }
    static warn(message, data) {
        const extra = data ? ` ${JSON.stringify(data)}` : '';
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}${extra}`);
    }
    static error(message, err) {
        // Sanitize: never log raw error objects that may contain auth headers/API keys
        const safeErr = typeof err === 'string' ? err : (err?.message || 'Unknown error');
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, safeErr);
    }
    // Debug-level: only printed in development mode
    static debug(message, data) {
        if (!IS_DEV)
            return;
        const extra = data ? ` ${JSON.stringify(data)}` : '';
        console.log(`[DEBUG] ${new Date().toISOString()} - ${message}${extra}`);
    }
}
exports.Logger = Logger;
