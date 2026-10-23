// src/components/academy/FinalExamView.jsx — Comprehensive Final Examination
import React, { useState } from 'react';
import { waterEngineeringCourse } from '../../data/courses/waterEngineeringCourse';
import { recordFinalExam, checkCertificateEligibility, saveIssuedCertificate } from '../../services/progressService';
import { generateCertificate } from '../../services/certificateService';
import FormattedContent from '../common/FormattedContent';
import '../../styles/academy.css';

export default function FinalExamView({
  user,
  dark,
  onBackToCourse,
  onBack,
  onViewCertificates,
  onComplete
}) {
  const course = waterEngineeringCourse;
  const exam = course?.finalExam;
  const questions = exam?.questions || [];
  const handleBack = () => {
    const fn = onBackToCourse || onBack;
    if (typeof fn === 'function') {
      try {
        fn();
      } catch (err) {
        console.error('Error in onBack callback:', err);
      }
    }
  };
  const handleCertificates = () => {
    const fn = onViewCertificates || onComplete;
    if (typeof fn === 'function') {
      try {
        fn();
      } catch (err) {
        console.error('Error in onViewCertificates callback:', err);
      }
    }
  };

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [unlockedCert, setUnlockedCert] = useState(null);

  const handleSelectOption = (qIdx, optIdx) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.ans) score += 1;
    });

    const res = recordFinalExam(user?.id, course.id, score, questions.length);
    setExamResult(res);
    setSubmitted(true);

    // Check if certificate eligibility is met
    const eligibility = checkCertificateEligibility(user?.id, course);
    if (eligibility.eligible) {
      const newCert = generateCertificate({
        userId: user?.id,
        studentName: user?.name,
        courseId: course.id,
        courseTitle: course.title,
        scorePct: res.percentage
      });
      saveIssuedCertificate(user?.id, newCert);
      setUnlockedCert(newCert);
    }
  };

  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="ll-academy-container">
      <div className="ll-breadcrumbs">
        <span className="ll-breadcrumb-link" onClick={handleBack}>← {course?.title || 'Course'}</span>
        <span>/</span>
        <span style={{ color: '#6366F1' }}>Comprehensive Final Examination</span>
      </div>

      <div style={{
        background: dark ? 'linear-gradient(135deg, #111827 0%, #1E1B4B 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
        border: '1px solid var(--ll-border, #1E293B)',
        borderRadius: 18,
        padding: '28px 32px',
        marginBottom: 28
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <span className="ll-tag ll-tag-primary">Final Exam</span>
          <span className="ll-tag ll-tag-accent">12 Comprehensive Questions</span>
          <span className="ll-tag ll-tag-warn">Passing Score: 70%</span>
        </div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, margin: '0 0 8px 0', color: dark ? '#FFFFFF' : '#0F172A' }}>
          {exam.title}
        </h1>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.6 }}>
          Covers all 6 course modules. Achieving ≥ 70% qualifies you for the official LearnLoop AI Course Completion Certificate.
        </p>
      </div>

      {/* Result Card */}
      {submitted && examResult && (
        <div style={{
          background: examResult.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `2px solid ${examResult.passed ? '#10B981' : '#EF4444'}`,
          borderRadius: 16,
          padding: '28px',
          marginBottom: 28,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 50, marginBottom: 8 }}>{examResult.passed ? '🏆' : '⚠️'}</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: examResult.passed ? '#10B981' : '#EF4444', margin: '0 0 8px 0' }}>
            {examResult.passed ? 'Final Examination Passed!' : 'Exam Score Below 70% Passing Standard'}
          </h2>
          <div style={{ fontSize: 20, fontWeight: 800, margin: '8px 0' }}>
            Score: {examResult.score} / {examResult.total} ({examResult.percentage}%)
          </div>

          {unlockedCert ? (
            <div style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid #6366F1',
              borderRadius: 12,
              padding: '16px 20px',
              maxWidth: 580,
              margin: '16px auto',
              color: '#E0E7FF'
            }}>
              <strong>🎉 Certificate Unlocked & Issued!</strong>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                Certificate ID: <code style={{ color: '#38BDF8', fontWeight: 700 }}>{unlockedCert.id}</code>
              </div>
              <button
                onClick={handleCertificates}
                style={{
                  marginTop: 12,
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                View & Download Official Certificate →
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 540, margin: '0 auto 16px auto' }}>
              {examResult.passed
                ? 'Great job on passing the final exam! Complete any remaining module assessments or lessons to unlock your certificate.'
                : 'Review the detailed question explanations below and retake the examination.'}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
            <button
              onClick={() => { setSelectedAnswers({}); setSubmitted(false); setExamResult(null); }}
              style={{
                background: 'transparent',
                color: '#818CF8',
                border: '1px solid #6366F1',
                borderRadius: 10,
                padding: '10px 20px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔄 Retake Exam
            </button>
            <button
              onClick={handleBack}
              style={{
                background: '#6366F1',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 22px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Back to Course →
            </button>
          </div>
        </div>
      )}

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {questions.map((q, qIdx) => {
          const chosen = selectedAnswers[qIdx];
          const isCorrect = chosen === q.ans;

          return (
            <div key={qIdx} style={{
              background: dark ? '#111827' : '#FFFFFF',
              border: '1px solid var(--ll-border, #1E293B)',
              borderRadius: 14,
              padding: '20px 24px'
            }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14, color: dark ? '#F1F5F9' : '#0F172A' }}>
                <span style={{ color: '#818CF8', marginRight: 8 }}>Q{qIdx + 1}.</span>
                <FormattedContent inline content={q.q} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(q.options || []).map((opt, optIdx) => {
                  const isOptSelected = chosen === optIdx;
                  let bg = dark ? 'rgba(255,255,255,0.02)' : '#F8FAFC';
                  let border = dark ? '#253352' : '#E2E8F0';

                  if (submitted) {
                    if (optIdx === q.ans) {
                      bg = 'rgba(16, 185, 129, 0.15)';
                      border = '#10B981';
                    } else if (isOptSelected && !isCorrect) {
                      bg = 'rgba(239, 68, 68, 0.15)';
                      border = '#EF4444';
                    }
                  } else if (isOptSelected) {
                    bg = 'rgba(99, 102, 241, 0.15)';
                    border = '#6366F1';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: `1px solid ${border}`,
                        background: bg,
                        cursor: submitted ? 'default' : 'pointer',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <span style={{ fontWeight: 700, width: 22, color: isOptSelected ? '#6366F1' : '#94A3B8' }}>
                        {['A','B','C','D'][optIdx]}.
                      </span>
                      <span style={{ color: dark ? '#E2E8F0' : '#1E293B' }}><FormattedContent inline content={opt} /></span>
                    </div>
                  );
                })}
              </div>

              {submitted && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(99, 102, 241, 0.08)',
                  fontSize: 12,
                  color: '#A5B4FC',
                  lineHeight: 1.5
                }}>
                  <strong>Explanation:</strong> <FormattedContent inline content={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '14px 40px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              opacity: allAnswered ? 1 : 0.4,
              boxShadow: '0 4px 20px rgba(16,185,129,0.4)'
            }}
          >
            {allAnswered ? 'Submit Final Examination 🎓' : `Answer all questions to submit (${Object.keys(selectedAnswers).length}/${questions.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
