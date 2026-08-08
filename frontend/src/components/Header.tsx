import React from 'react';
import { Cpu, Users, RefreshCw } from 'lucide-react';
import type { CandidateProfile } from '../types';

interface HeaderProps {
  selectedCandidate: CandidateProfile | null;
  onOpenCandidateDrawer: () => void;
  onResetSession: () => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCandidate,
  onOpenCandidateDrawer,
  onResetSession,
  isBackendConnected
}) => {
  return (
    <header className="glass-card" style={{ padding: '14px 24px', margin: '16px auto', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00f2fe 0%, #7f00ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)'
        }}>
          <Cpu size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Interview<span className="gradient-text">OS</span>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
              v1.0 Adaptive
            </span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Autonomous AI Technical Interviewer · 31-Day AI Cohort
          </p>
        </div>
      </div>

      {/* Center Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Active Candidate Badge */}
        <button
          onClick={onOpenCandidateDrawer}
          className="glass-pill"
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <Users size={16} color="var(--accent-cyan)" />
          {selectedCandidate ? (
            <span>
              <strong>{selectedCandidate.member.name}</strong> ({selectedCandidate.member.jobRole})
            </span>
          ) : (
            <span>Select Candidate Profile</span>
          )}
        </button>

        {/* Reset Session */}
        <button
          onClick={onResetSession}
          className="glass-pill"
          title="Reset Session"
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Right System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isBackendConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isBackendConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            boxShadow: isBackendConnected ? '0 0 8px #10b981' : '0 0 8px #f43f5e'
          }} />
          {isBackendConnected ? 'Engine Connected' : 'Engine Offline'}
        </div>
      </div>
    </header>
  );
};
