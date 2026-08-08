"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.Logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    logger_1.Logger.error(`Unhandled Exception on ${req.method} ${req.originalUrl}:`, err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.'
    });
};
exports.errorHandler = errorHandler;
