// src/components/Chatbot.jsx — Interactive AI Tutor for LearnLoop GATE Prep
import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/chatService';
import '../styles/chatbot.css';

// Formats basic markdown elements: bold, bullet points, numbers, and code blocks
function renderFormattedMessage(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  lines.forEach((line, lineIdx) => {
    // Handle code fences ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${lineIdx}`}>
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Empty line spacer
    if (!line.trim()) {
      elements.push(<div key={`sp-${lineIdx}`} style={{ height: 6 }} />);
      return;
    }

    // Step or numbered list pattern (e.g., "1. Given Data:", "Step 1:")
    const stepMatch = line.match(/^(\d+\.|\bStep \d+:?)(.*)/i);
    if (stepMatch) {
      elements.push(
        <div key={`step-${lineIdx}`} style={{ marginBottom: 4 }}>
          <span className="ll-step-badge">{stepMatch[1]}</span>
          <span>{renderInlineStyles(stepMatch[2])}</span>
        </div>
      );
      return;
    }

    // Bullet point pattern
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
      const bulletContent = line.trim().replace(/^[-•*]\s+/, '');
      elements.push(
        <div key={`li-${lineIdx}`} style={{ display: 'flex', gap: 6, marginBottom: 3, paddingLeft: 6 }}>
          <span style={{ color: 'var(--ll-primary)' }}>•</span>
          <span>{renderInlineStyles(bulletContent)}</span>
        </div>
      );
      return;
    }

    // Regular line
    elements.push(
      <p key={`p-${lineIdx}`} style={{ margin: '0 0 6px 0' }}>
        {renderInlineStyles(line)}
      </p>
    );
  });

  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre key="code-final">
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }

  return elements;
}

// Inline formatting: **bold** and `code`
function renderInlineStyles(text) {
  if (!text) return '';
  const parts = [];
  // Tokenize by code backticks and bold markdown
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={match.index}>{token.slice(1, -1)}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

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

  // Retry last user message
  const handleRetry = () => {
    if (messages.length === 0) return;
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx !== -1) {
      const actualIdx = messages.length - 1 - lastUserIdx;
      const textToRetry = messages[actualIdx].content;
      // Truncate messages up to the last user message
      setMessages(messages.slice(0, actualIdx));
      handleSend(textToRetry);
    }
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
                  >
                    <span>💡</span> Explain Abram's Law simply
                  </button>
                  <button
                    className="ll-suggested-chip"
                    onClick={() => handleSend("What is the difference between Flash Set and False Set in cement hydration?")}
                  >
                    <span>⚡</span> Flash Set vs False Set
                  </button>
                  <button
                    className="ll-suggested-chip"
                    onClick={() => handleSend("Solve a step-by-step numerical for gel-space ratio given x = 0.89 and intrinsic strength 260 MPa.")}
                  >
                    <span>🔢</span> Solve a Gel-Space ratio numerical
                  </button>
                  <button
                    className="ll-suggested-chip"
                    onClick={() => handleSend("What are the IS 456 Table 5 maximum w/c limits for all 5 exposure conditions?")}
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
                  {m.role === 'user' ? m.content : renderFormattedMessage(m.content)}
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
                <button className="ll-retry-btn" onClick={handleRetry}>
                  Retry
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
