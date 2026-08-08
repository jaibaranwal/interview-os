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
      res.status(400).json({
        error: 'Bad Request',
        details: errorMsg
      });
      return;
    }

    try {
      // 2. Delegate to InterviewEngine orchestrator
      const response = await this.interviewEngine.processTurn(parseResult.data as any);
      res.status(200).json(response);
    } catch (err: any) {
      Logger.error(`InterviewController error on session '${req.body?.sessionId}':`, err.message);
      res.status(400).json({
        error: 'Bad Request',
        details: err.message
      });
    }
  };
}
