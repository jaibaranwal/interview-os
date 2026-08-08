import { Request, Response } from 'express';
import { InterviewEngine } from '../services/InterviewEngine';
import { interviewRequestSchema } from '../validators/interview.validator';
import { Logger } from '../utils/logger';

export class InterviewController {
  private interviewEngine: InterviewEngine;

  constructor(interviewEngine: InterviewEngine = new InterviewEngine()) {
    this.interviewEngine = interviewEngine;
  }

  public handleInterview = async (req: Request, res: Response): Promise<void> => {
    // 1. Validate payload with Zod
    const parseResult = interviewRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      res.status(422).json({
        error: 'Validation Error',
        details: errorMsg
      });
      return;
    }

    try {
      // 2. Delegate to InterviewEngine orchestrator
      const response = await this.interviewEngine.processTurn(parseResult.data as any);
      res.status(200).json(response);
    } catch (err: any) {
      const sessionId = req.body?.sessionId;
      Logger.error(`InterviewController error on session '${sessionId}':`, err.message);

      // 404 for session not found
      if (err.message?.includes('not found') || err.message?.includes('Session')) {
        res.status(404).json({
          error: 'Session Not Found',
          details: err.message
        });
        return;
      }

      // 500 for all other unexpected errors
      res.status(500).json({
        error: 'Interview Engine Error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred processing this interview turn. Please try again.'
      });
    }
  };
}
