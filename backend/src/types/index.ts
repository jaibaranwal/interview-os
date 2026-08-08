export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface CandidateProfile {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

export interface CurriculumModule {
  n: number;
  title: string;
  days: [number, number];
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CurriculumData {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export interface StartInterviewRequest {
  sessionId: string;
  candidate: CandidateProfile;
}

export interface TurnInterviewRequest {
  sessionId: string;
  message: string;
}

export type InterviewRequest = StartInterviewRequest | TurnInterviewRequest;

export interface FeedbackObject {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: FeedbackObject;
}

export interface LLMEvaluationResult {
  score: number; // 0-100
  confidence: number; // 0-100
  correctness: 'EXEMPLARY' | 'ADEQUATE' | 'WEAK' | 'INVALID';
  detected_concepts: string[];
  missing_concepts: string[];
  strengths: string[];
  weaknesses: string[];
  follow_up_needed: boolean;
  recommended_difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  next_action: 'retry' | 'follow_up' | 'advance';
  raw_reasoning?: string;
}
