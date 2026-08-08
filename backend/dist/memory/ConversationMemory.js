"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationMemory = void 0;
class ConversationMemory {
    visitedDaysSet = new Set();
    askedQuestionsList = [];
    candidateAnswersList = [];
    mistakesList = [];
    strengthsList = new Set();
    weaknessesList = new Set();
    questionCountNum = 0;
    currentDifficultyScalar = 2.5; // Default mid difficulty
    topicHistoryList = [];
    // Enhanced Evaluation & Retry State
    evaluationsList = [];
    scoresList = [];
    confidenceList = [];
    retryMap = new Map();
    markDayVisited(day) {
        this.visitedDaysSet.add(day);
        if (!this.topicHistoryList.includes(day)) {
            this.topicHistoryList.push(day);
        }
    }
    recordQuestion(day, objective, text) {
        this.questionCountNum += 1;
        this.markDayVisited(day);
        this.askedQuestionsList.push({
            day,
            objective,
            text,
            timestamp: new Date()
        });
    }
    recordAnswer(text) {
        this.candidateAnswersList.push({
            turn: this.candidateAnswersList.length + 1,
            text,
            timestamp: new Date()
        });
    }
    recordEvaluation(evalResult, currentDay) {
        this.evaluationsList.push(evalResult);
        this.scoresList.push(evalResult.score);
        this.confidenceList.push(evalResult.confidence);
        if (evalResult.strengths) {
            evalResult.strengths.forEach((s) => this.strengthsList.add(s));
        }
        if (evalResult.weaknesses) {
            evalResult.weaknesses.forEach((w) => this.weaknessesList.add(w));
        }
        if (evalResult.next_action === 'retry') {
            this.incrementRetryCount(currentDay);
        }
        else if (evalResult.next_action === 'advance') {
            this.resetRetryCount(currentDay);
        }
    }
    getRetryCountForDay(day) {
        return this.retryMap.get(day) || 0;
    }
    incrementRetryCount(day) {
        const current = this.getRetryCountForDay(day);
        const updated = current + 1;
        this.retryMap.set(day, updated);
        return updated;
    }
    resetRetryCount(day) {
        this.retryMap.set(day, 0);
    }
    getLastEvaluation() {
        return this.evaluationsList.length > 0
            ? this.evaluationsList[this.evaluationsList.length - 1]
            : null;
    }
    getAverageScore() {
        if (this.scoresList.length === 0)
            return 0;
        const sum = this.scoresList.reduce((acc, curr) => acc + curr, 0);
        return Math.round(sum / this.scoresList.length);
    }
    getAverageConfidence() {
        if (this.confidenceList.length === 0)
            return 0;
        const sum = this.confidenceList.reduce((acc, curr) => acc + curr, 0);
        return Math.round(sum / this.confidenceList.length);
    }
    recordMistake(day, concept, detail) {
        this.mistakesList.push({
            day,
            concept,
            detail,
            timestamp: new Date()
        });
    }
    recordStrength(strength) {
        this.strengthsList.add(strength);
    }
    recordWeakness(weakness) {
        this.weaknessesList.add(weakness);
    }
    setDifficulty(difficulty) {
        this.currentDifficultyScalar = Math.min(5.0, Math.max(1.0, difficulty));
    }
    getVisitedDays() {
        return Array.from(this.visitedDaysSet);
    }
    getAskedQuestions() {
        return this.askedQuestionsList;
    }
    getCandidateAnswers() {
        return this.candidateAnswersList;
    }
    getMistakes() {
        return this.mistakesList;
    }
    getStrengths() {
        return Array.from(this.strengthsList);
    }
    getWeaknesses() {
        return Array.from(this.weaknessesList);
    }
    getQuestionCount() {
        return this.questionCountNum;
    }
    getDifficulty() {
        return this.currentDifficultyScalar;
    }
    getTopicHistory() {
        return this.topicHistoryList;
    }
    isQuestionAsked(objective) {
        return this.askedQuestionsList.some((q) => q.objective.toLowerCase() === objective.toLowerCase());
    }
}
exports.ConversationMemory = ConversationMemory;
