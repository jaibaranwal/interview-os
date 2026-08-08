import http from 'http';
import app from './server';
import { CandidateLoader } from './data/CandidateLoader';

const PORT = 5002;

function makeRequest(
  method: string,
  path: string,
  body?: any
): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ statusCode: res.statusCode || 500, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode || 500, data: rawData });
          }
        });
      }
    );

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runOrchestratorTest() {
  console.log('==================================================');
  console.log('   INTERVIEWOS ORCHESTRATION LAYER TEST');
  console.log('==================================================\n');

  const server = app.listen(PORT, async () => {
    try {
      const candidate1 = CandidateLoader.getInstance().getCandidateById('CAND-001')!;
      const testSessionId = 'orchestrator-test-session-001';

      // 1. Test Turn 1: Initialization Greeting
      console.log('1️⃣ Testing Turn 1 (Interview Initialization & Personalized Greeting) ...');
      const startPayload = {
        sessionId: testSessionId,
        candidate: candidate1
      };

      const startRes = await makeRequest('POST', '/api/interview', startPayload);
      console.log(`   HTTP Status: ${startRes.statusCode}`);
      console.log(`   Reply Output:\n   "${startRes.data.reply}"\n`);
      console.log(`   Done State: ${startRes.data.done}`);

      if (
        startRes.statusCode !== 200 ||
        !startRes.data.reply ||
        startRes.data.done !== false
      ) {
        throw new Error('Turn 1 initialization failed!');
      }
      console.log('   ✅ Turn 1 Initialization Passed.\n');

      // 2. Test Turn 2: Conversation Turn with Candidate Answer
      console.log('2️⃣ Testing Turn 2 (Candidate Answer & Technical Question Generation) ...');
      const turnPayload = {
        sessionId: testSessionId,
        message: 'On Day 7, I used Sentence Transformers to convert chunked text into 384-dimensional dense vectors and evaluated cosine similarity clusters using Scikit-learn Matplotlib.'
      };

      const turnRes = await makeRequest('POST', '/api/interview', turnPayload);
      console.log(`   HTTP Status: ${turnRes.statusCode}`);
      console.log(`   Reply Output:\n   "${turnRes.data.reply}"\n`);
      console.log(`   Done State: ${turnRes.data.done}`);

      if (
        turnRes.statusCode !== 200 ||
        !turnRes.data.reply ||
        turnRes.data.done !== false
      ) {
        throw new Error('Turn 2 evaluation failed!');
      }
      console.log('   ✅ Turn 2 Conversation Passed.\n');

      console.log('==================================================');
      console.log('🎉 ORCHESTRATION LAYER VERIFICATION SUCCESSFUL');
      console.log('==================================================\n');

      server.close(() => {
        process.exit(0);
      });
    } catch (err: any) {
      console.error('❌ ORCHESTRATION TEST FAILED:', err.message);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

runOrchestratorTest();
