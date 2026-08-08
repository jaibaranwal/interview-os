import dotenv from 'dotenv';
dotenv.config();

// Type-safe environment variable loading
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  llmProvider: process.env.LLM_PROVIDER || 'groq',
  llmApiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
  llmBaseUrl: process.env.LLM_BASE_URL || '',
  llmModel: process.env.LLM_MODEL || ''
};

// Startup debug logs
console.log("process.env.LLM_MODEL =", process.env.LLM_MODEL);
console.log("env.LLM_MODEL =", config.llmModel);
