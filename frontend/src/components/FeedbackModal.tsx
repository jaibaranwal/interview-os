import React from 'react';
import { Award, CheckCircle, AlertTriangle, ArrowRight, X, Copy, Check } from 'lucide-react';
import type { FeedbackObject, CandidateProfile } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackObject | null;
  candidate: CandidateProfile | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
  candidate
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !feedback) return null;

  const handleCopy = () => {
    const text = `INTERVIEWOS TECHNICAL PERFORMANCE REPORT
Candidate: ${candidate?.member.name} (${candidate?.member.jobRole})

SUMMARY:
${feedback.summary}

STRENGTHS:
${feedback.strengths.map((s) => `• ${s}`).join('\n')}

AREAS FOR GROWTH:
${feedback.gaps.map((g) => `• ${g}`).join('\n')}

ACTIONABLE NEXT STEPS:
${feedback.next.map((n) => `• ${n}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.88)',
      backdropFilter: 'blur(16px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 0 40px rgba(16, 185, 129, 0.15)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
            }}>
              <Award size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                InterviewOS Performance Evaluation Report
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {candidate?.member.name} · {candidate?.member.jobRole} ({candidate?.member.yearsExperience} yrs exp)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Card */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 'var(--radius-md)', padding: '18px 20px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Performance Summary
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
              {feedback.summary}
            </p>
          </div>

          {/* Strengths & Gaps Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Strengths */}
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-md)', padding: '18px 20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> Verified Technical Strengths
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {feedback.strengths.map((str, idx) => (
                  <li key={idx} style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div style={{ background: 'rgba(245, 158, 11, 0.06)', borderRadius: 'var(--radius-md)', padding: '18px 20px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Identified Learning Gaps
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {feedback.gaps.map((gap, idx) => (
                  <li key={idx} style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Next Steps */}
          <div style={{ background: 'rgba(127, 0, 255, 0.06)', borderRadius: 'var(--radius-md)', padding: '18px 20px', border: '1px solid rgba(127, 0, 255, 0.2)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRight size={18} /> Recommended Cohort Growth Roadmap
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
              {feedback.next.map((step, idx) => (
                <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(127, 0, 255, 0.2)', color: 'var(--accent-purple)' }}>
                    Step {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)' }}>
          <button
            onClick={handleCopy}
            className="glass-pill"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            <span>{copied ? 'Report Copied to Clipboard!' : 'Copy Evaluation Report'}</span>
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
