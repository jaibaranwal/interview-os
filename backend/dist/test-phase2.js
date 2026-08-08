"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const server_1 = __importDefault(require("./server"));
const CandidateLoader_1 = require("./data/CandidateLoader");
let PORT = 5098;
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
async function runPhase2Tests() {
    console.log('==================================================');
    console.log('   INTERVIEWOS PHASE 2 VERIFICATION TEST');
    console.log('==================================================\n');
    const server = server_1.default.listen(0, async () => {
        const address = server.address();
        if (address && typeof address !== 'string') {
            PORT = address.port;
        }
        try {
            // 1. Test GET /health
            console.log('1️⃣ Testing GET /health ...');
            const healthRes = await makeRequest('GET', '/health');
            console.log(`   Status: ${healthRes.statusCode}`);
            console.log(`   Response: ${JSON.stringify(healthRes.data)}`);
            if (healthRes.statusCode !== 200 || healthRes.data.status !== 'ok') {
                throw new Error('GET /health test failed!');
            }
            console.log('   ✅ GET /health Passed.\n');
            // 2. Test POST /api/interview (New Session Initialization)
            console.log('2️⃣ Testing POST /api/interview (New Session with CAND-001) ...');
            const candidate1 = CandidateLoader_1.CandidateLoader.getInstance().getCandidateById('CAND-001');
            if (!candidate1)
                throw new Error('CAND-001 not found');
            const testSessionId = 'test-session-phase2-999';
            const startPayload = {
                sessionId: testSessionId,
                candidate: candidate1
            };
            const startRes = await makeRequest('POST', '/api/interview', startPayload);
            console.log(`   Status: ${startRes.statusCode}`);
            console.log(`   Response: ${JSON.stringify(startRes.data)}`);
            if (startRes.statusCode !== 200 ||
                typeof startRes.data.reply !== 'string' ||
                startRes.data.reply.length === 0 ||
                startRes.data.done !== false) {
                throw new Error('New session initialization failed!');
            }
            console.log('   ✅ New Session Initialization Passed.\n');
            // 3. Test POST /api/interview (Existing Session Turn)
            console.log('3️⃣ Testing POST /api/interview (Existing Session Turn) ...');
            const turnPayload = {
                sessionId: testSessionId,
                message: 'Hello, I am ready for the interview.'
            };
            const turnRes = await makeRequest('POST', '/api/interview', turnPayload);
            console.log(`   Status: ${turnRes.statusCode}`);
            console.log(`   Response: ${JSON.stringify(turnRes.data)}`);
            if (turnRes.statusCode !== 200 ||
                typeof turnRes.data.reply !== 'string' ||
                turnRes.data.reply.length === 0 ||
                turnRes.data.done !== false) {
                throw new Error('Existing session turn failed!');
            }
            console.log('   ✅ Existing Session Turn Passed.\n');
            // 4. Test Invalid Payload (Zod Validation)
            console.log('4️⃣ Testing POST /api/interview (Invalid Payload / Missing sessionId) ...');
            const invalidRes = await makeRequest('POST', '/api/interview', {});
            console.log(`   Status: ${invalidRes.statusCode}`);
            console.log(`   Response: ${JSON.stringify(invalidRes.data)}`);
            if (invalidRes.statusCode !== 400 || !invalidRes.data.error) {
                throw new Error('Invalid payload validation failed!');
            }
            console.log('   ✅ Zod Validation Test Passed.\n');
            console.log('==================================================');
            console.log('🎉 PHASE 2 VERIFICATION SUCCESSFUL: ALL ENDPOINTS PASSED');
            console.log('==================================================\n');
            server.close(() => {
                process.exit(0);
            });
        }
        catch (err) {
            console.error('❌ PHASE 2 VERIFICATION FAILED:', err.message);
            server.close(() => {
                process.exit(1);
            });
        }
    });
}
runPhase2Tests();
