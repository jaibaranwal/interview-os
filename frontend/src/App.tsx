import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CandidateDrawer } from './components/CandidateDrawer';
import { InterviewCockpit } from './components/InterviewCockpit';
import { ChatInterface } from './components/ChatInterface';
import { FeedbackModal } from './components/FeedbackModal';
import { LandingPage } from './components/LandingPage';
import type { CandidateProfile, ChatMessage, FeedbackObject } from './types';
import { fetchCandidates, startInterviewSession, sendInterviewTurn } from './services/api';

export const App: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [isCandidateDrawerOpen, setIsCandidateDrawerOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // View Navigation: 'landing' (Hackathon Overview) vs 'interview' (Live Interview Cockpit)
  const [viewMode, setViewMode] = useState<'landing' | 'interview'>('landing');

  // Session State
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Cockpit metrics
  const [questionCount, setQuestionCount] = useState(0);
  const [visitedDaysCount, setVisitedDaysCount] = useState(0);
  const [difficulty, setDifficulty] = useState(2.5);
  const [currentState, setCurrentState] = useState('GREETING');
  const [currentDayTitle, setCurrentDayTitle] = useState('');
  const [evidenceProgress, setEvidenceProgress] = useState(0);

  const [feedback, setFeedback] = useState<FeedbackObject | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Ref guards to eliminate duplicate React StrictMode effect executions & duplicate API calls
  const hasFetchedCandidatesRef = useRef(false);
  const activeInitializingCandidateIdRef = useRef<string | null>(null);

  const handleSelectCandidate = useCallback(async (candidate: CandidateProfile) => {
    if (activeInitializingCandidateIdRef.current === candidate.member.id) {
      return;
    }
    activeInitializingCandidateIdRef.current = candidate.member.id;

    setSelectedCandidate(candidate);
    const newSessionId = `session-${candidate.member.id}-${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([]);
    setIsLoading(true);
    setIsComplete(false);
    setFeedback(null);
    setQuestionCount(0);
    setVisitedDaysCount(0);
    setDifficulty(2.5);
    setCurrentState('GREETING');
    setCurrentDayTitle('');
    setEvidenceProgress(0);

    try {
      const res = await startInterviewSession(newSessionId, candidate);
      const initialMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'interviewer',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMessage]);
      setIsBackendConnected(true);

      if (res.difficulty !== undefined) setDifficulty(res.difficulty);
      if (res.currentState) setCurrentState(res.currentState);
      if (res.currentDayTitle) setCurrentDayTitle(res.currentDayTitle);
      if (res.evidenceProgress !== undefined) setEvidenceProgress(res.evidenceProgress);
    } catch (err: any) {
      setIsBackendConnected(false);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'interviewer',
        content: '⚠️ Unable to connect to the interview system. Please check that the backend is running and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
      activeInitializingCandidateIdRef.current = null;
    }
  }, []);

  // Load Candidates on Mount — guarded against React 18 StrictMode double execution
  useEffect(() => {
    if (hasFetchedCandidatesRef.current) return;
    hasFetchedCandidatesRef.current = true;

    fetchCandidates()
      .then((data) => {
        setCandidates(data);
        setIsBackendConnected(true);
        if (data.length > 0) {
          handleSelectCandidate(data[0]);
        }
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, [handleSelectCandidate]);

  const handleSendMessage = async (text: string) => {
    if (!sessionId || isLoading || isComplete) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'candidate',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await sendInterviewTurn(sessionId, text);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'interviewer',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);

      if (res.questionCount !== undefined) setQuestionCount(res.questionCount);
      if (res.visitedDaysCount !== undefined) setVisitedDaysCount(res.visitedDaysCount);
      if (res.difficulty !== undefined) setDifficulty(res.difficulty);
      if (res.currentState) setCurrentState(res.done ? 'COMPLETED' : res.currentState);
      if (res.currentDayTitle) setCurrentDayTitle(res.currentDayTitle);
      if (res.evidenceProgress !== undefined) setEvidenceProgress(res.evidenceProgress);

      if (res.done && res.feedback) {
        setIsComplete(true);
        setFeedback(res.feedback);
        setIsFeedbackModalOpen(true);
      }
    } catch (err: any) {
      const isTimeout = err.message?.includes('timed out');
      const errorContent = isTimeout
        ? '⏱️ The AI is taking longer than usual. This can happen under load — please try again.'
        : '⚠️ Something went wrong processing your response. Please try again in a moment.';

      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'interviewer',
        content: errorContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    if (selectedCandidate) {
      activeInitializingCandidateIdRef.current = null;
      handleSelectCandidate(selectedCandidate);
    }
  };

  const handleStartLiveDemo = () => {
    setViewMode('interview');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '16px 20px 24px 20px', position: 'relative' }}>
      {/* Animated Low-Opacity Background Mesh */}
      <div className="bg-mesh-container">
        <div className="bg-mesh-orb-1" />
        <div className="bg-mesh-orb-2" />
      </div>

      {/* Header Bar */}
      <Header
        selectedCandidate={selectedCandidate}
        onOpenCandidateDrawer={() => setIsCandidateDrawerOpen(true)}
        onResetSession={handleResetSession}
        isBackendConnected={isBackendConnected}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
      />

      {/* View Switcher: Landing / Arch Overview vs Live Interview Cockpit */}
      {viewMode === 'landing' ? (
        <LandingPage
          onStartInterview={handleStartLiveDemo}
          onOpenCandidateDrawer={() => setIsCandidateDrawerOpen(true)}
        />
      ) : (
        <>
          {/* Cockpit Status Bar */}
          <InterviewCockpit
            candidate={selectedCandidate}
            questionCount={questionCount}
            visitedDaysCount={visitedDaysCount}
            difficulty={difficulty}
            currentState={currentState}
            currentDayTitle={currentDayTitle}
            isComplete={isComplete}
            evidenceProgress={evidenceProgress}
          />

          {/* Chat Conversational View */}
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isComplete={isComplete}
          />
        </>
      )}

      {/* Candidate Profile Selection Drawer */}
      <CandidateDrawer
        isOpen={isCandidateDrawerOpen}
        onClose={() => setIsCandidateDrawerOpen(false)}
        candidates={candidates}
        selectedCandidateId={selectedCandidate?.member.id || null}
        onSelectCandidate={(c) => {
          handleSelectCandidate(c);
          setViewMode('interview');
        }}
      />

      {/* Feedback & Performance Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        feedback={feedback}
        candidate={selectedCandidate}
      />
    </div>
  );
};

export default App;
