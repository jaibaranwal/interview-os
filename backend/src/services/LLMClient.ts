import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { config } from '../config/env';
import { Logger } from '../utils/logger';

export interface ILLMClient {
  generate(systemPrompt: string, userMessage?: string): Promise<string>;
}

export class LLMClient implements ILLMClient {
  private groqClient: Groq | null = null;
  private geminiClient: GoogleGenAI | null = null;
  private openAIClient: OpenAI | null = null;
  private model: string;
  private provider: string;

  constructor() {
    const apiKey = config.llmApiKey || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '';
    this.provider = (config.llmProvider || '').toLowerCase();
    this.model = config.llmModel || (this.provider === 'groq' || apiKey.startsWith('gsk_') ? 'llama-3.3-70b-versatile' : 'gemini-2.5-flash');

    const isApiKeyValid =
      apiKey &&
      apiKey.trim().length > 0 &&
      !apiKey.includes('your_api_key_here') &&
      !apiKey.includes('your_gemini_api_key_here') &&
      !apiKey.includes('gsk_...');

    if (isApiKeyValid) {
      if (this.provider === 'groq' || apiKey.startsWith('gsk_')) {
        this.groqClient = new Groq({ apiKey });
        this.provider = 'Groq';
        Logger.info(`🚀 Groq initialized (Model: ${this.model})`);
      } else if (this.provider === 'gemini' || apiKey.startsWith('AIza') || this.model.includes('gemini')) {
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
    const isJsonRequest = systemPrompt.toLowerCase().includes('json');

    // 1. Live Groq Execution
    if (this.groqClient) {
      console.log("🔥 GROQ REQUEST");
      console.log({
        model: this.model || 'llama-3.3-70b-versatile',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        provider: 'Groq',
        userMessage: userMessage || '(evaluation request)'
      });

      try {
        const userPrompt = userMessage && userMessage.trim().length > 0
          ? userMessage
          : (isJsonRequest ? 'Evaluate the candidate response and output valid JSON.' : 'Begin response.');

        let completion;
        try {
          completion = await this.groqClient.chat.completions.create({
            model: this.model || 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: isJsonRequest ? 0.2 : 0.3,
            max_completion_tokens: 600,
            ...(isJsonRequest ? { response_format: { type: 'json_object' } } : {})
          });
        } catch (rateErr: any) {
          if (rateErr?.status === 429) {
            console.log('⏳ Groq TPM rate limit hit on 70B model, retrying with llama-3.1-8b-instant...');
            completion = await this.groqClient.chat.completions.create({
              model: 'llama-3.1-8b-instant',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: isJsonRequest ? 0.2 : 0.3,
              max_completion_tokens: 600,
              ...(isJsonRequest ? { response_format: { type: 'json_object' } } : {})
            });
          } else {
            throw rateErr;
          }
        }

        const reply = completion.choices[0]?.message?.content?.trim();
        if (reply && reply.length > 0) {
          console.log("🔥 GROQ RESPONSE:");
          console.log(`"${reply.slice(0, 150)}${reply.length > 150 ? '...' : ''}"\n`);
          return reply;
        }
      } catch (err: any) {
        console.error("❌ GROQ ERROR");
        console.error(JSON.stringify(err, null, 2));
        Logger.error('Groq API call failed, switching to intelligent fallback mode:', err.message);
      }
    }


    // 2. Live Gemini Execution
    if (this.geminiClient) {
      console.log("🔥 GEMINI REQUEST");
      console.log({
        model: this.model || 'gemini-2.5-flash',
        endpoint: 'generativelanguage.googleapis.com',
        provider: this.provider,
      });

      try {
        const contentsText = userMessage && userMessage.trim().length > 0
          ? userMessage
          : (isJsonRequest ? 'Evaluate the candidate response and output valid JSON.' : 'Begin response.');

        const response = await this.geminiClient.models.generateContent({
          model: this.model || 'gemini-2.5-flash',
          contents: contentsText,
          config: {
            systemInstruction: systemPrompt,
            temperature: isJsonRequest ? 0.2 : 0.7,
            maxOutputTokens: 600,
            ...(isJsonRequest ? { responseMimeType: 'application/json' } : {})
          }
        });

        const reply = response.text?.trim();
        if (reply && reply.length > 0) {
          console.log('✅ GEMINI RESPONSE RECEIVED:');
          console.log(`"${reply.slice(0, 150)}${reply.length > 150 ? '...' : ''}"\n`);
          return reply;
        }
      } catch (err: any) {
        console.error("🔥 FULL GEMINI ERROR");
        console.error(JSON.stringify(err, null, 2));
        Logger.error('Gemini API call failed, switching to intelligent fallback mode:', err.message);
      }
    }

    // 3. Live OpenAI Execution
    if (this.openAIClient) {
      console.log('🔥 OPENAI CALLED');
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
          console.log('✅ OPENAI RESPONSE RECEIVED:', reply.slice(0, 150));
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

    // Extract Day, Title, and Tools from system prompt dynamically
    const dayMatch = systemPrompt.match(/Target Curriculum Day:\s*Day (\d+) - ([^\n]+)/i) ||
                     systemPrompt.match(/Target Curriculum Topic:\s*Day (\d+):\s*([^\n]+)/i);
    const toolMatch = systemPrompt.match(/Relevant Tools:\s*([^\n]+)/i) ||
                     systemPrompt.match(/Target Tools:\s*([^\n]+)/i);

    const dayNum = dayMatch ? dayMatch[1] : '7';
    const dayTitle = dayMatch ? dayMatch[2].trim() : 'Embeddings Explained';
    const tools = toolMatch ? toolMatch[1].trim() : 'Sentence Transformers, Vector Databases';

    // Spam / Retry Fallback (Dynamic per day topic)
    if (lowerPrompt.includes('retry action') || lowerPrompt.includes('invalid') || lowerPrompt.includes('asdf')) {
      return `I couldn't determine your understanding from that response. Could you explain how you configured and used ${tools} on Day ${dayNum} (${dayTitle})?`;
    }

    // Greeting Fallback
    if (lowerPrompt.includes('state: greeting') || lowerPrompt.includes('greeting action')) {
      const nameMatch = systemPrompt.match(/Candidate Name:\s*([^\n]+)/i);
      const candidateName = nameMatch ? nameMatch[1].trim() : 'Candidate';
      return `Welcome ${candidateName}. I'm excited to explore your 31-day AI Cohort learning journey. Let's begin by discussing your experience with foundational AI setup and core concepts.`;
    }

    // Follow-up Fallback (Dynamic per day topic)
    if (lowerPrompt.includes('follow-up action')) {
      return `Building on what you mentioned for Day ${dayNum} (${dayTitle}), how did you evaluate implementation trade-offs using ${tools}?`;
    }

    // Question Fallback
    if (lowerPrompt.includes('target curriculum day:') || lowerPrompt.includes('target curriculum topic:')) {
      return `Let's discuss Day ${dayNum}: ${dayTitle}. How did you configure and use ${tools} in your implementation, and what key objective did you achieve?`;
    }

    return `That's a solid explanation for Day ${dayNum} (${dayTitle}). Can you walk me through the specific implementation details and trade-offs you encountered?`;
  }
}


