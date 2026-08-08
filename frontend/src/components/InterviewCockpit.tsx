import React from 'react';
import { Target, Calendar, Activity, CheckCircle2, BookOpen } from 'lucide-react';
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

  const difficultyLabel =
    difficulty >= 4.5 ? 'Expert' :
    difficulty >= 3.5 ? 'Advanced' :
    difficulty >= 2.5 ? 'Intermediate' :
    difficulty >= 1.5 ? 'Foundational' : 'Introductory';

  return (
    <div className="glass-card" style={{ padding: '14px 24px', margin: '0 auto 16px auto', maxWidth: '1200px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'center' }}>

        {/* Active Topic */}
        {currentDayTitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', flexShrink: 0 }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '2px' }}>Active Topic</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-emerald)', lineHeight: 1.3 }}>
                {currentDayTitle}
              </div>
            </div>
          </div>
        )}

        {/* Questions Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.12)', color: 'var(--accent-cyan)', flexShrink: 0 }}>
            <Target size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Questions</span>
              <span style={{ fontWeight: 700, color: questionCount >= minQuestions ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                {questionCount} / {minQuestions}
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${questionProgress}%`, height: '100%', background: 'linear-gradient(90deg, #00f2fe, #4facfe)', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* Curriculum Coverage */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(127, 0, 255, 0.12)', color: 'var(--accent-purple)', flexShrink: 0 }}>
            <Calendar size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Days Covered</span>
              <span style={{ fontWeight: 700, color: visitedDaysCount >= minDays ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                {visitedDaysCount} / {minDays}
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${daysProgress}%`, height: '100%', background: 'linear-gradient(90deg, #7f00ff, #e100ff)', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* Difficulty Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)', flexShrink: 0 }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Difficulty</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{difficulty.toFixed(1)}</span>
              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)' }}>
                {difficultyLabel}
              </span>
            </div>
          </div>
        </div>

        {/* FSM State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>State</div>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isComplete ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              justifyContent: 'flex-end'
            }}>
              {isComplete && <CheckCircle2 size={14} />}
              {currentState}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
