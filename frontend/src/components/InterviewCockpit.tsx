import React from 'react';
import { Target, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import type { CandidateProfile } from '../types';

interface InterviewCockpitProps {
  candidate: CandidateProfile | null;
  questionCount: number;
  visitedDaysCount: number;
  difficulty: number;
  currentState: string;
  isComplete: boolean;
}

export const InterviewCockpit: React.FC<InterviewCockpitProps> = ({
  questionCount,
  visitedDaysCount,
  difficulty,
  currentState,
  isComplete
}) => {
  const minQuestions = 8;
  const minDays = 4;

  const questionProgress = Math.min(100, Math.round((questionCount / minQuestions) * 100));
  const daysProgress = Math.min(100, Math.round((visitedDaysCount / minDays) * 100));

  return (
    <div className="glass-card" style={{ padding: '16px 24px', margin: '0 auto 16px auto', maxWidth: '1200px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
        {/* Metric 1: Question Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.12)', color: 'var(--accent-cyan)' }}>
            <Target size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Questions Progress</span>
              <span style={{ fontWeight: 700, color: questionCount >= minQuestions ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                {questionCount} / {minQuestions}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${questionProgress}%`, height: '100%', background: 'linear-gradient(90deg, #00f2fe, #4facfe)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {/* Metric 2: Curriculum Coverage */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(127, 0, 255, 0.12)', color: 'var(--accent-purple)' }}>
            <Calendar size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Curriculum Days Covered</span>
              <span style={{ fontWeight: 700, color: visitedDaysCount >= minDays ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                {visitedDaysCount} / {minDays}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${daysProgress}%`, height: '100%', background: 'linear-gradient(90deg, #7f00ff, #e100ff)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {/* Metric 3: Dynamic Difficulty Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Difficulty Scalar (D)</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{difficulty.toFixed(1)} / 5.0</span>
              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
                Adaptive
              </span>
            </div>
          </div>
        </div>

        {/* State Machine Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>FSM State</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isComplete ? 'var(--accent-emerald)' : 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              {isComplete && <CheckCircle2 size={14} />}
              {currentState}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
