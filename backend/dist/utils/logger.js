"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
// Future responsibility: Structured logging utility for server requests and interview engine events
class Logger {
    static info(message) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
    static error(message, err) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, err || '');
    }
}
exports.Logger = Logger;
