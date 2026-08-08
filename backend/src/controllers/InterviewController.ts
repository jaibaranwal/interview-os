import { Request, Response } from 'express';
import { SessionManager } from '../services/SessionManager';
import { interviewRequestSchema } from '../validators/interview.validator';
import { Logger } from '../utils/logger';

export class InterviewController {
  private sessionManager: SessionManager;

  constructor(sessionManager: SessionManager = SessionManager.getInstance()) {
    this.sessionManager = sessionManager;
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

    const { sessionId, candidate, message } = parseResult.data;

    // 2. Check session existence
    if (!this.sessionManager.hasSession(sessionId)) {
      // New Session Initialization
      if (!candidate) {
        res.status(400).json({
          error: 'Bad Request',
          details: "New session initialization requires a valid 'candidate' profile object."
        });
        return;
      }

      // Create session
      const session = this.sessionManager.createSession(sessionId, candidate);
      Logger.info(`Initialized new session '${sessionId}' for candidate '${candidate.member.name}' (${candidate.member.id}).`);

      res.status(200).json({
        reply: 'Interview initialized successfully.',
        done: false
      });
      return;
    }

    // Existing Session Turn
    const existingSession = this.sessionManager.getSession(sessionId)!;

    if (message) {
      const updatedMessages = [
        ...existingSession.messages,
        { role: 'candidate' as const, content: message, timestamp: new Date() }
      ];
      this.sessionManager.updateSession(sessionId, { messages: updatedMessages });
      Logger.info(`Updated session '${sessionId}' with candidate message (${message.length} chars).`);
    }

    res.status(200).json({
      reply: 'Session found.',
      done: false
    });
  };
}
