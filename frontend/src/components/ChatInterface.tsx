import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 230px)', minHeight: '520px' }}>
      <div className="glass-card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        background: 'rgba(10, 15, 30, 0.75)',
        border: '1px solid rgba(79, 140, 255, 0.15)'
      }}>

        {/* Scrollable Message Container */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isBot = msg.role === 'interviewer';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignSelf: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    width: 'auto'
                  }}
                >
                  {/* Interviewer Avatar */}
                  {isBot && (
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00E5FF 0%, #4F8CFF 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 0 16px rgba(0, 229, 255, 0.3)'
                    }}>
                      <Bot size={20} color="#FFFFFF" />
                    </div>
                  )}

                  {/* Message Card */}
                  <div style={{
                    background: isBot
                      ? 'rgba(16, 23, 42, 0.85)'
                      : 'linear-gradient(135deg, rgba(79, 140, 255, 0.2), rgba(0, 229, 255, 0.12))',
                    border: isBot
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 229, 255, 0.4)',
                    borderLeft: isBot ? '3px solid #00E5FF' : undefined,
                    borderRadius: isBot ? '4px 20px 20px 20px' : '20px 20px 4px 20px',
                    padding: '16px 22px',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    lineHeight: '1.65',
                    boxShadow: isBot
                      ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                      : '0 8px 24px rgba(0, 229, 255, 0.12)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                      gap: '12px'
                    }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: isBot ? '#00E5FF' : '#7DD3FC',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {isBot ? <Sparkles size={12} /> : <User size={12} />}
                        {isBot ? 'InterviewOS AI' : 'Candidate'}
                      </span>

                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                        {msg.timestamp}
                      </span>
                    </div>

                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: isBot ? '#F8FAFC' : '#FFFFFF' }}>
                      {msg.content}
                    </div>
                  </div>

                  {/* Candidate Avatar */}
                  {!isBot && (
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'rgba(79, 140, 255, 0.2)',
                      border: '1px solid rgba(79, 140, 255, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#4F8CFF'
                    }}>
                      <User size={20} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: '14px', alignItems: 'center', alignSelf: 'flex-start' }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00E5FF 0%, #4F8CFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0, 229, 255, 0.3)'
              }}>
                <Bot size={20} color="#FFFFFF" />
              </div>

              <div style={{
                background: 'rgba(16, 23, 42, 0.85)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                borderLeft: '3px solid #00E5FF',
                borderRadius: '4px 20px 20px 20px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#00E5FF' }}>
                  InterviewOS AI is evaluating & generating response
                </span>
                <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-typing-dot"
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#00E5FF',
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Modern Floating Composer (Input Area) */}
        <div style={{ padding: '16px 24px', background: 'rgba(5, 8, 22, 0.85)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{
              flex: 1,
              position: 'relative',
              borderRadius: '20px',
              background: 'rgba(16, 23, 40, 0.9)',
              border: '1px solid rgba(79, 140, 255, 0.3)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isComplete}
                placeholder={
                  isComplete
                    ? 'Interview session completed. Review the evaluation report.'
                    : 'Type your technical response... (Press Enter to send, Shift+Enter for new line)'
                }
                rows={1}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  resize: 'none',
                  maxHeight: '180px'
                }}
              />

              {/* Input Hints & Character Counter */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 18px 10px 18px',
                fontSize: '0.72rem',
                color: '#64748B'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CornerDownLeft size={12} /> Press <strong>Enter</strong> to send
                </span>
                <span>{input.length} chars</span>
              </div>
            </div>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || isLoading || isComplete}
              style={{
                height: '52px',
                width: '52px',
                borderRadius: '16px',
                background: !input.trim() || isLoading || isComplete
                  ? 'rgba(30, 41, 59, 0.5)'
                  : 'linear-gradient(135deg, #00E5FF 0%, #4F8CFF 100%)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: !input.trim() || isLoading || isComplete
                  ? 'none'
                  : '0 0 20px rgba(0, 229, 255, 0.4)',
                cursor: !input.trim() || isLoading || isComplete ? 'not-allowed' : 'pointer',
                opacity: !input.trim() || isLoading || isComplete ? 0.5 : 1,
                flexShrink: 0
              }}
            >
              <Send size={20} />
            </motion.button>
          </form>
        </div>

      </div>
    </div>
  );
};
