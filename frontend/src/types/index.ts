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

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface FeedbackObject {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  communicationAssessment?: string;
  topicsDemonstrated?: string[];
  topicsSkipped?: string[];
  hiringRecommendation?: string;
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: FeedbackObject;
  // Real-time cockpit data returned from backend
  questionCount?: number;
  visitedDaysCount?: number;
  difficulty?: number;
  currentState?: string;
  currentDayTitle?: string;
  llmCallCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: string;
}
