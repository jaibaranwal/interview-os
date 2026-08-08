"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
class SessionManager {
    static instance;
    sessions;
    constructor() {
        this.sessions = new Map();
    }
    static getInstance() {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }
    createSession(sessionId, candidate) {
        const now = new Date();
        const session = {
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
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    updateSession(sessionId, updates) {
        const existing = this.sessions.get(sessionId);
        if (!existing) {
            throw new Error(`Session with id '${sessionId}' not found.`);
        }
        const updatedSession = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        };
        this.sessions.set(sessionId, updatedSession);
        return updatedSession;
    }
    deleteSession(sessionId) {
        return this.sessions.delete(sessionId);
    }
    hasSession(sessionId) {
        return this.sessions.has(sessionId);
    }
}
exports.SessionManager = SessionManager;
