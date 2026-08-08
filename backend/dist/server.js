"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const middleware_1 = require("./middleware");
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
// 1. Security Middleware
const allowedOrigins = process.env.CORS_ALLOWED_ORIGIN || '*';
app.use((0, cors_1.default)({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map(o => o.trim()),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
// Body size limit — prevents DoS via huge payloads
app.use(express_1.default.json({ limit: '50kb' }));
app.use(middleware_1.requestLogger);
// 2. Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        provider: env_1.config.llmProvider,
        model: env_1.config.llmModel
    });
});
// 3. Register API Routes
app.use('/api', interview_routes_1.default);
// 4. Register Centralized Error Handler
app.use(middleware_1.errorHandler);
// 5. Start Express Server
if (require.main === module) {
    app.listen(env_1.config.port, () => {
        logger_1.Logger.info(`🚀 InterviewOS Backend Server running on http://localhost:${env_1.config.port}`);
        logger_1.Logger.info(`   - Health check: http://localhost:${env_1.config.port}/health`);
        logger_1.Logger.info(`   - Interview API: http://localhost:${env_1.config.port}/api/interview`);
    });
}
exports.default = app;
