import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CandidateDrawer } from './components/CandidateDrawer';
import { InterviewCockpit } from './components/InterviewCockpit';
import { ChatInterface } from './components/ChatInterface';
import { FeedbackModal } from './components/FeedbackModal';
import type { CandidateProfile, ChatMessage, FeedbackObject } from './types';
import { fetchCandidates, startInterviewSession, sendInterviewTurn } from './services/api';

export const App: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [isCandidateDrawerOpen, setIsCandidateDrawerOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Session State
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Live Cockpit Metrics
  const [questionCount, setQuestionCount] = useState(0);
  const [visitedDaysCount, setVisitedDaysCount] = useState(0);
  const [difficulty, setDifficulty] = useState(2.5);
  const [currentState, setCurrentState] = useState('GREETING');
  const [feedback, setFeedback] = useState<FeedbackObject | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Load Candidates on Mount
  useEffect(() => {
    fetchCandidates()
      .then((data) => {
        setCandidates(data);
        if (data.length > 0) {
          handleSelectCandidate(data[0]); // Default to CAND-001
        }
        setIsBackendConnected(true);
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, []);

  const handleSelectCandidate = async (candidate: CandidateProfile) => {
    setSelectedCandidate(candidate);
    const newSessionId = `session-${candidate.member.id}-${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([]);
    setIsLoading(true);
    setIsComplete(false);
    setFeedback(null);
    setQuestionCount(0);
    setVisitedDaysCount(1);
    setDifficulty(candidate.member.yearsExperience > 5 ? 3.5 : 2.5);
    setCurrentState('GREETING');

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
    } catch (err: any) {
      console.error(err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

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

      // Update cockpit counters
      setQuestionCount((prevCount) => prevCount + 1);
      setVisitedDaysCount(() => Math.min(8, Math.max(1, Math.floor((questionCount + 2) / 2))));
      setDifficulty((prevDiff) => Math.min(5.0, Math.max(1.0, prevDiff + 0.1)));
      setCurrentState(res.done ? 'COMPLETED' : 'LISTENING');

      if (res.done && res.feedback) {
        setIsComplete(true);
        setFeedback(res.feedback);
        setIsFeedbackModalOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'interviewer',
        content: '⚠️ Engine Error: Failed to process turn. Please check backend server status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    if (selectedCandidate) {
      handleSelectCandidate(selectedCandidate);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0 16px 24px 16px' }}>
      {/* Header Bar */}
      <Header
        selectedCandidate={selectedCandidate}
        onOpenCandidateDrawer={() => setIsCandidateDrawerOpen(true)}
        onResetSession={handleResetSession}
        isBackendConnected={isBackendConnected}
      />

      {/* Cockpit Status Bar */}
      <InterviewCockpit
        candidate={selectedCandidate}
        questionCount={questionCount}
        visitedDaysCount={visitedDaysCount}
        difficulty={difficulty}
        currentState={currentState}
        isComplete={isComplete}
      />

      {/* Chat Conversational View */}
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isComplete={isComplete}
      />

      {/* Candidate Profile Selection Drawer */}
      <CandidateDrawer
        isOpen={isCandidateDrawerOpen}
        onClose={() => setIsCandidateDrawerOpen(false)}
        candidates={candidates}
        selectedCandidateId={selectedCandidate?.member.id || null}
        onSelectCandidate={handleSelectCandidate}
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
