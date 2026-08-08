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

export interface InterviewStatistics {
  questionsAsked: number;
  minQuestionsRequired?: number;
  goodAnswersCount: number;
  weakAnswersCount: number;
  adaptiveFollowupsCount: number;
  topicsVisitedCount: number;
  averageResponseQuality: string; // e.g. "82%"
  confidence: 'High' | 'Medium' | 'Low' | string;
  continuationReasons?: string[];
}

export interface PanelDecision {
  technicalInterview: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Weak Pass' | 'No Hire';
  architectureReview: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Weak Pass' | 'No Hire';
  communication: 'Strong' | 'Satisfactory' | 'Needs Improvement';
  overallRecommendation: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Weak Pass' | 'No Hire';
  overallStars: string;
}

export interface FeedbackObject {
  summary: string;
  competencyScores?: CompetencyScores;
  strengths: string[]; // max 3 evidence-backed strengths
  gaps: string[]; // max 5 specific missing concept weaknesses
  next: string[]; // max 3 weak-area growth items
  topicPerformance?: TopicPerformanceRecord[];
  hiringRecommendation?: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Weak Pass' | 'No Hire' | string;
  confidence?: 'High' | 'Medium' | 'Low' | string;
  statistics?: InterviewStatistics;
  panelDecision?: PanelDecision;
  communicationAssessment?: string;
  topicsDemonstrated?: string[];
  topicsSkipped?: string[];
  continuationReasons?: string[];
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
  evidenceProgress?: number; // 0-100% evidence collection score
}

export interface ChatMessage {
  id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: string;
}
