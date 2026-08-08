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
*End of Chapter 0: Project Understanding Report.*
