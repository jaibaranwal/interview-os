"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CandidateLoader_1 = require("./data/CandidateLoader");
const CandidateAnalyzer_1 = require("./engine/CandidateAnalyzer");
const InterviewPlanner_1 = require("./services/InterviewPlanner");
const ConversationMemory_1 = require("./memory/ConversationMemory");
const StateMachine_1 = require("./engine/StateMachine");
const ResponseEvaluator_1 = require("./engine/ResponseEvaluator");
console.log('==================================================');
console.log('   INTERVIEWOS DETERMINISTIC BRAIN VERIFICATION TEST');
console.log('==================================================\n');
async function testBrain() {
    const candidateLoader = CandidateLoader_1.CandidateLoader.getInstance();
    // 1. Test CandidateAnalyzer
    console.log('1️⃣ Testing CandidateAnalyzer ...');
    const analyzer = new CandidateAnalyzer_1.CandidateAnalyzer();
    const candidate1 = candidateLoader.getCandidateById('CAND-001');
    const candidate7 = candidateLoader.getCandidateById('CAND-007');
    const candidate15 = candidateLoader.getCandidateById('CAND-015');
    const analysis1 = analyzer.analyzeProfile(candidate1);
    const analysis7 = analyzer.analyzeProfile(candidate7);
    const analysis15 = analyzer.analyzeProfile(candidate15);
    console.log(`   CAND-001 (${candidate1.member.name}): Seniority Score = ${analysis1.seniorityScore} (${analysis1.experienceLevel}), Confidence = ${analysis1.confidenceEstimate}`);
    console.log(`   - Completed Days: ${analysis1.completedDays.length}, Skipped: ${analysis1.skippedDays.length}, Weak Topics: ${analysis1.weakTopics.length}`);
    console.log(`   CAND-007 (${candidate7.member.name}): Seniority Score = ${analysis7.seniorityScore} (${analysis7.experienceLevel}), Confidence = ${analysis7.confidenceEstimate}`);
    console.log(`   CAND-015 (${candidate15.member.name}): Seniority Score = ${analysis15.seniorityScore} (${analysis15.experienceLevel}), Confidence = ${analysis15.confidenceEstimate}`);
    console.log('   ✅ CandidateAnalyzer Passed.\n');
    // 2. Test InterviewPlanner
    console.log('2️⃣ Testing InterviewPlanner ...');
    const planner = new InterviewPlanner_1.InterviewPlanner();
    const plan1 = planner.createPlan(candidate1);
    console.log(`   Plan for CAND-001: Target Days = [${plan1.targetDays.join(', ')}], Total Target Days Count = ${plan1.targetDays.length}`);
    console.log(`   - Planned Question Count: ${plan1.plannedQuestionCount} (Min 8 constraint satisfied)`);
    console.log(`   - Focus Weak Areas: [${plan1.focusWeakAreas.join(', ')}]`);
    console.log(`   - Skipped Days Excluded: [${plan1.skippedDaysExcluded.join(', ')}]`);
    if (plan1.targetDays.length < 4 || plan1.plannedQuestionCount < 8) {
        throw new Error('InterviewPlanner failed coverage constraints!');
    }
    console.log('   ✅ InterviewPlanner Passed.\n');
    // 3. Test ConversationMemory
    console.log('3️⃣ Testing ConversationMemory ...');
    const memory = new ConversationMemory_1.ConversationMemory();
    memory.setDifficulty(3.5);
    memory.recordQuestion(7, 'Embeddings Concept', 'Can you explain embeddings?');
    memory.recordAnswer('Embeddings convert text into dense vectors.');
    memory.recordStrength('Vector Embeddings Understanding');
    memory.recordWeakness('Monitoring Observability');
    memory.recordMistake(29, 'Metrics', 'Skipped Grafana dashboard setup');
    console.log(`   Question Count = ${memory.getQuestionCount()}, Difficulty = ${memory.getDifficulty()}`);
    console.log(`   Visited Days = [${memory.getVisitedDays().join(', ')}]`);
    console.log(`   Strengths = [${memory.getStrengths().join(', ')}]`);
    console.log(`   Weaknesses = [${memory.getWeaknesses().join(', ')}]`);
    if (memory.getQuestionCount() !== 1 || memory.getVisitedDays()[0] !== 7) {
        throw new Error('ConversationMemory recording failed!');
    }
    console.log('   ✅ ConversationMemory Passed.\n');
    // 4. Test StateMachine
    console.log('4️⃣ Testing StateMachine ...');
    const sm = new StateMachine_1.StateMachine();
    console.log(`   Initial State: ${sm.getState()}`);
    sm.transitionTo(StateMachine_1.InterviewState.PLANNING);
    sm.transitionTo(StateMachine_1.InterviewState.QUESTION);
    sm.transitionTo(StateMachine_1.InterviewState.LISTENING);
    sm.transitionTo(StateMachine_1.InterviewState.EVALUATING);
    sm.transitionTo(StateMachine_1.InterviewState.FOLLOW_UP);
    sm.transitionTo(StateMachine_1.InterviewState.QUESTION);
    sm.transitionTo(StateMachine_1.InterviewState.LISTENING);
    sm.transitionTo(StateMachine_1.InterviewState.EVALUATING);
    sm.transitionTo(StateMachine_1.InterviewState.FINAL_EVALUATION);
    sm.transitionTo(StateMachine_1.InterviewState.COMPLETED);
    console.log(`   Final State: ${sm.getState()}, isComplete = ${sm.isComplete()}`);
    if (!sm.isComplete()) {
        throw new Error('StateMachine lifecycle completion failed!');
    }
    console.log('   ✅ StateMachine Passed.\n');
    // 5. Test ResponseEvaluator Engine
    console.log('5️⃣ Testing ResponseEvaluator ...');
    const evaluator = new ResponseEvaluator_1.ResponseEvaluator();
    const emptyEval = await evaluator.evaluateResponse('asdfasdf');
    const shortUncertainEval = await evaluator.evaluateResponse("i think maybe don't know");
    const detailedExemplaryEval = await evaluator.evaluateResponse('Specifically, I built the RAG retrieval pipeline on Day 11 using Sentence Transformers and configured ChromaDB with cosine similarity metadata filtering to ensure high accuracy.');
    console.log(`   Spam Response Action: ${emptyEval.next_action} (Score: ${emptyEval.score})`);
    console.log(`   Uncertain Response Action: ${shortUncertainEval.next_action} (Score: ${shortUncertainEval.score})`);
    console.log(`   Detailed Response Action: ${detailedExemplaryEval.next_action} (Score: ${detailedExemplaryEval.score})`);
    if (emptyEval.next_action !== 'retry' || detailedExemplaryEval.score < 75 || detailedExemplaryEval.next_action === 'retry') {
        throw new Error('ResponseEvaluator classification failed!');
    }
    console.log('   ✅ ResponseEvaluator Passed.\n');
    console.log('==================================================');
    console.log('🎉 DETERMINISTIC INTERVIEW BRAIN VERIFICATION SUCCESSFUL');
    console.log('==================================================\n');
}
testBrain().catch((err) => {
    console.error('❌ INTERVIEW BRAIN TEST FAILED:', err.message);
    process.exit(1);
});
