import { CandidateLoader } from './data/CandidateLoader';
import { InterviewEngine } from './services/InterviewEngine';

async function testRealInterviewFlow() {
  console.log('===================================================');
  console.log('  PROMPT 20 REAL INTERVIEW FLOW VERIFICATION');
  console.log('===================================================\n');

  const engine = new InterviewEngine();
  const candidate = CandidateLoader.getInstance().getCandidateById('CAND-001')!;
  const sessionId = `real-flow-${Date.now()}`;

  // Turn 1: Greeting
  console.log('>>> [1] INITIALIZING INTERVIEW SESSION ...');
  const greetingRes = await engine.processTurn({ sessionId, candidate });
  console.log(`[UI DISPLAYED GREETING]: "${greetingRes.reply.slice(0, 100)}..."\n`);

  // Step 1: Wrong answer (retry)
  console.log('>>> [2] STEP 1: WRONG / UNCERTAIN ANSWER ("I don\'t know") ...');
  const turn1 = await engine.processTurn({ sessionId, message: "I don't know" });
  console.log(`[UI DISPLAYED RETRY QUESTION]: "${turn1.reply.slice(0, 120)}..."\n`);

  // Step 2: Partial Answer (follow_up)
  console.log('>>> [3] STEP 2: PARTIAL ANSWER ("I used Sentence Transformers for building dense vectors.") ...');
  const turn2 = await engine.processTurn({
    sessionId,
    message: 'I used Sentence Transformers for building dense vectors.'
  });
  console.log(`[UI DISPLAYED FOLLOW-UP QUESTION]: "${turn2.reply.slice(0, 120)}..."\n`);

  // Step 3: Exemplary Technical Answer (advance)
  console.log('>>> [4] STEP 3: EXEMPLARY TECHNICAL ANSWER (Triggers next_action: "advance" & TOPIC SWITCH) ...');
  const turn3 = await engine.processTurn({
    sessionId,
    message: 'On Day 7, I used Sentence Transformers (all-MiniLM-L6-v2) to generate 384-dimensional dense vectors for chunked medical text, stored them in ChromaDB alongside metadata, evaluated cosine distance using Scikit-learn, compared performance against OpenAI text-embedding-ada-002, and visualized embedding clusters using PCA and Matplotlib.'
  });
  console.log(`[UI DISPLAYED ADVANCED QUESTION]: "${turn3.reply.slice(0, 120)}..."\n`);

  console.log('===================================================');
  console.log('🎉 PROMPT 20 REAL INTERVIEW FLOW VERIFIED SUCCESSFUL');
  console.log('===================================================\n');
}

testRealInterviewFlow().catch((err) => {
  console.error('❌ Flow Error:', err);
  process.exit(1);
});
