"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Type-safe environment variable loading
exports.config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5001,
    nodeEnv: process.env.NODE_ENV || 'development',
    llmProvider: process.env.LLM_PROVIDER || 'groq',
    llmApiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
    llmBaseUrl: process.env.LLM_BASE_URL || '',
    llmModel: process.env.LLM_MODEL || ''
};
// Startup debug logs
console.log("process.env.LLM_MODEL =", process.env.LLM_MODEL);
console.log("env.LLM_MODEL =", exports.config.llmModel);
