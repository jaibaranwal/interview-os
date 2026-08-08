import dotenv from 'dotenv';
dotenv.config();

// Type-safe environment variable loading (Default port 5001 to avoid macOS ControlCenter conflict on 5000)
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  llmProvider: process.env.LLM_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : (process.env.GEMINI_API_KEY ? 'gemini' : 'openai')),
  llmApiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
  llmBaseUrl: process.env.LLM_BASE_URL || '',
  llmModel: process.env.LLM_MODEL || (process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gemini-2.5-flash')
};

