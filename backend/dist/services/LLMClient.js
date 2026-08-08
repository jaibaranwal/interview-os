"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMClient = void 0;
const genai_1 = require("@google/genai");
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class LLMClient {
    geminiClient = null;
    openAIClient = null;
    model;
    provider;
    constructor() {
        const apiKey = env_1.config.llmApiKey;
        this.provider = env_1.config.llmProvider;
        this.model = env_1.config.llmModel || 'gemini-2.5-flash';
        const isApiKeyValid = apiKey &&
            apiKey.trim().length > 0 &&
            !apiKey.includes('your_api_key_here') &&
            !apiKey.includes('your_gemini_api_key_here');
        if (isApiKeyValid) {
            if (this.provider === 'gemini' || apiKey.startsWith('AIza') || this.model.includes('gemini')) {
                this.geminiClient = new genai_1.GoogleGenAI({ apiKey });
                this.provider = 'Gemini';
                logger_1.Logger.info(`🚀 LLMClient initialized with Gemini (Model: ${this.model})`);
            }
            else {
                this.openAIClient = new openai_1.default({
                    apiKey,
                    baseURL: env_1.config.llmBaseUrl || undefined
                });
                this.provider = 'OpenAI';
                logger_1.Logger.info(`🚀 LLMClient initialized with OpenAI (Model: ${this.model})`);
            }
        }
        else {
            logger_1.Logger.info('LLMClient initialized in Mock/Fallback Mode (No API key configured)');
        }
    }
    async generate(systemPrompt, userMessage = '') {
        const isJsonRequest = systemPrompt.toLowerCase().includes('json');
        // 1. Live Gemini Execution
        if (this.geminiClient) {
            console.log('🔥 GEMINI CALLED');
            console.log('   - Model:', this.model);
            console.log('   - User Input:', userMessage || '(empty / system evaluation request)');
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
            }
            catch (err) {
                console.error('❌ GEMINI API CALL FAILED:', err.message);
                logger_1.Logger.error('Gemini API call failed, switching to intelligent fallback mode:', err.message);
            }
        }
        // 2. Live OpenAI Execution
        if (this.openAIClient) {
            console.log('🔥 OPENAI CALLED');
            try {
                const messages = [
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
            }
            catch (err) {
                logger_1.Logger.error('OpenAI API call failed, switching to intelligent fallback mode:', err.message);
            }
        }
        // 3. Intelligent Deterministic Fallback Generation
        return this.generateFallbackResponse(systemPrompt, userMessage);
    }
    generateFallbackResponse(systemPrompt, userMessage) {
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
exports.LLMClient = LLMClient;
