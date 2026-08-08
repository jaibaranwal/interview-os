import { CandidateProfile } from '../types';

export interface SessionMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

export interface SessionData {
  sessionId: string;
  candidate: CandidateProfile;
  createdAt: Date;
  updatedAt: Date;
  messages: SessionMessage[];
  metadata: Record<string, any>;
}

export interface ISessionManager {
  createSession(sessionId: string, candidate: CandidateProfile): SessionData;
  getSession(sessionId: string): SessionData | undefined;
  updateSession(sessionId: string, updates: Partial<SessionData>): SessionData;
  deleteSession(sessionId: string): boolean;
  hasSession(sessionId: string): boolean;
}

export class SessionManager implements ISessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, SessionData>;

  constructor() {
    this.sessions = new Map<string, SessionData>();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public createSession(sessionId: string, candidate: CandidateProfile): SessionData {
    const now = new Date();
    const session: SessionData = {
      sessionId,
      candidate,
      createdAt: now,
      updatedAt: now,
      messages: [],
      metadata: {}
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  public getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  public updateSession(sessionId: string, updates: Partial<SessionData>): SessionData {
    const existing = this.sessions.get(sessionId);
    if (!existing) {
      throw new Error(`Session with id '${sessionId}' not found.`);
    }

    const updatedSession: SessionData = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  public deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  public hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}
