import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { config } from '../config/env';
import { Logger } from '../utils/logger';

const IS_DEV = process.env.NODE_ENV !== 'production';

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
    this.model = config.llmModel;

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
      Logger.warn('LLMClient initialized in Mock/Fallback Mode (No valid API key configured)');
    }
  }

  public async generate(systemPrompt: string, userMessage: string = ''): Promise<string> {
    console.log("Using model:", this.model);

    const isJsonRequest = systemPrompt.toLowerCase().includes('output only valid json')
      || systemPrompt.toLowerCase().includes('exact schema:')
      || systemPrompt.toLowerCase().includes('output must be raw valid json');

    // 1. Live Groq Execution
    if (this.groqClient) {
      if (IS_DEV) {
        Logger.debug('🔥 GROQ REQUEST', {
          model: this.model,
          endpoint: 'https://api.groq.com/openai/v1/chat/completions',
          provider: 'Groq',
          messagePreview: (userMessage || '(evaluation request)').slice(0, 80)
        });
      }

      try {
        const userPrompt = userMessage && userMessage.trim().length > 0
          ? userMessage
          : (isJsonRequest ? 'Evaluate the candidate response and output valid JSON.' : 'Begin response.');

        let completion;
        let lastErr: any;
        const maxAttempts = 2;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            completion = await this.groqClient.chat.completions.create({
              model: this.model,  // Always use the configured model
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: isJsonRequest ? 0.15 : 0.7,
              max_completion_tokens: isJsonRequest ? 350 : 400,
              ...(isJsonRequest ? { response_format: { type: 'json_object' } } : {})
            });
            break; // Success
          } catch (err: any) {
            lastErr = err;
            if (err?.status === 429 && attempt < maxAttempts) {
              const waitMs = 1500;
              Logger.warn(`⏳ Groq rate limit hit (attempt ${attempt}/${maxAttempts}). Waiting ${waitMs}ms...`);
              await new Promise((r) => setTimeout(r, waitMs));
            } else if (err?.status === 429) {
              Logger.warn('⚠️ Groq quota limit hit — using deterministic fallback.');
              return this.generateFallbackResponse(systemPrompt, userMessage);
            } else {
              throw err;
            }
          }
        }

        if (completion) {
          const reply = completion.choices[0]?.message?.content?.trim();
          if (reply && reply.length > 0) {
            if (IS_DEV) {
              Logger.debug(`✅ GROQ RESPONSE: "${reply.slice(0, 120)}${reply.length > 120 ? '...' : ''}"`);
            }
            return reply;
          }
        }
      } catch (err: any) {
        // Sanitize error before logging — don't log auth headers
        Logger.error('Groq API call failed:', err.message || 'Unknown error');
        Logger.warn('Groq API call failed — falling back to deterministic mode.');
      }
    }

    // 2. Live Gemini Execution
    if (this.geminiClient) {
      if (IS_DEV) {
        Logger.debug('🔥 GEMINI REQUEST', { model: this.model, provider: this.provider });
      }

      try {
        const contentsText = userMessage && userMessage.trim().length > 0
          ? userMessage
          : (isJsonRequest ? 'Evaluate the candidate response and output valid JSON.' : 'Begin response.');

        const response = await this.geminiClient.models.generateContent({
          model: this.model || 'gemini-2.5-flash',
          contents: contentsText,
          config: {
            systemInstruction: systemPrompt,
            temperature: isJsonRequest ? 0.15 : 0.7,
            maxOutputTokens: isJsonRequest ? 500 : 600,
            ...(isJsonRequest ? { responseMimeType: 'application/json' } : {})
          }
        });

        const reply = response.text?.trim();
        if (reply && reply.length > 0) {
          if (IS_DEV) {
            Logger.debug(`✅ GEMINI RESPONSE: "${reply.slice(0, 120)}${reply.length > 120 ? '...' : ''}"`);
          }
          return reply;
        }
      } catch (err: any) {
        Logger.error('Gemini API call failed:', err.message || 'Unknown error');
        Logger.warn('Gemini API call failed — falling back to deterministic mode.');
      }
    }

    // 3. Live OpenAI Execution
    if (this.openAIClient) {
      if (IS_DEV) {
        Logger.debug('🔥 OPENAI REQUEST', { model: this.model });
      }
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
          temperature: isJsonRequest ? 0.15 : 0.7,
          max_tokens: isJsonRequest ? 500 : 600
        });

        const reply = completion.choices[0]?.message?.content?.trim();
        if (reply && reply.length > 0) {
          if (IS_DEV) {
            Logger.debug(`✅ OPENAI RESPONSE: "${reply.slice(0, 120)}${reply.length > 120 ? '...' : ''}"`);
          }
          return reply;
        }
      } catch (err: any) {
        Logger.error('OpenAI API call failed:', err.message || 'Unknown error');
      }
    }

    // 4. Deterministic Fallback
    return this.generateFallbackResponse(systemPrompt, userMessage);
  }

  private generateFallbackResponse(systemPrompt: string, userMessage: string): string {
    const lowerPrompt = systemPrompt.toLowerCase();
    const isJsonRequest = lowerPrompt.includes('output only valid json')
      || lowerPrompt.includes('exact schema:')
      || lowerPrompt.includes('output must be raw valid json');

    if (isJsonRequest) {
      const lowerMessage = (userMessage || '').toLowerCase();
      let correctness = 'ADEQUATE';
      let nextAction = 'advance';
      let score = 75;
      let reason = 'Candidate provided a valid technical explanation.';

      if (!userMessage || userMessage.trim().length < 3
        || /^(asdf|qwerty|zxcv|1234|abc|test|foo|bar|\?+|\.+|[a-z]{1,4})$/i.test(userMessage.trim())) {
        correctness = 'INVALID';
        nextAction = 'retry';
        score = 0;
        reason = 'Response was empty, keyboard spam, or invalid text.';
      } else if (/fuck|shit|bitch|asshole|cunt|bastard/i.test(userMessage)) {
        correctness = 'PROFANITY';
        nextAction = 'retry';
        score = 0;
        reason = 'Profanity detected in response.';
      } else if (lowerMessage.includes("don't know") || lowerMessage.includes("dont know")
        || lowerMessage.includes("not sure") || lowerMessage.includes("no idea")
        || lowerMessage.trim() === 'idk' || lowerMessage.trim() === 'pass') {
        correctness = 'UNCERTAIN';
        nextAction = 'retry';
        score = 10;
        reason = 'Candidate expressed uncertainty.';
      } else if (userMessage.split(/\s+/).length < 8) {
        correctness = 'WEAK';
        nextAction = 'follow_up';
        score = 45;
        reason = 'Response was brief and lacked implementation details.';
      }

      return JSON.stringify({
        score,
        confidence: 70,
        correctness,
        detected_concepts: [],
        missing_concepts: [],
        strengths: score > 0 ? ['Provided candidate answer'] : [],
        weaknesses: score === 0 ? ['No valid technical content detected'] : [],
        next_action: nextAction,
        reason
      });
    }

    // Extract Day context dynamically from prompt
    const dayMatch = systemPrompt.match(/Target Curriculum Day:\s*Day (\d+) - ([^\n]+)/i)
      || systemPrompt.match(/Target Curriculum Topic:\s*Day (\d+):\s*([^\n]+)/i)
      || systemPrompt.match(/Topic:\s*Day (\d+):\s*([^\n]+)/i);
    const toolMatch = systemPrompt.match(/Relevant Tools:\s*([^\n]+)/i)
      || systemPrompt.match(/Target Tools:\s*([^\n]+)/i)
      || systemPrompt.match(/ALLOWED TOOLS FOR THIS TOPIC:\s*([^\n]+)/i);

    const dayNum = dayMatch ? dayMatch[1] : '7';
    const dayTitle = dayMatch ? dayMatch[2].trim() : 'AI Engineering Fundamentals';
    const tools = toolMatch ? toolMatch[1].trim() : 'Sentence Transformers, Vector Databases';

    const stateMatch = systemPrompt.match(/INTERVIEW STATE:\s*([A-Z_]+)/i);
    const state = stateMatch ? stateMatch[1].toUpperCase() : 'QUESTION';

    if (state === 'GREETING') {
      const nameMatch = systemPrompt.match(/conducting a technical interview with ([^(,\n]+)/i);
      const name = nameMatch ? nameMatch[1].trim() : 'the candidate';
      return `Welcome, ${name}. Let's get started with ${dayTitle}. Walk me through how you approached using ${tools} in your project.`;
    }

    if (state === 'HINT' || state === 'RETRY') {
      return `Let's revisit ${dayTitle}. How specifically did you apply ${tools} to achieve the module objectives?`;
    }

    if (state === 'FOLLOW_UP') {
      return `Can you go deeper on the specific implementation details and trade-offs you encountered when using ${tools}?`;
    }

    if (state === 'TOPIC_SWITCH') {
      return `Good. Let's move on to ${dayTitle}. How did you configure and use ${tools} in that context?`;
    }

    return `For ${dayTitle}: how did you configure and use ${tools}, and what was the key outcome you achieved?`;
  }
}

// Singleton factory — shared across all services to avoid 3x SDK initialization
let _sharedInstance: LLMClient | null = null;
export function getSharedLLMClient(): LLMClient {
  if (!_sharedInstance) {
    _sharedInstance = new LLMClient();
  }
  return _sharedInstance;
}
