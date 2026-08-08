import React from 'react';
import { Cpu, Users, RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <header style={{ width: '100%', maxWidth: '1440px', margin: '0 auto 20px auto', position: 'relative' }}>
      <div className="glass-card" style={{
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(16, 23, 40, 0.85)',
        border: '1px solid rgba(79, 140, 255, 0.18)',
        backdropFilter: 'blur(24px)'
      }}>

        {/* Brand Logo & Model Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #00E5FF 0%, #4F8CFF 50%, #7F00FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(0, 229, 255, 0.4)',
              position: 'relative'
            }}
          >
            <Cpu size={26} color="#FFFFFF" />
            <span className="ai-pulse-dot" style={{ position: 'absolute', top: '-2px', right: '-2px' }} />
          </motion.div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#FFFFFF' }}>
                Interview<span className="gradient-text">OS</span>
              </h1>

              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                background: 'rgba(0, 229, 255, 0.1)',
                color: '#00E5FF',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={11} /> v2.0 Adaptive
              </span>

              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '20px',
                background: 'rgba(125, 211, 252, 0.08)',
                color: '#7DD3FC',
                border: '1px solid rgba(125, 211, 252, 0.2)'
              }}>
                Groq llama-3.1-8b
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Autonomous AI Technical Interview Platform</span>
              <span style={{ color: '#64748B' }}>•</span>
              <span style={{ color: '#7DD3FC' }}>Evidence-Based Engine</span>
            </p>
          </div>
        </div>

        {/* Center Controls: Candidate Selector Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCandidateDrawer}
            className="glass-pill"
            style={{
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              border: '1px solid rgba(79, 140, 255, 0.28)',
              background: 'linear-gradient(135deg, rgba(16, 23, 40, 0.9), rgba(30, 41, 59, 0.7))',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(0, 229, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00E5FF'
            }}>
              <Users size={14} />
            </div>

            {selectedCandidate ? (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
                  {selectedCandidate.member.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  {selectedCandidate.member.jobRole} ({selectedCandidate.member.yearsExperience} yrs exp)
                </div>
              </div>
            ) : (
              <span style={{ fontWeight: 600 }}>Select Candidate Profile</span>
            )}
          </motion.button>

          {/* Reset Session */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetSession}
            title="Reset Interview Session"
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </motion.button>
        </div>

        {/* Right Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: isBackendConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: isBackendConnected ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: isBackendConnected ? '#10B981' : '#EF4444'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isBackendConnected ? '#10B981' : '#EF4444',
              boxShadow: isBackendConnected ? '0 0 10px #10B981' : '0 0 10px #EF4444'
            }} />
            <span>{isBackendConnected ? 'Engine Connected' : 'Engine Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Separator Gradient Line */}
      <div style={{
        position: 'absolute',
        bottom: '-1px',
        left: '5%',
        right: '5%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0, 229, 255, 0.4) 50%, transparent 100%)'
      }} />
    </header>
  );
};
