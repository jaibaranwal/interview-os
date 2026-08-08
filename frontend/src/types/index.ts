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

export interface CompetencyScores {
  technicalUnderstanding: number; // 1-5
  practicalImplementation: number; // 1-5
  systemDesignArchitecture: number; // 1-5
  tradeoffAnalysis: number; // 1-5
  communicationQuality: number; // 1-5
  averageScore: number; // 1-5
}

export interface TopicPerformanceRecord {
  topic: string;
  dayNum: number;
  stars: string; // e.g. "★★★★★"
  score: number; // 1-5
}

export interface FeedbackObject {
  summary: string;
  competencyScores?: CompetencyScores;
  strengths: string[];
  gaps: string[];
  next: string[];
  topicPerformance?: TopicPerformanceRecord[];
  hiringRecommendation?: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Weak Pass' | 'No Hire' | string;
  confidence?: 'High' | 'Medium' | 'Low' | string;
  communicationAssessment?: string;
  topicsDemonstrated?: string[];
  topicsSkipped?: string[];
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
