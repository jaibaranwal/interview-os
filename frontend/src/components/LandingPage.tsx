import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Brain, Users, BookOpen, MessageSquare, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStartInterview: () => void;
  onOpenCandidateDrawer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInterview,
  onOpenCandidateDrawer
}) => {
  const scrollToIntelligenceFlow = () => {
    const el = document.getElementById('intelligence-flow-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. Hero Section */}
      <section style={{ textAlign: 'center', padding: '50px 20px 60px 20px', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Hackathon Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', marginBottom: '24px' }}>
            <Sparkles size={14} color="#00E5FF" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00E5FF', letterSpacing: '0.05em' }}>
              ADAPTIVE AI TECHNICAL INTERVIEW PLATFORM
            </span>
          </div>

          {/* Hero Main Heading */}
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: '1.1', color: '#FFFFFF', marginBottom: '20px' }}>
            Next-Gen AI Technical Interviewer <br />
            <span className="gradient-text">Engineered for Real Engineering Roles</span>
          </h1>

          {/* Subtitle Description */}
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94A3B8', maxWidth: '820px', margin: '0 auto 36px auto', lineHeight: '1.6' }}>
            Conduct realistic, evidence-grounded technical interviews using adaptive state machines, Groq LLM inference, 1–5 competency scoring, and executive hiring panel reports.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onStartInterview}
              style={{
                padding: '14px 32px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00E5FF 0%, #4F8CFF 100%)',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 0 30px rgba(0, 229, 255, 0.4)',
                cursor: 'pointer'
              }}
            >
              <span>Start Live Candidate Interview</span>
              <ArrowRight size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenCandidateDrawer}
              style={{
                padding: '14px 28px',
                borderRadius: '16px',
                background: 'rgba(16, 23, 40, 0.8)',
                border: '1px solid rgba(79, 140, 255, 0.3)',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Users size={18} color="#7DD3FC" />
              <span>Select Candidate Profile</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={scrollToIntelligenceFlow}
              style={{
                padding: '14px 24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View Intelligence Flow
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* 2. Animated Interview Journey Timeline Widget */}
      <section style={{ margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div className="glass-card" style={{ padding: '24px 32px', background: 'rgba(16, 23, 40, 0.7)', border: '1px solid rgba(79, 140, 255, 0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              INTERVIEW OS ADAPTIVE PIPELINE JOURNEY
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {[
              { step: '01', title: 'Greeting 👋', desc: 'Contextual intro & setup', color: '#7DD3FC' },
              { step: '02', title: 'Adaptive Questions 🎯', desc: 'Grounding in curriculum day', color: '#4F8CFF' },
              { step: '03', title: 'Follow-up Probing ⚡', desc: 'Progressive technical depth', color: '#00E5FF' },
              { step: '04', title: 'Competency Analysis 🧠', desc: '1–5 scale multi-turn scoring', color: '#A855F7' },
              { step: '05', title: 'Hiring Decision 🏆', desc: 'Evidence-backed panel report', color: '#10B981' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ translateY: -4 }}
                style={{
                  background: 'rgba(5, 8, 22, 0.7)',
                  border: `1px solid ${item.color}35`,
                  borderRadius: '14px',
                  padding: '16px',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: item.color, marginBottom: '4px' }}>
                  STEP {item.step}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROMPT 35 REFINEMENT: Interview Intelligence Flow Section */}
      <section id="intelligence-flow-section" style={{ margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div className="glass-card" style={{ padding: '40px 36px', background: 'rgba(16, 23, 40, 0.85)', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              REASONING ENGINE ARCHITECTURE
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>
              Interview Intelligence Flow
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginTop: '8px', maxWidth: '750px', margin: '8px auto 0 auto' }}>
              How InterviewOS reasons through a complete technical interview before making an evidence-backed hiring recommendation.
            </p>
          </div>

          {/* Flow Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { step: '01', title: 'Candidate Profile', desc: 'Initial candidate background & seniority scoring', color: '#7DD3FC' },
              { step: '02', title: 'Curriculum Analysis', desc: '31-day AI Cohort completed & skipped missions', color: '#38BDF8' },
              { step: '03', title: 'Adaptive Planning', desc: 'Deterministic topic selection prioritizing weak areas', color: '#4F8CFF' },
              { step: '04', title: 'Live Technical Interview', desc: 'State-machine driven adaptive question turns', color: '#00E5FF' },
              { step: '05', title: 'Conversation Memory', desc: 'Multi-turn tracking of strengths, mistakes, and answers', color: '#818CF8' },
              { step: '06', title: 'Dynamic Probing', desc: 'Progressive probing on good answers (basic → impl → trade-offs)', color: '#A855F7' },
              { step: '07', title: 'Evidence Collection', desc: 'Keyword verification & concept detection without false strengths', color: '#EC4899' },
              { step: '08', title: 'Competency Evaluation', desc: '1–5 scale scoring across Technical, Impl, Arch, Trade-offs, Comm', color: '#F59E0B' },
              { step: '09', title: 'Executive Recommendation', desc: 'Evidence-backed panel decision & 5-star topic ratings', color: '#10B981' }
            ].map((flowNode, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, translateY: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'rgba(5, 8, 22, 0.8)',
                  border: `1px solid ${flowNode.color}35`,
                  borderRadius: '16px',
                  padding: '20px 18px',
                  position: 'relative',
                  boxShadow: `0 8px 24px -10px ${flowNode.color}20`
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: flowNode.color, marginBottom: '6px' }}>
                  STAGE {flowNode.step}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                  {flowNode.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: '1.45' }}>
                  {flowNode.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROMPT 35 REQUIREMENT: 5 Premium Capability Cards */}
      <section style={{ margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF' }}>
            Core AI Intelligence Capabilities
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginTop: '6px' }}>
            Five foundational pillars powering InterviewOS autonomous technical evaluations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[
            {
              icon: Brain,
              title: 'Adaptive Reasoning',
              desc: 'Generates intelligent follow-up questions based on previous answers.',
              color: '#00E5FF'
            },
            {
              icon: BookOpen,
              title: 'Curriculum Awareness',
              desc: "Grounds every interview in the candidate's completed AI Cohort journey.",
              color: '#4F8CFF'
            },
            {
              icon: MessageSquare,
              title: 'Multi-turn Memory',
              desc: 'Maintains interview context, remembers strengths, mistakes, and previous answers.',
              color: '#A855F7'
            },
            {
              icon: ShieldCheck,
              title: 'Evidence-Based Evaluation',
              desc: 'Hiring decisions are generated from accumulated interview evidence rather than isolated responses.',
              color: '#10B981'
            },
            {
              icon: Award,
              title: 'Executive Hiring Report',
              desc: 'Produces competency scores, evidence-backed strengths, focused learning roadmap, and hiring recommendation.',
              color: '#F59E0B'
            }
          ].map((cap, idx) => {
            const CapIcon = cap.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ translateY: -4 }}
                className="glass-card"
                style={{
                  padding: '24px',
                  background: 'rgba(16, 23, 40, 0.75)',
                  border: `1px solid ${cap.color}30`
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: `${cap.color}15`,
                  border: `1px solid ${cap.color}35`,
                  color: cap.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <CapIcon size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                  {cap.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.6' }}>
                  {cap.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
