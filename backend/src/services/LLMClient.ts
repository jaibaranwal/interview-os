import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { config } from '../config/env';
import { Logger } from '../utils/logger';

export interface ILLMClient {
  generate(systemPrompt: string, userMessage?: string): Promise<string>;
}

export class LLMClient implements ILLMClient {
  private geminiClient: GoogleGenAI | null = null;
  private openAIClient: OpenAI | null = null;
  private model: string;
  private provider: string;

  constructor() {
    const apiKey = config.llmApiKey;
    this.provider = config.llmProvider;
    this.model = config.llmModel || 'gemini-2.5-flash';

    const isApiKeyValid =
      apiKey &&
      apiKey.trim().length > 0 &&
      !apiKey.includes('your_api_key_here') &&
      !apiKey.includes('your_gemini_api_key_here');

    if (isApiKeyValid) {
      if (this.provider === 'gemini' || apiKey.startsWith('AIza') || this.model.includes('gemini')) {
        this.geminiClient = new GoogleGenAI({ apiKey });
        this.provider = 'Gemini';
        Logger.info(`🚀 LLMClient initialized with Gemini (Model: ${this.model})`);
      } else {
        this.openAIClient = new OpenAI({
          apiKey,
          baseURL: config.llmBaseUrl || undefined
        });
        this.provider = 'OpenAI';
        Logger.info(`🚀 LLMClient initialized with OpenAI (Model: ${this.model})`);
      }
    } else {
      Logger.info('LLMClient initialized in Mock/Fallback Mode (No API key configured)');
    }
  }

  public async generate(systemPrompt: string, userMessage: string = ''): Promise<string> {
    // 1. Live Gemini Execution
    if (this.geminiClient) {
      try {
        const response = await this.geminiClient.models.generateContent({
          model: this.model || 'gemini-2.5-flash',
          contents: userMessage && userMessage.trim().length > 0 ? userMessage : 'Hello',
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 500
          }
        });

        const reply = response.text?.trim();
        if (reply && reply.length > 0) {
          return reply;
        }
      } catch (err: any) {
        Logger.error('Gemini API call failed, switching to intelligent fallback mode:', err.message);
      }
    }

    // 2. Live OpenAI Execution
    if (this.openAIClient) {
      try {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt }
        ];

        if (userMessage && userMessage.trim().length > 0) {
          messages.push({ role: 'user', content: userMessage });
        }

        const completion = await this.openAIClient.chat.completions.create({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 500
        });

        const reply = completion.choices[0]?.message?.content?.trim();
        if (reply && reply.length > 0) {
          return reply;
        }
      } catch (err: any) {
        Logger.error('OpenAI API call failed, switching to intelligent fallback mode:', err.message);
      }
    }

    // 3. Intelligent Deterministic Fallback Generation
    return this.generateFallbackResponse(systemPrompt, userMessage);
  }

  private generateFallbackResponse(systemPrompt: string, userMessage: string): string {
    const lowerPrompt = systemPrompt.toLowerCase();

    // Spam / Retry Fallback
    if (lowerPrompt.includes('retry action') || lowerPrompt.includes('invalid') || lowerPrompt.includes('asdf')) {
      return "I couldn't determine your understanding from that response. Could you explain how Sentence Transformers generate embeddings for text chunks?";
    }

    // Greeting Fallback
    if (lowerPrompt.includes('state: greeting') || lowerPrompt.includes('greeting action')) {
      const nameMatch = systemPrompt.match(/Candidate Name:\s*([^\n]+)/i);
      const candidateName = nameMatch ? nameMatch[1].trim() : 'Candidate';
      return `Welcome ${candidateName}. I'm excited to explore your 31-day AI Cohort learning journey. Let's begin by discussing your experience with foundational AI setup and core concepts.`;
    }

    // Follow-up Fallback
    if (lowerPrompt.includes('follow-up action')) {
      return "Building on what you mentioned, how did you evaluate vector magnitude versus cosine distance during your implementation?";
    }

    // Question Fallback
    if (lowerPrompt.includes('target curriculum day:')) {
      const dayMatch = systemPrompt.match(/Target Curriculum Day:\s*Day (\d+) - ([^\n]+)/i);
      const toolMatch = systemPrompt.match(/Relevant Tools:\s*([^\n]+)/i);

      const dayNum = dayMatch ? dayMatch[1] : '7';
      const dayTitle = dayMatch ? dayMatch[2] : 'Embeddings Explained';
      const tools = toolMatch ? toolMatch[1] : 'Sentence Transformers';

      return `Let's discuss Day ${dayNum}: ${dayTitle}. How did you configure and use ${tools} in your implementation, and what key objective did you achieve?`;
    }

    return "That's a solid explanation. Can you walk me through the specific implementation details and trade-offs you encountered?";
  }
}

