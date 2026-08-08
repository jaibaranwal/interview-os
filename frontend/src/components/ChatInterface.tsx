import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isComplete: boolean;
}

// Typing indicator dots animation
const TypingIndicator: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
            opacity: 0.7,
            animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`
          }}
        />
      ))}
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isComplete
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-focus the input when loading finishes
  useEffect(() => {
    if (!isLoading && !isComplete) {
      inputRef.current?.focus();
    }
  }, [isLoading, isComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage();
  };

  const submitMessage = () => {
    if (!input.trim() || isLoading || isComplete) return;
    onSendMessage(input.trim());
    setInput('');
  };

  // Enter sends; Shift+Enter inserts newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <>
      {/* Typing indicator keyframes injected inline once */}
      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div className="glass-card" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        height: 'calc(100vh - 240px)',
        minHeight: '460px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Messages Scroll View */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {messages.map((msg) => {
            const isBot = msg.role === 'interviewer';

            return (
              <div
                key={msg.id}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '84%'
                }}
              >
                {isBot && (
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00f2fe, #7f00ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 10px rgba(0,242,254,0.25)'
                  }}>
                    <Bot size={18} color="#fff" />
                  </div>
                )}

                <div style={{
                  background: isBot ? 'rgba(30, 41, 59, 0.7)' : 'linear-gradient(135deg, rgba(0,242,254,0.12), rgba(127,0,255,0.12))',
                  border: isBot ? '1px solid var(--border-glass)' : '1px solid rgba(0,242,254,0.35)',
                  borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  padding: '14px 18px',
                  color: 'var(--text-main)',
                  fontSize: '0.93rem',
                  lineHeight: '1.65',
                  boxShadow: isBot ? '0 4px 16px rgba(0,0,0,0.18)' : '0 4px 16px rgba(0,242,254,0.08)'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isBot ? 'var(--accent-cyan)' : 'var(--accent-purple)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isBot ? 'Interviewer' : 'You'}
                  </div>
                  {/* Preserve whitespace/newlines in responses */}
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-subtle)', textAlign: 'right', marginTop: '6px' }}>
                    {msg.timestamp}
                  </div>
                </div>

                {!isBot && (
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(148,163,184,0.15)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={18} color="var(--text-muted)" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator — natural "thinking" state */}
          {isLoading && (
            <div className="animate-fade-in" style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f2fe, #7f00ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0,242,254,0.25)'
              }}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid var(--border-glass)',
                borderRadius: '4px 16px 16px 16px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.85)',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={
                isComplete
                  ? 'Interview complete — view your performance report above'
                  : isLoading
                  ? 'Interviewer is thinking...'
                  : 'Type your response here… (Enter to send, Shift+Enter for new line)'
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-grow: reset height then set to scrollHeight
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isComplete}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${input.trim() ? 'rgba(0,242,254,0.4)' : 'var(--border-glass)'}`,
                color: 'var(--text-main)',
                fontSize: '0.93rem',
                resize: 'none',
                lineHeight: '1.5',
                maxHeight: '140px',
                overflowY: 'auto',
                transition: 'border-color 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>
          <button
            type="submit"
            id="send-button"
            aria-label="Send message"
            disabled={!input.trim() || isLoading || isComplete}
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: !input.trim() || isLoading || isComplete
                ? 'rgba(148,163,184,0.15)'
                : 'linear-gradient(135deg, #00f2fe 0%, #7f00ff 100%)',
              color: '#fff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: !input.trim() || isLoading || isComplete ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: input.trim() && !isLoading ? '0 0 14px rgba(0,242,254,0.3)' : 'none',
              flexShrink: 0,
              height: '46px'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
};
