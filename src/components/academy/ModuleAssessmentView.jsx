// src/components/academy/ModuleAssessmentView.jsx — Outcome-Based Module Assessment
import React, { useState } from 'react';
import { waterEngineeringCourse } from '../../data/courses/waterEngineeringCourse';
import { recordModuleAssessment } from '../../services/progressService';
import FormattedContent from '../common/FormattedContent';
import '../../styles/academy.css';

export default function ModuleAssessmentView({
  module: propModule,
  moduleId,
  course: propCourse,
  user,
  dark,
  onBackToCourse,
  onBack,
  onComplete
}) {
  const course = propCourse || waterEngineeringCourse;
  const module = propModule || (course?.modules || []).find(m => m.id === moduleId) || course?.modules?.[0];
  const handleBack = () => {
    const fn = onBackToCourse || onBack;
    if (typeof fn === 'function') {
      try {
        fn();
      } catch (err) {
        console.error('Error in back callback:', err);
      }
    }
  };
  const assessment = module?.assessment;
  const questions = assessment?.questions || [];

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelectOption = (qIdx, optIdx) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.ans) {
        correctCount += 1;
      }
    });

    const res = recordModuleAssessment(user?.id, course?.id, module?.id, correctCount, questions.length);
    setResult(res);
    setSubmitted(true);
    if (onComplete) onComplete(res);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="ll-academy-container">
      <div className="ll-breadcrumbs">
        <span className="ll-breadcrumb-link" onClick={handleBack}>← {course?.title || 'Course Overview'}</span>
        <span>/</span>
        <span style={{ color: '#6366F1' }}>Unit {module?.unitNumber || ''} Assessment</span>
      </div>

      <div style={{
        background: dark ? '#111827' : '#FFFFFF',
        border: '1px solid var(--ll-border, #1E293B)',
        borderRadius: 18,
        padding: '28px 32px',
        marginBottom: 28
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <span className="ll-tag ll-tag-primary">Unit {module.unitNumber} Assessment</span>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Passing Threshold: 70%</span>
        </div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, margin: '0 0 8px 0', color: dark ? '#FFFFFF' : '#0F172A' }}>
          {assessment.title}
        </h1>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>
          Assesses course outcomes and syllabus mastery for {module.title}. Minimum score of 70% required for course certification.
        </p>
      </div>

      {/* Result Card when Submitted */}
      {submitted && result && (
        <div style={{
          background: result.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `2px solid ${result.passed ? '#10B981' : '#EF4444'}`,
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 28,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>{result.passed ? '🎉' : '⚠️'}</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: result.passed ? '#10B981' : '#EF4444', margin: '0 0 6px 0' }}>
            {result.passed ? 'Assessment Passed with Proficiency!' : 'Score Below 70% Passing Threshold'}
          </h2>
          <div style={{ fontSize: 18, fontWeight: 700, margin: '10px 0' }}>
            Score: {result.score} / {result.total} ({result.percentage}%)
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 540, margin: '0 auto 18px auto' }}>
            {result.passed
              ? 'Congratulations! This module requirement is fulfilled and recorded towards your official Certificate of Completion.'
              : 'Review the technical explanations below and the lesson notes before retaking the assessment.'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={handleRetake}
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
              🔄 Retake Assessment
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
              Back to Course Modules →
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
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
                        gap: 12,
                        transition: 'all 0.15s'
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

      {/* Submission CTA */}
      {!submitted && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '14px 36px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              opacity: allAnswered ? 1 : 0.4,
              boxShadow: '0 4px 18px rgba(99,102,241,0.4)'
            }}
          >
            {allAnswered ? 'Submit Unit Assessment 🎯' : `Answer all questions (${Object.keys(selectedAnswers).length}/${questions.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
