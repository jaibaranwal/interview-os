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
