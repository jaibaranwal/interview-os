import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isComplete: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isComplete
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isComplete) return;
    onSendMessage(input);
    setInput('');
  };

  const quickSuggestions = [
    'On Day 7 Embeddings, I used Sentence Transformers to build 384-dimensional dense vectors.',
    'I implemented ChromaDB HNSW indexing with cosine similarity filtering.',
    'I structured system prompts with few-shot XML tags to prevent hallucination.',
    'Could you clarify the specific evaluation metric?'
  ];

  return (
    <div className="glass-card" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      height: 'calc(100vh - 220px)',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Messages Scroll View */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((msg) => {
          const isBot = msg.role === 'interviewer';

          return (
            <div
              key={msg.id}
              className="animate-fade-in"
              style={{
                display: 'flex',
                gap: '14px',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '85%'
              }}
            >
              {isBot && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f2fe, #7f00ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 12px rgba(0, 242, 254, 0.3)'
                }}>
                  <Bot size={20} color="#fff" />
                </div>
              )}

              <div style={{
                background: isBot ? 'rgba(30, 41, 59, 0.7)' : 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(127, 0, 255, 0.15))',
                border: isBot ? '1px solid var(--border-glass)' : '1px solid rgba(0, 242, 254, 0.4)',
                borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                padding: '16px 20px',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                boxShadow: isBot ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 242, 254, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isBot ? 'var(--accent-cyan)' : 'var(--accent-purple)', marginBottom: '6px' }}>
                  {isBot ? 'InterviewOS AI Interviewer' : 'Candidate Response'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textAlign: 'right', marginTop: '8px' }}>
                  {msg.timestamp}
                </div>
              </div>

              {!isBot && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={20} color="var(--text-main)" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '14px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f2fe, #7f00ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(0, 242, 254, 0.3)'
            }}>
              <Bot size={20} color="#fff" />
            </div>
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid var(--border-glass)',
              borderRadius: '4px 18px 18px 18px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}>
              <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>InterviewOS reasoning engine evaluating candidate turn...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Bar */}
      {!isComplete && (
        <div style={{ padding: '8px 24px', background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Sparkles size={12} color="var(--accent-amber)" /> Quick Response Suggestions:
          </span>
          {quickSuggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setInput(chip)}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '12px', background: 'rgba(15, 23, 42, 0.8)' }}>
        <input
          type="text"
          placeholder={isComplete ? "Interview complete. View performance report above." : "Type candidate response to interviewer..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading || isComplete}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-main)',
            fontSize: '0.95rem'
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isComplete}
          style={{
            padding: '0 24px',
            borderRadius: 'var(--radius-md)',
            background: !input.trim() || isLoading || isComplete
              ? 'rgba(148, 163, 184, 0.2)'
              : 'linear-gradient(135deg, #00f2fe 0%, #7f00ff 100%)',
            color: '#fff',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: !input.trim() || isLoading || isComplete ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: input.trim() && !isLoading ? '0 0 16px rgba(0, 242, 254, 0.4)' : 'none'
          }}
        >
          <span>Send</span>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
