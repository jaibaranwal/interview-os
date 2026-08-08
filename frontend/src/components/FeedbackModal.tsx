import React, { useState } from 'react';
import { Award, CheckCircle, AlertTriangle, ArrowRight, X, Copy, Check, ShieldCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [copied, setCopied] = useState(false);

  if (!isOpen || !feedback) return null;

  const handleCopy = () => {
    const text = `INTERVIEWOS TECHNICAL PERFORMANCE REPORT
Candidate: ${candidate?.member.name} (${candidate?.member.jobRole})
Hiring Recommendation: ${feedback.hiringRecommendation || 'N/A'}
Evaluation Confidence: ${feedback.confidence || 'Medium'}

SUMMARY:
${feedback.summary}

STRENGTHS:
${feedback.strengths.map((s) => `• ${s}`).join('\n')}

AREAS FOR GROWTH:
${feedback.gaps.map((g) => `• ${g}`).join('\n')}

ACTIONABLE ROADMAP:
${feedback.next.map((n) => `• ${n}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRecommendationBadge = (rec?: string) => {
    switch (rec) {
      case 'Strong Hire':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: 'rgba(16, 185, 129, 0.4)' };
      case 'Hire':
        return { bg: 'rgba(79, 140, 255, 0.2)', color: '#4F8CFF', border: 'rgba(79, 140, 255, 0.4)' };
      case 'Lean Hire':
        return { bg: 'rgba(125, 211, 252, 0.2)', color: '#7DD3FC', border: 'rgba(125, 211, 252, 0.4)' };
      case 'Weak Pass':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' };
      default:
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' };
    }
  };

  const recBadge = getRecommendationBadge(feedback.hiringRecommendation);

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 22, 0.9)',
        backdropFilter: 'blur(20px)',
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
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 0 60px rgba(16, 185, 129, 0.18)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}>
                <Award size={28} color="#FFFFFF" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF' }}>
                  InterviewOS Hiring Panel Evaluation
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
                  Candidate: <strong>{candidate?.member.name}</strong> · {candidate?.member.jobRole} ({candidate?.member.yearsExperience} yrs exp)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>

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
          </div>

          {/* Modal Content */}
          <div style={{ padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Recommendation & Confidence Hero Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderRadius: '16px',
              background: 'rgba(16, 23, 40, 0.8)',
              border: '1px solid rgba(79, 140, 255, 0.2)'
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Hiring Panel Recommendation
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: recBadge.color,
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldCheck size={22} /> {feedback.hiringRecommendation || 'Hire'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Evaluation Confidence
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#00E5FF',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'flex-end'
                }}>
                  <Activity size={16} /> {feedback.confidence || 'High'} Confidence
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div style={{ background: 'rgba(16, 23, 40, 0.6)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00E5FF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Executive Evidence Summary
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.65', color: '#FFFFFF' }}>
                {feedback.summary}
              </p>
            </div>

            {/* Competency Scores Grid (1-5 scale) */}
            {feedback.competencyScores && (
              <div style={{ background: 'rgba(16, 23, 40, 0.6)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(79, 140, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4F8CFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    1–5 Competency Evaluation Scores
                  </h4>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#00E5FF' }}>
                    Overall Avg: {feedback.competencyScores.averageScore} / 5.0
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {[
                    { label: 'Technical Understanding', score: feedback.competencyScores.technicalUnderstanding },
                    { label: 'Practical Implementation', score: feedback.competencyScores.practicalImplementation },
                    { label: 'System Architecture', score: feedback.competencyScores.systemDesignArchitecture },
                    { label: 'Trade-off Analysis', score: feedback.competencyScores.tradeoffAnalysis },
                    { label: 'Communication Quality', score: feedback.competencyScores.communicationQuality }
                  ].map((comp, idx) => (
                    <div key={idx} style={{ background: 'rgba(5, 8, 22, 0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>
                        <span>{comp.label}</span>
                        <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{comp.score} / 5</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(comp.score / 5) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00E5FF, #4F8CFF)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Performance Grid */}
            {feedback.topicPerformance && feedback.topicPerformance.length > 0 && (
              <div style={{ background: 'rgba(16, 23, 40, 0.6)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7DD3FC', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Curriculum Topic Performance (5-Star Evaluation)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {feedback.topicPerformance.map((tp, idx) => (
                    <div key={idx} style={{ background: 'rgba(5, 8, 22, 0.6)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>{tp.topic}</span>
                      <span style={{ fontSize: '0.9rem', color: '#F59E0B', letterSpacing: '2px' }}>{tp.stars}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Gaps Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Strengths */}
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#10B981', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Verified Competency Strengths (Max 3)
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {feedback.strengths.map((str, idx) => (
                    <li key={idx} style={{ fontSize: '0.88rem', color: '#FFFFFF', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#10B981', fontWeight: 800 }}>•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div style={{ background: 'rgba(245, 158, 11, 0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#F59E0B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} /> Identified Learning Gaps (Max 5)
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {feedback.gaps.map((gap, idx) => (
                    <li key={idx} style={{ fontSize: '0.88rem', color: '#FFFFFF', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#F59E0B', fontWeight: 800 }}>•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Growth Roadmap */}
            <div style={{ background: 'rgba(168, 85, 247, 0.06)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#A855F7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRight size={18} /> Actionable Cohort Growth Roadmap
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {feedback.next.map((step, idx) => (
                  <div key={idx} style={{ background: 'rgba(16, 23, 40, 0.8)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.85rem', color: '#FFFFFF', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', color: '#A855F7' }}>
                      0{idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
