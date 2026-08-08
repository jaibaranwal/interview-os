import dotenv from 'dotenv';
dotenv.config();

// Type-safe environment variable loading (Default port 5001 to avoid macOS ControlCenter conflict on 5000)
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmBaseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini'
};
