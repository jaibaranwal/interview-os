# InterviewOS Development Prompts

This document records the complete prompt engineering journey used during the development of InterviewOS.

It documents the iterative design, architecture evolution, UI improvements, backend refinements, evaluation engine, adaptive interview flow, and presentation polish completed throughout the project.

The prompts are preserved for transparency and development documentation.

---

## Table of Contents

- [Prompt 1: Initial Setup & Architecture Verification](#prompt-1)
- [Prompt 2: Phase 1 Verification & Execution Plan](#prompt-2)
- [Prompt 3: Runtime Execution Proof & Validation](#prompt-3)
- [Prompt 4: Multi-Turn Execution & Engine Stabilization](#prompt-4)
- [Prompt 5: Live LLM Integration & Evaluation](#prompt-5)
- [Prompt 6: InterviewEngine & LLM Client Verification](#prompt-6)
- [Prompt 7: Response Evaluator & Action Processing](#prompt-7)
- [Prompt 8: Live Gemini API Verification](#prompt-8)
- [Prompt 9: LLM Call Audit & Response Evaluation](#prompt-9)
- [Prompt 10: Groq Provider Integration (llama-3.3-70b)](#prompt-10)
- [Prompt 11: Real LLM Evaluation & Anti-Scripting Audit](#prompt-11)
- [Prompt 12: Real-time Interview Behavior & Fast-Path Evaluation](#prompt-12)
- [Prompt 13: State Machine Audit & Topic Transition Policy](#prompt-13)
- [Prompt 14: Execution Continuation & Verification](#prompt-14)
- [Prompt 15: Production Engineering Audit & Quality Refinements](#prompt-15)
- [Prompt 16: Production Stabilization (Part 1)](#prompt-16)
- [Prompt 17: Production Stabilization (Part 2)](#prompt-17)
- [Prompt 18: Production Stabilization (Part 3)](#prompt-18)
- [Prompt 19: LLM Audit Logging & Anti-Scripting Proofs](#prompt-19)
- [Prompt 20: System Performance & Architecture Audit](#prompt-20)
- [Prompt 21: Terminal Environment & Server Inspection](#prompt-21)
- [Prompt 22: LLM Model Selection (llama-3.1-8b-instant)](#prompt-22)
- [Prompt 23: System Polishing & Execution Verification](#prompt-23)
- [Prompt 24: Comprehensive Architecture & Security Audit](#prompt-24)
- [Prompt 25: Git Repository Release & Commit](#prompt-25)
- [Prompt 26: Prompt 28 — Final Production Audit](#prompt-26)
- [Prompt 27: Prompt 29 — Final Interview Realism & Report Accuracy Polish](#prompt-27)
- [Prompt 28: Evidence-Based Competency Scoring (1–5 Scale)](#prompt-28)
- [Prompt 29: Red Team Audit (50+ Candidate Persona Simulations)](#prompt-29)
- [Prompt 30: INTERVIEWOS V2 — Premium Frontend Redesign](#prompt-30)
- [Prompt 31: Executive Hiring Panel Report Transformation](#prompt-31)
- [Prompt 32: Prompt 34 — Final Hackathon Presentation Polish](#prompt-32)
- [Prompt 33: Interview Intelligence Flow & README Architecture Alignment](#prompt-33)
- [Prompt 34: Product Design Polish & WOW Factor Enhancements](#prompt-34)
- [Prompt 35: Final Hackathon UX & Interactive Architecture Polish](#prompt-35)
- [Prompt 36: Prompt 38 — Dynamic Adaptive Interview Length & Evidence-Driven Completion](#prompt-36)
- [Prompt 37: Prompt 38 — Dynamic Evidence-Based Interview Termination Refinement](#prompt-37)
- [Prompt 38: Termination Logic Bug Audit & Strict Min 8 Guard](#prompt-38)

---

# Prompt 1

## Objective
Initial Setup & Architecture Verification

## Prompt

```text
The frontend is loading successfully, React has no runtime errors, and the backend is running correctly on http://localhost:5001.

However, the browser Network tab shows ZERO API requests.

There are no fetch/XHR requests to:

http://localhost:5001/api/candidates
http://localhost:5001/api/interview/*
or any backend endpoint.

This means the frontend is not actually calling the backend.

I want you to perform a complete frontend audit.

Check the following in order:

1. Locate the API service layer (api.ts or equivalent).

2. Verify the backend base URL is correct.
It must point to:
http://localhost:5001

3. Find every place where candidates should be loaded.

Verify that the candidate loading function is actually called inside useEffect() on initial render.

4. Check InterviewCockpit.

Verify interview initialization actually executes.

5. Check CandidateDrawer.

Ensure selecting a candidate triggers the backend start interview endpoint.

6. Search the project for:

fetch(
axios
api.
startInterview
submitResponse
loadCandidates
getCandidates

Verify none of these functions are dead code.

7. Verify no early return, conditional rendering, loading guard, feature flag, or state check prevents the API calls.

8. Add temporary console logs before every API request:

console.log("Loading candidates...");
console.log("Starting interview...");
console.log("Submitting response...");

9. Confirm every request appears in the browser Network tab.

10. If any API function is never called, trace the React component tree until the missing invocation is found and fix it.

11. If there are multiple API clients, remove duplicates and use a single API service.

12. Ensure the frontend uses only the backend running on:

http://localhost:5001

Do not stop after identifying the issue.

Actually fix the wiring so that:

• candidates load automatically
• interview starts correctly
• submitting a response calls the backend
• backend evaluates using the LLM
• frontend updates using the backend response

After fixing, provide:

- which files were modified
- why the API calls were not happening
- screenshots or logs showing successful requests in the Network tab
- backend logs proving requests are reaching the server

Do not create new code unless necessary.
Prefer fixing the existing architecture.
```

---

# Prompt 2

## Objective
Phase 1 Verification & Execution Plan

## Prompt

```text
Do NOT implement the plan yet.

Your audit says:

- fetchCandidates() is called inside useEffect
- API_BASE_URL is correct
- backend is healthy

However, the browser Network tab shows ZERO requests to /api/candidates.

Those facts cannot all be true simultaneously.

I want you to trace the execution step-by-step and identify exactly where execution stops.

Add console logs in this order:

App.tsx
-----------
console.log("App mounted");
console.log("Running fetchCandidates useEffect");

api.ts
-----------
console.log("Entering fetchCandidates()");
console.log("GET", API_BASE_URL + "/candidates");

Immediately before fetch():
console.log("Sending HTTP request");

Immediately after response:
console.log("Received response", response.status);

After parsing JSON:
console.log(data);

If any log is never printed, stop there and explain why.

Also verify:

1. App.tsx is actually the component rendered by main.tsx.
2. There isn't another App component being rendered.
3. There isn't another api.ts being imported.
4. Vite is serving the same source files you inspected.
5. There isn't another frontend running on another port.
6. The browser is connected to the correct Vite instance.

Do not guess.

Trace the execution from main.tsx → App.tsx → useEffect → fetchCandidates → fetch().

Tell me the exact line where execution stops.

Only after identifying the root cause should you modify the code.
```

---

# Prompt 3

## Objective
Runtime Execution Proof & Validation

## Prompt

```text
Good. Now I want runtime proof, not code inspection.

1. Launch the frontend.
2. Open the browser.
3. Refresh the page.
4. Verify these console logs actually appear:

App mounted
Running fetchCandidates useEffect
Entering fetchCandidates()
GET http://localhost:5001/api/candidates
Sending HTTP request
Received response 200

5. Verify the Network tab contains:
GET /api/candidates
POST /api/interview

6. Verify the backend terminal prints the incoming requests.

7. If ANY of those logs do not appear,
stop immediately and identify exactly why.

Do not tell me what should happen.
Tell me what actually happened at runtime.
```

---

# Prompt 4

## Objective
Multi-Turn Execution & Engine Stabilization

## Prompt

```text
We are entering the stabilization phase of InterviewOS.

DO NOT add new features unless they are required to fix an existing issue.

Your objective is to transform InterviewOS into a reliable, production-ready application.

========================
CURRENT STATUS
========================

Backend and frontend exist.

The backend and frontend communicate successfully.

The backend is currently running in Mock/Fallback mode because no LLM API key has been configured.

This is expected for now.

Do NOT attempt to integrate or test live Gemini/OpenAI APIs until a valid API key is available.

Keep the architecture provider-agnostic and ready for future LLM integration.

========================
PRIMARY OBJECTIVE
========================

Audit the entire project and eliminate every remaining bug, broken workflow, missing connection, placeholder, TODO, dead code, duplicated logic, and inconsistent behavior.

The application should behave like a finished product even while using the mock LLM.

========================
YOU MAY
========================

• Refactor code where necessary.
• Fix bugs.
• Improve architecture.
• Improve UI/UX.
• Improve state management.
• Improve error handling.
• Improve logging.
• Improve session handling.
• Improve retry logic.
• Improve adaptive interview behavior.
• Improve evaluation logic.
• Improve memory handling.
• Improve performance.
• Improve documentation.
• Improve project structure.

========================
YOU MUST NOT
========================

• Rewrite working modules unnecessarily.
• Remove existing functionality.
• Introduce breaking changes.
• Replace architecture without justification.
• Hardcode interview responses.
• Hardcode evaluation scores.
• Fake successful LLM responses.
• Depend on a live API.

========================
LLM REQUIREMENTS
========================

The current mock mode must simulate realistic interviewer behaviour.

Even in mock mode:

• random text should not pass
• empty responses should not pass
• "I don't know" should trigger retry
• unrelated answers should trigger follow-up
• strong answers should advance
• difficulty should adapt
• retry limits should work
• interview memory should remain consistent

The transition to a real LLM later should require only adding environment variables.

========================
QUALITY REQUIREMENTS
========================

Verify:

✓ candidate loading
✓ session creation
✓ interview flow
✓ retry flow
✓ follow-up flow
✓ adaptive difficulty
✓ conversation memory
✓ state machine
✓ final feedback
✓ frontend/backend integration
✓ browser console
✓ backend logs
✓ TypeScript build
✓ Vite build
✓ npm tests

Fix anything that fails.

========================
TERMINAL USAGE
========================

Use ONLY these terminals:

NORMAL terminal
→ repository operations
→ git
→ npm install
→ testing
→ diagnostics

BACKEND terminal
→ backend build
→ backend server
→ backend logs

FRONTEND terminal
→ vite
→ frontend build
→ frontend logs

Never create hidden terminals.

Never spawn detached background processes.

Never leave orphan Node processes.

If a process already exists, reuse it.

========================
WORKFLOW
========================

Work autonomously.

Do not ask for permission unless:

• external credentials are required
• user input is genuinely required
• a destructive action is required

Otherwise continue automatically.

========================
GIT
========================

Whenever a significant milestone is completed:

git add .
git commit -m "<meaningful message>"
git push

Do not wait until the very end.

========================
STOP CONDITION
========================

Stop only when:

• no critical bugs remain
• interview flow is stable
• all tests pass
• frontend behaves correctly
• backend behaves correctly
• mock interviewer behaves realistically
• codebase is clean
• project is ready for real LLM integration by simply adding API credentials

Then provide:

1. What was fixed.
2. Remaining known issues.
3. Recommended next steps.
```

---

# Prompt 5

## Objective
Live LLM Integration & Evaluation

## Prompt

```text
The project is stable now.

The only remaining blocker is that InterviewOS is still running in MOCK/FALLBACK mode.

Current backend log:

LLMClient initialized in Mock/Fallback Mode (No API key configured)

I have a Gemini Pro subscription and I want InterviewOS to use the REAL Gemini model instead of the mock evaluator.

Your task is to fully integrate Gemini.

Requirements:

1. Create backend/.env from .env.example.

2. Configure the backend to use Gemini instead of mock mode.

3. Use the current official Google Gemini API (not deprecated SDKs).

4. If my existing LLMClient is provider-agnostic, adapt it correctly instead of rewriting the architecture.

5. Tell me exactly where to paste my Gemini API key.

6. Use environment variables only.
Never hardcode keys.

7. Verify the backend starts with logs similar to:

LLMClient initialized with Gemini
Model: <model-name>

instead of

Mock/Fallback Mode

8. Send a real test prompt to Gemini.

For example:

"What is an embedding?"

and verify a real response is returned.

9. Verify that InterviewEngine now uses Gemini for:

- answer evaluation
- follow-up generation
- adaptive questioning
- final feedback

instead of the deterministic mock evaluator.

10. If any part of the pipeline still uses mocked logic,
replace it with Gemini while preserving the existing architecture.

11. Keep all existing APIs unchanged.

12. Preserve every feature already implemented.

13. Do not rewrite unrelated files.

14. Build the backend.

15. Run all backend tests.

16. Start the backend and verify a successful live Gemini call.

17. Commit after the integration is complete with:

feat(llm): integrate live Gemini API and replace mock evaluation

IMPORTANT:

• Work autonomously.
• Do not ask for permission unless you require my Gemini API key.
• Stop only when the backend is actually talking to Gemini.
```

---

# Prompt 6

## Objective
InterviewEngine & LLM Client Verification

## Prompt

```text
**Verify that InterviewEngine actually calls LLMClient.generate(...) (or the equivalent Gemini generation method) on every candidate response before scoring. Trace the full runtime path from POST /api/interview → InterviewController → InterviewEngine → LLMClient. Show the exact method names and line numbers where the LLM is invoked. If any scoring still comes from ResponseEvaluator or hardcoded heuristics instead of Gemini, replace it so every interview decision (score, correctness, follow-up, next_action) is produced from the Gemini response. Then run a live test with a real API key and show backend logs proving the Gemini API was called for each candidate answer.`
```

---

# Prompt 7

## Objective
Response Evaluator & Action Processing

## Prompt

```text
**Verify that InterviewEngine actually calls LLMClient.generate(...) (or the equivalent Gemini generation method) on every candidate response before scoring. Trace the full runtime path from POST /api/interview → InterviewController → InterviewEngine → LLMClient. Show the exact method names and line numbers where the LLM is invoked. If any scoring still comes from ResponseEvaluator or hardcoded heuristics instead of Gemini, replace it so every interview decision (score, correctness, follow-up, next_action) is produced from the Gemini response. Then run a live test with a real API key and show backend logs proving the Gemini API was called for each candidate answer.`
```

---

# Prompt 8

## Objective
Live Gemini API Verification

## Prompt

```text
I need you to verify whether my InterviewOS is actually using the live Gemini API for every interview turn or whether it's still using the deterministic interview engine.
Current status:
LLMClient initializes successfully with:
🚀 LLMClient initialized with Gemini (Model: gemini-2.5-flash)
Backend is no longer in Mock/Fallback mode.
Frontend connects successfully.
Interview progresses normally.
Problem observed:
The interviewer keeps giving identical retry responses regardless of what I type.
Example conversation:
Candidate: I don't know
Interviewer: I couldn't determine your understanding from that response. Could you explain how Sentence Transformers generate embeddings for text chunks?

Candidate: fuck you
Interviewer: I couldn't determine your understanding from that response. Could you explain how Sentence Transformers generate embeddings for text chunks?

Candidate: okay
Interviewer: I couldn't determine your understanding from that response. Could you explain how Sentence Transformers generate embeddings for text chunks?
Also, after moving to the Day 12 topic, the retry message unexpectedly asks again about Sentence Transformers (Day 7), which suggests an older state or hard-coded retry logic.
Please perform a runtime verification instead of assuming the integration is correct.
Specifically:
Trace the full execution path from:
Frontend send button
Express route
InterviewEngine
ResponseEvaluator
LLMClient
Gemini SDK
Confirm whether LLMClient.generate() (or the Gemini SDK call) is invoked on every candidate response.
If Gemini is invoked, verify that its returned text is actually used to generate the interviewer reply and is not being overwritten by deterministic FSM or ResponseEvaluator logic.
Add temporary logs such as:
console.log("🔥 GEMINI CALLED");
console.log(geminiResponse);
console.log(finalReplySentToFrontend);
so we can compare the Gemini response with the final message displayed in the UI.
If the deterministic engine intentionally controls question flow, explain exactly which parts are generated by Gemini and which parts are generated by the rule engine.
I want definitive runtime proof of how the interview response is produced, not just confirmation that the Gemini client initializes.
```

---

# Prompt 9

## Objective
LLM Call Audit & Response Evaluation

## Prompt

```text
You've confirmed that LLMClient.generate() is being called and that the backend reaches the Gemini API, but the API returns 429 RESOURCE_EXHAUSTED.
I need you to determine the exact root cause and fix it.
Please investigate and provide evidence for the following:
Print the complete JSON error response returned by Google's API, including:
error.code
error.status
error.message
error.details (if present)
Identify why the request is being rejected:
Is it a requests-per-minute limit?
A daily quota limit?
A billing issue?
An invalid API key/project issue?
A model-specific limit?
Verify that the request is actually using:
model: gemini-2.5-flash
and show the exact request being sent.
Verify that the API key is associated with the same Google Cloud / AI Studio project that created it.
If this is a quota issue, suggest the best fix, for example:
switch to another supported Gemini model,
reduce request frequency,
or enable the required API/billing if necessary.
Add temporary logging so the terminal prints something like:
console.log("🔥 GEMINI REQUEST");
console.log({
  model,
  endpoint,
  provider,
});

try {
  ...
} catch (err) {
  console.error("🔥 FULL GEMINI ERROR");
  console.error(JSON.stringify(err, null, 2));
}
Do not guess. Use the live API response and explain the exact reason for the failure.
My goal is to eliminate the 429 RESOURCE_EXHAUSTED error and make every interview turn use the live Gemini API successfully.
```

---

# Prompt 10

## Objective
Groq Provider Integration (llama-3.3-70b)

## Prompt

```text
I have created a Groq account and added my GROQ_API_KEY to backend/.env.
Now replace Gemini with Groq throughout the backend while keeping the architecture provider-agnostic.
Requirements
Install the official SDK if not already installed:
npm install groq-sdk
Modify backend/src/services/LLMClient.ts so it supports:
LLM_PROVIDER=groq
GROQ_API_KEY=...
LLM_MODEL=llama-3.3-70b-versatile
When LLM_PROVIDER=groq, initialize:
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
Replace Gemini API calls with Groq Chat Completions:
const completion = await groq.chat.completions.create({
  model: process.env.LLM_MODEL,
  messages: [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: userPrompt
    }
  ],
  temperature: 0.3
});

return completion.choices[0].message.content;
Do not modify:
InterviewEngine
ResponseEvaluator
State Machine
Adaptive Difficulty
Conversation Memory
Only change the LLM provider layer.
Add logs:
🚀 Groq initialized
🔥 GROQ REQUEST
🔥 GROQ RESPONSE
❌ GROQ ERROR
After implementation:
Run npm run build
Run all backend tests
Start the backend
Verify that a real interview turn uses Groq successfully.
Show me the terminal output proving:
Groq initialized
Request sent
Response received
No mock mode
No Gemini fallback
No API errors
Do not stop until the backend is using Groq successfully.
```

---

# Prompt 11

## Objective
Real LLM Evaluation & Anti-Scripting Audit

## Prompt

```text
I do not want another code audit or theoretical verification.

I want runtime proof.

Your report claims:
- 0 hardcoded interview paths
- every question generated by the LLM
- 0 deterministic transitions

However, the actual UI behavior does not match those claims.

I want you to prove the runtime behavior by instrumenting the backend.

For every interview turn print exactly:

===================================================
TURN #
CURRENT DAY
CURRENT STATE

Candidate Answer

LLM Evaluation Request
(full prompt)

LLM Raw Response
(exact JSON)

Parsed Evaluation

Decision:
retry / follow_up / advance

Previous Day
Next Day

Reason for Transition

Question Generation Prompt
(full prompt)

Generated Question
===================================================

Then run an actual interview through the frontend with these answers:

1.
"I used Sentence Transformers."

2.
"I don't know"

3.
"banana"

4.
"asdf"

5.
"fuck you"

6.
"I implemented ChromaDB using cosine similarity."

I want the complete runtime logs for every turn.

If ANY question shown in the UI differs from the generated question printed in the backend logs, identify exactly where the question was replaced or overridden.

If ANY state transition occurs without the LLM deciding it, identify the exact file and line.

Do not tell me 'tests passed.'

I only want runtime evidence from the live application.
```

---

# Prompt 12

## Objective
Real-time Interview Behavior & Fast-Path Evaluation

## Prompt

```text
The Groq integration is working, but the interview behavior proves the LLM is not controlling the interview flow.
Current evidence
The backend logs show:
🚀 Groq initialized
🔥 GROQ REQUEST
🔥 GROQ RESPONSE
So the API connection is working.
However the UI still behaves like a scripted interviewer:
it asks predefined curriculum questions
it sometimes jumps to another day unexpectedly
retry messages are repetitive
evaluation appears deterministic
difficulty is still rule-based instead of AI-driven
This means LLMClient is connected but its outputs are not actually driving InterviewEngine.
I want a complete architecture audit.
Trace the complete runtime path for every interview turn.
Show the execution flow from:
Frontend
↓
POST /api/interview
↓
Interview Route
↓
InterviewEngine
↓
ResponseEvaluator
↓
LLMClient
↓
Groq API
↓
Evaluation JSON
↓
State Machine
↓
Question Generator
↓
Frontend Response
Verify these items one by one
1.
Does ResponseEvaluator actually call LLMClient.generate()?
or
Does it still return hardcoded scores?
2.
Does InterviewEngine actually use the JSON returned by the LLM?
or
Does it ignore it and use internal scoring?
3.
Does InterviewEngine still contain code like
score > 70
advance()

else retry()
or
switch(day)
or
curriculum[currentIndex+1]
or any deterministic progression?
Remove every remaining scripted progression.
4.
Question generation
The interviewer must NOT read from predefined question templates.
Instead:
For every turn call Groq again.
Prompt should include:
candidate profile
curriculum day
previous conversation
evaluation JSON
adaptive difficulty
retry count
Groq must generate the interviewer question.
Return that directly to the frontend.
5.
Evaluation
Every candidate response must produce structured JSON.
Required schema:
{
  "score":0,
  "confidence":0,
  "correctness":"",
  "detectedConcepts":[],
  "missingConcepts":[],
  "strengths":[],
  "weaknesses":[],
  "nextAction":"retry | follow_up | advance",
  "reason":""
}
Do NOT create these values using heuristics.
Only use Groq.
6.
Conversation memory
Groq should receive the entire interview context:
previous questions
previous answers
current topic
retry count
adaptive difficulty
candidate profile
No isolated prompts.
7.
Topic progression
Only advance when
evaluation.nextAction == "advance"
Never advance because of
question count
day number
index++
fallback logic
hardcoded thresholds
8.
Retry behaviour
If answer is
asdf
hello
ok
I don't know
...
Groq should decide
retry
and generate a new clarification question for the SAME topic.
Never reuse a hardcoded retry sentence.
9.
Backend logs
For every turn print:
==============================
CURRENT DAY

USER ANSWER

RAW GROQ EVALUATION JSON

NEXT ACTION

CURRENT STATE

RETRY COUNT

GENERATED QUESTION

TOPIC BEFORE

TOPIC AFTER

==============================
10.
Final proof
Do not tell me "implemented".
Prove it by showing:
the exact files changed
before/after snippets
one complete runtime log
one real interview where:
wrong answer
follow-up
improvement
advancement
confirm that every interviewer question shown in the UI came from Groq and not from hardcoded templates.
```

---

# Prompt 13

## Objective
State Machine Audit & Topic Transition Policy

## Prompt

```text
STOP PATCHING INDIVIDUAL BUGS.

I do NOT want another quick fix.

I want you to redesign the Interview Engine architecture.

The current implementation behaves like a chatbot instead of an interviewer.

I want a deterministic interview state machine driven by curriculum + evaluation.

==========================================
CURRENT PROBLEMS
==========================================

1.
The LLM invents questions instead of interviewing from the curriculum.

2.
The interviewer forgets previous answers.

3.
It keeps asking about embeddings forever.

4.
It asks OpenAI-specific questions although the curriculum never mentions OpenAI.

5.
It ignores the current curriculum day.

6.
It ignores interview state.

7.
It mixes evaluator logic with interviewer logic.

8.
It retries forever.

9.
It hallucinates new topics.

10.
It advances inconsistently.

11.
Question generation is uncontrolled.

12.
Conversation is not grounded.

==========================================
I WANT THIS ARCHITECTURE
==========================================

InterviewEngine
      │
      ▼
Current Curriculum Topic
      │
      ▼
Generate Question
      │
      ▼
Candidate Answer
      │
      ▼
Response Evaluator
      │
      ▼
Decision

retry
follow_up
advance
terminate

ONLY THESE FOUR ACTIONS.

Nothing else.

==========================================
QUESTION GENERATION
==========================================

The interviewer MUST NEVER invent random topics.

Every question must be grounded in

current curriculum day

learning objective

tools

project

expected concepts

difficulty

The LLM is ONLY allowed to rephrase or deepen the existing topic.

It is NOT allowed to introduce unrelated technologies.

For example

If current topic is

Sentence Transformers

the LLM must never suddenly ask

OpenAI embeddings

Azure AI Search

Vertex AI

FAISS IVF

unless they exist inside that curriculum day.

==========================================
EVALUATION
==========================================

Evaluation must happen FIRST.

Return structured JSON only.

{
score,

confidence,

correctness,

strengths,

weaknesses,

missingConcepts,

detectedConcepts,

next_action,

reason

}

No natural language.

==========================================
STATE MACHINE
==========================================

retry

↓

follow_up

↓

advance

↓

next curriculum day

The current day MUST remain locked until

next_action=="advance"

OR

retryCount >= maxRetry

==========================================
FOLLOW UP QUESTIONS
==========================================

Follow-up questions must ONLY depend on

candidate answer

missing concepts

current curriculum

difficulty

They must NEVER restart the interview.

==========================================
QUESTION MEMORY
==========================================

Store

askedQuestions

followUps

coveredConcepts

missingConcepts

retryCount

visitedDays

Never ask the same question twice.

Never ask identical retries.

Generate new wording every retry.

==========================================
CONTEXT WINDOW
==========================================

Every LLM request MUST receive

Candidate Profile

Current Day

Current Topic

Learning Objective

Expected Concepts

Conversation History

Last Question

Candidate Answer

Evaluation Result

Difficulty

Retry Count

Visited Topics

Covered Concepts

Missing Concepts

This context must be built inside InterviewEngine.

==========================================
INVALID RESPONSES
==========================================

If user answers

asdf

hello

...

empty

random keyboard

profanity

"I don't know"

the evaluator should classify them separately.

Examples

INVALID

OFF_TOPIC

PROFANITY

NO_ATTEMPT

UNCERTAIN

Each should have different handling.

==========================================
INTERVIEWER STYLE
==========================================

Behave like a real Senior Engineering Interviewer.

Never lecture.

Never explain the answer.

Never teach.

Never produce paragraphs.

Maximum 3-6 sentences.

Ask concise questions.

Challenge the candidate.

If answer is weak

ask a targeted follow-up.

==========================================
LOGGING
==========================================

Log every interview turn.

Current Day

Question ID

Question

Candidate Answer

Evaluation JSON

Decision

Retry Count

Next Topic

Difficulty

Latency

==========================================
CODE REQUIREMENTS
==========================================

Do NOT patch existing methods.

Refactor the engine properly.

Separate responsibilities into

QuestionGenerator

ResponseEvaluator

InterviewStateManager

ConversationMemory

CurriculumNavigator

LLMClient

InterviewEngine

The InterviewEngine should orchestrate only.

==========================================
FINAL GOAL
==========================================

I want InterviewOS to behave like a real adaptive AI technical interviewer like Google, Meta or Amazon.

It should feel conversational, remember context, ask intelligent follow-up questions, never hallucinate topics, never repeat itself, and progress deterministically through the curriculum.

Do not stop after making changes.

Run end-to-end tests yourself.

Start multiple interview simulations.

Deliberately test:

• excellent answers
• weak answers
• profanity
• off-topic answers
• random text
• repeated retries
• reaching retry limit
• curriculum progression
• follow-up generation

Keep fixing until every scenario behaves correctly.

Only then commit the changes.
```

---

# Prompt 14

## Objective
Execution Continuation & Verification

## Prompt

```text
continue
```

---

# Prompt 15

## Objective
Production Engineering Audit & Quality Refinements

## Prompt

```text
You are the Lead Staff AI Engineer, Principal Backend Architect, Senior Frontend Engineer, Product Designer, QA Lead, and Technical Interview Expert responsible for shipping InterviewOS v1.0.
Your objective is NOT to make small fixes.
Your objective is to transform this repository into a production-ready AI Interview Platform.
Assume nothing is perfect.
Treat every module as potentially flawed.
Do not stop after fixing the first issue.
Continue auditing until no major issue remains.
PRIMARY GOAL
Perform a complete engineering audit of the entire project.
Think like someone preparing this product for thousands of users.
Do not simply satisfy the current tests.
Find architectural problems.
Find hidden bugs.
Find poor AI behavior.
Find UX problems.
Find scalability problems.
Find security issues.
Find conversation flaws.
Find prompt engineering flaws.
Find state machine flaws.
Find evaluation flaws.
Find retry flaws.
Find memory bugs.
Find race conditions.
Find infinite loops.
Find API misuse.
Find anything that would make a real user think
"This AI interviewer feels fake."
Then fix every issue.
AI INTERVIEW QUALITY REQUIREMENTS
The interviewer must behave exactly like a senior interviewer from OpenAI, Google, Microsoft, Meta or Amazon.
Never robotic.
Never repetitive.
Never ask identical questions twice.
Never loop.
Never forget context.
Never contradict itself.
Never ignore previous answers.
Never ask irrelevant questions.
Never jump to another topic incorrectly.
Never continue forever.
Never become stuck.
Never produce raw JSON.
Never leak prompts.
Never expose internal reasoning.
Never expose evaluation objects.
Never expose tool outputs.
Never hallucinate candidate history.
Never hallucinate curriculum.
Never hallucinate scores.
CONVERSATION REQUIREMENTS
The interviewer must
remember previous answers
reference previous discussion
adapt difficulty
challenge good candidates
help weak candidates
politely recover from invalid input
handle profanity professionally
handle silence
handle "I don't know"
handle refusal
handle random text
handle copied answers
handle repeated answers
handle extremely long answers
handle extremely short answers
handle emojis
handle markdown
handle code blocks
handle mixed languages
handle pasted articles
handle AI generated answers
handle interruptions
without breaking.
STATE MACHINE REQUIREMENTS
Audit the entire FSM.
Verify every transition.
Greeting
↓
Question
↓
Evaluation
↓
Decision
↓
Retry
↓
Hint
↓
Follow-up
↓
Topic Switch
↓
Completion
↓
Final Feedback
There must be
no impossible transitions
no dead states
no infinite retry loops
no forgotten state variables
no duplicate topic visits
no skipped evaluation
no skipped scoring
no duplicate feedback
no duplicated questions
QUESTION GENERATION
Audit the entire prompt engineering pipeline.
Questions must
feel natural
feel human
reference candidate history
reference previous answer
increase in difficulty
change wording
avoid template repetition
avoid generic AI phrasing
avoid repetitive introductions
avoid repeating
"Can you explain..."
twenty times.
The interviewer should sound alive.
RESPONSE EVALUATION
Audit evaluation logic.
Verify
scoring
classification
confidence
reasoning
difficulty adjustment
follow-up generation
topic progression
retry thresholds
invalid detection
spam detection
profanity detection
irrelevant answer detection
copy-paste detection
AI-generated answer detection (if applicable)
MEMORY
Verify memory system.
The interviewer must remember
previous answers
mistakes
strengths
weaknesses
visited topics
asked questions
feedback already given
retry count
difficulty history
conversation history
There must never be memory loss during one interview.
FRONTEND AUDIT
Audit everything.
UI
animations
loading states
disabled buttons
typing indicator
scroll behavior
mobile responsiveness
error handling
API failures
network disconnect
reconnect
empty states
chat rendering
markdown rendering
copy issues
focus management
keyboard shortcuts
accessibility
performance
React rendering
unnecessary re-renders
state management
memory leaks
BACKEND AUDIT
Audit
API validation
input sanitization
rate limiting
timeouts
logging
error propagation
retry logic
provider abstraction
LLM integration
session management
thread safety
configuration
environment loading
build
tests
LLM PROVIDER
Verify the provider abstraction completely.
Groq
Gemini
future OpenAI compatibility
must all work without changing business logic.
Provider changes should only require configuration.
CODE QUALITY
Remove
dead code
duplicate code
unused variables
unused prompts
unused utilities
temporary debug logs
TODOs
FIXMEs
legacy hacks
test-only logic leaking into production
improper abstractions
large duplicated functions
magic numbers
unsafe any types
SECURITY
Audit
API keys
env loading
secret exposure
CORS
request validation
prompt injection risks
malicious input
XSS
DoS risks
session hijacking
unsafe logging
PERFORMANCE
Optimize
prompt size
token usage
render count
bundle size
API latency
memory usage
state updates
repeated LLM calls
duplicate evaluations
TESTING
Create comprehensive tests for
normal interview
excellent candidate
average candidate
poor candidate
silent candidate
spam
profanity
long answer
copy paste
network failure
provider failure
429
500
LLM timeout
invalid JSON
frontend refresh
browser reload
resume interview
multiple concurrent interviews
All tests must pass.
FINAL PRODUCT REQUIREMENTS
When finished,
the application should feel indistinguishable from a polished commercial AI interviewer.
A recruiter should be able to use it immediately.
A student should enjoy using it.
The interviewer should feel intelligent, adaptive, conversational, and professional.
IMPORTANT EXECUTION RULES
Do not stop after one fix.
Continue recursively auditing the project until no major issues remain.
If fixing one bug reveals another, continue automatically.
Refactor when necessary instead of patching.
Prefer architectural improvements over temporary fixes.
At the end, provide:
Complete list of issues found.
Root cause for each issue.
Exact files modified.
Why each fix was required.
Before vs After behavior.
Remaining limitations (if any).
Production readiness score out of 10.
Code quality score out of 10.
AI conversation quality score out of 10.
Overall project score and whether you would confidently ship this project to real users.
Do not finish until you genuinely believe this repository is production-ready.
```

---

# Prompt 16

## Objective
Production Stabilization (Part 1)

## Prompt

```text
Continue
```

---

# Prompt 17

## Objective
Production Stabilization (Part 2)

## Prompt

```text
Continue
```

---

# Prompt 18

## Objective
Production Stabilization (Part 3)

## Prompt

```text
Continue
```

---

# Prompt 19

## Objective
LLM Audit Logging & Anti-Scripting Proofs

## Prompt

```text
continue
```

---

# Prompt 20

## Objective
System Performance & Architecture Audit

## Prompt

```text
Perform a performance and architecture audit of InterviewOS. Do NOT add any new features. Analyze why multiple /api/interview and duplicate Groq requests are occurring. Ensure exactly one interview session is initialized, eliminate duplicate React renders or duplicate useEffect execution, minimize LLM usage to at most two API calls per interview turn (evaluation + question generation), cache static greetings instead of calling the LLM, and optimize retry logic so the application does not exhaust Groq quotas during normal usage. Instrument the backend to log the number of LLM calls per user turn and verify with a complete end-to-end test that one user answer results in no more than two Groq API requests. Produce a report with before/after request counts, latency, and quota usage.
```

---

# Prompt 21

## Objective
Terminal Environment & Server Inspection

## Prompt

```text
@[TerminalName: backend, ProcessId: 14150]
```

---

# Prompt 22

## Objective
LLM Model Selection (llama-3.1-8b-instant)

## Prompt

```text
I changed LLM_MODEL in .env, but the backend still reports:
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile"
}
This means the new model is not actually being used.
I do not want guesses or assumptions. I want you to debug the codebase and fix the root cause.
Your tasks:
Search the entire project for:
"llama-3.3-70b-versatile"
"llama-3.1-8b-instant"
Find every place where the model name is assigned.
Verify that LLM_MODEL is loaded correctly from .env.
Trace the flow:
.env
    ↓
env.ts
    ↓
LLMClient.ts
    ↓
Groq SDK
    ↓
/health endpoint
Remove every hardcoded model name.
Ensure every Groq request uses:
env.LLM_MODEL
and never a literal string.
Add temporary startup logs:
console.log("process.env.LLM_MODEL =", process.env.LLM_MODEL);
console.log("env.LLM_MODEL =", env.LLM_MODEL);
Also log before every API call:
console.log("Using model:", this.model);
Rebuild and restart the backend.
Verify by showing:
GET /health
and at least one real Groq request log proving the new model is being used.
IMPORTANT
Do not stop after editing files.
Actually verify the fix.
If /health still shows llama-3.3-70b-versatile, continue debugging until you find the exact file overriding the model.
Finally, tell me:
Which file contained the bug.
What line caused it.
What you changed.
Show the final /health output proving the fix.
```

---

# Prompt 23

## Objective
System Polishing & Execution Verification

## Prompt

```text
We have reached the polishing phase.

The infrastructure is stable.
The remaining issues are conversation-quality bugs.

Fix ALL of the following without introducing regressions.

1. Ground every generated question strictly to the CURRENT curriculum topic.

If current topic is:
Day 1 -> only VS Code/Python.
Day 4 -> only Pandas/SQLite.
Day 7 -> only Embeddings.
Never leak technologies from previous or future days.

2. Never generate "Can you go deeper...", "Building on what you shared...", or similar follow-ups unless the previous answer contains genuine technical content.

Invalid inputs:
- hi
- hello
- nope
- no
- maybe
- idk
- gibberish
- profanity
- off-topic

must instead receive:
- clarification
- simplified question
- polite retry

3. Add question diversity.

The interviewer must never repeat the same wording twice in a row.

Maintain a history of the last three interviewer prompts and forbid semantic repetition.

4. Implement repeat-question intent.

Recognize:
- previous question
- repeat
- say again
- repeat please
- what was the question

and resend the previous interviewer question exactly.

5. Improve report generation.

If no technical evidence exists,
strengths must be

"No technical strengths demonstrated."

Never invent strengths.

Only summarize verified evidence.

6. Prevent topic leakage.

QuestionGenerator may ONLY use:
currentDay.objectives
currentDay.tools
currentDay.concepts

It must never reuse technology names from earlier interview turns.

7. Add runtime assertions.

Before returning a question:

assert(question references current topic)

assert(question does not reference unrelated technologies)

assert(question differs from previous interviewer question)

assert(follow-up only if previous answer contained technical content)

If any assertion fails,
regenerate automatically.

Run an end-to-end test covering:

- greeting
- hello
- gibberish
- profanity
- repeat question
- I don't know
- good answer
- report generation

Do not stop until every test passes.
```

---

# Prompt 24

## Objective
Comprehensive Architecture & Security Audit

## Prompt

```text
You are acting as a Senior AI Architect and Staff Software Engineer performing the final production-quality refinement of InterviewOS.
The project is already stable:
✅ State machine works.
✅ Topic progression works.
✅ Runtime assertions work.
✅ Topic leakage fixed.
✅ Report no longer invents strengths.
✅ Duplicate requests fixed.
✅ Repeat-question intent works.
✅ Max 2 LLM calls per turn.
✅ TypeScript builds cleanly.
Do NOT refactor unrelated code.
Do NOT redesign the architecture.
Do NOT modify APIs.
Focus ONLY on the remaining realism issues below.
ISSUE 1 — Report Must Credit Good Answers
Current problem:
If the candidate performs poorly for most of the interview but gives one or two technically strong answers later, the final report still says
Strengths:
No technical strengths demonstrated.
This is incorrect.
The report must be completely evidence-driven.
For every GOOD or EXCELLENT evaluation:
store the evidence
store the topic
store the concepts demonstrated
Example:
Candidate answer:
LangChain enables tool use by allowing an LLM to decide when to call external functions...
Report should include
Strengths

• Demonstrated understanding of LangChain tool invocation.

• Explained how external tools integrate into an LLM reasoning loop.

• Showed conceptual understanding of Agentic Frameworks.
Only use evidence that actually appeared during the interview.
Never invent strengths.
Never ignore successful answers.
ISSUE 2 — Don't End Immediately After First Good Answer
Current behaviour:
Candidate struggles.
Eventually gives a strong answer.
Interview instantly ends.
This feels robotic.
Instead:
If interview question budget still remains:
GOOD ANSWER
↓
ask ONE follow-up
OR
ask ONE question on the same topic
↓
then finish naturally.
Only end immediately when
question budget exhausted
OR
all curriculum objectives completed.
The interview should feel like a human interviewer, not a finite-state machine.
ISSUE 3 — Add LACK_OF_EXPERIENCE Classification
Current classifications:
GOOD
EXCELLENT
WEAK
GIBBERISH
OFF_TOPIC
PROFANITY
UNCERTAIN
REFUSAL
Add
LACK_OF_EXPERIENCE
Detect examples like:
"I never used Pandas."
"I haven't worked with Docker."
"I don't have experience with LangChain."
"I didn't implement this."
"I've never done that."
This is NOT uncertainty.
This is NOT gibberish.
This is NOT refusal.
It simply means
candidate lacks practical exposure.
When detected:
Do NOT keep asking
"Describe how YOU implemented..."
Instead pivot naturally.
Example:
Instead of
How did you configure Pandas?
ask
If you had to build this today,
how would you approach it?
or
What do you know conceptually
about this technology?
This creates a much more realistic interview.
ISSUE 4 — Improve Interview Naturalness
Avoid repetitive templates.
Examples currently seen:
Let's revisit...
I'd like to clarify...
How specifically...
Expand interviewer phrasing with more natural variations such as:
Let's look at it from another angle...
Suppose you were implementing this today...
Walk me through your thought process...
Imagine you're designing this from scratch...
Can you reason through how this would work?
What would your approach be?
What trade-offs would you consider?
If you joined our team tomorrow, how would you solve this?
No opener should dominate the conversation.
ISSUE 5 — Stronger Conversation Memory
Follow-up questions should reference only verified candidate statements.
Example:
Candidate:
I used ChromaDB.
Valid follow-up:
You mentioned ChromaDB.
Why did you choose cosine similarity?
If the candidate never mentioned ChromaDB,
the interviewer must NEVER pretend they did.
Conversation memory must remain perfectly grounded.
ISSUE 6 — Final Report Quality
Generate reports like a real hiring panel.
Structure:
Executive Summary

Technical Strengths

Knowledge Gaps

Communication Assessment

Topics Successfully Demonstrated

Topics Skipped

Hiring Recommendation

Recommended Study Plan
Everything must be grounded in interview evidence.
No hallucinations.
No generic advice.
Verification
Create an automated end-to-end validation suite covering:
Mostly bad answers → final good answer.
Candidate with no experience.
Candidate with mixed performance.
Candidate giving only strong answers.
Candidate asking repeat question.
Candidate using profanity.
Candidate giving conceptual-only answers.
Candidate finishing interview.
Verify:
report credits all good answers
no invented strengths
no fake memory
lack-of-experience path works
follow-up after good final answer
interview ends naturally
no regression of previous fixes
Compile the backend and frontend, run all validation tests, and provide the actual execution results with any remaining issues. Do not claim success unless it is verified by the test outputs.
```

---

# Prompt 25

## Objective
Git Repository Release & Commit

## Prompt

```text
push git
```

---

# Prompt 26

## Objective
Prompt 28 — Final Production Audit

## Prompt

```text
Prompt 28 — Final Production Audit (NO IMPLEMENTATION)

You are now acting as a Principal Software Engineer, AI Architect, Staff Backend Engineer, Senior Frontend Engineer, Security Reviewer, and Technical Interview Platform Reviewer.

IMPORTANT:
Do NOT modify any code.
Do NOT edit any files.
Do NOT generate patches.
Do NOT claim success without evidence.

Your only job is to perform a brutal production audit of the entire InterviewOS project.

Assume this project is going to be deployed to real users.

Review everything, including:

• Backend architecture
• Frontend architecture
• State machine
• Prompt engineering
• Conversation memory
• Question generation
• Response evaluation
• Feedback/report generation
• Runtime assertions
• Session management
• Retry logic
• Error handling
• Rate-limit handling
• Performance
• Security
• API design
• Type safety
• Logging
• Edge cases
• Conversation realism
• Interview quality
• User experience
• Scalability
• Maintainability

I do NOT want improvements for the sake of improvements.

Instead produce a production audit.

For every issue provide:

1. Severity
   - Critical
   - High
   - Medium
   - Low

2. File(s) involved

3. Why it is a problem

4. Real-world impact

5. Suggested solution (high level only)

Do NOT implement anything.

Also answer these questions honestly:

1. Is the project production ready?

2. Could this handle 10,000 users?

3. What are the biggest architectural weaknesses?

4. What AI conversation weaknesses still exist?

5. What edge cases are still unhandled?

6. What security risks remain?

7. What performance bottlenecks remain?

8. What code smells remain?

9. What technical debt remains?

10. What would prevent shipping this today?

Finally produce:

==========================
FINAL PRODUCTION SCORE
==========================

Architecture: __/10

Backend: __/10

Frontend: __/10

AI Conversation Quality: __/10

Interview Realism: __/10

Security: __/10

Performance: __/10

Maintainability: __/10

Scalability: __/10

Overall: __/10

Finally give one of ONLY these verdicts:

✅ READY FOR PRODUCTION

⚠️ READY AFTER FIXING ONLY THE HIGH/CRITICAL ISSUES

❌ NOT READY FOR PRODUCTION

Be brutally honest. Do not invent issues, but do not overlook any either. Base your conclusions on the current codebase and any completed validation results.
```

---

# Prompt 27

## Objective
Prompt 29 — Final Interview Realism & Report Accuracy Polish

## Prompt

```text
Prompt 29 — Final Interview Realism & Report Accuracy Polish

The interview quality has improved significantly, but there are still two realism issues that need to be fixed.

Issue 1: Strengths section over-credits the candidate.

Currently, if a candidate gives only one or two decent answers, the report extracts every keyword and creates many strengths such as:

- Demonstrated understanding of FastAPI
- Demonstrated understanding of /health endpoint
- Demonstrated understanding of Ollama
- Demonstrated understanding of CLI chatbot
- Demonstrated understanding of API duplication avoidance

This exaggerates performance.

Instead:

- Group related evidence into broader strengths.
- Maximum 3 strengths.
- Each strength should represent an actual competency rather than individual technologies.

Example:

GOOD

Strengths
• Demonstrated a basic understanding of building AI applications with FastAPI and Ollama.
• Showed awareness of backend API design and health-check endpoints.

NOT

• FastAPI
• Ollama
• CLI chatbot
• /health endpoint
• API duplication avoidance

Only include strengths supported by explicit candidate answers.

--------------------------------------------------------

Issue 2: Topic transitions are too abrupt.

Current behaviour:

Candidate answers a FastAPI question.

Immediately next question:

"Compare zero-shot vs few-shot vs chain-of-thought..."

This feels like skipping the natural interview flow.

Instead implement progressive probing.

Rule:

If candidate gives a GOOD answer,

stay within the same concept for one follow-up before advancing.

Example:

Q1:
Explain how you built your FastAPI backend.

Candidate answers.

Q2:
How would you handle validation and error responses?

Candidate answers.

Then advance.

Only move to the next topic after:

- concept explored sufficiently
- or maximum follow-up depth reached

--------------------------------------------------------

Conversation realism requirements

Avoid sudden jumps between unrelated concepts.

Progress naturally:

basic

↓

implementation

↓

trade-offs

↓

next topic

--------------------------------------------------------

Report requirements

Strengths:
- maximum 3 bullets
- competency based
- evidence based

Areas for Growth:
- avoid duplicates
- merge similar weaknesses
- maximum 6 bullets

Summary:
Should reflect overall performance rather than isolated answers.

Someone who answered 2/8 questions correctly should receive a mixed or below-average summary—not one that sounds overly positive.

Do not modify working features such as:
- repeat question
- profanity handling
- topic progression
- runtime assertions
- rate limiting
- deterministic fallbacks

Only improve interview realism and report quality.
```

---

# Prompt 28

## Objective
Evidence-Based Competency Scoring (1–5 Scale)

## Prompt

```text
The interview conversation quality is now strong. The remaining weakness is the final evaluation report.
Implement the following improvements without changing the current interview flow.
1. Evidence-Based Competency Scoring
Do NOT score candidates primarily by keyword matches.
Instead evaluate across these competencies:
Technical Understanding
Practical Implementation
System Design / Architecture
Trade-off Analysis
Communication Quality
Each competency should receive a score from 1–5.
Example:
Technical Understanding: 5/5
Implementation: 4/5
Architecture: 5/5
Trade-offs: 4/5
Communication: 5/5
The hiring recommendation should be derived from these scores rather than isolated keywords.
2. Evidence Aggregation
Current issue:
If the candidate mentions:
FastAPI
Ollama
Health endpoint
API reuse
the report generates four different strengths.
Instead merge them into one competency.
Example:
❌ Bad
• FastAPI
• Ollama
• Health endpoint
• API reuse
✅ Good
• Demonstrated practical experience designing AI backend services using FastAPI, Ollama, reusable APIs, and deployment best practices.
3. Strong Answers Must Outweigh Earlier Weak Ones
Current behaviour penalizes candidates too heavily for weak early answers.
Instead:
Maintain cumulative evidence.
If a candidate later demonstrates deep understanding of a topic,
update the competency score.
A strong implementation answer should outweigh earlier uncertainty.
Do not permanently penalize candidates for an early "I don't know".
4. Topic-Level Evaluation
Store performance per curriculum topic.
Example:
Day 7
★★★★★

Day 8
★★★★☆

Day 12
★★★★★

Day 28
★★★★☆
The report should reference actual topic performance.
5. Hiring Recommendation
Replace the current heuristic with competency-based thresholds.
Example:
Average >= 4.5
Strong Hire
Average >=4.0
Hire
Average >=3.0
Lean Hire
Average >=2.5
Weak Pass
Average <2.5
No Hire
6. Summary Generation
Do not use generic templates.
Generate summaries directly from interview evidence.
Example:
"Sarah demonstrated strong practical knowledge of embeddings, vector databases, prompt engineering, and containerized deployment. Responses consistently showed implementation experience and architectural reasoning. Minor gaps remained in lower-level ChromaDB configuration details."
NOT
"Candidate demonstrated good technical awareness."
7. Strengths
Maximum 3 bullets.
Each bullet should describe a competency,
not individual technologies.
8. Areas for Growth
Maximum 5 bullets.
Only include genuine gaps observed during the interview.
Do not say:
Lacked technical depth
if the candidate later demonstrated deep implementation knowledge.
9. Confidence Score
Add:
Evaluation Confidence

High

Medium

Low
High confidence:
many technical answers
Low confidence:
mostly refusals/gibberish
10. Final Report Layout
Summary

Competency Scores

Technical Understanding
Implementation
Architecture
Trade-offs
Communication

Strengths

Areas for Growth

Topic Performance

Hiring Recommendation

Confidence
Important
Do NOT modify:
interview flow
adaptive questioning
runtime assertions
repeat-question handling
profanity handling
topic progression
LLM optimizations
Only improve the evaluation engine and final report generation.
```

---

# Prompt 29

## Objective
Red Team Audit (50+ Candidate Persona Simulations)

## Prompt

```text
I don't want any more new features.

Act as a Senior Staff Engineer, Principal AI Engineer, and Engineering Hiring Manager.

Your task is to perform a COMPLETE RED TEAM audit of InterviewOS.

DO NOT implement anything yet.

Run 50+ simulated interviews with different candidate personas.

Include:

• Excellent senior engineers
• Mid-level engineers
• Freshers
• Candidates with no experience
• Candidates that improve during interview
• Candidates that start strong then fail
• Overconfident candidates
• Candidates that answer partially
• Candidates that answer with code
• Candidates that ask to repeat questions
• Candidates that switch topics
• Candidates that use profanity
• Candidates that type gibberish
• Candidates that copy ChatGPT-style answers
• Candidates that hallucinate technologies
• Candidates that contradict themselves

For every interview verify:

1. Question realism
2. Topic progression
3. Adaptive probing
4. Evaluation fairness
5. Hiring recommendation correctness
6. False positives
7. False negatives
8. Prompt leakage
9. Hallucinated feedback
10. Topic leakage
11. Conversation naturalness
12. Score consistency
13. Competency scoring correctness
14. Whether later good answers outweigh early weak answers
15. Whether reports are fully evidence-based

Then identify EVERY remaining issue.

Categorize each issue as:
- Critical
- High
- Medium
- Low

For every issue provide:
- Root cause
- Exact file
- Exact function
- Why it happens
- Reproduction steps
- Suggested fix

Do NOT modify the code automatically.

Generate a final production readiness report with scores for:

- AI Quality
- Interview Realism
- Evaluation Fairness
- Security
- Backend
- Frontend
- Scalability
- Maintainability
- Production Readiness

Finally answer:

1. Would FAANG interviewers consider this realistic?
2. Would this fool candidates into thinking it is a human interviewer?
3. Is the hiring recommendation trustworthy?
4. Is there any bias?
5. What is still preventing this from being world-class?

Be brutally critical.
Assume this system is about to be deployed to thousands of candidates.
```

---

# Prompt 30

## Objective
INTERVIEWOS V2 — Premium Frontend Redesign

## Prompt

```text
INTERVIEWOS V2 — PREMIUM FRONTEND REDESIGN (NO BACKEND CHANGES)
You are ONLY redesigning the frontend.
DO NOT modify any backend logic, APIs, interview engine, evaluation engine, prompts, state machine, scoring, routing, business logic, or TypeScript backend files.
The application already works correctly.
Your ONLY task is to transform the UI into something that looks like a premium AI operating system suitable for a hackathon demo.
CRITICAL
Do NOT break anything.
Keep every API exactly the same.
Keep every React state exactly the same.
Keep every hook exactly the same.
Keep every websocket/API interaction exactly the same.
Only improve presentation.
DESIGN GOAL
Make InterviewOS feel like
"OpenAI + Linear + Apple + Vercel"
NOT
Bootstrap Dashboard.
Color Palette
Very dark background
Deep navy
Soft blue gradients
Glassmorphism
Soft shadows
Tiny borders
No heavy boxes
Use:
background #050816
card #101728
primary #4F8CFF
secondary #7DD3FC
accent #00E5FF
text white
muted #94A3B8
danger #EF4444
success #10B981
warning #F59E0B
Typography
Use Inter.
Large headings.
Lots of whitespace.
Reduce visual clutter.
Layout
Increase breathing room.
Reduce unnecessary borders.
Everything aligned perfectly.
More premium spacing.
Header
Current header is boring.
Replace it with:
Large InterviewOS logo
AI pulse animation
Version badge
Candidate pill
Connection status
Current AI model badge
Animated glowing background
Small gradient separator
Chat Area
This should become the hero section.
Interviewer messages:
Glass card
Blue accent line
Animated entrance
Typing indicator
AI icon
Candidate messages:
Different alignment
Rounded bubble
Subtle gradient
Timestamp
Smooth animation
Input Area
Modern floating composer.
Rounded 24px.
Shadow.
Focus glow.
Animated send button.
Auto-growing textarea.
Character counter.
Keyboard shortcut hint.
Progress Cards
Replace static cards.
Use animated dashboard widgets.
Question Progress
Topic Progress
Difficulty
State
Each should animate when changing.
Difficulty
Current badge is plain.
Replace with:
Easy
Medium
Advanced
Expert
Color coded.
Animated.
State
Instead of plain text
Listening
Thinking
Evaluating
Generating
Completed
Each has animated icon.
Topic
Current topic card looks static.
Create beautiful topic timeline.
Current day highlighted.
Previous completed.
Future faded.
Overall Layout
Desktop
Centered
Max width 1500px
Beautiful spacing.
Tablet
Responsive.
Mobile
Single column.
Sticky input.
Cards stack vertically.
No overflow.
No horizontal scrolling.
Animations
Framer Motion.
Fade.
Slide.
Scale.
Hover lift.
Micro interactions.
No excessive animations.
Everything 60fps.
Background
Add subtle animated gradient.
Very low opacity.
Floating blurred circles.
Never distracting.
Glass Effects
Use:
backdrop-blur
transparent cards
soft borders
gradient outlines
Empty States
Improve all empty screens.
Professional illustrations using CSS only.
No images.
Loading
Skeleton loaders.
Animated shimmer.
Buttons
Modern.
Rounded.
Hover.
Ripple.
Focus.
Scrollbars
Custom thin scrollbar.
Accessibility
Keyboard navigation.
Focus rings.
ARIA labels.
Contrast compliant.
Responsive Requirements
Must work perfectly on:
320px
375px
390px
412px
768px
820px
1024px
1280px
1440px
1600px
1920px
No broken layouts.
No clipped text.
No overflow.
No overlapping cards.
Performance
No heavy assets.
No large libraries except Framer Motion if not already installed.
Maintain Lighthouse score.
IMPORTANT
Do NOT redesign functionality.
Do NOT change interview flow.
Do NOT change API.
Do NOT change state management.
Do NOT change backend.
Only improve visuals.
Deliverables
Update the existing React frontend only.
Keep project production ready.
No TypeScript errors.
No ESLint errors.
No broken responsiveness.
No placeholder components.
No TODOs.
```

---

# Prompt 31

## Objective
Executive Hiring Panel Report Transformation

## Prompt

```text
The interview engine is complete.

DO NOT modify:
- interview flow
- topic progression
- evaluation logic
- adaptive questioning
- runtime assertions
- backend APIs
- state machine

This task is ONLY about improving the final hiring report.

Current report still feels AI-generated.

Transform it into something that looks like a real hiring panel report from companies like Google, Microsoft, OpenAI, Amazon or Stripe.

========================
GOALS
========================

1. Add an Executive Hiring Dashboard.

Display:

Candidate
Role
Years Experience

Overall Rating
★★★★★

Hiring Recommendation
Strong Hire / Hire / Lean Hire / Weak Pass / No Hire

Evaluation Confidence

Average Competency Score

Questions Asked

Topics Covered

Interview Duration

------------------------

2. Replace generic strengths.

Current:

"Demonstrated practical experience designing AI backend services."

Instead write evidence-backed strengths.

Example:

"Demonstrated practical understanding of semantic retrieval by explaining cosine similarity, embedding persistence, metadata versioning and ChromaDB architecture."

Each strength MUST reference demonstrated evidence.

Maximum 3 strengths.

------------------------

3. Replace generic weaknesses.

Current:

"Lacked technical depth."

Instead:

"Did not discuss Kubernetes readiness/liveness probes."

"Did not explain ConfigMaps and Secrets."

"Skipped environment variable management."

Every weakness must be tied to something actually missing.

No generic statements.

Maximum 5.

------------------------

4. Add Competency Scorecard.

Display:

Technical Understanding
★★★★★

Implementation
★★★★☆

Architecture
★★★★☆

Trade-offs
★★★★☆

Communication
★★★★★

Average
4.4 / 5

------------------------

5. Add Topic Performance.

Example

Day 7
Embeddings Explained
★★★★★

Day 8
Vector Databases
★★★★☆

Day 12
Prompt Engineering
★★★★★

Day 28
Docker
★★★★☆

------------------------

6. Add Interview Statistics.

Questions Asked

Good Answers

Weak Answers

Adaptive Follow-ups

Topics Visited

Average Response Quality

Evaluation Confidence

------------------------

7. Improve Hiring Recommendation.

Instead of

"Hire"

Write

"Hiring Panel Decision"

Then include

Technical Interview

Hire

Architecture Review

Hire

Communication

Strong

Overall Recommendation

★★★★★ Hire

------------------------

8. Improve roadmap.

Instead of suggesting every visited topic,

recommend ONLY actual weak areas.

Maximum three roadmap items.

------------------------

9. Improve typography.

Use sections.

Use spacing.

Use dividers.

Use icons where appropriate.

Make the report feel premium.

Example:

======================================
EXECUTIVE HIRING REPORT
======================================

instead of plain text.

------------------------

10. Constraints

DO NOT invent evidence.

DO NOT hallucinate strengths.

DO NOT recommend reviewing topics already mastered.

Everything must be generated ONLY from accumulated interview evidence.

Maximum report length:
700 words.

========================

Finally,

build successfully.

Run the existing validation suite.

Ensure TypeScript compiles with zero errors.

Do not change backend behavior.

Only improve report presentation and evidence wording.
```

---

# Prompt 32

## Objective
Prompt 34 — Final Hackathon Presentation Polish

## Prompt

```text
Prompt 34 — Final Hackathon Presentation Polish (No Backend Logic Changes)
You are working on InterviewOS, an AI-powered adaptive technical interview platform.
IMPORTANT: This is the final hackathon polish, NOT a feature expansion.
The backend interview engine, adaptive questioning, evaluation logic, competency scoring, state machine, API contracts, and reports are already complete and production-tested.
DO NOT MODIFY:
Interview engine
State machine
Adaptive questioning
Evaluation logic
Competency scoring
Backend APIs
Database logic
Prompting logic
Only improve the presentation layer.
OBJECTIVE
Transform InterviewOS into something that immediately impresses hackathon judges within the first 30 seconds.
The UI should feel like a premium SaaS product (OpenAI × Linear × Vercel × Apple quality).
TASK 1 — Premium Landing Page
Replace the immediate chat screen with a modern landing page.
Hero should include:
InterviewOS logo
Tagline
Example:
Adaptive AI Technical Interview Platform
Short description:
Conduct realistic technical interviews using adaptive questioning, evidence-based competency scoring, and executive hiring reports.
Buttons:
Start Interview
View Features
Feature cards (glassmorphism):
Adaptive AI Interview
Real-time Competency Scoring
Executive Hiring Dashboard
Evidence-based Evaluation
Curriculum-aware Questioning
Responsive UI
Include subtle gradients and animated background blobs.
TASK 2 — Architecture Section
Create a beautiful Architecture section.
Use cards connected with animated arrows.
Pipeline:
Candidate
↓
React Frontend
↓
Interview Engine
↓
Conversation Memory
↓
Question Generator
↓
Groq LLM
↓
Response Evaluator
↓
Competency Engine
↓
Executive Hiring Report
Each block should have:
icon
title
one-line explanation
TASK 3 — Why This Recommendation?
Enhance the Hiring Report.
Add a dedicated section:
Why this recommendation?
Example:
✓ Demonstrated ChromaDB implementation
✓ Explained cosine similarity
✓ Designed reusable FastAPI APIs
✓ Understood Docker deployment
✓ Discussed metadata versioning
These should come from the evidence already generated by the backend.
Do NOT invent new logic.
Just present existing evidence better.
TASK 4 — Animated Journey Timeline
Before interview starts show:
Greeting
↓
Adaptive Questions
↓
Follow-up Probing
↓
Competency Analysis
↓
Hiring Decision
Animated timeline.
TASK 5 — Better Dashboard
Improve cockpit.
Current widgets should become premium.
Examples:
Current Topic
Progress
Difficulty
Evaluation Confidence
Questions Asked
Adaptive Follow-ups
Average Competency
Connection Status
LLM Model
Make cards consistent.
Hover animations.
Glass effects.
TASK 6 — Beautiful Empty States
Instead of blank panels show:
"No interview started yet"
with illustration/icon.
Chat empty state.
Candidate drawer empty state.
Feedback empty state.
TASK 7 — Better Loading Experience
Replace plain loading.
Show animated AI thinking.
Examples:
Analyzing response...
Evaluating competency...
Generating follow-up...
Building hiring report...
Use animated dots.
TASK 8 — Microinteractions
Improve:
Hover
Buttons
Transitions
Scale animations
Card lift
Smooth fades
Framer Motion
Nothing flashy.
Professional only.
TASK 9 — Mobile Responsiveness
Verify:
320px
375px
768px
1024px
1440px
No overflow.
No clipped buttons.
No broken layouts.
Chat should remain usable.
Landing page should stack correctly.
Dashboard should collapse elegantly.
TASK 10 — Accessibility
Improve:
Keyboard navigation
Focus rings
ARIA labels where appropriate
Contrast
Large touch targets
TASK 11 — README Upgrade
Improve README with:
Problem
Solution
Architecture
Features
Tech Stack
Screenshots
Installation
Future Scope
Demo Flow
TASK 12 — Demo Polish
Create a demo experience.
Landing
↓
Select Candidate
↓
Interview
↓
Adaptive Follow-up
↓
Hiring Dashboard
Everything should feel smooth.
CONSTRAINTS
DO NOT touch:
backend
APIs
interview engine
evaluation engine
prompts
state machine
competency scoring
response evaluator
routing logic
No regression.
VALIDATION
Before finishing:
Backend builds with 0 TypeScript errors
Frontend builds with 0 TypeScript/Vite errors
No console errors
No layout issues
Mobile verified
Tablet verified
Desktop verified
Existing interview flow works exactly as before
DELIVERABLE
Provide:
Summary of all UI improvements
Files changed
Screenshots generated (if applicable)
Build confirmation
Confirmation that no backend logic changed
Git commit and push to origin/main
Goal: Make InterviewOS look like a polished, premium AI SaaS product that stands out immediately during a hackathon demo, while preserving the stable backend you've already built.
```

---

# Prompt 33

## Objective
Interview Intelligence Flow & README Architecture Alignment

## Prompt

```text
We are in the final polishing stage of a hackathon project called InterviewOS.
⚠️ IMPORTANT CONSTRAINTS
DO NOT modify any backend code.
DO NOT change interview logic.
DO NOT change API contracts.
DO NOT change state management.
DO NOT change prompts.
DO NOT change scoring.
DO NOT change report generation.
DO NOT change adaptive questioning.
DO NOT break responsiveness.
Frontend only.
Build must finish with 0 TypeScript/Vite errors.
Goal
The landing page currently contains a section called "Technical System Architecture".
It exposes implementation details like:
React Frontend
Groq LLM
Conversation Memory
Question Generator
Response Evaluator
Competency Engine
This feels like an internal engineering diagram.
For hackathon judges, I want this section to instead communicate how InterviewOS thinks, not how it is implemented.
Replace this section with
Interview Intelligence Flow
Subtitle:
How InterviewOS reasons through a complete technical interview before making an evidence-backed hiring recommendation.
Display a clean premium flow such as:
Candidate Profile
        ↓
Curriculum Analysis
        ↓
Adaptive Interview Planning
        ↓
Live Technical Interview
        ↓
Conversation Memory
        ↓
Dynamic Follow-up Reasoning
        ↓
Evidence Collection
        ↓
Competency Evaluation
        ↓
Executive Hiring Recommendation
This should look premium and animated using Framer Motion.
Use glassmorphism consistent with the existing design.
No engineering component names should appear.
Below the flow
Instead of architecture boxes, show 5 premium capability cards.
🧠 Adaptive Reasoning
Generates intelligent follow-up questions based on previous answers.
📚 Curriculum Awareness
Grounds every interview in the candidate's completed AI Cohort journey.
💬 Multi-turn Memory
Maintains interview context, remembers strengths, mistakes, and previous answers.
📊 Evidence-Based Evaluation
Hiring decisions are generated from accumulated interview evidence rather than isolated responses.
🏆 Executive Hiring Report
Produces competency scores, evidence-backed strengths, focused learning roadmap, and hiring recommendation.
Design Requirements
Keep the existing InterviewOS design language:
Deep obsidian background
Glassmorphism
Blue/cyan accents
Soft glow
Premium spacing
Framer Motion animations
Responsive on:
Mobile
Tablet
Laptop
Desktop
README
Move the detailed technical architecture into the README instead.
Add a Mermaid architecture diagram showing:
Candidate Profile
        ↓
Interview Engine
        ↓
Conversation Memory
        ↓
Question Generator
        ↓
Groq LLM
        ↓
Response Evaluator
        ↓
Competency Engine
        ↓
Executive Report
Also explain briefly:
React + Vite frontend
FastAPI backend
Interview State Machine
Adaptive Question Generator
Conversation Memory
Competency Engine
Executive Report Engine
This belongs in documentation, not on the landing page.
Preserve
Do not modify:
Interview Cockpit
Feedback Modal
Candidate Drawer
Adaptive Interview Engine
Backend
APIs
Existing animations outside this section
Deliverables
Premium "Interview Intelligence Flow" section replacing the technical architecture section.
Five capability cards.
Updated README with technical architecture.
Zero TypeScript errors.
Zero backend changes.
Preserve existing responsiveness and visual quality.
This change should make the landing page explain the product's intelligence while keeping the implementation details in the README, resulting in a cleaner and more judge-friendly presentation.
```

---

# Prompt 34

## Objective
Product Design Polish & WOW Factor Enhancements

## Prompt

```text
I have built an AI project called InterviewOS – Autonomous Adaptive AI Technical Interview Platform.
I am attaching screenshots of the current UI. Analyze them first before making any changes.
Your Task
Do NOT redesign everything.
Keep the same premium dark futuristic theme, but transform it into a hackathon-winning product.
The goal is that judges should immediately think:
"This looks like a real SaaS product built by experienced engineers."
What to Improve
1. Landing Page
Current landing page feels good but lacks wow factor.
Improve by adding:
Animated glowing background
Aurora gradient
Floating particles
Better typography
Better spacing
Strong CTA
More premium hero section
Better scroll animations
Glassmorphism cards
Micro interactions
Keep it clean.
No unnecessary clutter.
2. Architecture Section
Instead of simple cards,
Create an animated architecture flow.
Example:
Candidate
↓
Frontend
↓
Backend
↓
Interview Engine
↓
LLM
↓
Evaluation
↓
Hiring Report
with animated connections.
3. Intelligence Flow
Current boxes look static.
Improve with
animated timeline
progress indicators
glowing arrows
hover animations
4. Candidate Selector
Make it feel like selecting engineers inside a professional recruitment SaaS.
Add
search animation
selected glow
profile avatars
better badges
hover lift
smoother transitions
5. Live Interview Cockpit
This is the MOST IMPORTANT section.
Transform it into a real AI interview dashboard.
Improve:
AI typing indicator
animated thinking dots
conversation bubbles
better message styling
syntax highlighting for code
markdown support
smooth message animation
auto scroll
loading animation
interview progress animation
The dashboard should feel like ChatGPT + Cursor + Linear.
6. Metrics
Current metrics are boring.
Replace with animated widgets.
Examples:
Difficulty
Questions
State Machine
Confidence
Memory
Competency
with live animations.
7. Executive Hiring Report
This should become the strongest section.
Design like an executive HR dashboard.
Include
competency radar chart
score cards
hiring recommendation
strengths
weaknesses
evidence collected
learning roadmap
final verdict
Everything beautifully animated.
8. Motion
Use Framer Motion everywhere.
Need
page transitions
stagger animations
hover effects
glowing buttons
animated gradients
animated borders
fade transitions
smooth scrolling
9. Visual Identity
Keep
Dark Obsidian Theme
Blue
Cyan
Purple
Glassmorphism
Rounded corners
Premium shadows
Glow effects
Modern SaaS design
10. Technical Constraints
Do NOT change backend APIs.
Do NOT break functionality.
Do NOT modify interview logic.
Only improve:
UI
UX
animations
responsiveness
component structure
Backend should continue working exactly the same.
11. Overall Goal
This project should look comparable to products from:
OpenAI
Vercel
Linear
Cursor
Perplexity
Retool
It should feel polished, modern, and production-ready.
Deliverables
Improved React components
Better Tailwind styling
Better Framer Motion animations
Better component organization
Responsive design
Production-quality UI
Maintain all existing functionality
Before changing anything, first analyze the attached screenshots and identify weak areas. Then implement improvements incrementally without breaking the existing application.
```

---

# Prompt 35

## Objective
Final Hackathon UX & Interactive Architecture Polish

## Prompt

```text
Final Hackathon Polish Prompt
You are the lead Staff Frontend Engineer and Product Designer.
The InterviewOS project is feature complete. Do NOT modify any backend logic, interview engine, scoring engine, state machine, adaptive questioning logic, API contracts, or business logic.
Your goal is to transform the application into a production-grade hackathon-winning experience similar to Linear, Vercel, OpenAI, Stripe, and Apple-level polish.
Objectives
Focus ONLY on frontend UX, animations, micro-interactions, responsiveness, accessibility, and visual hierarchy.
Maintain the existing dark premium aesthetic.
Hero Section
Improve the landing page without changing content.
Add:
smooth entrance animations
subtle floating background gradients
animated glowing grid
animated blobs
better spacing
premium typography
subtle mouse parallax
animated CTA buttons
hover effects
Architecture Section
Transform architecture into an interactive experience.
Instead of static boxes:
animated connections
hover highlighting
sequential reveal
glowing connectors
better spacing
animated state transitions
Everything should feel alive.
Candidate Drawer
Improve UX.
Add:
smoother search
keyboard navigation
better hover animations
profile avatar improvements
selection animation
loading skeletons
empty state
polished transitions
Live Interview Cockpit
This is the most important page.
Upgrade:
chat bubbles
typing animation
thinking indicator
markdown rendering
syntax highlighted code blocks
auto-scroll improvements
message animations
textarea auto resize
animated send button
keyboard shortcuts
timestamps
better spacing
Cockpit metrics should animate smoothly.
Progress Indicators
Improve:
Question Progress
Day Progress
Difficulty Meter
Interview State
Use:
animated gradients
count-up animations
pulse
glow
smooth transitions
Executive Report
Make it feel like an executive dashboard.
Improve:
competency cards
star ratings
strengths
weaknesses
recommendations
charts
visual hierarchy
Use premium dashboard styling.
Animations
Use Framer Motion.
Avoid excessive animation.
Everything should feel:
smooth
professional
purposeful
60 FPS
Responsiveness
Ensure excellent experience on:
desktop
tablet
mobile
No overflow.
No broken layouts.
Accessibility
Improve:
focus states
keyboard navigation
ARIA labels
contrast
Performance
Do not introduce unnecessary rerenders.
Memoize where appropriate.
Avoid heavy animation loops.
Maintain excellent Lighthouse performance.
Constraints
DO NOT modify:
Backend
Interview engine
State machine
Adaptive reasoning
Groq integration
Scoring
Memory
API routes
Business logic
Only improve frontend.
Final Validation
Before finishing:
npm run build (frontend)
npm run build (backend)
Both must complete with 0 TypeScript errors.
Fix every warning you introduce.
Do not stop until the application builds successfully.
Finally provide:
Summary of every UI improvement.
Components modified.
Screenshots description of major improvements.
Build verification.
Git commit and push to origin/main.
```

---

# Prompt 36

## Objective
Prompt 38 — Dynamic Adaptive Interview Length & Evidence-Driven Completion

## Prompt

```text
Prompt 38 — Dynamic Adaptive Interview Length & Evidence-Driven Interview Completion
You are working on InterviewOS, an adaptive AI technical interviewer for the AI Cohort Hackathon.
Background
The hackathon requirement states:
Conduct a conversational technical interview.
Ask a minimum of 8 questions.
Cover at least 4 different curriculum days.
Generate follow-up questions.
Maintain conversation context.
Produce structured feedback.
Notice it says minimum 8, not exactly 8.
Currently the interview always finishes after exactly 8 questions.
Although this satisfies the requirement, it makes the interviewer feel deterministic instead of adaptive.
The goal is to make InterviewOS behave more like a real senior interviewer.
Objective
Redesign interview termination logic so the interview length becomes dynamic.
The interview should end only when InterviewOS has collected enough evidence to make a confident hiring recommendation.
Desired Behaviour
Instead of:
Ask exactly 8 questions
Generate report
InterviewOS should behave like:
Ask questions

↓

Evaluate every answer

↓

Update evidence

↓

Update competency scores

↓

Update confidence

↓

Have we collected enough evidence?

No
↓

Continue interview

Yes
↓

End interview
Interview Rules
Always satisfy:
Minimum 8 questions
Minimum 4 curriculum days
Conversation memory maintained
Adaptive follow-ups
Then continue only when necessary.
Suggested Decision Logic
Interview may finish only when ALL conditions are true:
questionsAsked >= MIN_QUESTIONS

daysCovered >= 4

evaluationConfidence >= threshold

all critical competencies evaluated
Otherwise continue interviewing.
Dynamic Limits
Instead of
MAX_QUESTIONS = 8
Introduce configurable limits such as
MIN_QUESTIONS = 8
MAX_QUESTIONS = 12
(or another reasonable upper limit if the architecture suggests something better).
The interview should never continue forever.
Expected Behaviour
Strong Candidate
Gives detailed implementation answers.
Covers concepts quickly.
High confidence after minimum questions.
Interview:
8 questions

Finish
Average Candidate
Confidence still medium.
Interview:
8 questions

↓

2 additional questions

↓

Finish
Weak Candidate
Many uncertain answers.
Interview:
8 questions

↓

additional follow-ups

↓

another curriculum topic

↓

finish around 11–12 questions
Backend Requirements
Implement this in the existing interview engine.
Prefer evidence-driven logic over hardcoded rules.
Reuse existing systems wherever possible:
Conversation Memory
Competency Engine
Hiring Recommendation Engine
Confidence Scoring
Topic Tracking
Do NOT rewrite the architecture.
Extend it.
Frontend Changes
Update the cockpit so it no longer implies the interview always ends at 8 questions.
Instead of:
Questions

6 / 8
Use something more adaptive, for example:
Questions

6 / 8+
or
Questions Asked

9

Minimum Required: 8
Avoid displaying a fixed endpoint.
If the interview continues after question 8, clearly communicate why.
Possible UI examples:
Minimum Complete ✓

Gathering additional evidence...
or
Continuing evaluation...
Final Report Improvements
Add interview statistics such as:
Questions Asked: 11

Minimum Required: 8

Reason interview continued:

• Confidence below threshold
• Needed more evidence for Architecture
• Required additional implementation validation
This makes the behaviour explainable to judges.
Design Principles
Preserve every existing API.
Preserve all current features.
Preserve frontend design language.
Preserve adaptive questioning.
Preserve competency scoring.
Preserve report generation.
Preserve state machine architecture.
Keep the implementation clean and production-ready.
Do not introduce hacks.
Prefer extending the current architecture over replacing it.
Deliverables
Implement the complete feature and verify:
Backend builds successfully.
Frontend builds successfully.
No TypeScript errors.
Existing functionality remains intact.
The interview length is now truly adaptive while still satisfying the hackathon requirement of at least 8 questions across at least 4 curriculum days.
```

---

# Prompt 37

## Objective
Prompt 38 — Dynamic Evidence-Based Interview Termination Refinement

## Prompt

```text
Prompt 38 — Dynamic Evidence-Based Interview Termination
Refactor the interview engine so it no longer terminates at a fixed 8 questions.
Requirements:
Keep 8 questions as the minimum, since this is required by the hackathon.
Introduce a configurable maximum (recommend 15).
Replace the fixed stopping condition with an evidence-based decision.
The interview should end only when BOTH conditions are met:
At least 8 questions have been asked.
The engine has sufficient confidence to make a hiring recommendation.
If evidence is insufficient after question 8 (weak, inconsistent, contradictory, or incomplete answers), continue asking adaptive questions until enough evidence is collected or the maximum question limit is reached.
Strong candidates should naturally receive more advanced follow-up questions (architecture, trade-offs, production, scalability, optimization) before ending.
Weak candidates should receive clarification and probing questions, but the engine should avoid unnecessary repetition once enough evidence exists.
The frontend must no longer display a fixed "X/8 Questions". Instead show:
Questions Asked
Topics Covered
Evidence Progress (%)
Interview Status (Collecting Evidence / Final Validation / Ready for Evaluation)
Preserve all existing functionality:
Conversation memory
Adaptive follow-up logic
Curriculum grounding
Runtime guards
Competency scoring
Executive Hiring Report
Do not modify API contracts unless absolutely necessary.
Maintain zero TypeScript errors and full backward compatibility.
The implementation should feel like a real FAANG interview where the interviewer decides to stop after collecting sufficient evidence, not after a fixed number of questions.
```

---

# Prompt 38

## Objective
Termination Logic Bug Audit & Strict Min 8 Guard

## Prompt

```text
There is a logic bug in the interview termination flow.
In testing, the interview terminated after 7 evaluated questions, even though MIN_QUESTIONS = 8. This violates the hackathon specification.
Please audit the termination logic across the backend and frontend.
Requirements:
The interview must never terminate when questionCount < MIN_QUESTIONS.
Termination condition must be:
questionCount >= MIN_QUESTIONS
visitedDays >= MIN_DAYS
evidenceComplete == true
The MAX_QUESTIONS safety cap (15) should still force completion.
The frontend status badge ("Ready for Evaluation") must never appear before question 8.
Verify that follow-up questions are counted consistently. If follow-ups are intentionally excluded from the displayed count, ensure the termination logic still uses the correct total evaluated question count and that the UI accurately reflects the metric being enforced.
Add regression tests confirming the interview cannot end at 7 questions under any circumstance.
```

---

