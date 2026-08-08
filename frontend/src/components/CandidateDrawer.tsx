import React, { useState } from 'react';
import { X, Search, UserCheck, Award, Briefcase, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 22, 0.88)',
        backdropFilter: 'blur(16px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '960px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            boxShadow: '0 0 50px rgba(0, 229, 255, 0.15)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16, 23, 40, 0.6)'
          }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Candidate Cohort Selector
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', background: 'rgba(79, 140, 255, 0.15)', color: '#4F8CFF', border: '1px solid rgba(79, 140, 255, 0.3)' }}>
                  {candidates.length} Cohort Members
                </span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '2px' }}>
                Select a candidate profile to test the adaptive InterviewOS intelligence engine.
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '16px 28px', background: 'rgba(15, 23, 42, 0.4)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#64748B" style={{ position: 'absolute', left: '16px', top: '13px' }} />
              <input
                type="text"
                placeholder="Search candidate by name, job role (e.g. AI Engineer, Data Scientist)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 46px',
                  borderRadius: '12px',
                  background: 'rgba(16, 23, 40, 0.8)',
                  border: '1px solid rgba(79, 140, 255, 0.25)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Candidate Grid */}
          <div style={{
            padding: '24px 28px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            {filteredCandidates.map((c) => {
              const isSelected = c.member.id === selectedCandidateId;
              const completedCount = c.missions.filter((m) => m.passed).length;

              return (
                <motion.div
                  key={c.member.id}
                  whileHover={{ scale: 1.02, translateY: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectCandidate(c);
                    onClose();
                  }}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(79, 140, 255, 0.15))'
                      : 'rgba(16, 23, 40, 0.7)',
                    border: isSelected
                      ? '2px solid #00E5FF'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: isSelected ? '0 0 24px rgba(0, 229, 255, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: '#00E5FF',
                      color: '#050816',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <UserCheck size={16} />
                    </div>
                  )}

                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
                    {c.member.name}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#7DD3FC', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <Briefcase size={14} /> {c.member.jobRole} ({c.member.yearsExperience} yrs exp)
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                    <GraduationCap size={14} /> {c.member.education}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{ color: '#94A3B8' }}>Missions Completed</span>
                    <span style={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={14} /> {completedCount} / {c.missions.length}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
