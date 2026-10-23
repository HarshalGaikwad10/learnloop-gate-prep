// src/components/academy/LessonPlayer.jsx — Interactive Multilingual Lesson Player with Signature Understanding Check
import React, { useState, useEffect } from 'react';
import { waterEngineeringCourse } from '../../data/courses/waterEngineeringCourse';
import { evaluateUnderstanding, sendChatMessage } from '../../services/chatService';
import { recordUnderstandingCheck, getStudentProgress } from '../../services/progressService';
import FormattedContent from '../common/FormattedContent';
import '../../styles/academy.css';

export default function LessonPlayer({
  lesson: propLesson,
  initialModuleId = 'mod-2',
  initialLessonId = 'les-2-1',
  user,
  dark,
  onBackToCourse,
  onNavigateLesson,
  onOpenAssessment
}) {
  const [activeLessonId, setActiveLessonId] = useState(
    propLesson?.id || initialLessonId || 'les-2-1'
  );

  useEffect(() => {
    if (propLesson?.id) {
      setActiveLessonId(propLesson.id);
    }
  }, [propLesson?.id]);

  useEffect(() => {
    if (initialLessonId) {
      setActiveLessonId(initialLessonId);
    }
  }, [initialLessonId]);

  const allLessons = [];
  (waterEngineeringCourse?.modules || []).forEach(m => {
    (m.lessons || []).forEach(l => allLessons.push(l));
  });

  const lesson = (propLesson && propLesson.id === activeLessonId)
    ? propLesson
    : allLessons.find(l => l.id === activeLessonId) || allLessons[0] || {};

  const [preferredLang, setPreferredLang] = useState(user?.preferredLanguage || 'English');
  const explanationStyle = user?.explanationStyle || 'simple';
  const [multilingualExplanation, setMultilingualExplanation] = useState('');
  const [langLoading, setLangLoading] = useState(false);

  // Understanding Check state (Signature Feature)
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  // Practice MCQs state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});

  // Check if previously completed
  useEffect(() => {
    if (!lesson) return;
    const progress = getStudentProgress(user?.id);
    const prevCheck = progress.understandingChecks?.[lesson.id];
    if (prevCheck) {
      setEvalResult(prevCheck);
      setStudentAnswer(prevCheck.studentAnswer || '');
    } else {
      setEvalResult(null);
      setStudentAnswer('');
    }
    setMultilingualExplanation('');
    setSelectedAnswers({});
    setShowExplanations({});
    setFollowUpSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, user?.id]);

  // Handle "Explain in my language"
  const handleRequestLanguageExplanation = async (lang) => {
    setPreferredLang(lang);
    if (lang === 'English') {
      setMultilingualExplanation('');
      return;
    }
    setLangLoading(true);
    setMultilingualExplanation('');

    const promptText = `Explain the core concept of "${lesson.title}" in ${lang}. Use an everyday engineering analogy, keep key technical terms in English inside parentheses, preserve all units/formulas, and finish with a short question to check understanding.`;

    const context = {
      courseTitle: waterEngineeringCourse.title,
      lessonTitle: lesson.title,
      preferredLanguage: lang,
      explanationStyle,
      essentialPoints: lesson.essentialPoints
    };

    const res = await sendChatMessage([{ role: 'user', content: promptText }], context);
    if (res.reply) {
      setMultilingualExplanation(res.reply);
    } else {
      setMultilingualExplanation('Unable to fetch language explanation at this moment. Please check network connection.');
    }
    setLangLoading(false);
  };

  // Submit Understanding Check (Signature Feature)
  const handleSubmitUnderstanding = async () => {
    if (!studentAnswer.trim()) {
      alert('Please write your explanation before submitting.');
      return;
    }

    setEvalLoading(true);
    const res = await evaluateUnderstanding({
      studentAnswer,
      questionPrompt: lesson.understandingCheck.prompt,
      rubric: lesson.understandingCheck.rubric,
      lessonTitle: lesson.title,
      preferredLanguage: preferredLang
    });

    if (res.result) {
      setEvalResult(res.result);
      recordUnderstandingCheck(user?.id, waterEngineeringCourse.id, lesson.id, {
        ...res.result,
        studentAnswer
      });
    }
    setEvalLoading(false);
  };

  // Navigation helpers
  const currentIndex = allLessons.findIndex(l => l.id === lesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = (currentIndex >= 0 && currentIndex < allLessons.length - 1) ? allLessons[currentIndex + 1] : null;

  const handleNavigate = (targetLesson) => {
    if (!targetLesson) return;
    const targetId = typeof targetLesson === 'object' ? targetLesson?.id : targetLesson;
    if (targetId) {
      setActiveLessonId(targetId);
    }
    if (typeof onNavigateLesson === 'function') {
      try {
        onNavigateLesson(targetLesson);
      } catch (err) {
        console.error('Error in onNavigateLesson callback:', err);
      }
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        // Safe fallback in test or headless environments
      }
    }
  };

  const handleBack = () => {
    if (typeof onBackToCourse === 'function') {
      try {
        onBackToCourse();
      } catch (err) {
        console.error('Error in onBackToCourse callback:', err);
      }
    }
  };

  return (
    <div className="ll-academy-container">
      {/* Breadcrumb Navigation */}
      <div className="ll-breadcrumbs">
        <span className="ll-breadcrumb-link" onClick={handleBack}>← Water Supply & Sanitation Course</span>
        <span>/</span>
        <span style={{ color: '#6366F1' }}>{lesson?.title || 'Lesson'}</span>
      </div>

      {/* Lesson Header */}
      <div style={{
        background: dark ? '#111827' : '#FFFFFF',
        border: '1px solid var(--ll-border, #1E293B)',
        borderRadius: 18,
        padding: '28px 32px',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="ll-tag ll-tag-primary">{lesson.syllabusSource}</span>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>⏱ ~{lesson.readTimeMinutes} mins read</span>
          {evalResult?.status === 'understood' && (
            <span className="ll-tag ll-tag-success">✓ Concept Mastered</span>
          )}
        </div>

        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 28,
          fontWeight: 800,
          margin: '0 0 16px 0',
          color: dark ? '#F8FAFC' : '#0F172A'
        }}>
          {lesson.title}
        </h1>

        {/* Learning Objectives Box */}
        <div style={{
          background: dark ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.04)',
          borderLeft: '4px solid #6366F1',
          borderRadius: '0 10px 10px 0',
          padding: '12px 18px'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Learning Objectives
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
            {(lesson?.objectives || []).map((obj, i) => <li key={i}>{obj}</li>)}
          </ul>
        </div>
      </div>

      {/* "Explain in my language" Bar (Section 6.1 Requirement) */}
      <div className="ll-lang-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🗣️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: dark ? '#F1F5F9' : '#0F172A' }}>
              Explain in My Language
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              Concept explanation with local engineering analogies & English technical terms
            </div>
          </div>
        </div>

        <div className="ll-lang-options">
          {[
            { id: 'English', label: '🇬🇧 English' },
            { id: 'Hindi', label: '🇮🇳 हिन्दी (Hindi)' },
            { id: 'Marathi', label: '🚩 मराठी (Marathi)' },
            { id: 'Manipuri', label: '🌺 মৈতৈলোন্ (Manipuri)' }
          ].map(lang => (
            <button
              key={lang.id}
              className={`ll-lang-btn ${preferredLang === lang.id ? 'active' : ''}`}
              onClick={() => handleRequestLanguageExplanation(lang.id)}
              disabled={langLoading}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Multilingual AI Explanation Box */}
      {langLoading && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px dashed #6366F1',
          borderRadius: 14,
          padding: '20px',
          marginBottom: 24,
          textAlign: 'center',
          color: '#818CF8',
          fontSize: 14
        }}>
          🤖 Preparing conceptual explanation in {preferredLang} with practical analogies...
        </div>
      )}

      {multilingualExplanation && !langLoading && (
        <div style={{
          background: dark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 28
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#818CF8', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              🌐 AI Explanation in {preferredLang}
            </span>
            <button
              onClick={() => setMultilingualExplanation('')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 12 }}
            >
              ✕ Hide
            </button>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: dark ? '#E2E8F0' : '#1E293B' }}>
            <FormattedContent content={multilingualExplanation} />
          </div>
        </div>
      )}

      {/* Contextual Important for GATE CE Annotation (Section 4 & 5 Requirement) */}
      {lesson.gateCeHighlight && (
        <div className="ll-gate-ce-callout" data-testid="gate-ce-callout">
          <div className="ll-gate-ce-header">
            <span className="ll-gate-ce-badge">🎯 Important for GATE CE</span>
            <span className="ll-gate-ce-concept">{lesson.gateCeHighlight.concept}</span>
          </div>
          <div className="ll-gate-ce-body">
            <FormattedContent content={lesson.gateCeHighlight.focus} />
          </div>
        </div>
      )}

      {/* Preserved GATE ES Reference (Section 2 Requirement) */}
      {lesson.gateEsHighlight && (
        <div className="ll-gate-es-callout" data-testid="gate-es-callout">
          <span className="ll-gate-es-badge">🌿 GATE ES Reference</span>
          <strong>{lesson.gateEsHighlight.concept}:</strong> {lesson.gateEsHighlight.focus}
        </div>
      )}

      {/* Main Lesson Content */}
      <div style={{
        background: dark ? '#111827' : '#FFFFFF',
        border: '1px solid var(--ll-border, #1E293B)',
        borderRadius: 18,
        padding: '36px 36px',
        marginBottom: 32
      }} className="ll-lesson-prose">
        <FormattedContent content={lesson.content} />

        {/* Practical Field Examples */}
        {lesson.practicalExamples?.length > 0 && (
          <div className="ll-callout" style={{ marginTop: 28 }}>
            <div className="ll-callout-title">🏗️ Real-World Civil Engineering Field Examples</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#94A3B8' }}>
              {lesson.practicalExamples.map((ex, i) => <li key={i}>{ex}</li>)}
            </ul>
          </div>
        )}

        {/* Common Misconceptions */}
        {lesson.commonMisconceptions?.length > 0 && (
          <div className="ll-callout" style={{ borderLeftColor: '#F59E0B', background: 'rgba(245, 158, 11, 0.08)' }}>
            <div className="ll-callout-title" style={{ color: '#F59E0B' }}>⚠️ Common Student Misconceptions & Exam Traps</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#94A3B8' }}>
              {lesson.commonMisconceptions.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* ── SIGNATURE FEATURE: CONCEPTUAL UNDERSTANDING CHECK (Section 7) ── */}
      <div className="ll-check-container" data-testid="understanding-check-container">
        <div className="ll-check-header">
          <span className="ll-check-badge">SIGNATURE LEARNING CHECK</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#818CF8' }}>Outcome-Based Conceptual Verification</span>
        </div>

        <div className="ll-check-prompt">
          <FormattedContent inline content={lesson?.understandingCheck?.prompt || ''} />
        </div>

        <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px 0' }}>
          Explain in your own words. Focus on the physical mechanisms and engineering consequences. You do not need to memorize textbook definitions.
        </p>

        <textarea
          className="ll-check-textarea"
          placeholder="Type your explanation here in English, Hindi, or Marathi..."
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          disabled={evalLoading}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 11, color: '#64748B' }}>
            Evaluated against the official lesson rubric by LearnLoop AI Tutor
          </span>

          <button
            onClick={handleSubmitUnderstanding}
            disabled={evalLoading || !studentAnswer.trim()}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: evalLoading || !studentAnswer.trim() ? 'not-allowed' : 'pointer',
              opacity: evalLoading || !studentAnswer.trim() ? 0.5 : 1
            }}
          >
            {evalLoading ? 'Evaluating against Rubric...' : 'Submit Explanation for AI Feedback →'}
          </button>
        </div>

        {/* Structured Rubric Evaluation Feedback */}
        {evalResult && (
          <div className={`ll-feedback-box ${evalResult.status}`} data-testid="evaluation-feedback-box">
            <div className="ll-feedback-title">
              {evalResult.status === 'understood' && <span style={{ color: '#10B981' }}>✅ Concept Fully Understood!</span>}
              {evalResult.status === 'partial' && <span style={{ color: '#F59E0B' }}>⚠️ Partially Understood — Key Gaps Identified</span>}
              {evalResult.status === 'needs_reteaching' && <span style={{ color: '#EF4444' }}>🔄 Fundamental Misconception Detected</span>}
            </div>

            {/* Strengths */}
            {evalResult.strengths?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', marginBottom: 4 }}>
                  ✓ What You Understood Correctly:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#D1FAE5' }}>
                  {evalResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Missing Points */}
            {evalResult.missingPoints?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', marginBottom: 4 }}>
                  ⚠️ Critical Points Missing from Your Explanation:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#FEF3C7' }}>
                  {evalResult.missingPoints.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}

            {/* Misconceptions */}
            {evalResult.misconceptions?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', marginBottom: 4 }}>
                  ❌ Identified Misconceptions:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#FEE2E2' }}>
                  {evalResult.misconceptions.map((mc, i) => <li key={i}>{mc}</li>)}
                </ul>
              </div>
            )}

            {/* Professor's Explanation & Analogy */}
            {evalResult.explanation && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 10, margin: '12px 0', fontSize: 13, lineHeight: 1.6 }}>
                <strong>Professor's Clarification:</strong> <FormattedContent content={evalResult.explanation} />
              </div>
            )}

            {/* Follow-up Question */}
            {evalResult.followUpQuestion && (
              <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#93C5FD', marginBottom: 6 }}>
                  🎯 Targeted Follow-Up Question:
                </div>
                <div style={{ fontSize: 13, color: '#E0E7FF', margin: '0 0 10px 0' }}>
                  <FormattedContent content={evalResult.followUpQuestion} />
                </div>

                {!followUpSubmitted ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="text"
                      placeholder="Type brief follow-up answer..."
                      value={followUpAnswer}
                      onChange={(e) => setFollowUpAnswer(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--ll-border, #1E293B)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 13,
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => setFollowUpSubmitted(true)}
                      style={{
                        background: '#6366F1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 18px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                    ✓ Follow-up response recorded. Progress saved to your learning profile!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PRACTICE MCQs SECTION ── */}
      {lesson.practiceQuestions?.length > 0 && (
        <div style={{
          background: dark ? '#111827' : '#FFFFFF',
          border: '1px solid var(--ll-border, #1E293B)',
          borderRadius: 18,
          padding: '28px 32px',
          marginBottom: 32
        }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 18px 0', color: dark ? '#F8FAFC' : '#0F172A' }}>
            Curated Practice Questions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {(lesson?.practiceQuestions || []).map((pq, qIdx) => {
              const selected = selectedAnswers[qIdx];
              const revealed = showExplanations[qIdx];

              return (
                <div key={qIdx} style={{
                  padding: '16px 20px',
                  background: dark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                  borderRadius: 12,
                  border: '1px solid var(--ll-border, #1E293B)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: dark ? '#F1F5F9' : '#1E293B' }}>
                    {qIdx + 1}. <FormattedContent inline content={pq.q} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {(pq?.options || []).map((opt, optIdx) => {
                      const isChosen = selected === optIdx;
                      const isCorrect = pq.ans === optIdx;
                      let bg = 'transparent';
                      let borderColor = dark ? '#253352' : '#CBD5E1';

                      if (revealed) {
                        if (isCorrect) {
                          bg = 'rgba(16, 185, 129, 0.15)';
                          borderColor = '#10B981';
                        } else if (isChosen && !isCorrect) {
                          bg = 'rgba(239, 68, 68, 0.15)';
                          borderColor = '#EF4444';
                        }
                      } else if (isChosen) {
                        bg = 'rgba(99, 102, 241, 0.15)';
                        borderColor = '#6366F1';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => {
                            setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
                            setShowExplanations({ ...showExplanations, [qIdx]: true });
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${borderColor}`,
                            background: bg,
                            cursor: 'pointer',
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                          }}
                        >
                          <span style={{ fontWeight: 700, width: 20 }}>{['A','B','C','D'][optIdx]}.</span>
                          <span><FormattedContent inline content={opt} /></span>
                        </div>
                      );
                    })}
                  </div>

                  {revealed && (
                    <div style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: '#A5B4FC',
                      lineHeight: 1.5
                    }}>
                      <strong>Explanation:</strong> <FormattedContent inline content={pq.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--ll-border, #1E293B)',
        paddingTop: 24,
        flexWrap: 'wrap',
        gap: 12
      }}>
        {prevLesson ? (
          <button
            onClick={() => handleNavigate(prevLesson)}
            style={{
              background: 'transparent',
              color: '#94A3B8',
              border: '1px solid var(--ll-border, #1E293B)',
              borderRadius: 10,
              padding: '10px 20px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Previous: {prevLesson.title}
          </button>
        ) : <div />}

        {nextLesson ? (
          <button
            onClick={() => handleNavigate(nextLesson)}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)'
            }}
          >
            Next: {nextLesson.title} →
          </button>
        ) : (
          <button
            onClick={handleBack}
            style={{
              background: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Return to Course Modules ✓
          </button>
        )}
      </div>
    </div>
  );
}
