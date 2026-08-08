import 'dotenv/config';
import { LLMClient } from './services/LLMClient';

async function testGroqIntegration() {
  console.log('==================================================');
  console.log('    INTERVIEWOS GROQ INTEGRATION VERIFICATION');
  console.log('==================================================\n');

  console.log('1️⃣ Initializing LLMClient with Groq API Key ...');
  const client = new LLMClient();

  console.log('\n2️⃣ Sending test prompt "Explain embedding vectors in 2 sentences" to Groq ...');
  const response = await client.generate(
    'You are a Senior AI Evaluator. Answer concisely.',
    'Explain embedding vectors in 2 sentences'
  );

  console.log('\n--- GROQ LIVE RESPONSE ---');
  console.log(`"${response}"`);
  console.log('---------------------------\n');

  console.log('==================================================');
  console.log('🎉 GROQ LIVE API INTEGRATION TEST VERIFIED');
  console.log('==================================================\n');
}

testGroqIntegration().catch((err) => {
  console.error('❌ Groq Test Error:', err);
  process.exit(1);
});
