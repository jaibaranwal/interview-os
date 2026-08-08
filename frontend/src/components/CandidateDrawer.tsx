import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Search, UserCheck } from 'lucide-react';
import type { CandidateProfile } from '../types';

interface CandidateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateProfile[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  isOpen,
  onClose,
  candidates,
  selectedCandidateId,
  onSelectCandidate
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter((c) =>
    c.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.member.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.member.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(0, 242, 254, 0.3)'
      }}>
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Candidate Profile Selector ({candidates.length} Cohort Members)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Select any candidate to test the adaptive InterviewOS intelligence engine.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: '16px 24px', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search candidate by name, role (e.g. Data Engineer, AI Researcher)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        {/* Candidate List Grid */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filteredCandidates.map((c) => {
            const isSelected = c.member.id === selectedCandidateId;
            const completedCount = c.missions.filter((m) => m.passed).length;
            const skippedCount = c.missions.filter((m) => m.skipped).length;
            const failedCount = c.missions.filter((m) => m.passed === false).length;

            return (
              <div
                key={c.member.id}
                onClick={() => {
                  onSelectCandidate(c);
                  onClose();
                }}
                className="glass-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                  background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-glass)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--accent-cyan)' }}>
                    <UserCheck size={18} />
                  </span>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px' }}>
                  {c.member.id}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {c.member.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {c.member.jobRole} · {c.member.yearsExperience} yrs exp
                </p>

                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> {completedCount} Pass
                  </span>
                  {failedCount > 0 && (
                    <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> {failedCount} Fail
                    </span>
                  )}
                  {skippedCount > 0 && (
                    <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <XCircle size={12} /> {skippedCount} Skip
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                  Commits: {c.signals.commitDays}/31 days · 1st Try: {c.signals.missionsFirstTry}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
