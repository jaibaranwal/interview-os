// Candidate Data Types
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

export interface CandidatesData {
  candidates: CandidateProfile[];
}

// Curriculum Data Types
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

// API Contract Types
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

export interface ContinuationResponse {
  reply: string;
  done: false;
}

export interface FinalResponse {
  reply: string;
  done: true;
  feedback: FeedbackObject;
}

export type InterviewResponse = ContinuationResponse | FinalResponse;
