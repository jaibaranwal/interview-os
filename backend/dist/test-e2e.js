"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const server_1 = __importDefault(require("./server"));
const CandidateLoader_1 = require("./data/CandidateLoader");
const PORT = 5003;
function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const postData = body ? JSON.stringify(body) : '';
        const req = http_1.default.request({
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(rawData);
                    resolve({ statusCode: res.statusCode || 500, data: parsed });
                }
                catch (e) {
                    resolve({ statusCode: res.statusCode || 500, data: rawData });
                }
            });
        });
        req.on('error', (e) => reject(e));
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}
async function runE2ETest() {
    console.log('==================================================');
    console.log('   INTERVIEWOS FULL E2E INTERVIEW LIFECYCLE TEST');
    console.log('==================================================\n');
    const server = server_1.default.listen(PORT, async () => {
        try {
            const candidate = CandidateLoader_1.CandidateLoader.getInstance().getCandidateById('CAND-001');
            const sessionId = `e2e-session-${Date.now()}`;
            // 1. Initial Greeting Turn 1
            console.log('🔹 Turn 1: Initializing Session & Greeting ...');
            const startRes = await makeRequest('POST', '/api/interview', { sessionId, candidate });
            console.log(`   Response: "${startRes.data.reply}" | done=${startRes.data.done}\n`);
            // Simulated responses for 8 successive turns
            const candidateTurns = [
                'On Day 7 Embeddings, I used Sentence Transformers to build 384-dimensional dense vectors and compared cosine distance.',
                'For Day 8 Vector Search, I implemented HNSW indexing in ChromaDB and tuned M=16 efConstruction=200 for sub-10ms recall.',
                'On Day 12 Prompt Engineering, I structured system prompts with few-shot XML tags and guardrails to prevent hallucination.',
                'During Day 13 Fine-tuning, I configured LoRA adapters with rank r=8 and alpha=16 on LLaMA-3 models using Unsloth.',
                'On Day 21 Agentic Workflows, I built tool-calling loops with ReAct prompting and state validation checks.',
                'For Day 22 Model Context Protocol, I created custom MCP tools for database query verification.',
                'On Day 27 Security & Evaluation, I set up RAGAS for faithfullness scoring and benchmarked toxicity detectors.',
                'During Day 28 Production Deployment, I deployed vLLM on Kubernetes with Triton inference server metrics.'
            ];
            let turnIndex = 0;
            let lastResponse;
            while (turnIndex < 15) {
                const turnMessage = candidateTurns[turnIndex % candidateTurns.length];
                console.log(`🔹 Turn ${turnIndex + 2}: Sending Candidate Response ...`);
                lastResponse = await makeRequest('POST', '/api/interview', {
                    sessionId,
                    message: turnMessage
                });
                console.log(`   Reply: "${lastResponse.data.reply.slice(0, 100)}..."`);
                console.log(`   Done State: ${lastResponse.data.done}`);
                turnIndex++;
                if (lastResponse.data.done) {
                    console.log(`   🎉 Interview completed at Turn ${turnIndex + 1}!`);
                    break;
                }
            }
            console.log('\n==================================================');
            console.log('   FINAL EVALUATION & STRUCTURED FEEDBACK REPORT');
            console.log('==================================================');
            console.log(`Done: ${lastResponse.data.done}`);
            if (lastResponse.data.feedback) {
                console.log(`Summary:\n  "${lastResponse.data.feedback.summary}"\n`);
                console.log(`Strengths:\n  - ${lastResponse.data.feedback.strengths.join('\n  - ')}\n`);
                console.log(`Gaps:\n  - ${lastResponse.data.feedback.gaps.join('\n  - ')}\n`);
                console.log(`Next Steps:\n  - ${lastResponse.data.feedback.next.join('\n  - ')}\n`);
            }
            else {
                throw new Error('Feedback object missing from completion response!');
            }
            console.log('==================================================');
            console.log('🎉 E2E FULL LIFECYCLE VERIFICATION SUCCESSFUL');
            console.log('==================================================\n');
            server.close(() => {
                process.exit(0);
            });
        }
        catch (err) {
            console.error('❌ E2E TEST FAILED:', err.message);
            server.close(() => {
                process.exit(1);
            });
        }
    });
}
runE2ETest();
