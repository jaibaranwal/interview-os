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

