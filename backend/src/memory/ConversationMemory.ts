// Future responsibility: Isolated in-memory state store retaining turn history, claims, strengths, and gaps per session
export class ConversationMemory {
  private history: any[] = [];

  public addTurn(role: string, content: string): void {
    this.history.push({ role, content });
  }

  public getHistory(): any[] {
    return this.history;
  }
}
