import React from 'react';
import { Users, Code, Server, Cpu, Database, Sparkles, Zap, Activity, Layers, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const ArchitectureSection: React.FC = () => {
  const pipelineNodes = [
    { icon: Users, title: 'Candidate Profile', desc: 'Seniority scoring & history', color: '#7DD3FC' },
    { icon: Code, title: 'React Frontend', desc: '60fps SaaS glassmorphism UI', color: '#4F8CFF' },
    { icon: Server, title: 'Express Backend', desc: 'REST session orchestrator', color: '#38BDF8' },
    { icon: Cpu, title: 'Interview Engine', desc: '10-state state machine', color: '#00E5FF' },
    { icon: Database, title: 'Conversation Memory', desc: 'Multi-turn context tracking', color: '#818CF8' },
    { icon: Sparkles, title: 'Question Generator', desc: '4 runtime assertion guards', color: '#A855F7' },
    { icon: Zap, title: 'Groq LLM', desc: 'llama-3.1-8b inference', color: '#EC4899' },
    { icon: Activity, title: 'Response Evaluator', desc: 'Fast-path + LLM grading', color: '#F59E0B' },
    { icon: Layers, title: 'Competency Engine', desc: '1–5 scale 5-dimension scoring', color: '#10B981' },
    { icon: FileText, title: 'Executive Report', desc: 'Evidence-backed panel decision', color: '#34D399' }
  ];

  return (
    <section style={{ margin: '0 auto 60px auto', padding: '0 20px' }}>
      <div className="glass-card" style={{ padding: '40px 36px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SYSTEM PIPELINE ARCHITECTURE
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '6px' }}>
            Technical Component Flow
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginTop: '8px', maxWidth: '750px', margin: '8px auto 0 auto' }}>
            Decoupled orchestrator connecting state machine logic, conversation memory, and LLM inference.
          </p>
        </div>

        {/* Animated Connector Flow Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', alignItems: 'center' }}>
          {pipelineNodes.map((node, idx) => {
            const NodeIcon = node.icon;
            return (
              <React.Fragment key={idx}>
                <motion.div
                  whileHover={{ scale: 1.04, translateY: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'rgba(3, 7, 18, 0.85)',
                    border: `1px solid ${node.color}35`,
                    borderRadius: '16px',
                    padding: '18px 16px',
                    position: 'relative',
                    boxShadow: `0 8px 24px -10px ${node.color}25`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `${node.color}18`,
                      border: `1px solid ${node.color}40`,
                      color: node.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <NodeIcon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 900, color: node.color, letterSpacing: '0.05em' }}>
                        NODE 0{idx + 1}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                        {node.title}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: '1.4' }}>
                    {node.desc}
                  </p>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};
