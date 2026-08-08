import { CandidateProfile } from '../types';

export interface CandidateAnalysisResult {
  completedDays: number[];
  skippedDays: number[];
  failedDays: number[];
  strongTopics: { day: number; title: string }[];
  weakTopics: { day: number; title: string; attempts?: number }[];
  experienceLevel: 'Junior' | 'Intermediate' | 'Senior';
  seniorityScore: number; // 1.0 to 5.0
  confidenceEstimate: number; // 0.0 to 1.0
}

export class CandidateAnalyzer {
  public analyzeProfile(candidate: CandidateProfile): CandidateAnalysisResult {
    const { member, missions, signals } = candidate;

    // 1. Mission Categorization
    const completedDays: number[] = [];
    const skippedDays: number[] = [];
    const failedDays: number[] = [];
    const strongTopics: { day: number; title: string }[] = [];
    const weakTopics: { day: number; title: string; attempts?: number }[] = [];

    missions.forEach((m) => {
      if (m.skipped === true) {
        skippedDays.push(m.day);
      } else if (m.passed === false) {
        failedDays.push(m.day);
        weakTopics.push({ day: m.day, title: m.title, attempts: m.attempts });
      } else if (m.passed === true) {
        completedDays.push(m.day);
        if (m.attempts && m.attempts >= 3) {
          weakTopics.push({ day: m.day, title: m.title, attempts: m.attempts });
        } else {
          strongTopics.push({ day: m.day, title: m.title });
        }
      }
    });

    // 2. Seniority Calculation
    let educationMod = 0;
    const edu = member.education.toLowerCase();
    if (edu.includes('ms') || edu.includes('master') || edu.includes('phd')) {
      educationMod = 0.5;
    } else if (edu.includes('bs') || edu.includes('b.tech') || edu.includes('bachelor') || edu.includes('computer')) {
      educationMod = 0.25;
    }

    const expScore = Math.min(2.5, member.yearsExperience * 0.25);
    const rawSeniority = 1.0 + expScore + educationMod;
    const seniorityScore = Number(Math.min(5.0, Math.max(1.0, rawSeniority)).toFixed(2));

    let experienceLevel: 'Junior' | 'Intermediate' | 'Senior' = 'Junior';
    if (seniorityScore >= 3.5) {
      experienceLevel = 'Senior';
    } else if (seniorityScore >= 2.2) {
      experienceLevel = 'Intermediate';
    }

    // 3. Confidence Estimate
    const commitRatio = Math.min(1.0, signals.commitDays / 31.0);
    const firstTryVelocity = signals.missionsCompleted > 0
      ? Math.min(1.0, signals.missionsFirstTry / signals.missionsCompleted)
      : 0.5;

    const confidenceEstimate = Number((commitRatio * 0.4 + firstTryVelocity * 0.6).toFixed(2));

    return {
      completedDays,
      skippedDays,
      failedDays,
      strongTopics,
      weakTopics,
      experienceLevel,
      seniorityScore,
      confidenceEstimate
    };
  }
}
