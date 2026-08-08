import dotenv from 'dotenv';
dotenv.config();

// Future responsibility: Environment variable loading and type-safe configuration mapping
export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmBaseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini'
};
