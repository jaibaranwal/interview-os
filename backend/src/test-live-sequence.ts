import { CandidateLoader } from './data/CandidateLoader';
import { InterviewEngine } from './services/InterviewEngine';
import { SessionManager } from './services/SessionManager';

async function runLiveSequenceTest() {
  console.log('===================================================');
  console.log('      LIVE APPLICATION RUNTIME TRACE AUDIT');
  console.log('===================================================\n');

  const engine = new InterviewEngine();
  const sessionManager = SessionManager.getInstance();
  const candidate = CandidateLoader.getInstance().getCandidateById('CAND-001')!;
  const sessionId = `live-runtime-trace-${Date.now()}`;

  // Turn 1: Initializing session & greeting
  const initRes = await engine.processTurn({ sessionId, candidate });
  console.log(`[UI RECEIVED TURN 1 REASONING]: Done=${initRes.done}\nReply: "${initRes.reply.slice(0, 120)}..."\n`);

  const answers = [
    'I used Sentence Transformers.',
    "I don't know",
    'banana',
    'asdf',
    'fuck you',
    'I implemented ChromaDB using cosine similarity.'
  ];

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    console.log(`>>> SENDING CANDIDATE ANSWER TURN #${i + 2}: "${answer}"`);
    const res = await engine.processTurn({ sessionId, message: answer });
    console.log(`[UI RECEIVED TURN #${i + 2}]: Done=${res.done}\nReply: "${res.reply}"\n`);
  }
}

runLiveSequenceTest().catch((err) => {
  console.error('❌ Live Sequence Error:', err);
  process.exit(1);
});
