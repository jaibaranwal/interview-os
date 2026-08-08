import React, { useState } from 'react';
import { Award, CheckCircle, AlertTriangle, ArrowRight, X, Copy, Check, ShieldCheck, Activity, BarChart2, Layers, MessageSquare, Terminal } from 'lucide-react';
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
    const text = `======================================
EXECUTIVE HIRING PANEL REPORT
======================================
Candidate: ${candidate?.member.name} (${candidate?.member.jobRole}, ${candidate?.member.yearsExperience} yrs exp)
Overall Recommendation: ${feedback.panelDecision?.overallRecommendation || feedback.hiringRecommendation || 'N/A'} (${feedback.panelDecision?.overallStars || ''})
Evaluation Confidence: ${feedback.confidence || 'Medium'}
Average Competency Score: ${feedback.competencyScores?.averageScore || 4.0}/5.0

EXECUTIVE EVIDENCE SUMMARY:
${feedback.summary}

HIRING PANEL DECISION:
• Technical Interview: ${feedback.panelDecision?.technicalInterview || 'Hire'}
• Architecture Review: ${feedback.panelDecision?.architectureReview || 'Hire'}
• Communication: ${feedback.panelDecision?.communication || 'Strong'}
• Overall Recommendation: ${feedback.panelDecision?.overallStars || ''} ${feedback.hiringRecommendation}

VERIFIED EVIDENCE-BACKED STRENGTHS:
${feedback.strengths.map((s) => `• ${s}`).join('\n')}

IDENTIFIED MISSING CONCEPTS & LEARNING GAPS:
${feedback.gaps.map((g) => `• ${g}`).join('\n')}

FOCUSED COHORT GROWTH ROADMAP:
${feedback.next.map((n) => `• ${n}`).join('\n')}
======================================
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadgeStyle = (rec?: string) => {
    switch (rec) {
      case 'Strong Hire':
        return { bg: 'rgba(16, 185, 129, 0.18)', color: '#10B981', border: 'rgba(16, 185, 129, 0.4)' };
      case 'Hire':
        return { bg: 'rgba(79, 140, 255, 0.18)', color: '#4F8CFF', border: 'rgba(79, 140, 255, 0.4)' };
      case 'Lean Hire':
        return { bg: 'rgba(125, 211, 252, 0.18)', color: '#7DD3FC', border: 'rgba(125, 211, 252, 0.4)' };
      case 'Weak Pass':
        return { bg: 'rgba(245, 158, 11, 0.18)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' };
      default:
        return { bg: 'rgba(239, 68, 68, 0.18)', color: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' };
    }
  };

  const badge = getBadgeStyle(feedback.hiringRecommendation);

  const getStarRating = (score: number) => {
    const s = Math.min(5, Math.max(1, Math.round(score)));
    return '★'.repeat(s) + '☆'.repeat(5 - s);
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 22, 0.92)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '960px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            boxShadow: '0 0 70px rgba(0, 229, 255, 0.15)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(79, 140, 255, 0.08))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00E5FF 0%, #4F8CFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)'
              }}>
                <Award size={26} color="#FFFFFF" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  Executive Hiring Panel Evaluation Report
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '2px' }}>
                  Candidate: <strong>{candidate?.member.name}</strong> · {candidate?.member.jobRole} ({candidate?.member.yearsExperience} yrs exp)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy Full Report'}</span>
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

          {/* Modal Content View */}
          <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* 1. Executive Hiring Dashboard Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              padding: '20px 24px',
              borderRadius: '16px',
              background: 'rgba(16, 23, 40, 0.85)',
              border: `1px solid ${badge.border}`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Hiring Recommendation
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: badge.color, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={20} /> {feedback.hiringRecommendation || 'Hire'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Overall Rating
                </div>
                <div style={{ fontSize: '1.15rem', color: '#F59E0B', marginTop: '4px', letterSpacing: '2px' }}>
                  {feedback.panelDecision?.overallStars || getStarRating(feedback.competencyScores?.averageScore || 4)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Avg Competency Score
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00E5FF', marginTop: '4px' }}>
                  {feedback.competencyScores?.averageScore || 4.0} / 5.0
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Evaluation Confidence
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7DD3FC', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={16} /> {feedback.confidence || 'High'}
                </div>
              </div>
            </div>

            {/* 2. Executive Evidence Summary */}
            <div style={{ background: 'rgba(16, 23, 40, 0.6)', borderRadius: '16px', padding: '18px 22px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00E5FF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Executive Evidence Summary
              </h3>
              <p style={{ fontSize: '0.94rem', lineHeight: '1.65', color: '#FFFFFF' }}>
                {feedback.summary}
              </p>
            </div>

            {/* 3. Hiring Panel Decision & Interview Statistics (Two Columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Hiring Panel Decision Breakdown */}
              <div style={{ background: 'rgba(16, 23, 40, 0.6)', borderRadius: '16px', padding: '18px 22px', border: '1px solid rgba(79, 140, 255, 0.2)' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4F8CFF', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} /> Hiring Panel Decision Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(5, 8, 22, 0.6)', borderRadius: '8px' }}>
                    <span style={{ color: '#94A3B8' }}>Technical Interview</span>
                    <span style={{ fontWeight: 800, color: '#10B981' }}>{feedback.panelDecision?.technicalInterview || 'Hire'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(5, 8, 22, 0.6)', borderRadius: '8px' }}>
                    <span style={{ color: '#94A3B8' }}>Architecture Review</span>
                    <span style={{ fontWeight: 800, color: '#4F8CFF' }}>{feedback.panelDecision?.architectureReview || 'Hire'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(5, 8, 22, 0.6)', borderRadius: '8px' }}>
                    <span style={{ color: '#94A3B8' }}>Communication Assessment</span>
                    <span style={{ fontWeight: 800, color: '#00E5FF' }}>{feedback.panelDecision?.communication || 'Strong'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: '8px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 800, color: badge.color }}>Overall Recommendation</span>
                    <span style={{ fontWeight: 900, color: badge.color }}>{feedback.panelDecision?.overallStars} {feedback.hiringRecommendation}</span>
                  </div>
                </div>
              </div>

              {/* Interview Statistics */}
              {feedback.statistics && (
                <div style={{ background: 'rgba(16, 23, 40, 0.6)', borderRadius: '16px', padding: '18px 22px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7DD3FC', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={16} /> Session Interview Statistics
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.84rem' }}>
                    <div style={{ background: 'rgba(5, 8, 22, 0.6)', padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ color: '#94A3B8', fontSize: '0.74rem' }}>Questions Asked</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>{feedback.statistics.questionsAsked}</div>
                    </div>
                    <div style={{ background: 'rgba(5, 8, 22, 0.6)', padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ color: '#94A3B8', fontSize: '0.74rem' }}>Good Answers</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>{feedback.statistics.goodAnswersCount}</div>
                    </div>
                    <div style={{ background: 'rgba(5, 8, 22, 0.6)', padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ color: '#94A3B8', fontSize: '0.74rem' }}>Adaptive Follow-ups</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F59E0B', marginTop: '2px' }}>{feedback.statistics.adaptiveFollowupsCount}</div>
                    </div>
                    <div style={{ background: 'rgba(5, 8, 22, 0.6)', padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ color: '#94A3B8', fontSize: '0.74rem' }}>Topics Visited</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#A855F7', marginTop: '2px' }}>{feedback.statistics.topicsVisitedCount}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* 4. Competency Scorecard (5-Star Scale) */}
            {feedback.competencyScores && (
              <div style={{ background: 'rgba(16, 23, 40, 0.6)', borderRadius: '16px', padding: '18px 22px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} /> Competency Scorecard (5-Star Scale)
                  </h4>
                  <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#00E5FF' }}>
                    Average Score: {feedback.competencyScores.averageScore} / 5.0
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'Technical Understanding', score: feedback.competencyScores.technicalUnderstanding },
                    { label: 'Implementation', score: feedback.competencyScores.practicalImplementation },
                    { label: 'Architecture', score: feedback.competencyScores.systemDesignArchitecture },
                    { label: 'Trade-offs', score: feedback.competencyScores.tradeoffAnalysis },
                    { label: 'Communication', score: feedback.competencyScores.communicationQuality }
                  ].map((comp, idx) => (
                    <div key={idx} style={{ background: 'rgba(5, 8, 22, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', color: '#94A3B8', fontWeight: 600 }}>{comp.label}</span>
                      <span style={{ fontSize: '0.9rem', color: '#F59E0B', letterSpacing: '2px', fontWeight: 800 }}>
                        {getStarRating(comp.score)} <span style={{ fontSize: '0.78rem', color: '#FFFFFF', marginLeft: '4px' }}>({comp.score}/5)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Topic Performance Grid (5-Star Ratings) */}
            {feedback.topicPerformance && feedback.topicPerformance.length > 0 && (
              <div style={{ background: 'rgba(16, 23, 40, 0.6)', borderRadius: '16px', padding: '18px 22px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7DD3FC', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={16} /> Topic Performance Evaluation
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {feedback.topicPerformance.map((tp, idx) => (
                    <div key={idx} style={{ background: 'rgba(5, 8, 22, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>{tp.topic}</span>
                      <span style={{ fontSize: '0.9rem', color: '#F59E0B', letterSpacing: '2px' }}>{tp.stars}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Strengths & Weaknesses (Two Column Layout) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Evidence-Backed Strengths */}
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: '16px', padding: '18px 20px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#10B981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> Verified Evidence-Backed Strengths (Max 3)
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {feedback.strengths.map((str, idx) => (
                    <li key={idx} style={{ fontSize: '0.86rem', color: '#FFFFFF', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: '1.5' }}>
                      <span style={{ color: '#10B981', fontWeight: 800 }}>•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specific Missing-Concept Weaknesses */}
              <div style={{ background: 'rgba(245, 158, 11, 0.06)', borderRadius: '16px', padding: '18px 20px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#F59E0B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} /> Identified Missing Concepts & Gaps (Max 5)
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {feedback.gaps.map((gap, idx) => (
                    <li key={idx} style={{ fontSize: '0.86rem', color: '#FFFFFF', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: '1.5' }}>
                      <span style={{ color: '#F59E0B', fontWeight: 800 }}>•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* 7. Focused Growth Roadmap */}
            <div style={{ background: 'rgba(168, 85, 247, 0.06)', borderRadius: '16px', padding: '18px 20px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#A855F7', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRight size={16} /> Focused Weak-Area Growth Roadmap (Max 3)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {feedback.next.map((step, idx) => (
                  <div key={idx} style={{ background: 'rgba(16, 23, 40, 0.8)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.84rem', color: '#FFFFFF', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', color: '#A855F7' }}>
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
