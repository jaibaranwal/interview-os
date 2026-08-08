import React from 'react';
import { Cpu, Sparkles, ArrowRight, ShieldCheck, Target, Layers, Brain, Activity, Terminal, Users, Database, Code, FileText, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStartInterview: () => void;
  onOpenCandidateDrawer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInterview,
  onOpenCandidateDrawer
}) => {
  const scrollToArchitecture = () => {
    const el = document.getElementById('architecture-section');
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
              onClick={scrollToArchitecture}
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
              View System Architecture
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* 2. Task 4: Animated Interview Journey Timeline Widget */}
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

      {/* 3. Feature Cards Grid */}
      <section style={{ margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF' }}>
            Engineered for Industrial AI Technical Evaluation
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginTop: '6px' }}>
            Every component built to emulate senior principal interviewers at FAANG companies.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {[
            {
              icon: Target,
              title: 'Adaptive AI Interview Engine',
              desc: '10-state finite state machine with dynamic difficulty scaling, topic switching, and repeat-question intent handling.',
              color: '#00E5FF'
            },
            {
              icon: Layers,
              title: 'Real-time Competency Scoring',
              desc: 'Evaluates candidates across Technical Understanding, Practical Implementation, System Architecture, Trade-offs, and Communication.',
              color: '#4F8CFF'
            },
            {
              icon: ShieldCheck,
              title: 'Executive Hiring Dashboard',
              desc: 'Generates evidence-backed hiring reports with 5-star topic ratings, session statistics, and hiring panel decisions.',
              color: '#10B981'
            },
            {
              icon: Brain,
              title: 'Evidence-Based Evaluation',
              desc: 'Cumulative evidence weighting ensures later strong answers outweigh early uncertainty without inventing false strengths.',
              color: '#A855F7'
            },
            {
              icon: Activity,
              title: 'Curriculum-Aware Grounding',
              desc: 'Enforces strict day grounding and 4 runtime assertion guards to prevent topic leakage across 31 curriculum days.',
              color: '#F59E0B'
            },
            {
              icon: Terminal,
              title: 'Production SaaS Cockpit UI',
              desc: 'Built with React, Vite, Framer Motion, and dark obsidian glassmorphism for smooth 60fps presentation.',
              color: '#7DD3FC'
            }
          ].map((card, idx) => {
            const IconComp = card.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ translateY: -4 }}
                className="glass-card"
                style={{
                  padding: '24px',
                  background: 'rgba(16, 23, 40, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${card.color}15`,
                  border: `1px solid ${card.color}35`,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <IconComp size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.6' }}>
                  {card.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Task 2: Architecture Pipeline Section */}
      <section id="architecture-section" style={{ margin: '0 auto', padding: '0 20px' }}>
        <div className="glass-card" style={{ padding: '36px 32px', background: 'rgba(16, 23, 40, 0.85)', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              TECHNICAL SYSTEM ARCHITECTURE
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>
              End-to-End Autonomous AI Orchestration Pipeline
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { icon: Users, title: 'Candidate Profile', desc: 'Seniority scoring & mission history' },
              { icon: Code, title: 'React Frontend', desc: 'Floating composer & 60fps cockpit' },
              { icon: Cpu, title: 'Interview Engine', desc: '10-state state machine manager' },
              { icon: Database, title: 'Conversation Memory', desc: 'Multi-turn context & mistake tracking' },
              { icon: Sparkles, title: 'Question Generator', desc: '4 runtime assertion guards' },
              { icon: Zap, title: 'Groq LLM', desc: 'llama-3.1-8b-instant inference' },
              { icon: Activity, title: 'Response Evaluator', desc: 'Fast-path + LLM evaluation' },
              { icon: Layers, title: 'Competency Engine', desc: '1–5 scale 5-dimension scoring' },
              { icon: FileText, title: 'Executive Report', desc: 'Evidence-backed panel decision' }
            ].map((node, idx) => {
              const NodeIcon = node.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    background: 'rgba(5, 8, 22, 0.8)',
                    border: '1px solid rgba(79, 140, 255, 0.25)',
                    borderRadius: '14px',
                    padding: '18px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.15)', color: '#00E5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <NodeIcon size={16} />
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF' }}>{node.title}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: '1.4' }}>{node.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
