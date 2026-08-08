import { CandidateProfile, LLMEvaluationResult } from '../types';

export interface IDifficultyEngine {
  calculateInitialDifficulty(candidate: CandidateProfile): number;
  updateDifficulty(currentDifficulty: number, evaluation: LLMEvaluationResult): number;
}

export class DifficultyEngine implements IDifficultyEngine {
  public calculateInitialDifficulty(candidate: CandidateProfile): number {
    const years = candidate.member.yearsExperience;
    let base = 1.0 + Math.min(2.5, years * 0.25);

    const edu = candidate.member.education.toLowerCase();
    if (edu.includes('ms') || edu.includes('master') || edu.includes('phd')) {
      base += 0.5;
    } else if (edu.includes('bs') || edu.includes('b.tech') || edu.includes('computer')) {
      base += 0.25;
    }

    return Number(Math.min(5.0, Math.max(1.0, base)).toFixed(2));
  }

  public updateDifficulty(currentDifficulty: number, evaluation: LLMEvaluationResult): number {
    let delta = 0.0;

    if (evaluation.score >= 80) {
      delta = 0.35;
    } else if (evaluation.score >= 70) {
      delta = 0.15;
    } else if (evaluation.score >= 50) {
      delta = 0.0; // Maintain current level
    } else if (evaluation.score >= 25) {
      delta = -0.25;
    } else {
      delta = -0.4;
    }

    // Recommended difficulty scalar override check
    if (evaluation.recommended_difficulty === 'EASY' && currentDifficulty > 2.5) {
      delta -= 0.2;
    } else if (evaluation.recommended_difficulty === 'EXPERT' && currentDifficulty < 4.0) {
      delta += 0.2;
    }

    const updated = currentDifficulty + delta;
    return Number(Math.min(5.0, Math.max(1.0, updated)).toFixed(2));
  }
}
