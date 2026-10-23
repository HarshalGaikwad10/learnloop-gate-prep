// src/components/Chatbot.jsx — Interactive AI Tutor for LearnLoop GATE Prep
import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/chatService';
import FormattedContent from './common/FormattedContent';
import '../styles/chatbot.css';

export default function Chatbot({
  dark = true,
  user = null,
  activeContext = {},
  onNavigate = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [dismissedContext, setDismissedContext] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Reset dismissed context when context changes significantly
  useEffect(() => {
    setDismissedContext(false);
  }, [activeContext?.topicName, activeContext?.currentQuestion?.q, activeContext?.recentScore?.topic]);

  // Adjust textarea height dynamically
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  // Send message
  const handleSend = async (customText = null) => {
    const textToSend = typeof customText === 'string' ? customText.trim() : input.trim();
    if (!textToSend || loading) return;

    setError('');
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }

    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    const contextToSend = dismissedContext ? {} : activeContext;
    const res = await sendChatMessage(updatedMessages, contextToSend, abortCtrl.signal);

    if (!isMountedRef.current) return;

    if (res.error) {
      setError(res.error);
    } else if (res.reply) {
      const tutorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...updatedMessages, tutorMsg]);
    }

    setLoading(false);
  };

  // Keyboard navigation: Enter sends, Shift+Enter new line
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Retry last user message safely without state race conditions or duplicate entries
  const handleRetry = async () => {
    if (loading || messages.length === 0) return;
    setError('');

    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    const actualIdx = messages.length - 1 - lastUserIdx;

    // Preserve all messages up to and including the failed user query
    const targetMessages = messages.slice(0, actualIdx + 1);
    setMessages(targetMessages);

    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    const contextToSend = dismissedContext ? {} : activeContext;
    const res = await sendChatMessage(targetMessages, contextToSend, abortCtrl.signal);

    if (!isMountedRef.current) return;

    if (res.error) {
      setError(res.error);
    } else if (res.reply) {
      const tutorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...targetMessages, tutorMsg]);
    }

    setLoading(false);
  };

  // Reset conversation
  const handleReset = () => {
    if (messages.length > 0) {
      setShowConfirmReset(true);
    }
  };

  const confirmReset = () => {
    setMessages([]);
    setError('');
    setShowConfirmReset(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  };

  // Active context pill label
  const getContextLabel = () => {
    if (dismissedContext) return null;
    if (activeContext.currentQuestion) {
      return {
        tag: 'Test Question',
        text: activeContext.currentQuestion.q.slice(0, 42) + '...'
      };
    }
    if (activeContext.recentScore) {
      return {
        tag: 'Recent Result',
        text: `${activeContext.recentScore.topic} (${activeContext.recentScore.score}/${activeContext.recentScore.total})`
      };
    }
    if (activeContext.topicName) {
      return {
        tag: 'Topic',
        text: activeContext.topicName
      };
    }
    return null;
  };

  const contextLabel = getContextLabel();

  // Quick Action Chips
  const quickActions = [
    { label: '💡 Explain Simply', prompt: 'Could you explain this concept in very simple, easy-to-understand terms with an everyday analogy?' },
    { label: '🔍 Give Example', prompt: 'Could you give me a real-world civil engineering practical example of this?' },
    { label: '📐 Show Formula', prompt: 'What are the key formulas and IS code references related to this topic?' },
    { label: '🔢 Solve Step by Step', prompt: 'Could you solve this step by step, showing Given, Formula, Substitution, and Calculation with units?' },
    { label: '🎯 Quiz Me', prompt: 'Could you ask me a GATE-level practice question on this concept to test my understanding?' }
  ];

  return (
    <div className={`ll-chatbot-root ${dark ? 'dark' : 'light'}`} data-testid="chatbot-root">
      {/* ── Floating Launcher ── */}
      {!isOpen && (
        <button
          className="ll-chat-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open LearnLoop AI Tutor chat"
          data-testid="chat-launcher-btn"
        >
          <div className="ll-launcher-icon-wrap">
            <span className="ll-launcher-pulse" />
            <span style={{ fontSize: 18, zIndex: 1 }}>💬</span>
            <span className="ll-launcher-badge" />
          </div>
          <span>Ask AI Tutor</span>
        </button>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="ll-chat-panel" role="region" aria-label="LearnLoop AI Tutor panel" data-testid="chat-panel">
          {/* Header */}
          <div className="ll-chat-header">
            <div className="ll-header-left">
              <div className="ll-header-avatar">🎓</div>
              <div className="ll-header-info">
                <h3 className="ll-header-title">
                  LearnLoop AI Tutor
                  <span className="ll-header-status" title="Active" />
                </h3>
                <p className="ll-header-sub">GATE Civil Engineering Teacher</p>
              </div>
            </div>

            <div className="ll-header-actions">
              <button
                className="ll-icon-btn"
                onClick={handleReset}
                title="New conversation"
                aria-label="Start new conversation"
                data-testid="chat-reset-btn"
              >
                🔄
              </button>
              <button
                className="ll-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Minimize chat panel"
                data-testid="chat-close-btn"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Context pill if available */}
          {contextLabel && (
            <div className="ll-context-pill" data-testid="chat-context-pill">
              <div className="ll-context-pill-content">
                <span className="ll-context-tag">{contextLabel.tag}</span>
                <span title={contextLabel.text}>{contextLabel.text}</span>
              </div>
              <button
                className="ll-context-clear"
                onClick={() => setDismissedContext(true)}
                title="Dismiss context"
                aria-label="Dismiss active context"
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="ll-chat-messages" data-testid="chat-messages-container">
            {messages.length === 0 && (
              <div className="ll-welcome-box">
                <h4 className="ll-welcome-title">
                  Namaste {user?.name ? user.name : 'Engineer'}! 🙏
                </h4>
                <p className="ll-welcome-desc">
                  I am your 24/7 GATE Civil Engineering teacher. Ask me any conceptual doubt, request a step-by-step numerical solution, or explore IS codes together.
                </p>

                <div className="ll-suggested-prompts">
                  <button
                    className="ll-suggested-chip"
                    onClick={() => handleSend("Explain Abram's Law and why w/c ratio governs concrete strength.")}
                    disabled={loading}
                  >
                    <span>💡</span> Explain Abram's Law simply
                  </button>
                  <button
                    className="ll-suggested-chip"
                    onClick={() => handleSend("What is the difference between Flash Set and False Set in cement hydration?")}
                    disabled={loading}
                  >
                    <span>⚡</span> Flash Set vs False Set
                  </button>
                  <button
                    className="ll-suggested-chip"
                    onClick={() => handleSend("Solve a step-by-step numerical for gel-space ratio given x = 0.89 and intrinsic strength 260 MPa.")}
                    disabled={loading}
                  >
                    <span>🔢</span> Solve a Gel-Space ratio numerical
                  </button>
                  <button
                    className="ll-suggested-chip"
                    onClick={() => handleSend("What are the IS 456 Table 5 maximum w/c limits for all 5 exposure conditions?")}
                    disabled={loading}
                  >
                    <span>📘</span> IS 456 Table 5 Exposure limits
                  </button>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`ll-message-row ${m.role === 'user' ? 'user' : 'tutor'}`}
              >
                <div className="ll-message-bubble">
                  <FormattedContent content={m.content} />
                </div>
                {m.timestamp && <span className="ll-message-time">{m.timestamp}</span>}
              </div>
            ))}

            {loading && (
              <div className="ll-message-row tutor">
                <div className="ll-typing-indicator" aria-label="Tutor is thinking">
                  <span className="ll-typing-dot" />
                  <span className="ll-typing-dot" />
                  <span className="ll-typing-dot" />
                </div>
              </div>
            )}

            {error && (
              <div className="ll-error-banner" role="alert">
                <span>⚠️ {error}</span>
                <button
                  className="ll-retry-btn"
                  onClick={handleRetry}
                  disabled={loading}
                  data-testid="chat-retry-btn"
                >
                  {loading ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Bar */}
          <div className="ll-quick-actions-bar" aria-label="Quick response actions">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                className="ll-quick-chip"
                onClick={() => handleSend(qa.prompt)}
                disabled={loading}
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="ll-chat-input-area">
            <textarea
              ref={textareaRef}
              className="ll-chat-textarea"
              placeholder="Ask a civil engineering doubt... (Enter to send)"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              aria-label="Chat input message"
              data-testid="chat-input"
            />
            <button
              className="ll-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              data-testid="chat-send-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Confirmation Dialog for New Chat */}
          {showConfirmReset && (
            <div className="ll-confirm-overlay" role="dialog" aria-modal="true">
              <div className="ll-confirm-dialog">
                <h4 className="ll-confirm-title">Start New Conversation?</h4>
                <p className="ll-confirm-text">
                  Your current discussion and questions will be cleared.
                </p>
                <div className="ll-confirm-buttons">
                  <button
                    className="ll-confirm-btn cancel"
                    onClick={() => setShowConfirmReset(false)}
                  >
                    Keep Chat
                  </button>
                  <button
                    className="ll-confirm-btn confirm"
                    onClick={confirmReset}
                  >
                    Clear & Restart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
