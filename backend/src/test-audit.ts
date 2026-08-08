import http from 'http';
import { CandidateLoader } from './data/CandidateLoader';

const PORT = 5001;

function post(payload: any): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/interview',
        method: 'POST',
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
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runAudit() {
  console.log('==================================================');
  console.log('   INTERVIEWOS STATE MACHINE AUDIT VERIFICATION');
  console.log('==================================================\n');

  const candidate = CandidateLoader.getInstance().getCandidateById('CAND-001')!;

  const testCases = [
    { label: '1. Spam ("asdfasdf")', message: 'asdfasdf' },
    { label: '2. Uncertainty ("I don\'t know")', message: "I don't know" },
    { label: '3. Greeting ("Hello")', message: 'Hello' },
    { label: '4. Unrelated ("The weather today is very nice.")', message: 'The weather today is very nice.' },
    { label: '5. Partially Correct ("I used Sentence Transformers for embeddings.")', message: 'I used Sentence Transformers for embeddings.' },
    { label: '6. Correct Technical ("On Day 7 Embeddings, I used Sentence Transformers to build 384-dimensional dense vectors and evaluated cosine distance using Scikit-learn.")', message: 'On Day 7 Embeddings, I used Sentence Transformers to build 384-dimensional dense vectors and evaluated cosine distance using Scikit-learn.' }
  ];

  for (const tc of testCases) {
    const sessionId = `audit-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    console.log(`--------------------------------------------------`);
    console.log(`TEST CASE: ${tc.label}`);
    console.log(`--------------------------------------------------`);

    // Turn 1 Start
    await post({ sessionId, candidate });

    // Turn 2 Message Test
    const res = await post({ sessionId, message: tc.message });

    console.log(`Candidate Input: "${tc.message}"`);
    console.log(`HTTP Status:     ${res.statusCode}`);
    console.log(`Interviewer Reply: "${res.data.reply.slice(0, 100)}..."\n`);
  }

  console.log('==================================================');
  console.log('🎉 AUDIT VERIFICATION COMPLETE');
  console.log('==================================================\n');
}

runAudit().catch(console.error);
