"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationMemory = void 0;
// Future responsibility: Isolated in-memory state store retaining turn history, claims, strengths, and gaps per session
class ConversationMemory {
    history = [];
    addTurn(role, content) {
        this.history.push({ role, content });
    }
    getHistory() {
        return this.history;
    }
}
exports.ConversationMemory = ConversationMemory;
