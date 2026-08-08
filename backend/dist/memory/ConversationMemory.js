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
    currentDifficultyScalar = 2.5;
    topicHistoryList = [];
    // Sliding conversation window for LLM context
    conversationTurns = [];
    // Evaluation history (single source of truth)
    evaluationsList = [];
    scoresList = [];
    confidenceList = [];
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
    recordConversationTurn(question, answer, dayNum, dayTitle) {
        this.conversationTurns.push({ question, answer, dayNum, dayTitle });
    }
    getRecentContext(n = 3) {
        const recent = this.conversationTurns.slice(-n);
        if (recent.length === 0)
            return '(No prior conversation)';
        return recent.map((t, i) => {
            const label = recent.length === 1 ? 'Previous' : `Turn -${recent.length - i}`;
            return `[${label} | Day ${t.dayNum}: ${t.dayTitle}]\nInterviewer: ${t.question}\nCandidate: ${t.answer}`;
        }).join('\n\n');
    }
    recordEvaluation(evalResult, currentDay) {
        this.evaluationsList.push(evalResult);
        this.scoresList.push(evalResult.score);
        this.confidenceList.push(evalResult.confidence);
        const isGoodTurn = ['GOOD', 'EXCELLENT'].includes(evalResult.correctness) || evalResult.score >= 60;
        if (isGoodTurn) {
            if (evalResult.detected_concepts && evalResult.detected_concepts.length > 0) {
                evalResult.detected_concepts.forEach((c) => {
                    if (c && c.length > 2) {
                        this.strengthsList.add(`Demonstrated understanding of ${c}`);
                    }
                });
            }
            if (evalResult.strengths && evalResult.strengths.length > 0) {
                evalResult.strengths.forEach((s) => {
                    if (s && !s.toLowerCase().includes('no technical strengths')) {
                        this.strengthsList.add(s);
                    }
                });
            }
        }
        if (evalResult.weaknesses && evalResult.weaknesses.length > 0) {
            evalResult.weaknesses.forEach((w) => this.weaknessesList.add(w));
        }
    }
    getEvaluations() {
        return this.evaluationsList;
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
        this.mistakesList.push({ day, concept, detail, timestamp: new Date() });
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
    getAskedQuestionTexts() {
        return this.askedQuestionsList.map((q) => q.text);
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
    isQuestionAsked(text) {
        const normalizedNew = text.toLowerCase().trim();
        return this.askedQuestionsList.some((q) => {
            const normalizedExisting = q.text.toLowerCase().trim();
            return normalizedExisting === normalizedNew
                || (normalizedNew.length > 40 && normalizedExisting.startsWith(normalizedNew.slice(0, 60)));
        });
    }
    getLastCandidateAnswer() {
        const answers = this.candidateAnswersList;
        return answers.length > 0 ? answers[answers.length - 1].text : undefined;
    }
    getPreviousCandidateAnswer() {
        const answers = this.candidateAnswersList;
        return answers.length > 1 ? answers[answers.length - 2].text : undefined;
    }
}
exports.ConversationMemory = ConversationMemory;
