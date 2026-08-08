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

export class ConversationMemory {
  private visitedDaysSet: Set<number> = new Set();
  private askedQuestionsList: AskedQuestionRecord[] = [];
  private candidateAnswersList: CandidateAnswerRecord[] = [];
  private mistakesList: MistakeRecord[] = [];
  private strengthsList: Set<string> = new Set();
  private weaknessesList: Set<string> = new Set();
  private questionCountNum: number = 0;
  private currentDifficultyScalar: number = 2.5; // Default mid difficulty
  private topicHistoryList: number[] = [];

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

  public recordMistake(day: number, concept: string, detail: string): void {
    this.mistakesList.push({
      day,
      concept,
      detail,
      timestamp: new Date()
    });
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

  public isQuestionAsked(objective: string): boolean {
    return this.askedQuestionsList.some(
      (q) => q.objective.toLowerCase() === objective.toLowerCase()
    );
  }
}
