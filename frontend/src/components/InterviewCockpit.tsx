import React from 'react';
import { Calendar, Activity, CheckCircle2, BookOpen, Brain, Sparkles, Volume2, ShieldCheck, BarChart3, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CandidateProfile } from '../types';

interface InterviewCockpitProps {
  candidate: CandidateProfile | null;
  questionCount: number;
  visitedDaysCount: number;
  difficulty: number;
  currentState: string;
  currentDayTitle: string;
  isComplete: boolean;
  evidenceProgress?: number;
}

export const InterviewCockpit: React.FC<InterviewCockpitProps> = ({
  questionCount,
  visitedDaysCount,
  difficulty,
  currentState,
  currentDayTitle,
  isComplete,
  evidenceProgress = 0
}) => {
  const minQuestions = 8;
  const minDays = 4;

  const computedEvidence = isComplete
    ? 100
    : Math.min(100, Math.max(evidenceProgress, Math.round((questionCount / minQuestions) * 50 + (visitedDaysCount / minDays) * 30)));

  const daysProgress = Math.min(100, Math.round((visitedDaysCount / minDays) * 100));

  // Dynamic Interview Status Badge (Strict MIN 8 Guard)
  const getInterviewStatus = () => {
    if (isComplete && questionCount >= minQuestions) {
      return { label: 'Ready for Evaluation', color: '#10B981', bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.4)' };
    }
    if (questionCount >= minQuestions) {
      return { label: 'Final Validation...', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.18)', border: 'rgba(245, 158, 11, 0.4)' };
    }
    return { label: 'Collecting Evidence...', color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.18)', border: 'rgba(0, 229, 255, 0.4)' };
  };

  const statusBadge = getInterviewStatus();

  // Color-coded difficulty configuration
  const difficultyBadge =
    difficulty >= 4.5
      ? { label: 'Expert', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' }
      : difficulty >= 3.5
      ? { label: 'Advanced', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' }
      : difficulty >= 2.5
      ? { label: 'Medium', color: '#4F8CFF', bg: 'rgba(79, 140, 255, 0.15)', border: 'rgba(79, 140, 255, 0.3)' }
      : { label: 'Easy', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };

  // FSM State Icon & Color mapping
  const getStateInfo = (state: string) => {
    switch (state.toUpperCase()) {
      case 'COMPLETED':
        return { label: 'Completed', color: '#10B981', icon: CheckCircle2, bg: 'rgba(16, 185, 129, 0.15)' };
      case 'EVALUATING':
        return { label: 'Evaluating', color: '#00E5FF', icon: Brain, bg: 'rgba(0, 229, 255, 0.15)' };
      case 'FOLLOW_UP':
        return { label: 'Deep Probing', color: '#F59E0B', icon: Sparkles, bg: 'rgba(245, 158, 11, 0.15)' };
      case 'LISTENING':
      case 'IDLE':
        return { label: 'Listening', color: '#7DD3FC', icon: Volume2, bg: 'rgba(125, 211, 252, 0.15)' };
      case 'GENERATING':
      case 'THINKING':
        return { label: 'Generating', color: '#A855F7', icon: Activity, bg: 'rgba(168, 85, 247, 0.15)' };
      default:
        return { label: state, color: '#4F8CFF', icon: Activity, bg: 'rgba(79, 140, 255, 0.15)' };
    }
  };

  const stateInfo = getStateInfo(isComplete ? 'COMPLETED' : currentState);

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto 20px auto' }}>
      <div className="glass-card" style={{
        padding: '18px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>

        {/* 1. Active Topic Timeline Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Curriculum Topic
            </div>
            <div style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '2px'
            }}>
              {currentDayTitle || 'Day 1: Environment & Setup'}
            </div>
          </div>
        </motion.div>

        {/* 2. Questions Asked Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            color: '#00E5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <HelpCircle size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94A3B8', marginBottom: '2px' }}>
              <span style={{ fontWeight: 600 }}>Questions Asked</span>
              <span style={{ fontWeight: 800, color: questionCount >= minQuestions ? '#10B981' : '#FFFFFF' }}>
                {questionCount}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
              Min 8 · Max 15
            </div>
          </div>
        </motion.div>

        {/* 3. Topics Covered Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            color: '#A855F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600 }}>Topics Covered</span>
              <span style={{ fontWeight: 800, color: visitedDaysCount >= minDays ? '#10B981' : '#FFFFFF' }}>
                {visitedDaysCount} / {minDays}
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${daysProgress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 100%)', borderRadius: '4px' }}
              />
            </div>
          </div>
        </motion.div>

        {/* 4. Evidence Progress Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BarChart3 size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600 }}>Evidence Progress</span>
              <span style={{ fontWeight: 800, color: computedEvidence >= 100 ? '#10B981' : '#00E5FF' }}>
                {computedEvidence}%
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${computedEvidence}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #00E5FF 0%, #10B981 100%)', borderRadius: '4px' }}
              />
            </div>
          </div>
        </motion.div>

        {/* 5. Adaptive Difficulty Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: difficultyBadge.bg,
            border: `1px solid ${difficultyBadge.border}`,
            color: difficultyBadge.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Difficulty ({difficulty.toFixed(1)})
            </div>
            <div style={{ marginTop: '2px' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: difficultyBadge.bg,
                color: difficultyBadge.color,
                border: `1px solid ${difficultyBadge.border}`
              }}>
                {difficultyBadge.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 6. Interview Status Badge */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '10px',
            background: statusBadge.bg,
            border: `1px solid ${statusBadge.border}`,
            color: statusBadge.color
          }}>
            <ShieldCheck size={14} />
            <span style={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.02em' }}>
              {statusBadge.label}
            </span>
          </div>

          <div style={{ fontSize: '0.7rem', color: stateInfo.color, fontWeight: 700 }}>
            {stateInfo.label}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
