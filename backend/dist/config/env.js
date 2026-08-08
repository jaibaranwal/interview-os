"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Type-safe environment variable loading (Default port 5001 to avoid macOS ControlCenter conflict on 5000)
exports.config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5001,
    nodeEnv: process.env.NODE_ENV || 'development',
    llmProvider: process.env.LLM_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai'),
    llmApiKey: process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
    llmBaseUrl: process.env.LLM_BASE_URL || '',
    llmModel: process.env.LLM_MODEL || 'gemini-2.5-flash'
};
