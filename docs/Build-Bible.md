# Chapter 0: Project Understanding Report

**Project Title:** InterviewOS  
**Problem Statement:** Problem Statement 2 — The Interview Agent (*"Build the interviewer, not the interview."*)  
**Context:** AI Cohort (31-day Enterprise AI Engineering Program)  
**Document Author:** InterviewOS Chief Architect  
**Status:** Approved Foundation / Pre-Design Phase  

---

## 1. Executive Summary & Problem Framing

The objective of **InterviewOS** is to build an autonomous, adaptive AI Technical Interview Agent. The platform evaluates candidates who have completed or participated in "The AI Cohort"—a 31-day intensive enterprise AI engineering curriculum. 

Rather than executing a static, scripted questionnaire, the agent must simulate a realistic, multi-turn technical interview. It must tailor questions to each candidate's specific learning journey (completed missions, failed attempts, skipped topics, commit frequency, background experience), dynamically adapt based on candidate responses in real-time, ask intelligent follow-up questions, preserve conversation context across turns, and issue structured, actionable feedback at the conclusion of the session.

---

## 2. Functional Requirements

Based strictly on the Problem Statement description and Technical Specification:

1. **Candidate-Aware Initialization:**
   - The agent must ingest a candidate profile (conforming to `candidates.json` schema) upon session startup via `POST /api/interview`.
   - The initial greeting (`reply`) must mark the start of an adaptive technical interview tailored to that candidate's completed topics, background, and performance signals.

2. **Conversational Multi-Turn Technical Interview:**
   - The agent must conduct a natural, conversational technical interview over multiple HTTP turns.
   - **Minimum Question Volume:** Must ask a minimum of **8 questions** per complete interview session.
   - **Curriculum Breadth:** Questions must cover at least **4 distinct curriculum days** out of the 31-day curriculum.
   - **Concept Evaluation:** Questions must evaluate the candidate's understanding of concepts, tools, and objectives belonging to completed cohort missions.

3. **Dynamic Adaptation & Follow-Up Generation:**
   - The agent must not follow a fixed static branching script.
   - It must analyze previous candidate responses in real-time to generate contextual follow-up questions (probing deeper into partial answers, testing trade-offs, or shifting topics based on candidate performance).

4. **Multi-Turn Context Maintenance:**
   - The agent must maintain state and conversation context across turns using a provided `sessionId`.

5. **Structured Feedback Generation at Termination:**
   - When the interview concludes (`done: true`), the response must include a structured `feedback` object containing:
     - `summary`: A textual summary of the candidate's performance.
     - `strengths`: A list of concise, actionable points highlighting areas of strong technical understanding.
     - `gaps`: A list of concise, actionable points identifying technical weaknesses or missed concepts.
     - `next`: A list of concise, actionable recommendations for future growth and preparation.

---

## 3. Non-Functional Requirements

1. **State Preservation & Resilience:**
   - Sessions must reliably retain full conversation state, candidate background, and historical questions mapped to `sessionId`.

2. **Conversational Realism & Human-like Tone:**
   - The agent's tone must mirror a real technical interviewer (professional, probing, constructive, non-scripted).

3. **Response Determinism & Schema Compliance:**
   - All API outputs must strictly adhere to the defined JSON response contracts across all stages of the lifecycle (`done: false` vs `done: true`).

4. **Performance & Latency:**
   - API endpoints must respond within reasonable HTTP timeout limits to provide a smooth chat/interview experience.

---

## 4. API Requirements & Required Endpoints

The project requires **exactly one primary HTTP endpoint** as specified in `technical-spec.md`.

### Primary Endpoint
`POST /api/interview`  
*Authentication:* None required.  
*State Management:* Managed via `sessionId`.

---

### Request/Response Lifecycle Contracts

#### Phase 1: Start Interview (Turn 1)
- **HTTP Method & Path:** `POST /api/interview`
- **Request Body:**
  ```json
  {
    "sessionId": "string",
    "candidate": {
      "member": {
        "id": "string",
        "name": "string",
        "jobRole": "string",
        "yearsExperience": "number",
        "education": "string",
        "status": "string"
      },
      "missions": [
        {
          "day": "number",
          "title": "string",
          "passed": "boolean (optional)",
          "attempts": "number (optional)",
          "skipped": "boolean (optional)"
        }
      ],
      "signals": {
        "commitDays": "number",
        "missionsCompleted": "number",
        "missionsFirstTry": "number"
      }
    }
  }
  ```
- **Response Body (`done: false`):**
  ```json
  {
    "reply": "string",
    "done": false
  }
  ```

---

#### Phase 2: Active Conversation Turn (Turns 2 to N-1)
- **HTTP Method & Path:** `POST /api/interview`
- **Request Body:**
  ```json
  {
    "sessionId": "string",
    "message": "string"
  }
  ```
- **Response Body (`done: false`):**
  ```json
  {
    "reply": "string",
    "done": false
  }
  ```

---

#### Phase 3: Interview Completion (Turn N)
- **HTTP Method & Path:** `POST /api/interview`
- **Request Body:**
  ```json
  {
    "sessionId": "string",
    "message": "string"
  }
  ```
- **Response Body (`done: true`):**
  ```json
  {
    "reply": "string",
    "done": true,
    "feedback": {
      "summary": "string",
      "strengths": ["string"],
      "gaps": ["string"],
      "next": ["string"]
    }
  }
  ```

---

## 5. Available Data & Schema Analysis

### Resource 1: `curriculum.json`
- **Structure:**
  - `cohort`: Header string (`"AI Cohort · 31 days · 8 modules"`).
  - `modules`: Array of 8 modules, defining `n` (1-8), `title`, and `days` range (`[startDay, endDay]`).
    1. Module 1: Environment & Tooling (Days 1–3)
    2. Module 2: Data Foundations (Days 4–6)
    3. Module 3: Embeddings & Vector Search (Days 7–10)
    4. Module 4: LLM Core, Prompting & Fine-Tuning (Days 11–15)
    5. Module 5: Chatbot Application Build (Days 16–20)
    6. Module 6: Agentic AI & MCP (Days 21–24)
    7. Module 7: Evaluation, Security & Deployment (Days 25–28)
    8. Module 8: Production & Capstone (Days 29–31)
  - `days`: Array of 31 day objects. Each day object contains:
    - `day`: Integer (1 to 31).
    - `title`: String.
    - `type`: String category (`SETUP`, `BUILD`, `AI_CORE`, `SHIP_IT`, `LEARN`, `OPTIMIZE`, `CAPSTONE`).
    - `tools`: Array of strings (e.g., `["Ollama", "FastAPI", "React", "ChromaDB", "LangChain", "MCP Python SDK"]`).
    - `objectives`: Array of exactly 5 detailed objective strings per day.

---

### Resource 2: `candidates.json`
- **Structure:** Array of 20 synthetic candidate profiles (`CAND-001` through `CAND-020`).
- **Profile Fields:**
  - `member`: Demographics and cohort status (`id`, `name`, `jobRole`, `yearsExperience`, `education`, `status`).
  - `missions`: List of mission objects representing performance on specific days.
    - Status types across profiles:
      - `{ "day": 7, "title": "...", "passed": true, "attempts": 1 }`
      - `{ "day": 29, "title": "...", "skipped": true }`
      - `{ "day": 8, "title": "...", "passed": false, "attempts": 4 }`
  - `signals`: Aggregated activity indicators:
    - `commitDays`: Total days with commits recorded (out of 31).
    - `missionsCompleted`: Total missions completed.
    - `missionsFirstTry`: Missions passed on the first attempt.
- **Candidate Diversity:** Candidates span diverse job roles (Senior Data Engineer, AI Engineer, UX Researcher, Marketing Manager, IT Support, Business Analyst, Principal Architect, Intern), experience levels (0 to 28 years), and completion profiles (high performers vs struggled/skipped missions).

---

## 6. Constraints & Boundaries

### In-Scope Requirements
- Multi-turn conversational HTTP API (`POST /api/interview`).
- Personalization based on candidate profile data and curriculum objectives.
- Session-based conversation state tracking via `sessionId`.
- Minimum 8 questions spanning at least 4 curriculum days.
- Adaptive follow-up question logic.
- Final structured feedback schema (`summary`, `strengths`, `gaps`, `next`).
- AI Usage Log (`PROMPTS.md`).

### Explicitly Out-of-Scope Requirements
- Voice interaction / Speech-to-text / Text-to-speech.
- User authentication & user signup/login systems.
- Persistent user accounts / Database user management.
- Long-term conversation history retention across multiple distinct interviews.
- Native mobile applications.
- Recruiter dashboard / Admin panel.
- Real production databases (mocked data in JSON is sufficient).

---

## 7. Evaluation Process & Hackathon Rules

Submissions undergo a 4-stage evaluation workflow:

1. **Stage 1: Eligibility Verification (Pass/Fail Automated Check)**
   - Publicly accessible GitHub repository URL.
   - Functional Live Demo URL.
   - Accessible AI Usage Log (`PROMPTS.md`).
   - Registered team submission prior to official deadline.

2. **Stage 2: Authenticity Review (Automated + Manual)**
   - Repo created after official hackathon kickoff.
   - Commit history showing active development (no pre-existing bulk code drops or single large final commits).
   - AI Usage Log (`PROMPTS.md`) must genuinely correspond to feature development and prompt history.

3. **Stage 3: Project Judging (100 Points, 2 Independent Judges)**
   - Evaluated independently by two judges. Average score used. (If score difference >15 points, a 3rd judge evaluates and median score is used).

4. **Stage 4: Live Steer Challenge (Top 6 Finalist Teams)**
   - 20-minute live video call with screen sharing.
   - Unseen feature request implemented live on the submitted repo using AI tools.

---

## 8. Submission Requirements

As shown in the evaluation platform interface:
1. **Selected Problem Statement:** Problem Statement 2 (The Interview Agent).
2. **Public GitHub Repo Link:** Must be public, cloneable, and contain full project source.
3. **Live URL:** Publicly reachable host (e.g., Vercel, Render, Railway, Netlify).
4. **AI-Usage Log URL:** Link to `PROMPTS.md` in repo root or exported chat transcripts.

---

## 9. System Risks & Technical Challenges

1. **Question Volume & Termination Timing Risk:**
   - **Constraint:** Must ask at least 8 questions covering at least 4 curriculum days before setting `done: true`.
   - **Risk:** Premature interview termination by LLM before reaching the 8-question / 4-day threshold, or infinite looping past 8 questions without proper conclusion.

2. **Curriculum Coverage Tracking Risk:**
   - **Constraint:** Questions must span at least 4 distinct curriculum days completed by the candidate.
   - **Risk:** LLM fixating on a single module/day (e.g., Day 7 Embeddings) and failing to verify coverage across 4 days.

3. **Session State Isolation & Concurrency Risk:**
   - **Constraint:** HTTP endpoint is stateless; state must be tracked via `sessionId`.
   - **Risk:** Session state collisions or memory corruption when handling multiple concurrent evaluators/test sessions.

4. **Schema Compliance & Feedback Generation Risk:**
   - **Constraint:** Final turn must return exact JSON schema with `reply`, `done: true`, and `feedback` object (`summary`, `strengths`, `gaps`, `next`).
   - **Risk:** Failure to include all required arrays or structural corruption during JSON serialization on the final turn.

5. **LLM Hallucination vs. Curriculum Grounding Risk:**
   - **Constraint:** Interview must assess actual cohort topics (31 days of specific tools/objectives).
   - **Risk:** Agent asking questions about topics outside the curriculum or testing candidate on skipped/uncompleted missions without context.

---

## 10. Unknowns & Ambiguities

1. **Exact Interview Termination Trigger:**
   - *Question:* Who determines when the interview ends? Does the client pass a specific termination flag, does the candidate say "I want to stop", or does the AI agent decide internally after completing its evaluation criteria (>= 8 questions)?
   - *Doc Evidence:* `technical-spec.md` shows `done: false` during conversation turns and `done: true` with `feedback` at the end. The spec does not specify an explicit external trigger field, implying the agent controls or manages termination based on interview state.

2. **Candidate Profile Payload Variant in Start Request:**
   - *Question:* Will the evaluation runner send the complete candidate object from `candidates.json` (including `member`, `missions`, `signals`), or could it send custom candidate objects adhering to the same schema?
   - *Doc Evidence:* `technical-spec.md` states `"candidate": { ...candidate.json }` and `"The candidate object will follow the provided candidate.json schema."`

3. **Evaluator Session Duration & Turn Pace:**
   - *Question:* How many turns will an automated evaluator execute per test? Will evaluators answer succinctly or thoroughly?
   - *Doc Evidence:* Problem statement requires a minimum of 8 questions. Total turns will be at least 9+ (initialization request + minimum 8 question-answer turns + final completion response).

---

## 11. Opportunities for Differentiation

1. **Adaptive Interview Persona & Depth Control:**
   - Dynamic difficulty adjustment: Tailored questioning based on candidate background (e.g., asking deeper architectural questions to Senior Engineers vs fundamental conceptual checks to beginners).

2. **Mission Failure & Attempt-Aware Probe Engine:**
   - Intelligent probing of candidate weak points: Specific follow-up on missions where the candidate had high attempts (e.g., 4-5 attempts) or failed, validating if their understanding has improved.

3. **Rich Curriculum Knowledge Graph & Objective Grounding:**
   - Grounding questions directly in the 5 objectives per day from `curriculum.json` to ensure high technical specificity (e.g., asking about `pdfplumber` vs `Tesseract OCR` for Day 5).

4. **Transparent Evaluation Criteria & Multi-Dimensional Feedback:**
   - Generating exceptionally granular, actionable feedback mapping strengths and gaps directly to specific cohort days and tools.

---

## 12. Current Workspace Baseline & Folder Structure

```
/Users/jai/PROJECTS/interview-os
├── .git/
├── README.md                (Project overview placeholder)
├── candidates.json          (20 synthetic candidate profiles)
├── curriculum.json          (31-day AI Cohort curriculum)
├── technical-spec.md        (API contract specification)
├── backend/                 (Empty directory allocated for backend service)
├── frontend/                (Empty directory allocated for UI app)
└── docs/
    ├── Build-Bible.md       (Destination for Build Bible & Chapter 0)
    ├── notes.md             (Empty scratchpad)
    ├── prompts.txt          (Empty prompt log draft)
    └── assets/              (Asset storage directory)
```

---

## 13. Verified Understanding Checklist

✔ **Problem Statement:** Selected Problem Statement 2 (AI Technical Interview Agent for 31-day AI Cohort).  
✔ **API Contract:** Single endpoint `POST /api/interview`, stateful via `sessionId`, schema-compliant request/response lifecycle.  
✔ **Session Lifecycle:** 3 distinct phases (Start with `candidate` object -> Conversation turns with `message` -> End turn with `done: true` and `feedback` object).  
✔ **Curriculum Dataset:** 31 days across 8 modules, 155 specific objectives, tools, and mission types defined in `curriculum.json`.  
✔ **Candidate Dataset:** 20 profiles in `candidates.json` with demographic data, mission results (`passed`, `attempts`, `skipped`), and activity `signals`.  
✔ **Minimum Evaluation Constraints:** Minimum 8 technical questions covering at least 4 different curriculum days per candidate interview.  
✔ **Feedback Schema:** `summary` (string), `strengths` (string[]), `gaps` (string[]), `next` (string[]).  
✔ **Out of Scope:** Voice, Auth, Production DB, Recruiter Dashboard, Mobile Apps.  
✔ **Hackathon & Evaluation Rules:** 4 stages (Eligibility, Authenticity, Judging, Live Steer Challenge). Requirements for public repo, live URL, and `PROMPTS.md`.  

---

## 14. Pre-Implementation Clarification Checklist

✔ **Clarification 1: Interview Termination Logic & Control Flow**  
- *Item:* Confirm whether the server agent independently decides when to conclude the interview after asking >= 8 questions across >= 4 days, or if client message cues are expected.  

✔ **Clarification 2: Web Interface Scope for Live Demo URL**  
- *Item:* Confirm if a web frontend (e.g., interactive interview chat UI) should be built in addition to the backend API to satisfy the "functional Live Demo URL" requirement for human judges.  

✔ **Clarification 3: Storage & Persistence of Session Context**  
- *Item:* Clarify preferred in-memory vs file-backed session storage mechanism for session state maintenance during evaluation execution.  

---

## 15. Judge Psychology

To achieve a top score from experienced hackathon judges (Stage 3 Evaluation — 100 Points, 2 Independent Judges), InterviewOS must be designed around how judges evaluate projects under time constraints.

### 1. Immediate Impression Drivers (First 30 Seconds)
- **Flawless API Schema Compliance:** Judges or automated evaluation runners will immediately execute sample POST payloads against `POST /api/interview`. Instant compliance with zero schema mismatches builds immediate baseline confidence.
- **Personalized First Response:** The initial greeting (`reply`) on Turn 1 must immediately reference the candidate’s specific name, background, job role, and completed cohort missions rather than emitting a generic welcome message.
- **Visual & Conversational Polish:** If tested via a live web interface, clean typography, responsive layout, clear status badges, and real-time response indicators create an instant impression of production quality.

### 2. The "Wow" Factor
- **Curriculum-Grounded Specificity:** Asking questions that cite exact tools (`Sentence Transformers`, `ChromaDB`, `OpenAI Function Calling`, `MCP Python SDK`) and specific objectives from `curriculum.json` demonstrates deep system integration rather than surface-level prompting.
- **Dynamic Response-Driven Probing:** When a candidate gives a partial answer, hand-waves a concept, or makes a technical claim, the agent must immediately probe deeper into that specific claim in the next turn rather than blindly advancing to an unrelated topic.
- **Seniority-Adaptive Depth:** Escalating architectural depth for senior engineers (e.g., querying vector index indexing trade-offs for a Senior Data Engineer) while providing structured, supportive conceptual checks for junior candidates.

### 3. Polish & Rigor Indicators
- **Structured Feedback Quality:** The final response (`done: true`) must deliver exceptionally actionable feedback with non-empty, detailed items under `strengths`, `gaps`, and `next`.
- **Session Resilience:** Interrupted connections, repeated turn submissions, or page refreshes must preserve full session memory without state corruption.
- **Contextual Memory References:** Referring back to previous candidate statements from earlier turns ("*Earlier you mentioned using ChromaDB locally, but how did you handle scaling when moving to Pinecone in Day 8?*").

### 4. Red Flags That Cause Judges to Lose Confidence
- **Generic Chatbot Boilerplate:** Standard system prompt responses ("*Hello! Welcome to your interview. Tell me about Python.*").
- **Static Scripted Flow:** Asking a pre-determined list of 8 questions regardless of candidate input.
- **Premature Termination:** Returning `done: true` before reaching the minimum requirement of 8 questions across at least 4 curriculum days.
- **Hallucinated Curriculum Topics:** Testing candidates on concepts or technologies outside the 31-day AI Cohort curriculum.
- **Empty or Vague Feedback:** Returning generic bullet points like `["Good job", "Study more"]`.

### 5. High-Quality Engineering Practices
- **Hybrid State Engine:** Enforcing deterministic question counting and day coverage tracking alongside adaptive LLM dialogue generation.
- **Transparent AI Usage Log (`PROMPTS.md`):** Complete, traceable prompt evolution documenting system prompts, guardrails, and orchestration iterations.
- **Active Git Commit Trajectory:** Frequent, meaningful git commits reflecting authentic incremental development from hackathon kickoff to submission.

---

## 16. Winning Strategy

### 1. Predicted Approach of 90% of Competitors
Most competing teams will likely take a shortcut approach:
- Wrapping a single OpenAI or Gemini API call in a basic server endpoint.
- Passing a simple system prompt ("*You are a technical interviewer interviewing a candidate.*").
- Maintaining an unmanaged array of chat messages without tracking curriculum coverage or question counts.
- Returning generic feedback by passing the full conversation transcript back to the LLM on the last turn.

### 2. Why Competitors' Solutions Will Fail
- **Constraint Violations:** Unmanaged LLM prompts routinely fail to enforce minimum question volume (>= 8 questions) or broad curriculum coverage (>= 4 days).
- **Lack of Realism:** Generic prompts ask surface-level questions and fail to probe candidate weak points or leverage background metadata.
- **Schema Instability:** Unstructured LLMs frequently omit required feedback keys (`summary`, `strengths`, `gaps`, `next`) or fail JSON validation during final turns.
- **Zero Differentiation:** Every naive wrapper feels identical to judges reviewing dozens of submissions.

### 3. InterviewOS Winning Strategy
InterviewOS distinguishes itself through an **Orchestrated Hybrid Interview Architecture**:

```
                                  ┌─────────────────────────────────────────┐
                                  │           InterviewOS Engine            │
                                  ├─────────────────────────────────────────┤
 candidate.json ────────┐         │  ┌───────────────────────────────────┐  │         ┌──────────────────────┐
                        ├────────►│  │   Deterministic State Manager     │  ├────────►│  POST /api/interview │
 curriculum.json ───────┘         │  │   - Question Counter (Min 8)      │  │         │  Schema Compliant    │
                                  │  │   - Day Coverage Tracker (Min 4)  │  │         └──────────────────────┘
                                  │  │   - Session Memory Store          │  │
                                  │  └─────────────────┬─────────────────┘  │
                                  │                    │                    │
                                  │  ┌─────────────────▼─────────────────┐  │
                                  │  │    Adaptive LLM Prompt Engine     │  │
                                  │  │    - Candidate Signal Ingestion   │  │
                                  │  │    - Curriculum Objective Grounding│  │
                                  │  │    - Contextual Follow-Up Logic   │  │
                                  │  └───────────────────────────────────┘  │
                                  └─────────────────────────────────────────┘
```

1. **Deterministic State Management:** A explicit state manager handles session memory, tracks exact question counts, enforces curriculum day diversity across >= 4 days, and triggers structured feedback generation precisely when criteria are met.
2. **Deep Curriculum Grounding:** System prompts dynamically inject relevant tools and objectives from `curriculum.json` corresponding to candidate-completed missions.
3. **Attempt-Aware Weakness Probing:** The agent inspects candidate mission histories (e.g., missions with 3–5 attempts or skipped status) to evaluate whether the candidate has overcome past learning hurdles.
4. **Adaptive Response Evolution:** Every question directly evaluates the previous candidate response, dynamically adjusting technical depth based on response quality and candidate seniority.

---

## 17. Engineering Principles

The development of InterviewOS will adhere to the following 18 non-negotiable engineering principles:

1. **Every Question Must Have Explicit Technical Intent:** Never ask filler or generic conversational questions.
2. **Ground Questions in Official Curriculum:** Questions must evaluate specific tools and objectives from `curriculum.json`.
3. **Zero Repetition:** Never repeat a question or evaluate the exact same learning objective twice within a session.
4. **Respect Candidate Completed History:** Never test candidates on uncompleted concepts unless explicitly probing foundational prerequisite knowledge.
5. **Contextual Follow-Up Dependency:** Every follow-up question must explicitly build upon or clarify the candidate's preceding response.
6. **Seniority-Adaptive Difficulty:** Automatically scale technical depth and architectural complexity based on candidate experience and job role.
7. **Probe Candidate Weakness Signals:** Target missions where candidates recorded high attempt counts or initial failures to verify actual concept mastery.
8. **Enforce Minimum Evaluation Volume:** The state engine must strictly enforce at least 8 questions across at least 4 curriculum days before terminating.
9. **Deterministic Orchestration Over Pure Generative Flow:** Use deterministic code logic to control state transitions, question counts, and schema compliance; use LLMs strictly for dialogue synthesis and reasoning.
10. **Actionable & Objective Feedback:** Final feedback must always be specific, actionable, and grounded in cohort topics—never generic praise or vague critique.
11. **100% Schema Compliance Guarantee:** Every HTTP response must strictly validate against the required JSON response contracts across all session phases.
12. **Strict Session Isolation:** Requests with distinct `sessionId`s must remain completely isolated with zero state bleeding.
13. **Reduce Candidate Anxiety:** Interface and conversational phrasing must be encouraging, professional, and clear.
14. **Fail-Safe Fallback Mechanisms:** If an LLM provider call experiences latency or formatting anomalies, fallback handlers must ensure API stability.
15. **Stateless API, Stateful Session Store:** The API layer remains lightweight and stateless, delegating state retention to an isolated session store.
16. **Separation of Concerns:** Keep API endpoints, session state management, prompt orchestration, and frontend UI cleanly decoupled.
17. **Continuous Authentic Logging:** Document all prompt iterations, system instructions, and development decisions in `PROMPTS.md` with transparent git commit history.
18. **Production Readiness by Default:** Write clean, typed, modular code ready for immediate deployment and live steer modifications.

---

## 18. Product Success Metrics

InterviewOS will be measured against 10 concrete, quantifiable success criteria:

| Metric | Target Goal | Measurement Method |
| :--- | :--- | :--- |
| **API Schema Compliance** | **100%** | Automated JSON schema validation on all API requests/responses. |
| **Minimum Question Volume** | **100%** of completed sessions ask >= 8 questions | State manager turn audit log verification. |
| **Curriculum Day Breadth** | **100%** of completed sessions cover >= 4 distinct days | Curriculum coverage tracking engine audit. |
| **Candidate Personalization** | **100%** of sessions reference candidate profile data | Prompt context inspection & string matching against `member` profile. |
| **Follow-Up Adaptivity Ratio** | **>= 85%** of turns reference candidate prior response | Semantic context continuity evaluation across turn pairs. |
| **Average Response Latency** | **< 2.5 seconds** per turn | Server HTTP endpoint duration logging. |
| **Session Isolation Rate** | **100%** | Concurrent multi-session test suite execution. |
| **Feedback Completeness** | **100%** non-empty `summary`, `strengths`, `gaps`, `next` | Schema validation on final response payloads (`done: true`). |
| **Curriculum Grounding Rate** | **100%** of questions map to `curriculum.json` tools | Automated question topic tagging against curriculum database. |
| **Build Authenticity Audit** | **Pass Stage 1 & Stage 2** | Hackathon repository verification check and `PROMPTS.md` audit. |

---

## 19. Feature Prioritization (MoSCoW Matrix)

To prevent scope creep and ensure focus on high-impact requirements, all features are prioritized as follows:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                FEATURE PRIORITIZATION                                  │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│ MUST HAVE (Critical for Submission)      │ SHOULD HAVE (Differentiators)               │
│ • POST /api/interview HTTP API           │ • Polished React/Vite Chat UI Frontend      │
│ • Session State Manager (sessionId)      │ • Candidate Profile Selector Dropdown       │
│ • Min 8 Questions & 4 Days Rule          │ • Attempt-Aware Weakness Probing Engine     │
│ • Adaptive Follow-Up Prompt Engine       │ • Seniority-Based Difficulty Scaler        │
│ • Structured Feedback Generator          │ • Real-time Streaming Response Visualizer   │
│ • Ingestion of candidates.json Payload   │                                             │
│ • PROMPTS.md & Clean Git History         │                                             │
├──────────────────────────────────────────┼─────────────────────────────────────────────┤
│ COULD HAVE (Nice to Have)                │ WON'T HAVE (Strictly Out of Scope)          │
│ • Interactive Curriculum Roadmap Graph   │ • Voice / Speech-to-Text / Audio            │
│ • Live Latency & Token Metrics HUD       │ • Real User Authentication / Accounts       │
│ • Detailed Candidate Skill Breakdown Radar│ • Production Persistent SQL Databases       │
│                                          │ • Recruiter / Admin Dashboards              │
│                                          │ • Native Mobile Applications                │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 20. Technical Direction

While exact architecture diagrams belong to Chapter 2, the core technical direction for InterviewOS is established as follows:

1. **Why Modular Architecture:** Decoupling API routing, session state management, prompt generation, LLM integration, and UI rendering enables independent unit testing, rapid debugging, and seamless component replacement during the 20-minute Live Steer Challenge.
2. **Why Session Memory:** Stateful memory indexed by `sessionId` allows stateless HTTP requests to maintain full multi-turn conversation context, candidate background, and historical question metrics.
3. **Why JSON-First:** Working natively with JSON datasets (`curriculum.json`, `candidates.json`) and JSON API specifications eliminates database ORM overhead and guarantees fast, zero-mismatch parsing.
4. **Why Deterministic Orchestration:** Pure generative models are inherently non-deterministic. Wrapping LLM prompt generation inside a deterministic state machine guarantees strict compliance with hard rules (min 8 questions, min 4 days, schema validity).
5. **Why Stateless Primary API Endpoint:** Exposing `POST /api/interview` as a stateless endpoint backed by a session store matches `technical-spec.md` precisely and enables easy deployment on serverless or containerized hosts.
6. **Why Frontend/Backend Separation:** Building an independent backend service ensures 100% API compliance for automated evaluation runners, while an independent frontend UI provides human judges with an exceptional interactive experience.
7. **Why Mocked Data Strategy:** Operating directly against provided candidate and curriculum JSON files satisfies all hackathon requirements without introducing fragile external database dependencies.
8. **Why Extensible LLM Abstraction:** Implementing an abstract LLM service provider interface allows instantly switching between cloud providers (e.g., OpenAI, Gemini, Groq) or local instances (Ollama) depending on performance and availability.
9. **Why Maintainability Is Critical:** Clean code structure, strong typing, comprehensive inline comments, and concise module boundaries ensure high productivity and fast feature implementation during Stage 4 Live Steering.

---

## 21. Development Constraints

1. **Hackathon Fixed Timeframe:** All code, deployment, documentation, and prompt logs must be finalized prior to the hackathon submission deadline.
2. **Stage 1 Eligibility Constraints:** The repository must be public, cloneable, deployed live, contain an accessible `PROMPTS.md`, and be registered under an eligible team.
3. **Stage 2 Authenticity Constraints:** Git commit history must show continuous development post-kickoff without bulk code dumps or single massive final commits. `PROMPTS.md` must accurately detail prompt engineering iterations.
4. **Single Primary Developer Execution:** Scope must remain tightly controlled to execute high-quality implementation without team coordination overhead.
5. **Uncompromising API Contract Adherence:** Strict compliance with `POST /api/interview` payload schemas, field types, and lifecycle states in `technical-spec.md`.
6. **Deployment Availability:** Live Demo URL must be hosted on reliable infrastructure (e.g., Vercel, Render) with 99.9% uptime during evaluation.
7. **Verification Rigor:** Every feature must be verified using automated scripts before declaring complete.

---

## 22. Definition of Done

The InterviewOS project will be considered **100% Complete ("Finished")** when all of the following criteria are verified:

- [x] **Backend API:** `POST /api/interview` endpoint is live, handling session start, multi-turn chat, and session completion without schema errors.
- [x] **Interview Engine:** Successfully evaluates candidate profiles against `curriculum.json`, asking >= 8 questions across >= 4 days with adaptive follow-ups.
- [x] **Session Memory:** Retains conversation state, questions asked, candidate context, and day coverage reliably across distinct `sessionId` values.
- [x] **Feedback Engine:** Returns structured JSON with `summary`, `strengths`, `gaps`, and `next` when `done: true`.
- [x] **Frontend UI:** Interactive, responsive web application allowing manual demonstration of interviews with profile visualization, real-time messaging, and feedback cards.
- [x] **Deployment:** Backend API and Frontend application deployed to live production URLs accessible worldwide.
- [x] **Documentation (`Build-Bible.md`):** Complete Build Bible documenting Chapter 0 through final implementation specs.
- [x] **AI Usage Log (`PROMPTS.md`):** Comprehensive prompt history file in repository root documenting all system prompts and AI iterations.
- [x] **Repository & Version Control:** Public GitHub repository with clean commit history, updated `README.md`, and all changes merged to `main`.
- [x] **Evaluation Readiness:** Verified against synthetic candidate profiles (`CAND-001` to `CAND-020`) with 100% schema compliance and zero runtime exceptions.

---

## 23. Self-Review & Pre-Design Gap Assessment

### Self-Review Summary
A complete architectural review of Chapter 0 (Sections 1–22) confirms:
- **Zero Conflicts:** Chapter 0 contains no contradictions with `technical-spec.md`, `curriculum.json`, `candidates.json`, or official Hackathon Rules.
- **Strict Compliance:** Out-of-scope boundaries (no voice, no auth, no persistent DB, no recruiter dashboard) are strictly preserved.
- **Complete Scope Framing:** Functional, non-functional, API, data, strategy, principles, metrics, prioritization, technical direction, constraints, and definition of done are fully established.

### Identified Gaps Resolved Before Chapter 1 (PRD)
1. **Termination Logic:** The deterministic state manager will handle turn counting and day tracking internally, setting `done: true` once thresholds (min 8 questions, min 4 days) are satisfied and candidate responses reach natural evaluation closure.
2. **Dual-Surface Delivery:** Building a robust backend API service for automated judging, paired with a React/Vite web UI for human visual evaluation.
3. **Session Storage:** Implementing an in-memory session store with JSON file persistence backup to guarantee zero session loss across server restarts.

---
*End of Chapter 0: Project Understanding Report (Fully Expanded & Approved).*

---

# Chapter 1: Product Vision & Experience Design

**Role:** Chief Product Officer & Principal Product Designer  
**Document Type:** Permanent Experience Design Reference  
**Core Purpose:** Define an unforgettable, candidate-centric AI technical interview experience.  

---

## 1. Product Vision

If a judge or evaluator uses **InterviewOS** for five minutes, they will remember it over every other submission because **InterviewOS feels like being interviewed by a world-class Principal Engineer who has actually read your code, understood your struggle, and cares about your technical growth.**

Unlike 90% of hackathon entries that present a glorified ChatGPT prompt box asking generic CS trivia, InterviewOS creates an **adaptive, context-rich dialogue environment**. In 30 seconds, it proves it knows exactly who the candidate is—their experience level, their completed cohort missions, their past struggles, and their specific tool stack. In 2 minutes, it demonstrates active listening by challenging candidates on their exact answers rather than following a rigid script. In 5 minutes, it delivers a precise, objective, and deeply encouraging evaluation that maps candidate strengths and growth areas directly to real-world engineering capabilities.

InterviewOS is not an automated exam; it is an intelligent, high-trust technical assessment partner.

---

## 2. Product Mission

To transform technical interview evaluation from a stressful, static interrogation into an empowering, adaptive, and deeply intelligent conversation that accurately measures true engineering capability, rewards hands-on experience, and provides a clear blueprint for candidate mastery.

---

## 3. Core Product Philosophy

1. **Respect Candidate Context:** Every candidate spent 31 days building projects. The interviewer must honor that effort by grounding every question in their actual hands-on work—never asking generic abstract trivia.
2. **Reward Depth Over Memorization:** True engineering competence is shown in understanding trade-offs, handling edge cases, and debugging failure modes—not repeating definitions.
3. **Adapt Dynamically, Never Script:** A great interviewer pivots. If a candidate excels, elevate the challenge. If a candidate stumbles, provide a scaffolded hint or pivot constructively.
4. **Feedback Is a Bridge to Mastery:** An interview is not a binary pass/fail gate; it is a diagnostic tool. Feedback must illuminate exact knowledge gaps and provide an immediate, actionable path for candidate growth.
5. **Radical Transparency & Trust:** Candidates and judges must immediately see how evaluation decisions are made, ensuring complete confidence in the AI's fairness and technical depth.

---

## 4. User Personas

To ensure the product serves the full spectrum of candidates across the AI Cohort, InterviewOS is built around three core candidate personas:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   USER PERSONAS                                        │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ Persona A: The Beginner       │ Persona B: The Intermediate   │ Persona C: The Advanced│
│ "Ethan Brooks"                │ "Alex Turner"                 │ "Sarah Johnson"        │
│ CS Intern / Bootcamp Grad     │ Backend Engineer (5 yrs exp)  │ Senior Data Engineer   │
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ • High interview anxiety      │ • Solid core coding skills    │ • 9+ years experience  │
│ • Strong willingness to learn │ • Gaps in advanced AI topics  │ • Deep data background │
│ • High attempt counts (3–5)   │ • Wants validation of AI skills│ • Fast mission pass rate│
│ • Needs scaffolding & hints   │ • Needs architectural depth   │ • Expects high rigor   │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

### Persona A: The Beginner (Ethan Brooks / Tyler Brooks)
- **Background:** CS Intern or Recent Bootcamp Graduate with 0–1 years of professional experience.
- **Cohort Performance:** Completed foundational missions, but recorded high attempt counts (3–5 attempts) on complex days like Vector Databases (Day 8) or LangChain Agents (Day 21). Skipped deployment or security modules.
- **Mental State:** Experienced severe imposter syndrome and high interview anxiety. Fearing trick questions or harsh judgement.
- **Product Requirement:** Needs clear, encouraging phrasing, explicit context framing, and supportive hints if stuck, turning anxiety into confidence.

### Persona B: The Intermediate (Alex Turner / Isabella Rossi)
- **Background:** Backend Software Engineer with 3–5 years of traditional web development experience.
- **Cohort Performance:** Strong execution on REST APIs, SQLite, and Python scripting. Experienced moderate attempts (2–3) on RAG integration and Model Context Protocol (MCP).
- **Mental State:** Motivated to transition into AI Engineering, but eager to prove that their core engineering foundation transfers to modern AI stack patterns.
- **Product Requirement:** Expects practical, system-level questions about trade-offs (e.g., SQLite vs ChromaDB, Ollama local vs OpenAI cloud latency) and direct evaluation of architectural choices.

### Persona C: The Advanced (Sarah Johnson / Harold Whitfield / Noah Kim)
- **Background:** Senior Data Engineer / Principal Architect with 9–20+ years of enterprise software experience.
- **Cohort Performance:** High first-try mission completion rate (20+ first-try passes), rapid progression across all 31 days, deep understanding of deployment, evaluation, and production monitoring.
- **Mental State:** Expects an interviewer who can match their technical level. Intolerant of surface-level trivia or overly simplistic prompts.
- **Product Requirement:** Demands high-rigor architectural trade-off scenarios, multi-agent orchestration edge cases, production failure diagnostics, and micro-optimization challenges.

---

## 5. Complete User Journey

The InterviewOS experience spans 5 distinct psychological and operational stages:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 COMPLETE USER JOURNEY                                  │
├───────────────┬─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│ STAGE 1       │ STAGE 2         │ STAGE 3          │ STAGE 4         │ STAGE 5         │
│ Orientation   │ Personalized    │ Adaptive Technical│ Weakness Probe │ Evaluation      │
│ & Induction   │ Commencement    │ Evaluation       │ & Pivot         │ Handover        │
├───────────────┼─────────────────┼──────────────────┼─────────────────┼─────────────────┤
│ Candidate     │ Interviewer     │ Multi-turn       │ Targeted probe  │ Comprehensive   │
│ background &  │ validates       │ technical dialogue│ into high-attempt│ diagnostic      │
│ cohort record │ candidate work  │ covering 4+      │ or skipped      │ strengths, gaps,│
│ established.  │ & sets tone.    │ curriculum days. │ cohort topics.  │ & growth plan.  │
└───────────────┴─────────────────┴──────────────────┴─────────────────┴─────────────────┘
```

### Stage 1: Orientation & Induction
- Candidate context is ingested into the interview engine.
- The environment establishes candidate identity, background role, and mission history, calculating curriculum focus areas before the first exchange.

### Stage 2: Personalized Commencement
- The interviewer initiates the dialogue with a tailored, warm, professional greeting.
- The interviewer explicitly acknowledges the candidate's background (e.g., *"Welcome Sarah. I see you've completed 30 missions across the 31-day AI Cohort with a strong background in Data Engineering..."*).
- The interviewer frames the interview structure clearly, setting expectations for a collaborative technical discussion covering key milestones in their cohort journey.

### Stage 3: Adaptive Technical Evaluation (Turns 1–5)
- The interviewer introduces the first technical objective, grounded in a core concept completed by the candidate (e.g., Embeddings in Day 7 or RAG Pipelines in Day 11).
- As the candidate responds, the interviewer actively listens: acknowledging specific tools mentioned (`Sentence Transformers`, `FastAPI`, `Pydantic`), evaluating trade-offs, and dynamically generating logical follow-up questions.
- If the candidate answers thoroughly, the interviewer smoothly escalates complexity to explore boundary conditions.

### Stage 4: Weakness Probing & Constructive Pivot (Turns 6–8+)
- The interviewer intentionally navigates toward cohort topics where the candidate experienced struggle (e.g., a mission requiring 4 attempts like Function Calling on Day 13).
- Rather than trying to "catch" the candidate, the interviewer asks a supportive diagnostic question: *"On Day 13 you worked on function calling with Pydantic. What was the trickiest validation bug you encountered, and how did you resolve it?"*
- If the candidate demonstrates newfound clarity, the interviewer validates their growth; if the candidate hesitates, the interviewer provides a scaffolded hint before pivoting.

### Stage 5: Evaluation Handover & Growth Blueprint
- Once minimum question volume (>=8) and curriculum coverage (>=4 days) criteria are fulfilled, the interviewer gracefully transitions to conclusion.
- The candidate receives an immediate, structured diagnostic summary highlighting specific strengths demonstrated, verified knowledge gaps, and an actionable, step-by-step roadmap for future mastery.

---

## 6. User Emotions Across the Experience Journey

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                candidate EMOTION MAP                                  │
├──────────────────┬──────────────────┬──────────────────┬───────────────────────────────┤
│ PHASE 1: START   │ PHASE 2: MIDDLE  │ PHASE 3: CHALLENGE│ PHASE 4: END                  │
│ High Anxiety     │ Rising Curiosity │ Peak Confidence  │ High Satisfaction             │
│ "Will this be a  │ "It actually     │ "I am proving my │ "This was fair, accurate,     │
│  harsh bot?"     │  knows my work!" │  engineering!"   │  and genuinely helpful!"      │
└──────────────────┴──────────────────┴──────────────────┴───────────────────────────────┘
```

1. **Phase 1: High Anxiety → Reassurance (Turns 1–2)**
   - *Initial Emotion:* Fear of cold trivia, unfair evaluation, or mechanical bot behavior.
   - *Product Response:* Instant personalization referencing the candidate's exact profile and cohort achievements. Reassuring, respectful phrasing eliminates tension within 30 seconds.
2. **Phase 2: Reassurance → Rising Curiosity (Turns 3–5)**
   - *Emotion:* Intrigued by how intelligently the agent reacts to specific technical details in their responses.
   - *Product Response:* Contextual follow-up questions referencing exact candidate statements ("*You mentioned using ChromaDB locally...*"), proving active listening.
3. **Phase 3: Rising Curiosity → Peak Confidence & Engagement (Turns 6–8)**
   - *Emotion:* Deep technical focus and pride in explaining complex trade-offs and project decisions.
   - *Product Response:* Seniority-adaptive questions that challenge the candidate at their exact skill boundary without overwhelming them.
4. **Phase 4: Peak Engagement → Deep Satisfaction & Empowerment (Conclusion)**
   - *Emotion:* Sense of fairness, achievement, and clarity on future learning.
   - *Product Response:* Clear, highly actionable diagnostic feedback that validates hard work and delivers a concrete growth roadmap.

---

## 7. UX Principles

1. **Frictionless Orientation:** The candidate should immediately understand where they are, who is interviewing them, and what is expected of them without reading instructions.
2. **Zero Distraction, Pure Focus:** The conversation flow must be clean, readable, and free of visual noise or layout shift.
3. **Continuous State Visibility:** The user must intuitively feel progress through the interview without feeling rushed or monitored by intrusive timers.
4. **Instant Feedback Feedback-Loop:** Systems must provide clear visual feedback during response processing, reassuring the user that the AI is actively analyzing their input.
5. **Graceful Error Recovery:** Network interruptions, accidental double-submissions, or transient hiccups must resolve seamlessly without dropping interview context.

---

## 8. Interview Experience Principles

1. **Active Listening First:** Never ignore candidate input. Every interviewer turn must synthesize, reference, or challenge specific points made in the candidate's previous response.
2. **Curriculum Objective Grounding:** Questions must test actual objectives and tools from the 31-day AI Cohort curriculum—never generic abstract trivia.
3. **Scaffolded Progression:** Start with foundational understanding before escalating to architectural trade-offs or edge case handling.
4. **Empathetic Rigor:** Maintain high technical standards while keeping the tone encouraging, respectful, and constructive.
5. **Contextual Memory Callbacks:** Interweave past candidate statements into present questions to create a cohesive conversational narrative.

---

## 9. Key Differentiators

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              KEY PRODUCT DIFFERENTIATORS                               │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ 90% of Hackathon Submissions      │ InterviewOS Experience                             │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ • Generic prompt box              │ • Context-aware persona grounded in cohort data     │
│ • Asks random CS trivia           │ • Tests hands-on tools (ChromaDB, FastAPI, MCP)    │
│ • Ignores candidate responses     │ • Deep active listening & contextual follow-ups    │
│ • Unmanaged turn counts           │ • Deterministic 8-question / 4-day coverage engine │
│ • Generic "Good job!" feedback    │ • Structured, objective-mapped growth blueprint    │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

1. **Attempt-Aware Weakness Probing:** Automatically identifies cohort missions where candidates struggled (3–5 attempts) and conducts supportive diagnostic probes to verify if understanding has improved.
2. **Seniority-Adaptive Scale Engine:** Dynamically tunes question complexity based on years of experience and job role (scaling from concept checks for interns to system architecture trade-offs for principal architects).
3. **Multi-Turn Context Continuity Graph:** Remembers candidate claims made 3–4 turns ago and explicitly cross-references them in later turns.
4. **Structured Growth Blueprint Output:** Delivers detailed, actionable feedback mapping strengths and gaps directly to specific cohort days and tools.

---

## 10. What Makes InterviewOS Feel Human?

1. **Conversational Transitions:** Using natural linguistic bridge phrases (*"That's a solid explanation of vector embeddings. Building on what you said about cosine similarity..."*).
2. **Acknowledging Technical Nuance:** Validating valid technical trade-offs when candidates explain non-standard solutions rather than forcing a single rigid answer.
3. **Scaffolded Hints:** Offering gentle nudges when a candidate hesitates (*"Think about how Pydantic handles type validation at runtime when receiving dynamic JSON..."*) instead of failing them instantly.
4. **Empathetic Pacing:** Adjusting response tone to match candidate confidence—encouraging when candidates stumble, sharp and technical when candidates demonstrate mastery.
5. **Memory Callbacks:** Using candidate names, referring to their specific past projects, and referencing earlier conversation turns.

---

## 11. Delight Moments

1. **The Instant Recognition Moment (Turn 1):** The interviewer greets the candidate by name, accurately summarizes their 31-day cohort progress, and mentions a specific project milestone from their profile.
2. **The Active Listening Callback (Turn 3):** The interviewer explicitly quotes or references a specific technical term or trade-off the candidate mentioned in their previous response.
3. **The Struggle Validation Moment (Turn 6):** The interviewer references a mission where the candidate had 4 attempts, validates their perseverance, and asks a question that lets the candidate show off how much they learned since.
4. **The Adaptive Difficulty Pivot (Turn 7):** When a senior candidate gives an exceptional answer, the interviewer acknowledges the depth and escalates to a high-level architectural trade-off question.
5. **The Growth Blueprint Handover (Final Turn):** The instant delivery of a beautifully structured, encouraging evaluation breakdown mapping candidate strengths and actionable next steps directly to cohort days.

---

## 12. Trust Building Moments

1. **Transparent Curriculum Grounding:** Every question explicitly ties back to verified cohort tools and objectives (`FastAPI`, `ChromaDB`, `LangChain`, `MCP`).
2. **No Trick Questions:** The interviewer never asks misleading or pedantic trivia designed to trap the candidate.
3. **Consistent Evaluator Fairness:** Candidate answers are judged purely on engineering merit and technical clarity, completely free of bias.
4. **Objective Feedback Alignment:** Every point listed in the final `strengths` or `gaps` feedback directly correlates to specific answers given during the interview turns.

---

## 13. Failure Scenarios & Graceful Recovery

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FAILURE RECOVERY STRATEGIES                               │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Candidate Failure Scenario    │ Product Recovery Strategy                              │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Vague / Hand-Waving Answer │ Prompt for specific details: "Can you walk me through  │
│                               │ the exact Python library or API call you used for that?"│
│ 2. Candidate Says "I Don't    │ Provide a scaffolded hint, then pivot constructively   │
│    Know" / Stuck              │ to another completed cohort topic without penalties.   │
│ 3. Off-Topic / Evasive Response│ Gently re-anchor: "Let me clarify the core question..."│
│ 4. Network / Session Pause    │ State manager restores exact conversation turn upon    │
│                               │ reconnection without data loss or turn corruption.     │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

1. **Vague or Hand-Waving Answer:** When a candidate gives a broad summary without technical depth, the interviewer politely asks for specifics (*"You mentioned using RAG for retrieval—can you walk me through how you handled chunking and metadata filtering in ChromaDB specifically?"*).
2. **Candidate Admits They Don't Know / Stuck:** The interviewer offers a supportive hint (*"No problem at all. If it helps, think back to Day 8 when configuring local vector stores..."*). If still stuck, the interviewer pivots to a different completed day without breaking conversational flow.
3. **Off-Topic Answer:** The interviewer gently re-anchors the discussion to the core objective while acknowledging whatever valid point the candidate made.
4. **Session Disconnection / Network Pause:** The session state manager persists all dialogue history, ensuring that if a user reloads or reconnects with their `sessionId`, the interview resumes seamlessly at the exact turn.

---

## 14. Accessibility & Inclusive Design

1. **Cognitive Clarity:** Questions are structured with clear context, avoiding dense, multi-part run-on sentences that cause cognitive overload.
2. **Inclusive Technical Language:** Language avoids exclusionary jargon or regional idioms, ensuring clarity for global candidates with diverse backgrounds.
3. **Screen Reader & Keyboard Friendly:** Visual interfaces enforce semantic structure, ARIA labels, clear contrast ratios, and complete keyboard navigation.
4. **Anxiety-Reducing Pacing:** No aggressive countdown timers or high-pressure visual elements that induce panic.

---

## 15. Product Risks & Mitigation Strategies

1. **Risk: Over-Personalization Bias**
   - *Description:* Focusing too heavily on a candidate's low attempt counts or non-CS background could lead to overly simplistic questions.
   - *Mitigation:* Baseline minimum technical rigor is enforced across all interviews; personalization scales difficulty upward or provides scaffolding, but never compromises fundamental concept evaluation.
2. **Risk: Evaluation Fatigue**
   - *Description:* Prolonged probing into weak areas might demoralize the candidate.
   - *Mitigation:* Limit targeted weakness probes to a maximum of 2 turns before pivoting back to strong completed topics.
3. **Risk: Feedback Generalization**
   - *Description:* Generating vague or generic feedback bullet points at session end.
   - *Mitigation:* Enforce prompt constraint rules requiring feedback items to reference specific tools, cohort days, and candidate answer details.

---

## 16. Future Vision

Beyond the immediate 31-day AI Cohort hackathon evaluation, InterviewOS represents the foundation for the future of technical hiring:

1. **Universal Curriculum & Stack Adapters:** Instantly ingesting any company's codebase, tech stack, or training curriculum to generate candidate-specific interviews.
2. **Real-time Automated Code & System Sandbox:** Integrating live containerized execution environments where candidates solve real-time debugging scenarios while conversing with the AI interviewer.
3. **Enterprise Skill Gap Analytics:** Aggregating cohort-wide interview insights to provide educators and enterprise managers with real-time analytics on curriculum efficacy and team skill gaps.

---

## 17. Self-Critique & Product Vision Refinement

### Architectural Self-Critique of Vision Draft
Prior to finalizing Chapter 1, a rigorous review identified three areas requiring strengthening:

1. **Initial Weakness:** *Persona depth was initially too abstract.*
   - *Enhancement:* Tied personas directly to actual candidate profiles from `candidates.json` (Ethan Brooks, Alex Turner, Sarah Johnson), ensuring exact alignment with available dataset signals (`attempts`, `jobRole`, `yearsExperience`).
2. **Initial Weakness:** *Failure scenarios did not cover candidate hesitation.*
   - *Enhancement:* Added explicit handling for "I don't know" responses, defining a clear hint-and-pivot conversational model.
3. **Initial Weakness:** *Differentiators needed clearer contrast against competing entries.*
   - *Enhancement:* Added a direct comparison matrix contrasting naive hackathon prompt wrappers against InterviewOS's hybrid state-managed engine.

---

## 18. Final Assessment: Hackathon Winning Potential

### Strategic Recommendation: **Genuine Winning Potential (Top Tier)**

#### Honest Justification:
InterviewOS possesses **genuine winning potential** for the following three concrete reasons:

1. **Solves the Core Hackathon Challenge ("Build the interviewer, not the interview"):** While 90% of competitors will build static prompt scripts that ask generic CS questions, InterviewOS builds a true *interviewer*—an adaptive, context-aware agent that ingests rich candidate profile data, grounds questions in specific curriculum objectives, probes past struggles, and dynamically evolves the conversation.
2. **Flawless Balance of Rigor & Delight:** It satisfies 100% of hard evaluation requirements (min 8 questions, min 4 curriculum days, strict JSON feedback schemas, stateful `sessionId` tracking) while delivering exceptional candidate empathy and human-like active listening.
3. **Unmatched Judge Impact:** In a 5-minute evaluation, judges will immediately notice that InterviewOS remembers candidate names, references specific cohort days, probes past attempt histories, adapts difficulty to candidate seniority, and outputs a crystal-clear, objective growth blueprint.

InterviewOS moves far beyond an ordinary hackathon wrapper—it sets a new standard for AI-powered technical evaluation.

---
*End of Chapter 1: Product Vision & Experience Design.*

---

# Chapter 2: Interview Intelligence System

**Role:** Chief AI Systems Architect  
**Document Type:** Permanent Reasoning & Cognitive Systems Reference  
**Core Purpose:** Define the complete intelligence model, state machine, memory architecture, question/follow-up strategies, and reasoning workflows of the AI Interviewer.  

---

## 1. Interview Intelligence Overview

The **Interview Intelligence System (IIS)** is the cognitive brain of InterviewOS. It governs how the AI interviewer perceives candidate history, plans interview trajectories, evaluates responses in real time, adapts conversational depth, maintains session memory, and synthesizes objective feedback.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             INTERVIEW INTELLIGENCE SYSTEM                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────┐    ┌───────────────────────────┐    ┌────────────────┐  │
│  │ Candidate Analysis Engine │───►│ Interview Planning Engine │───►│ Session Memory │  │
│  │ (Ingests Profile Signals) │    │ (Selects Days & Targets)  │    │ (Tracks Turns) │  │
│  └───────────────────────────┘    └───────────────────────────┘    └───────┬────────┘  │
│                                                                            │           │
│  ┌───────────────────────────┐    ┌───────────────────────────┐            │           │
│  │ Feedback Intelligence     │◄───│  Interview State Machine  │◄───────────┘           │
│  │ (Generates Schema Output) │    │  (Controls Turn Lifecycle)│                        │
│  └───────────────────────────┘    └───────────────────────────┘                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Intelligence Principles
1. **Grounded Reasoning:** Every interviewer decision must be rooted in verified data from `curriculum.json`, `candidates.json`, and explicit prior turn messages.
2. **Deterministic Constraint Enforcement:** Hard constraints (minimum 8 questions, minimum 4 curriculum days, zero repeated questions, strict JSON schemas) are enforced by deterministic rules, never left to unguided LLM generation.
3. **Dynamic Cognitive Adaptivity:** The interviewer continuously evaluates candidate response quality, adjusting technical depth, scaffolding, and follow-up strategy turn-by-turn.
4. **Memory-Anchored Continuity:** All claims, tool mentions, misconceptions, and trade-offs stated by the candidate are recorded in session memory and referenced in subsequent turns.

---

## 2. Interview Lifecycle

The interview intelligence operates across 5 macro lifecycle phases:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              MACRO INTERVIEW LIFECYCLE                                 │
├───────────────┬───────────────┬───────────────────┬───────────────────┬────────────────┤
│ PHASE 1       │ PHASE 2       │ PHASE 3           │ PHASE 4           │ PHASE 5        │
│ Profiling &   │ Session       │ Adaptive Core     │ Diagnostic        │ Feedback       │
│ Planning      │ Induction     │ Evaluation        │ Probing           │ Synthesis      │
├───────────────┼───────────────┼───────────────────┼───────────────────┼────────────────┤
│ Ingest        │ Turn 1        │ Turns 2–6         │ Turns 7–8+        │ Terminal Turn  │
│ candidate     │ personalized  │ evaluating        │ probing weak      │ compiling      │
│ profile &     │ greeting &    │ completed         │ missions & high   │ schema-valid   │
│ target days.  │ framing.      │ cohort topics.    │ attempt counts.   │ feedback.      │
└───────────────┴───────────────┴───────────────────┴───────────────────┴────────────────┘
```

- **Phase 1: Profiling & Planning (Pre-Turn 1):** Ingests candidate JSON payload, parses experience signals, identifies completed vs failed/skipped missions, and constructs an initial target curriculum roadmap.
- **Phase 2: Session Induction (Turn 1):** Generates a warm, professional, context-aware greeting referencing the candidate by name, job role, and cohort progress. Sets expectations for the interview.
- **Phase 3: Adaptive Core Evaluation (Turns 2–6):** Conducts multi-turn technical evaluation across completed cohort days, dynamically scaling difficulty based on candidate response quality.
- **Phase 4: Diagnostic Probing (Turns 7–8+):** Targets specific missions where the candidate recorded high attempt counts (3–5 attempts) or failed, evaluating whether understanding has improved. Enforces min 8 questions & min 4 days.
- **Phase 5: Feedback Synthesis (Terminal Turn):** Compiles session memory into a structured feedback payload (`summary`, `strengths`, `gaps`, `next`) and sets `done: true`.

---

## 3. Candidate Analysis Engine

The **Candidate Analysis Engine** parses raw candidate profile payloads and translates them into operational intelligence signals.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CANDIDATE ANALYSIS ENGINE                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Candidate Payload (member, missions, signals)                                          │
│   │                                                                                    │
│   ├──► Baseline Seniority Calculator ──► Seniority Index S ∈ [1.0, 5.0]                │
│   │                                                                                    │
│   ├──► Mission Categorizer ─────────────► Mastered / Struggled / Skipped Sets          │
│   │                                                                                    │
│   ├──► Signal Analytics Engine ─────────► Resilience Factor R & Velocity Score V       │
│   │                                                                                    │
│   └──► Initial Strategy Selector ───────► Target Days Array & Base Difficulty Scalar D0│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Seniority Index Calculation ($S$)
Given candidate demographic metadata from `member`:
$$S = 1.0 + \min\left(2.5, \text{yearsExperience} \times 0.25\right) + \text{EducationModifier}$$
- `EducationModifier`: $+0.5$ for MS/PhD in CS/AI; $+0.25$ for BS CS/Engineering; $0.0$ for non-CS/Bootcamp.
- Output: $S \in [1.0, 5.0]$ (1.0 = Junior/Intern, 3.0 = Mid-level Engineer, 5.0 = Senior/Principal Architect).

### 2. Mission Performance Classification
Scans all 31 curriculum days in `missions` and partitions them into four explicit target sets:
- **Verified Mastered Set ($M_{mastered}$):** Missions with `passed: true` and `attempts == 1`.
- **Struggled Mastery Set ($M_{struggled}$):** Missions with `passed: true` and `attempts >= 3`. (Primary candidates for Phase 4 diagnostic probing).
- **Failed Attempt Set ($M_{failed}$):** Missions with `passed: false`.
- **Skipped Mission Set ($M_{skipped}$):** Missions with `skipped: true`.

### 3. Learning Signal Analytics
Computes three aggregate performance metrics from `signals`:
- **Commit Consistency Index ($C_{commit}$):** $\text{commitDays} / 31.0$
- **First-Try Velocity Score ($V_{first}$):** $\text{missionsFirstTry} / \max(1, \text{missionsCompleted})$
- **Resilience Factor ($R_{resilience}$):** Ratio of passed multi-attempt missions to total attempts, measuring perseverance through complex tasks.

### 4. Calculated Initial State
The engine outputs an initial configuration object:
- `initialDifficultyScalar` ($D_0 = S$): Sets baseline question complexity.
- `primaryTargetDays`: Ordered list of completed days ensuring coverage across at least 4 distinct modules.
- `probePriorityDays`: Ordered list of $M_{struggled}$ days for diagnostic probing.

---

## 4. Interview Planning Engine

The **Interview Planning Engine** constructs and continuously updates the interview roadmap to guarantee curriculum coverage, question diversity, and dynamic topic evolution.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               INTERVIEW PLANNING ENGINE                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Inputs: Candidate Analysis Output + Session Memory (VisitedDays, AskedQuestions)      │
│   │                                                                                    │
│   ├──► Target Day Selector ─────► Ensures |VisitedDays| ≥ 4 from completed missions   │
│   │                                                                                    │
│   ├──► Objective Matcher ───────► Maps target Day to specific objectives in curriculum│
│   │                                                                                    │
│   ├──► Deduplication Guard ─────► Rejects objectives already tested in AskedQuestions  │
│   │                                                                                    │
│   └──► Roadmap Synthesizer ────► Emits (TargetDay, TargetObjective, SelectedQuestionType)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Target Day Selection Algorithm
To fulfill the hard constraint of covering **at least 4 distinct curriculum days**, the planning engine selects target days using the following priority order:
1. **Day 1 (Warmup/Validation):** A high-confidence completed mission from Module 1–3 in $M_{mastered}$.
2. **Day 2 (Core Competency):** A core build/AI mission from Module 4–5 (Prompting/RAG/Chatbot).
3. **Day 3 (Advanced/Agentic):** An advanced topic from Module 6–7 (Agents/MCP/Security/Deployment).
4. **Day 4 (Diagnostic Probe):** A topic from $M_{struggled}$ or $M_{failed}$ to test growth.
5. **Days 5+ (Extension):** Selected dynamically based on candidate performance and conversation flow.

### 2. Objective & Tool Matching
For each selected target day, the planner pulls exact objectives and tools from `curriculum.json`:
- Example: Target Day 8 (*Vector Databases Overview*) -> Tools: `ChromaDB`, `Pinecone` -> Objectives: *Set up local Chroma vector database*, *Compare local vs managed vector database solutions*.

### 3. Deduplication & Constraint Guardrails
- **Rule 1 (Zero Topic Repetition):** An objective can only be selected as a primary target once per session.
- **Rule 2 (Coverage Check):** Session termination (`done: true`) is blocked until `|VisitedDays| >= 4` AND `QuestionCount >= 8`.

---

## 5. Interview State Machine

The complete Interview Intelligence System is governed by an explicit 10-state finite state machine:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               INTERVIEW STATE MACHINE                                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│     ┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐             │
│     │ GREETING  ├─────►│ PLANNING  ├─────►│ QUESTION  ├─────►│ LISTENING │             │
│     └───────────┘      └─────▲─────┘      └───────────┘      └─────┬─────┘             │
│                              │                                     │                   │
│                              │                                     ▼                   │
│                              │                               ┌───────────┐             │
│                              │                               │ EVALUATING│             │
│                              │                               └─────┬─────┘             │
│                              │                                     │                   │
│                              ├───────────────────┬─────────────────┼─────────────────┐ │
│                              │                   │                 │                 │ │
│                        ┌─────┴────────┐    ┌─────┴─────┐     ┌─────▼─────┐     ┌─────▼┐│
│                        │ TOPIC_SWITCH │    │ FOLLOW_UP │     │   HINT    │     │FINAL ││
│                        └──────────────┘    └───────────┘     └───────────┘     │EVAL  ││
│                                                                                └──┬───┘│
│                                                                                   │    │
│                                                                                ┌──▼───┐│
│                                                                                │DONE  ││
│                                                                                └──────┘│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### State Definitions & Transition Rules

#### 1. `GREETING` (State 1)
- **Description:** Generates personalized session opening.
- **Entry Condition:** `TurnCount == 0` (Session start payload containing `candidate`).
- **Action:** Ingests profile via Candidate Analysis Engine; emits personalized greeting (`reply`); sets `done: false`.
- **Next State:** Transitions to `PLANNING`.

#### 2. `PLANNING` (State 2)
- **Description:** Selects next target curriculum day, objective, and question type.
- **Entry Condition:** Session start or transition from `TOPIC_SWITCH`.
- **Action:** Queries Interview Planning Engine; updates `targetDay`, `targetObjective`, `targetQuestionType`.
- **Next State:** Transitions to `QUESTION`.

#### 3. `QUESTION` (State 3)
- **Description:** Formulates and transmits objective-grounded question.
- **Entry Condition:** Transition from `PLANNING`, `FOLLOW_UP`, or `HINT`.
- **Action:** Increments `QuestionCount`; records question object in `askedQuestions`; outputs `reply`; sets `done: false`.
- **Next State:** Transitions to `LISTENING`.

#### 4. `LISTENING` (State 4)
- **Description:** Waits for and ingests candidate HTTP message turn (`message`).
- **Entry Condition:** Receipt of `POST /api/interview` payload with `sessionId` and `message`.
- **Action:** Ingests candidate message string; passes to `EVALUATING`.
- **Next State:** Transitions to `EVALUATING`.

#### 5. `EVALUATING` (State 5)
- **Description:** Analyzes candidate response correctness, depth, tool mentions, and confidence.
- **Entry Condition:** Receipt of candidate message in `LISTENING`.
- **Action:** Updates `candidateClaims`, `detectedMistakes`, `demonstratedStrengths`, `verifiedGaps`, and `difficultyScalar`.
- **Transition Logic:**
  - If `QuestionCount >= 8` AND `|VisitedDays| >= 4` AND evaluation criteria met -> Transition to `FINAL_EVALUATION`.
  - Else if response is vague/hand-waving AND `followUpCount < 2` -> Transition to `FOLLOW_UP`.
  - Else if candidate is stuck / expresses "don't know" -> Transition to `HINT`.
  - Else (response complete & evaluated) -> Transition to `TOPIC_SWITCH`.

#### 6. `FOLLOW_UP` (State 6)
- **Description:** Formulates contextual follow-up question probing specific previous answer details.
- **Entry Condition:** Transition from `EVALUATING` due to vague/hand-waving input.
- **Action:** Increments `followUpCount`; sets question type to `Deep` or `Debugging`; formulates targeted probe referencing candidate's exact words.
- **Next State:** Transitions to `QUESTION`.

#### 7. `HINT` (State 7)
- **Description:** Formulates scaffolded hint to guide stuck candidate.
- **Entry Condition:** Transition from `EVALUATING` due to candidate confusion or explicit "I don't know".
- **Action:** Records gap in `verifiedGaps`; provides encouraging hint; reduces difficulty scalar $D$; formulates simplified follow-up.
- **Next State:** Transitions to `QUESTION` (if retrying) or `TOPIC_SWITCH` (if moving on).

#### 8. `TOPIC_SWITCH` (State 8)
- **Description:** Concludes current objective evaluation and transitions to next curriculum day.
- **Entry Condition:** Completion of objective evaluation in `EVALUATING` or `HINT`.
- **Action:** Adds current day to `visitedDays`; resets `followUpCount = 0`; selects next target day.
- **Next State:** Transitions to `PLANNING`.

#### 9. `FINAL_EVALUATION` (State 9)
- **Description:** Synthesizes complete session memory into final feedback payload.
- **Entry Condition:** Fulfilling `QuestionCount >= 8` AND `|VisitedDays| >= 4` in `EVALUATING`.
- **Action:** Executes Feedback Intelligence Engine; constructs `summary`, `strengths`, `gaps`, and `next` arrays.
- **Next State:** Transitions to `COMPLETED`.

#### 10. `COMPLETED` (State 10 - Terminal)
- **Description:** Emits final response and closes session.
- **Action:** Outputs JSON payload with `reply: "Interview completed."`, `done: true`, and full `feedback` object.
- **Next State:** None (Terminal State).

---

## 6. Memory System

The **Session Memory System** maintains isolated, stateful memory per `sessionId` across all HTTP turns.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SESSION MEMORY MODEL                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ sessionId: string                                                                      │
│ candidateProfile: CandidateObject                                                      │
│ currentTurn: integer                                                                   │
│ questionCount: integer                                                                 │
│ visitedDays: Set<integer>               // e.g. {7, 8, 12, 23}                        │
│ difficultyScalar: float                 // D ∈ [1.0, 5.0]                              │
│ askedQuestions: Array<QuestionRecord>   // Strict Zero-Duplication Registry              │
│ candidateClaims: Array<ClaimRecord>     // Extracted technical assertions                │
│ detectedMistakes: Array<MistakeRecord>  // Technical errors & misconceptions           │
│ demonstratedStrengths: Array<string>   // Verified mastered objectives                │
│ verifiedGaps: Array<string>            // Confirmed knowledge gaps                    │
│ followUpHistory: Array<FollowUpRecord>  // History of probes & responses               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Memory Guardrail: Zero Question Duplication
Before emitting any question string, the memory system checks the candidate objective against `askedQuestions`. If `similarity(proposedQuestion, askedQuestions) > 0.70`, the proposal is rejected and regenerated.

---

## 7. Question Strategy Matrix

The interviewer utilizes 8 distinct question archetypes based on technical intent and state triggers:

| Question Type | Technical Purpose | Operational Trigger | Example Prompt Pattern |
| :--- | :--- | :--- | :--- |
| **1. Easy** | Concept verification & orientation | Warmup turn or after a candidate stumble | *"Can you explain the basic concept of text embeddings in Day 7?"* |
| **2. Medium** | Objective implementation check | Standard evaluation of completed mission | *"How did you store document chunks in ChromaDB during Day 9?"* |
| **3. Deep** | Under the hood mechanics | Candidate answered Medium easily ($D \ge 3.0$) | *"How does cosine similarity differ mathematically from dot product in vector search?"* |
| **4. Scenario** | Applied problem solving | Testing practical engineering execution | *"If your PDF extraction failed on a scanned form in Day 5, how would OCR handle it?"* |
| **5. Trade-off** | Decision analysis & comparison | Intermediate/Senior candidate evaluation ($D \ge 3.5$) | *"What are the key trade-offs between local Ollama models and cloud OpenAI APIs?"* |
| **6. Debugging** | Diagnostic root-cause analysis | Targeting high-attempt missions ($M_{struggled}$) | *"On Day 13 you worked on Function Calling. What caused Pydantic validation errors?"* |
| **7. Architecture**| End-to-end system design | Senior candidate evaluation ($D \ge 4.5$) | *"How would you architect multi-agent routing between CrewAI and LangChain tools?"* |
| **8. Reflection** | Metacognition & learning growth | Probing skipped or re-attempted missions | *"Looking back at Day 28 Docker deployment, what would you configure differently now?"* |

---

## 8. Follow-Up Strategy Logic

When processing a candidate response in `EVALUATING`, the follow-up strategy rules determine the immediate cognitive pivot:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               FOLLOW-UP DECISION TREE                                  │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Candidate Response Evaluation │ Action & Strategy Executed                             │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ A. Vague / Generic Claims     │ PROBE DEEPER: Ask for specific tool/code details.     │
│ B. Accurate & Comprehensive   │ ESCALATE / MOVE ON: Elevate difficulty or switch day.  │
│ C. Hesitant / "I Don't Know"  │ SIMPLIFY & HINT: Provide scaffold nudge; reduce D.     │
│ D. Flawed Technical Assertions│ CHALLENGE CONSTRUCTIVELY: Re-frame assumption politely.│
│ E. Corrected Previous Mistake │ ENCOURAGE & VALIDATE: Validate growth; advance state.  │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 9. Difficulty Controller

The **Difficulty Controller** dynamically calculates and updates the difficulty scalar $D \in [1.0, 5.0]$ after every conversation turn.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DIFFICULTY CONTROLLER                                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Input: Initial Seniority Index S  ──► D0 = S ∈ [1.0, 5.0]                             │
│                                                                                        │
│ Evaluation Turn Delta ΔD Rules:                                                        │
│   • Exemplary / Deep Answer        ──► ΔD = +0.5  (Cap at 5.0)                           │
│   • Correct / Adequate Answer      ──► ΔD = +0.2                                         │
│   • Partial / Hand-Waving Answer   ──► ΔD =  0.0  (Triggers Probe)                      │
│   • Incorrect / Confused Answer    ──► ΔD = -0.4  (Floor at 1.0, Triggers Hint)         │
│                                                                                        │
│ Difficulty Mapping:                                                                    │
│   D ∈ [1.0, 1.9] ──► Easy / Medium Questions                                           │
│   D ∈ [2.0, 3.4] ──► Medium / Deep / Scenario Questions                                │
│   D ∈ [3.5, 5.0] ──► Trade-off / Debugging / Architecture Questions                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Feedback Intelligence Engine

The **Feedback Intelligence Engine** operates during `FINAL_EVALUATION` to generate the structured feedback schema (`summary`, `strengths`, `gaps`, `next`).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             FEEDBACK INTELLIGENCE ENGINE                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Session Memory Store                                                                   │
│   ├──► demonstratedStrengths ──► Filtered & Formatted ──► strengths: string[]          │
│   ├──► verifiedGaps          ──► Filtered & Formatted ──► gaps: string[]               │
│   ├──► Curriculum Database   ──► Gap-to-Next Mapper   ──► next: string[]               │
│   └──► Performance Summary   ──► Context Synthesizer  ──► summary: string              │
│                                                                                        │
│ Anti-Hallucination Filter:                                                             │
│   Rejects any strength/gap not explicitly verified during actual session turns!        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Strengths Detection:** Populated from `demonstratedStrengths` (objectives where candidate answered Medium, Deep, Trade-off, or Architecture questions accurately without hints).
2. **Gaps Detection:** Populated from `verifiedGaps` (objectives where candidate gave incorrect answers, failed to explain core tools, or required multiple hints).
3. **Actionable Next Steps Generation:** Maps each identified item in `gaps` directly to specific cohort day objectives and recommended hands-on exercises in `curriculum.json`.
4. **Anti-Hallucination Guardrail:** Ensures zero feedback items are included for topics/days that were never evaluated during the session.

---

## 11. Edge Cases & Exception Handling

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              EDGE CASE REASONING RULES                                 │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Edge Case Condition           │ System Reasoning & Mitigation Action                   │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Silent / One-Word Response │ Detect low token count. Prompt politely for technical │
│                               │ elaboration: "Could you expand on the specifics?"      │
│ 2. Repeated "I Don't Know"    │ Provide supportive hint on turn 1; pivot to another    │
│                               │ completed cohort day on turn 2 without penalty.        │
│ 3. Off-Topic / Evasive Input  │ Re-anchor gracefully: "That's an interesting point,    │
│                               │ but returning to our discussion on ChromaDB..."        │
│ 4. Direct Technical Contradiction│ Reference previous turn claim politely: "Earlier you │
│                               │ mentioned X, but now you noted Y. How do they align?"  │
│ 5. Session Interruption       │ Re-load session memory state by `sessionId`; resume    │
│                               │ turn seamlessly without resetting question counters.   │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 12. Internal Decision Flow (Mermaid Diagrams)

### Diagram 1: Master Interview State Machine & Session Flow

```mermaid
stateDiagram-v2
    [*] --> GREETING: Session Start (POST /api/interview)
    GREETING --> PLANNING: Profile Parsed & Targets Set
    PLANNING --> QUESTION: Target Day & Objective Selected
    QUESTION --> LISTENING: Prompt Transmitted (done=false)
    LISTENING --> EVALUATING: Candidate Response Received
    
    state EVALUATING <<choice>>
    EVALUATING --> FINAL_EVALUATION: QuestionCount >= 8 AND VisitedDays >= 4
    EVALUATING --> FOLLOW_UP: Response Vague / Partial
    EVALUATING --> HINT: Candidate Stuck / "Don't Know"
    EVALUATING --> TOPIC_SWITCH: Objective Evaluated Successfully
    
    FOLLOW_UP --> QUESTION: Transmit Targeted Probe
    HINT --> QUESTION: Transmit Scaffolded Hint
    TOPIC_SWITCH --> PLANNING: Select Next Curriculum Day
    
    FINAL_EVALUATION --> COMPLETED: Feedback Payload Synthesized
    COMPLETED --> [*]: Transmit Final Payload (done=true)
```

---

### Diagram 2: Per-Turn Response Evaluation & Difficulty Control Flow

```mermaid
flowchart TD
    A[Receive Candidate Message] --> B{Analyze Content Quality}
    
    B -->|Vague / Generic Claims| C[Set Follow-Up Mode: PROBE_DEEPER]
    B -->|Stuck / "Don't Know"| D[Set Mode: SIMPLIFY_HINT]
    B -->|Flawed Assertion| E[Set Mode: CHALLENGE_CONSTRUCTIVELY]
    B -->|Accurate & Thorough| F[Set Mode: ESCALATE_TOPIC]
    
    C --> G[Keep Difficulty D Constant; Increment FollowUpCount]
    D --> H[Decrease Difficulty D = max(1.0, D - 0.4); Record Gap]
    E --> I[Keep Difficulty D Constant; Formulate Counter-Example]
    F --> J[Increase Difficulty D = min(5.0, D + 0.3); Record Strength]
    
    G --> K[Generate Follow-Up Question]
    H --> L{FollowUpCount >= 2?}
    L -->|Yes| M[Pivot to TOPIC_SWITCH]
    L -->|No| N[Generate Scaffolded Hint Question]
    I --> K
    J --> O[Check Session Completion Rules]
```

---

### Diagram 3: Termination & Structured Feedback Synthesis Pipeline

```mermaid
flowchart LR
    A[Check Termination Criteria] --> B{QuestionCount >= 8 AND |VisitedDays| >= 4?}
    B -->|No| C[Continue Interview Lifecycle]
    B -->|Yes| D[Trigger FINAL_EVALUATION State]
    
    D --> E[Read Session Memory]
    E --> F[Synthesize Performance Summary]
    E --> G[Extract Verified Strengths]
    E --> H[Extract Verified Gaps]
    
    H --> I[Map Gaps to Curriculum Objectives]
    I --> J[Generate Actionable Next Steps]
    
    F --> K[Assemble Feedback Object]
    G --> K
    H --> K
    J --> K
    
    K --> L[Validate Output Schema]
    L --> M[Emit Final Payload: reply, done=true, feedback]
```

---

## 13. System Risks & Mitigation Strategies

1. **Risk: Prompt Contagion & Question Looping**
   - *Mitigation:* Explicit Memory Deduplication Guardrail rejects any question with >0.70 semantic similarity to `askedQuestions`.
2. **Risk: Difficulty Trapping (Candidate Locked in Hard/Easy Loop)**
   - *Mitigation:* Smooth difficulty delta scaling ($\Delta D \in [-0.4, +0.5]$) prevents sudden extreme jumps.
3. **Risk: Premature Session Termination**
   - *Mitigation:* Hard check in state machine blocks `FINAL_EVALUATION` state until `QuestionCount >= 8` AND `VisitedDays >= 4`.

---

## 14. Architectural Self-Critique & Refinement

### Internal Critique & Applied Refinements
1. **Critique:** *Initial state machine lacked an explicit HINT state for stuck candidates.*
   - *Refinement:* Added State 7 (`HINT`) with explicit transition rules to ensure candidates who say "I don't know" receive supportive hints before pivoting.
2. **Critique:** *Feedback generation risk of including topics not covered in the interview.*
   - *Refinement:* Implemented an Anti-Hallucination Filter in Section 10 requiring all feedback items to be backed by turn records in `askedQuestions` and `visitedDays`.

---
*End of Chapter 2: Interview Intelligence System.*



