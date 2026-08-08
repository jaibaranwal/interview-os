# InterviewOS — Autonomous Adaptive AI Technical Interviewer

> **"Build the interviewer, not the interview."** — Problem Statement 2

InterviewOS is an autonomous, adaptive AI Technical Interviewer built for evaluating candidates participating in the **31-Day AI Cohort**. Unlike static question-bank bots, InterviewOS acts as a senior principal interviewer: it analyzes candidate histories, constructs dynamic curriculum coverage plans, dynamically adjusts question difficulty, tracks conversational state, probes candidate claims, and compiles structured post-interview evaluations.

---

## 🌟 Key Differentiators & Features

1. **Deterministic Interview Brain:**
   - **CandidateAnalyzer:** Scores seniority ($S \in [1.0, 5.0]$) and classifies historical missions into mastered, struggled, and skipped topics.
   - **InterviewPlanner:** Guarantees minimum 8 questions across at least 4 curriculum days, prioritizing candidate weak areas while avoiding skipped curriculum overflow.
   - **ConversationMemory:** Stateful memory tracking visited days, asked objectives, turn histories, detected mistakes, strengths, and weaknesses.
   - **StateMachine:** 10-state finite state machine (`GREETING`, `PLANNING`, `QUESTION`, `LISTENING`, `EVALUATING`, `FOLLOW_UP`, `HINT`, `TOPIC_SWITCH`, `FINAL_EVALUATION`, `COMPLETED`).
   - **ResponseEvaluator:** Deterministic natural language evaluator detecting empty, short, detailed, or uncertain responses.

2. **Orchestration Layer & Provider Independence:**
   - **InterviewEngine:** Clean, decoupled orchestrator executing turn transitions without hardcoded prompts.
   - **LLMClient:** Supports OpenAI and Gemini (via OpenAI-compatible endpoint). Includes an intelligent offline fallback mode for local testing.
   - **PromptBuilder:** Synthesizes system prompts enforcing strict constraints: **Ask EXACTLY ONE question**, zero internal reasoning leakage, and concise interviewer tone.

3. **Modern Web UI Cockpit:**
   - Dark glassmorphism dashboard built with React, Vite, and TypeScript.
   - Candidate drawer allowing judges to select any of the 20 cohort profiles.
   - Live metrics bar tracking Question Progress ($0/8$), Curriculum Days ($0/4$), and Adaptive Difficulty ($D$).
   - Interactive modal rendering structured post-interview feedback (`summary`, `strengths`, `gaps`, `next`).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ & `npm`

### 1. Start Backend API Server
```bash
cd backend
npm install
npm run build
npm start
```
*Backend server runs on `http://localhost:5000`*

### 2. Start Frontend Cockpit
```bash
cd frontend
npm install
npm run dev
```
*Frontend application opens on `http://localhost:5173`*

---

## 🧪 Running Automated Test Suites

The backend includes comprehensive automated test suites:

```bash
cd backend

# Phase 1: Test Candidate & Curriculum Dataset Loaders
npm run test:phase1

# Phase 2: Test Express Server, Health & Session Store
npm run test:phase2

# Deterministic Brain: Test CandidateAnalyzer, Planner, Memory, StateMachine & Evaluator
npm run test:brain

# Orchestration Layer: Test PromptBuilder & InterviewEngine Turn Execution
npm run test:orchestrator

# Full End-to-End: Test Complete Multi-Turn Interview & Structured Feedback Output
npm run test:e2e
```

---

## 📋 API Specification Summary (`POST /api/interview`)

### Turn 1: Start Interview
```json
{
  "sessionId": "session-101",
  "candidate": { ... }
}
```
**Response:**
```json
{
  "reply": "Welcome Sarah Johnson. I'm excited to explore your 31-day AI Cohort learning journey...",
  "done": false
}
```

### Turn 2 to N-1: Turn Execution
```json
{
  "sessionId": "session-101",
  "message": "On Day 7, I implemented Sentence Transformers with cosine similarity distance."
}
```
**Response:**
```json
{
  "reply": "Building on what you mentioned, how did you evaluate vector recall in ChromaDB?",
  "done": false
}
```

### Turn N: Interview Completion & Structured Evaluation
**Response:**
```json
{
  "reply": "Thank you Sarah. That concludes our adaptive technical interview session...",
  "done": true,
  "feedback": {
    "summary": "Sarah Johnson completed an 8-question technical evaluation...",
    "strengths": [ ... ],
    "gaps": [ ... ],
    "next": [ ... ]
  }
}
```

---

## 📁 Repository Architecture Structure

```
interview-os/
├── candidates.json           # 20 synthetic candidate profiles
├── curriculum.json           # 31-day AI Cohort curriculum (8 modules, 155 objectives)
├── technical-spec.md         # API contract & problem statement rules
├── docs/
│   ├── Build-Bible.md        # Comprehensive 23-section engineering reference
│   └── Architecture.md       # Technical blueprint & implementation sequence
├── backend/                  # Express + TypeScript API Server
│   ├── src/
│   │   ├── config/           # Type-safe environment loader
│   │   ├── controllers/      # Express API controllers
│   │   ├── data/             # Candidate & Curriculum dataset loaders
│   │   ├── engine/           # CandidateAnalyzer, ResponseEvaluator, StateMachine
│   │   ├── memory/           # ConversationMemory state store
│   │   ├── middleware/       # Logger & centralized error handler
│   │   ├── routes/           # Express router definitions
│   │   ├── services/         # InterviewEngine, LLMClient, PromptBuilder, FeedbackEngine, DifficultyEngine
│   │   ├── types/            # Shared TypeScript domain models
│   │   └── validators/       # Zod request validation schemas
│   └── package.json
└── frontend/                 # React + Vite + TypeScript Web UI Cockpit
    ├── src/
    │   ├── components/       # Header, CandidateDrawer, InterviewCockpit, ChatInterface, FeedbackModal
    │   ├── services/         # API integration client
    │   ├── types/            # Frontend type definitions
    │   └── App.tsx
    └── package.json
```
