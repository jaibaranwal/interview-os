import { CandidateLoader } from './data/CandidateLoader';
import { CurriculumLoader } from './data/CurriculumLoader';

console.log('==================================================');
console.log('   INTERVIEWOS PHASE 1 VERIFICATION TEST');
console.log('==================================================\n');

try {
  // Test CandidateLoader
  const candidateLoader = CandidateLoader.getInstance();
  const candidates = candidateLoader.getAllCandidates();
  console.log(`✅ Candidates Loaded Successfully: ${candidates.length} profiles found.`);

  // Inspect first candidate (CAND-001)
  const candidate1 = candidateLoader.getCandidateById('CAND-001');
  if (candidate1) {
    console.log(`   Sample Candidate 1: ${candidate1.member.name} (${candidate1.member.jobRole}, ${candidate1.member.yearsExperience} yrs exp)`);
    console.log(`   - Missions Record: ${candidate1.missions.length} entries`);
    console.log(`   - Signals: Commits: ${candidate1.signals.commitDays}/31, Completed: ${candidate1.signals.missionsCompleted}, FirstTry: ${candidate1.signals.missionsFirstTry}`);
  } else {
    throw new Error('CAND-001 not found!');
  }

  // Test CurriculumLoader
  const curriculumLoader = CurriculumLoader.getInstance();
  const curriculum = curriculumLoader.getCurriculum();
  const days = curriculumLoader.getAllDays();
  const modules = curriculumLoader.getModules();

  console.log(`\n✅ Curriculum Loaded Successfully: ${days.length} days across ${modules.length} modules.`);
  console.log(`   Cohort Info: "${curriculum.cohort}"`);

  // Inspect sample modules
  console.log('\n   Modules Overview:');
  modules.forEach((mod) => {
    console.log(`   - Module ${mod.n}: ${mod.title} (Days ${mod.days[0]}–${mod.days[1]})`);
  });

  // Inspect sample day (Day 7 Embeddings)
  const day7 = curriculumLoader.getDayByNumber(7);
  if (day7) {
    console.log(`\n   Sample Day 7: "${day7.title}" [${day7.type}]`);
    console.log(`   - Tools: ${day7.tools.join(', ')}`);
    console.log(`   - Objectives Count: ${day7.objectives.length}`);
  } else {
    throw new Error('Day 7 not found!');
  }

  console.log('\n==================================================');
  console.log('🎉 PHASE 1 VERIFICATION SUCCESSFUL: DATA LOADERS VERIFIED');
  console.log('==================================================\n');
} catch (err: any) {
  console.error('❌ PHASE 1 VERIFICATION FAILED:', err.message);
  process.exit(1);
}
