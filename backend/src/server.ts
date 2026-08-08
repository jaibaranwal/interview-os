import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { requestLogger, errorHandler } from './middleware';
import interviewRouter from './routes/interview.routes';
import { Logger } from './utils/logger';

const app = express();

// 1. Security Middleware
const allowedOrigins = process.env.CORS_ALLOWED_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map(o => o.trim()),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Body size limit — prevents DoS via huge payloads
app.use(express.json({ limit: '50kb' }));
app.use(requestLogger);

// 2. Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: config.llmProvider,
    model: config.llmModel
  });
});

// 3. Register API Routes
app.use('/api', interviewRouter);

// 4. Register Centralized Error Handler
app.use(errorHandler);

// 5. Start Express Server
if (require.main === module) {
  app.listen(config.port, () => {
    Logger.info(`🚀 InterviewOS Backend Server running on http://localhost:${config.port}`);
    Logger.info(`   - Health check: http://localhost:${config.port}/health`);
    Logger.info(`   - Interview API: http://localhost:${config.port}/api/interview`);
  });
}

export default app;
