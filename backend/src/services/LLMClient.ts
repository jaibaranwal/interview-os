import OpenAI from 'openai';
import { config } from '../config/env';
import { Logger } from '../utils/logger';

export interface ILLMClient {
  generate(systemPrompt: string, userMessage?: string): Promise<string>;
}

export class LLMClient implements ILLMClient {
  private client: OpenAI | null = null;
  private model: string;
  private provider: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai';
    this.model = process.env.LLM_MODEL || config.llmModel || 'gpt-4o-mini';
    const apiKey = process.env.LLM_API_KEY || config.llmApiKey;
    const baseURL = process.env.LLM_BASE_URL || config.llmBaseUrl;

    if (apiKey && apiKey.trim().length > 0 && apiKey !== 'your_api_key_here') {
      this.client = new OpenAI({
        apiKey,
        baseURL: baseURL || undefined
      });
      Logger.info(`LLMClient initialized (${this.provider}, Model: ${this.model})`);
    } else {
      Logger.info('LLMClient initialized in Mock/Fallback Mode (No API key configured)');
    }
  }

  public async generate(systemPrompt: string, userMessage: string = ''): Promise<string> {
    // 1. Try Live LLM Execution if client configured
    if (this.client) {
      try {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt }
        ];

        if (userMessage && userMessage.trim().length > 0) {
          messages.push({ role: 'user', content: userMessage });
        }

        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 300
        });

        const reply = completion.choices[0]?.message?.content?.trim();
        if (reply && reply.length > 0) {
          return reply;
        }
      } catch (err: any) {
        Logger.error('LLM API call failed, switching to intelligent fallback mode:', err.message);
      }
    }

    // 2. Intelligent Deterministic Fallback Generation (for offline dev/tests)
    return this.generateFallbackResponse(systemPrompt, userMessage);
  }

  private generateFallbackResponse(systemPrompt: string, userMessage: string): string {
    const lowerPrompt = systemPrompt.toLowerCase();

    // Greeting Fallback
    if (lowerPrompt.includes('state: greeting') || lowerPrompt.includes('welcome')) {
      const nameMatch = systemPrompt.match(/Candidate Name:\s*([^\n]+)/i);
      const candidateName = nameMatch ? nameMatch[1].trim() : 'Candidate';
      return `Welcome ${candidateName}. I'm excited to explore your 31-day AI Cohort learning journey. Let's begin by discussing your experience with foundational AI setup and core concepts.`;
    }

    // Question Fallback
    if (lowerPrompt.includes('target curriculum day:')) {
      const dayMatch = systemPrompt.match(/Target Curriculum Day:\s*Day (\d+) - ([^\n]+)/i);
      const toolMatch = systemPrompt.match(/Relevant Tools:\s*([^\n]+)/i);
      
      const dayNum = dayMatch ? dayMatch[1] : '7';
      const dayTitle = dayMatch ? dayMatch[2] : 'Embeddings Explained';
      const tools = toolMatch ? toolMatch[1] : 'Sentence Transformers';

      if (userMessage && userMessage.length > 0) {
        return `Building on what you mentioned, how did you implement ${tools} during Day ${dayNum} (${dayTitle})? Specifically, what trade-offs did you evaluate?`;
      }

      return `Let's discuss Day ${dayNum}: ${dayTitle}. How did you configure and use ${tools} in your implementation, and what key objective did you achieve?`;
    }

    return "That's a solid explanation. Can you walk me through the specific implementation details and trade-offs you encountered?";
  }
}
