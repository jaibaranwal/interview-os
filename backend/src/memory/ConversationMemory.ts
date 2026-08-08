import { LLMEvaluationResult } from '../types';

export interface AskedQuestionRecord {
  day: number;
  objective: string;
  text: string;
  timestamp: Date;
}

export interface CandidateAnswerRecord {
  turn: number;
  text: string;
  timestamp: Date;
}

export interface MistakeRecord {
  day: number;
  concept: string;
  detail: string;
  timestamp: Date;
}

export interface ConversationTurn {
  question: string;
  answer: string;
  dayNum: number;
  dayTitle: string;
}

export class ConversationMemory {
  private visitedDaysSet: Set<number> = new Set();
  private askedQuestionsList: AskedQuestionRecord[] = [];
  private candidateAnswersList: CandidateAnswerRecord[] = [];
  private mistakesList: MistakeRecord[] = [];
  private strengthsList: Set<string> = new Set();
  private weaknessesList: Set<string> = new Set();
  private questionCountNum: number = 0;
  private currentDifficultyScalar: number = 2.5;
  private topicHistoryList: number[] = [];

  // Sliding conversation window for LLM context
  private conversationTurns: ConversationTurn[] = [];

  // Evaluation history (single source of truth)
  private evaluationsList: LLMEvaluationResult[] = [];
  private scoresList: number[] = [];
  private confidenceList: number[] = [];

  public markDayVisited(day: number): void {
    this.visitedDaysSet.add(day);
    if (!this.topicHistoryList.includes(day)) {
      this.topicHistoryList.push(day);
    }
  }

  public recordQuestion(day: number, objective: string, text: string): void {
    this.questionCountNum += 1;
    this.markDayVisited(day);
    this.askedQuestionsList.push({
      day,
      objective,
      text,
      timestamp: new Date()
    });
  }

  public recordAnswer(text: string): void {
    this.candidateAnswersList.push({
      turn: this.candidateAnswersList.length + 1,
      text,
      timestamp: new Date()
    });
  }

  public recordConversationTurn(question: string, answer: string, dayNum: number, dayTitle: string): void {
    this.conversationTurns.push({ question, answer, dayNum, dayTitle });
  }

  public getRecentContext(n: number = 3): string {
    const recent = this.conversationTurns.slice(-n);
    if (recent.length === 0) return '(No prior conversation)';

    return recent.map((t, i) => {
      const label = recent.length === 1 ? 'Previous' : `Turn -${recent.length - i}`;
      return `[${label} | Day ${t.dayNum}: ${t.dayTitle}]\nInterviewer: ${t.question}\nCandidate: ${t.answer}`;
    }).join('\n\n');
  }

  public recordEvaluation(evalResult: LLMEvaluationResult, currentDay: number): void {
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

  public getEvaluations(): LLMEvaluationResult[] {
    return this.evaluationsList;
  }

  public getLastEvaluation(): LLMEvaluationResult | null {
    return this.evaluationsList.length > 0
      ? this.evaluationsList[this.evaluationsList.length - 1]
      : null;
  }

  public getAverageScore(): number {
    if (this.scoresList.length === 0) return 0;
    const sum = this.scoresList.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / this.scoresList.length);
  }

  public getAverageConfidence(): number {
    if (this.confidenceList.length === 0) return 0;
    const sum = this.confidenceList.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / this.confidenceList.length);
  }

  public recordMistake(day: number, concept: string, detail: string): void {
    this.mistakesList.push({ day, concept, detail, timestamp: new Date() });
  }

  public recordStrength(strength: string): void {
    this.strengthsList.add(strength);
  }

  public recordWeakness(weakness: string): void {
    this.weaknessesList.add(weakness);
  }

  public setDifficulty(difficulty: number): void {
    this.currentDifficultyScalar = Math.min(5.0, Math.max(1.0, difficulty));
  }

  public getVisitedDays(): number[] {
    return Array.from(this.visitedDaysSet);
  }

  public getAskedQuestions(): AskedQuestionRecord[] {
    return this.askedQuestionsList;
  }

  public getAskedQuestionTexts(): string[] {
    return this.askedQuestionsList.map((q) => q.text);
  }

  public getCandidateAnswers(): CandidateAnswerRecord[] {
    return this.candidateAnswersList;
  }

  public getMistakes(): MistakeRecord[] {
    return this.mistakesList;
  }

  public getStrengths(): string[] {
    return Array.from(this.strengthsList);
  }

  public getWeaknesses(): string[] {
    return Array.from(this.weaknessesList);
  }

  public getQuestionCount(): number {
    return this.questionCountNum;
  }

  public getDifficulty(): number {
    return this.currentDifficultyScalar;
  }

  public getTopicHistory(): number[] {
    return this.topicHistoryList;
  }

  public isQuestionAsked(text: string): boolean {
    const normalizedNew = text.toLowerCase().trim();
    return this.askedQuestionsList.some((q) => {
      const normalizedExisting = q.text.toLowerCase().trim();
      return normalizedExisting === normalizedNew
        || (normalizedNew.length > 40 && normalizedExisting.startsWith(normalizedNew.slice(0, 60)));
    });
  }

  public getLastCandidateAnswer(): string | undefined {
    const answers = this.candidateAnswersList;
    return answers.length > 0 ? answers[answers.length - 1].text : undefined;
  }

  public getPreviousCandidateAnswer(): string | undefined {
    const answers = this.candidateAnswersList;
    return answers.length > 1 ? answers[answers.length - 2].text : undefined;
  }
}
