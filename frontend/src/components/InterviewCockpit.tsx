import React from 'react';
import { Target, Calendar, Activity, CheckCircle2, BookOpen, Brain, Sparkles, Volume2 } from 'lucide-react';
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
}

export const InterviewCockpit: React.FC<InterviewCockpitProps> = ({
  questionCount,
  visitedDaysCount,
  difficulty,
  currentState,
  currentDayTitle,
  isComplete
}) => {
  const minQuestions = 8;
  const minDays = 4;

  const questionProgress = Math.min(100, Math.round((questionCount / minQuestions) * 100));
  const daysProgress = Math.min(100, Math.round((visitedDaysCount / minDays) * 100));

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
  const StateIcon = stateInfo.icon;

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto 20px auto' }}>
      <div className="glass-card" style={{
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        alignItems: 'center',
        background: 'rgba(16, 23, 40, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>

        {/* 1. Active Topic Timeline Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Curriculum Topic
            </div>
            <div style={{
              fontSize: '0.88rem',
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

        {/* 2. Questions Progress Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            color: '#00E5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Target size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94A3B8', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Questions</span>
              <span style={{ fontWeight: 800, color: questionCount >= minQuestions ? '#10B981' : '#FFFFFF' }}>
                {questionCount} / {minQuestions} ({questionProgress}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${questionProgress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #00E5FF 0%, #4F8CFF 100%)', borderRadius: '4px' }}
              />
            </div>
          </div>
        </motion.div>

        {/* 3. Days / Curriculum Coverage Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            color: '#A855F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94A3B8', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Days Covered</span>
              <span style={{ fontWeight: 800, color: visitedDaysCount >= minDays ? '#10B981' : '#FFFFFF' }}>
                {visitedDaysCount} / {minDays} ({daysProgress}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${daysProgress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 100%)', borderRadius: '4px' }}
              />
            </div>
          </div>
        </motion.div>

        {/* 4. Adaptive Difficulty Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: difficultyBadge.bg,
            border: `1px solid ${difficultyBadge.border}`,
            color: difficultyBadge.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Adaptive Difficulty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF' }}>
                {difficulty.toFixed(1)}
              </span>
              <span style={{
                fontSize: '0.7rem',
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

        {/* 5. FSM State Widget */}
        <motion.div whileHover={{ translateY: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            background: stateInfo.bg,
            border: `1px solid ${stateInfo.color}40`,
            color: stateInfo.color
          }}>
            <StateIcon size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em' }}>
              {stateInfo.label}
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
