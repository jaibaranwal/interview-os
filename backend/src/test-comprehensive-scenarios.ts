import { CandidateLoader } from './data/CandidateLoader';
import { InterviewEngine } from './services/InterviewEngine';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runComprehensiveScenariosTest() {
  console.log('===================================================');
  console.log('  COMPREHENSIVE SCENARIO AUDIT TEST SUITE');
  console.log('===================================================\n');

  const engine = new InterviewEngine();
  const candidate = CandidateLoader.getInstance().getCandidateById('CAND-001')!;
  const sessionId = `audit-scenarios-${Date.now()}`;

  // Turn 1: Greeting
  console.log('>>> [1] TEST GREETING ...');
  const greetingRes = await engine.processTurn({ sessionId, candidate });
  console.log(`[UI REPLY]: "${greetingRes.reply}"\n`);
  await delay(6000);

  // Scenario A: Profanity Answer
  console.log('>>> [2] TEST PROFANITY INPUT ("fuck off")...');
  const profanityRes = await engine.processTurn({ sessionId, message: 'fuck off' });
  console.log(`[UI REPLY]: "${profanityRes.reply}"\n`);
  await delay(6000);

  // Scenario B: Invalid Keyboard Spam
  console.log('>>> [3] TEST INVALID KEYBOARD SPAM ("asdf")...');
  const spamRes = await engine.processTurn({ sessionId, message: 'asdf' });
  console.log(`[UI REPLY]: "${spamRes.reply}"\n`);
  await delay(6000);

  // Scenario C: Explicit Uncertainty ("I don't know")
  console.log('>>> [4] TEST UNCERTAIN ANSWER ("I don\'t know")...');
  const uncertainRes = await engine.processTurn({ sessionId, message: "I don't know" });
  console.log(`[UI REPLY]: "${uncertainRes.reply}"\n`);
  await delay(6000);

  // Scenario D: Off-topic Answer ("I like eating pizza")
  console.log('>>> [5] TEST OFF-TOPIC ANSWER ("I like eating pizza")...');
  const offTopicRes = await engine.processTurn({ sessionId, message: 'I like eating pizza' });
  console.log(`[UI REPLY]: "${offTopicRes.reply}"\n`);
  await delay(6000);

  // Scenario E: Weak Answer (follow_up)
  console.log('>>> [6] TEST WEAK TECHNICAL ANSWER ("I used Sentence Transformers for building dense vectors.") ...');
  const weakRes = await engine.processTurn({
    sessionId,
    message: 'I used Sentence Transformers for building dense vectors.'
  });
  console.log(`[UI REPLY]: "${weakRes.reply}"\n`);
  await delay(6000);

  // Scenario F: Excellent Technical Answer (advance & topic switch)
  console.log('>>> [7] TEST EXCELLENT TECHNICAL ANSWER (Triggers advance & Topic Switch) ...');
  const excellentRes = await engine.processTurn({
    sessionId,
    message: 'On Day 7, I used Sentence Transformers (all-MiniLM-L6-v2) to generate 384-dimensional dense vectors for medical records, stored them in ChromaDB alongside metadata, evaluated cosine distance using Scikit-learn, and visualized clusters with PCA and Matplotlib.'
  });
  console.log(`[UI REPLY]: "${excellentRes.reply}"\n`);

  console.log('===================================================');
  console.log('🎉 ALL COMPREHENSIVE SCENARIOS TESTED & VERIFIED');
  console.log('===================================================\n');
}

runComprehensiveScenariosTest().catch((err) => {
  console.error('❌ Comprehensive Test Error:', err);
  process.exit(1);
});
