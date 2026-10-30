// src/components/academy/CourseOverview.jsx — Authoritative Course Details & Curriculum Map
import React, { useState } from 'react';
import { waterEngineeringCourse } from '../../data/courses/waterEngineeringCourse';
import { isLessonCompleted, checkCertificateEligibility } from '../../services/progressService';
import FormattedContent from '../common/FormattedContent';
import '../../styles/academy.css';

export default function CourseOverview({
  user,
  dark = true,
  course: propCourse,
  onBackToCatalogue,
  onSelectCourse,
  onSelectLesson,
  onStartModuleAssessment,
  onTakeAssessment,
  onStartFinalExam,
  onTakeFinalExam,
  onViewCertificates
}) {
  const course = propCourse || waterEngineeringCourse;
  const isDemo = Boolean(course?.isDemo);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState(0);

  // Real progress eligibility only applies to active pilot course
  const eligibility = !isDemo
    ? checkCertificateEligibility(user?.id, course)
    : { overallProgressPct: 0, completedLessonsCount: 0, totalLessons: 0, modulesPassed: 0 };

  const handleStartAssessment = onStartModuleAssessment || onTakeAssessment;
  const handleStartExam = onStartFinalExam || onTakeFinalExam;

  return (
    <div className="ll-academy-container" style={{ paddingBottom: 60 }}>
      {/* Breadcrumb / Back to Catalogue */}
      {onBackToCatalogue && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={onBackToCatalogue}
            id="back-to-catalogue-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818CF8',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 0',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span>←</span> Back to Civil Engineering Catalogue
          </button>
        </div>
      )}

      {/* Demo Course Notice Banner (if showcase course) */}
      {isDemo && (
        <div
          style={{
            background: dark
              ? 'rgba(245, 158, 11, 0.1)'
              : '#FEF3C7',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 14,
            padding: '14px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <span style={{ fontSize: 24, lineHeight: 1 }}>🧪</span>
          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: dark ? '#FDE68A' : '#92400E' }}>
            <strong style={{ display: 'block', marginBottom: 2, fontSize: 14 }}>
              Demonstration & Curriculum Preview
            </strong>
            This course is part of the LearnLoop AI Civil Engineering showcase catalogue for curriculum mapping and GATE syllabus demonstration. Full interactive lessons, AI tutor checkpoints, and accredited certification are active in our pilot course:{' '}
            <button
              onClick={() => onSelectCourse && onSelectCourse(waterEngineeringCourse)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6366F1',
                textDecoration: 'underline',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
                fontSize: 'inherit',
              }}
            >
              Water Supply, Sanitation and Environmental Engineering →
            </button>
          </div>
        </div>
      )}

      {/* Course Header Banner */}
      <div
        className="ll-overview-hero"
        style={{
          background: dark
            ? 'linear-gradient(135deg, #111827 0%, #1E1B4B 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
          border: '1px solid var(--ll-border, #1E293B)',
          borderRadius: 20,
          padding: '36px 32px',
          marginBottom: 32,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <span className="ll-tag ll-tag-primary">Course Code: {course.code}</span>
          <span className="ll-tag ll-tag-accent">{course.plannedHours || 42} Planned Core Hours</span>
          {isDemo ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#F59E0B',
                background: dark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '3px 8px',
                borderRadius: 6,
              }}
            >
              Curriculum Preview Mode
            </span>
          ) : (
            <span className="ll-tag ll-tag-success">Outcome-Based Certificate</span>
          )}
        </div>

        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 32,
            fontWeight: 800,
            margin: '0 0 12px 0',
            color: dark ? '#FFFFFF' : '#0F172A',
            lineHeight: 1.25,
          }}
        >
          <FormattedContent inline content={course.title} />
        </h1>

        <p
          style={{
            fontSize: 15,
            color: dark ? '#CBD5E1' : '#334155',
            maxWidth: 820,
            lineHeight: 1.7,
            margin: '0 0 24px 0',
          }}
        >
          <FormattedContent inline content={course.description || course.shortDescription} />
        </p>

        {/* Progress Bar (Only for non-demo pilot course) */}
        {!isDemo && (
          <div
            style={{
              background: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
              border: dark ? 'none' : '1px solid #CBD5E1',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 24,
              maxWidth: 640,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                fontWeight: 700,
                color: dark ? '#F1F5F9' : '#0F172A',
                marginBottom: 8,
              }}
            >
              <span>Overall Curriculum Progress</span>
              <span style={{ color: '#6366F1' }}>{eligibility.overallProgressPct}%</span>
            </div>
            <div className="ll-progress-track">
              <div
                className="ll-progress-bar"
                style={{ width: `${eligibility.overallProgressPct}%` }}
              />
            </div>
            <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', marginTop: 6 }}>
              {eligibility.completedLessonsCount} of {eligibility.totalLessons} lessons completed · {eligibility.modulesPassed} of 6 module assessments passed
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {!isDemo ? (
            <>
              <button
                onClick={() => {
                  const targetLesson =
                    course?.modules?.[1]?.lessons?.[0] || course?.modules?.[0]?.lessons?.[0];
                  if (targetLesson && onSelectLesson) onSelectLesson(targetLesson);
                }}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                }}
              >
                🚀 Explore Module 2: Water Treatment (Featured) →
              </button>

              <button
                onClick={onViewCertificates}
                style={{
                  background: 'transparent',
                  color: dark ? '#CBD5E1' : '#475569',
                  border: '1px solid var(--ll-border, #1E293B)',
                  borderRadius: 12,
                  padding: '14px 24px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🏆 Certificate Criteria & Verification
              </button>
            </>
          ) : (
            <>
              {Array.isArray(course?.sampleQuiz) && course.sampleQuiz.length > 0 && (
                <button
                  onClick={() => setShowQuizPreview(!showQuizPreview)}
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '14px 26px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>📝</span> {showQuizPreview ? 'Hide Sample GATE Quiz' : 'Preview Sample GATE Quiz (3 Questions)'}
                </button>
              )}

              <button
                onClick={() => onSelectCourse && onSelectCourse(waterEngineeringCourse)}
                style={{
                  background: 'transparent',
                  color: dark ? '#CBD5E1' : '#475569',
                  border: '1px solid var(--ll-border, #1E293B)',
                  borderRadius: 12,
                  padding: '14px 24px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                💧 Open Active Pilot Course (Water Supply) →
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sample Quiz Preview Drawer (For Demo Courses) */}
      {isDemo && showQuizPreview && Array.isArray(course?.sampleQuiz) && (
        <div
          style={{
            background: dark ? '#111827' : '#FFFFFF',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 32,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              borderBottom: `1px solid ${dark ? '#1E293B' : '#E2E8F0'}`,
              paddingBottom: 12,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#818CF8',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Sample GATE Examination Preview
              </span>
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  margin: '4px 0 0 0',
                  color: dark ? '#F1F5F9' : '#0F172A',
                }}
              >
                {course.title} — Conceptual Question {activeQuizQuestionIdx + 1} of {course.sampleQuiz.length}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {course.sampleQuiz.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuizQuestionIdx(idx)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: 'none',
                    background: activeQuizQuestionIdx === idx
                      ? '#6366F1'
                      : dark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.05)',
                    color: activeQuizQuestionIdx === idx ? '#FFFFFF' : '#94A3B8',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Question Content */}
          {course.sampleQuiz[activeQuizQuestionIdx] && (
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: dark ? '#F1F5F9' : '#0F172A',
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                <FormattedContent content={course.sampleQuiz[activeQuizQuestionIdx].question} />
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {course.sampleQuiz[activeQuizQuestionIdx].options.map((opt, oIdx) => {
                  const isCorrect = oIdx === course.sampleQuiz[activeQuizQuestionIdx].answer;
                  return (
                    <div
                      key={oIdx}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        border: isCorrect
                          ? '1px solid rgba(16, 185, 129, 0.5)'
                          : dark
                          ? '1px solid #1E293B'
                          : '1px solid #E2E8F0',
                        background: isCorrect
                          ? dark
                            ? 'rgba(16, 185, 129, 0.08)'
                            : '#ECFDF5'
                          : dark
                          ? 'rgba(255,255,255,0.02)'
                          : '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 13,
                        color: dark ? '#CBD5E1' : '#334155',
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: isCorrect ? '#10B981' : dark ? '#334155' : '#CBD5E1',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {isCorrect && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#10B981',
                            background: dark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5',
                            padding: '2px 8px',
                            borderRadius: 4,
                          }}
                        >
                          ✓ Key Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation / GATE insight */}
              <div
                style={{
                  background: dark ? 'rgba(99, 102, 241, 0.08)' : '#EEF2FF',
                  borderLeft: '3px solid #6366F1',
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 16px',
                  fontSize: 12.5,
                  color: dark ? '#CBD5E1' : '#334155',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: '#818CF8' }}>💡 GATE Civil Engineering Insight:</strong>
                <div style={{ marginTop: 4 }}>
                  <FormattedContent content={course.sampleQuiz[activeQuizQuestionIdx].explanation} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Syllabus Alignment & Learning Outcomes Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          marginBottom: 36,
        }}
      >
        {/* Card 1: Core Curriculum / Learning Outcomes */}
        <div
          style={{
            background: dark ? '#111827' : '#FFFFFF',
            border: '1px solid var(--ll-border, #1E293B)',
            borderRadius: 16,
            padding: '24px 26px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>🏛️</span>
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                margin: 0,
                color: dark ? '#F1F5F9' : '#0F172A',
              }}
            >
              {isDemo ? 'Course Learning Outcomes (CLOs)' : 'Core Civil Engineering Curriculum'}
            </h3>
          </div>

          {isDemo && Array.isArray(course?.learningOutcomes) ? (
            <div>
              <p style={{ fontSize: 13, color: dark ? '#CBD5E1' : '#334155', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                Key pedagogical competencies mapped for Indian university undergraduate curricula:
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: dark ? '#CBD5E1' : '#334155', lineHeight: 1.8 }}>
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx}>
                    <FormattedContent inline content={outcome} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: dark ? '#CBD5E1' : '#334155', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                Structured for undergraduate Civil Engineering students across Indian colleges and universities. 6 comprehensive modules with 42 hours of structured municipal water supply and sanitation principles:
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: dark ? '#CBD5E1' : '#334155', lineHeight: 1.8 }}>
                <li>Basics of Water Supply & Population Forecasting (IS 1172 & CPHEEO)</li>
                <li>Physical & Chemical Water Treatment Units</li>
                <li>Water Distribution & Pipe Network Analysis</li>
                <li>Sewage Quantity, Sewer Hydraulics & Streeter-Phelps Kinetics</li>
                <li>Primary & Secondary Biological Wastewater Treatment (ASP, Trickling Filters)</li>
                <li>Tertiary Treatment & Anaerobic Sludge Digestion</li>
              </ul>
            </div>
          )}
        </div>

        {/* Card 2: GATE CE Integration */}
        <div
          style={{
            background: dark ? '#111827' : '#FFFFFF',
            border: '1px solid var(--ll-border, #1E293B)',
            borderRadius: 16,
            padding: '24px 26px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>🎯</span>
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                margin: 0,
                color: dark ? '#F1F5F9' : '#0F172A',
              }}
            >
              {isDemo ? 'Unified GATE CE Syllabus Integration' : 'Unified GATE CE & GATE ES Integration'}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: dark ? '#CBD5E1' : '#334155', lineHeight: 1.6, margin: '0 0 14px 0' }}>
            {isDemo
              ? 'Curriculum aligned with standard Indian higher education requirements and contextual GATE examination sections:'
              : 'Contextual annotations integrated seamlessly into lessons without separate tracks:'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!isDemo ? (
              <>
                <div
                  style={{
                    background: dark ? 'rgba(99, 102, 241, 0.08)' : '#EEF2FF',
                    borderLeft: '3px solid #6366F1',
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 14px',
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: dark ? '#CBD5E1' : '#334155',
                  }}
                >
                  <strong style={{ color: '#818CF8' }}>🎯 GATE Civil Engineering (CE — Section 6):</strong>
                  <div style={{ marginTop: 4 }}>
                    <FormattedContent inline content="Water standards (IS 10500), coagulation & rapid mixing hydraulics ($G = \sqrt{P/\mu V}$), Stokes' settling velocity, RSF/SSF media & backwashing, breakpoint chlorination, Manning sewer hydraulics, Streeter-Phelps oxygen sag ($D_c, t_c$), ASP kinetics ($F/M, \theta_c, SVI$), and sludge volume reduction." />
                  </div>
                </div>

                <div
                  style={{
                    background: dark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
                    borderLeft: '3px solid #10B981',
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 14px',
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: dark ? '#CBD5E1' : '#166534',
                  }}
                >
                  <strong style={{ color: '#10B981' }}>🌿 GATE Environmental Science & Engineering (ES):</strong>
                  <div>Preserved coverage of environmental chemistry, carbonate-alkalinity equilibria, Monod microbial kinetics, reactor hydraulics (CSTR, PFR), pathogen MPN indicators, and sustainable effluent reuse.</div>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    background: dark ? 'rgba(99, 102, 241, 0.08)' : '#EEF2FF',
                    borderLeft: '3px solid #6366F1',
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 14px',
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: dark ? '#CBD5E1' : '#334155',
                  }}
                >
                  <strong style={{ color: '#818CF8' }}>🎯 GATE Civil Engineering Weightage:</strong>
                  <div style={{ marginTop: 4 }}>
                    {course.category} is a core component of the GATE CE paper, contributing substantial marks across numerical answer type (NAT) and multiple choice questions.
                  </div>
                </div>

                <div
                  style={{
                    background: dark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
                    borderLeft: '3px solid #10B981',
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 14px',
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: dark ? '#CBD5E1' : '#166534',
                  }}
                >
                  <strong style={{ color: '#10B981' }}>📚 Academic Standards:</strong>
                  <div>Aligned with national model curricula (AICTE / Indian Universities) with theoretical rigor, IS codes, and step-by-step problem-solving.</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Units & Lessons Map */}
      <h2
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 20,
        }}
      >
        Curriculum Modules ({course.plannedHours || 42} Hours Target)
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {(course?.modules || []).map((mod) => {
          const isFeaturedMod = !isDemo && mod.id === 'mod-2';
          const hasInteractiveLessons = Array.isArray(mod?.lessons) && mod.lessons.length > 0;

          return (
            <div key={mod.id} className="ll-curriculum-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="ll-tag ll-tag-primary">Unit {mod.unitNumber}</span>
                    <span style={{ fontSize: 12, color: dark ? '#94A3B8' : '#475569' }}>{mod.plannedHours} Core Hours</span>
                    {isFeaturedMod && <span className="ll-tag ll-tag-success">⭐ Deep Demonstration</span>}
                    {isDemo && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#F59E0B',
                          background: dark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        Curriculum Preview
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      margin: '4px 0',
                      color: dark ? '#FFFFFF' : '#0F172A',
                    }}
                  >
                    <FormattedContent inline content={mod.title} />
                  </h3>
                  <p style={{ fontSize: 13, color: dark ? '#94A3B8' : '#334155', margin: 0 }}>
                    <FormattedContent inline content={mod.summary} />
                  </p>
                </div>

                {!isDemo && (
                  <button
                    onClick={() => handleStartAssessment && handleStartAssessment(mod)}
                    style={{
                      background: dark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF',
                      color: dark ? '#818CF8' : '#4338CA',
                      border: dark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #C7D2FE',
                      borderRadius: 10,
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    📝 Unit {mod.unitNumber} Assessment →
                  </button>
                )}
              </div>

              {/* Sample Topics Pills for Demo Courses */}
              {isDemo && Array.isArray(mod.sampleTopics) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', fontWeight: 600, marginBottom: 6 }}>
                    Core Unit Topics & GATE Focus:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {mod.sampleTopics.map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: 11.5,
                          background: dark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                          border: dark ? '1px solid #1E293B' : '1px solid #E2E8F0',
                          borderRadius: 6,
                          padding: '4px 9px',
                          color: dark ? '#CBD5E1' : '#475569',
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Items for Active Pilot Course */}
              {hasInteractiveLessons && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  {mod.lessons.map((les) => {
                    const completed = !isDemo && isLessonCompleted(user?.id, course.id, les.id);
                    return (
                      <div
                        key={les.id}
                        onClick={() => {
                          if (typeof onSelectLesson === 'function') {
                            onSelectLesson(les, mod?.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: dark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                          border: '1px solid var(--ll-border, #1E293B)',
                          borderRadius: 10,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: completed
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(99, 102, 241, 0.1)',
                              color: completed ? '#10B981' : '#818CF8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {completed ? '✓' : '•'}
                          </span>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                color: dark ? '#F1F5F9' : '#1E293B',
                              }}
                            >
                              <FormattedContent inline content={les.title} />
                            </div>
                            <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', marginTop: 2 }}>
                              {les.syllabusSource} · ⏱ ~{les.readTimeMinutes} mins read
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: 13, color: '#6366F1', fontWeight: 600 }}>
                          Start Lesson →
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Area: Capstone Exam (Pilot) or Explore Active Pilot Banner (Demo) */}
      {!isDemo ? (
        <div
          style={{
            marginTop: 36,
            background: dark
              ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12) 0%, rgba(17,24,39,0.9) 100%)'
              : 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            border: dark ? '2px solid rgba(99,102,241,0.4)' : '2px solid #C7D2FE',
            borderRadius: 20,
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <span className="ll-tag ll-tag-primary" style={{ marginBottom: 12 }}>
            Capstone Assessment
          </span>
          <h3
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 24,
              fontWeight: 800,
              margin: '8px 0',
              color: dark ? '#FFFFFF' : '#0F172A',
            }}
          >
            Comprehensive Final Examination
          </h3>
          <p
            style={{
              fontSize: 14,
              color: dark ? '#94A3B8' : '#334155',
              maxWidth: 640,
              margin: '0 auto 20px auto',
              lineHeight: 1.6,
            }}
          >
            12 multi-module questions covering Water Supply, Treatment Units, Sewer Hydraulics, Biological ASP, and Sludge Management. Minimum score of 70% required for course certification.
          </p>
          <button
            onClick={() => handleStartExam && handleStartExam()}
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '14px 32px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
            }}
          >
            🎓 Take Comprehensive Final Examination →
          </button>
        </div>
      ) : (
        <div
          style={{
            marginTop: 36,
            background: dark ? '#111827' : '#F8FAFC',
            border: '1px solid var(--ll-border, #1E293B)',
            borderRadius: 20,
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#F59E0B',
              background: dark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
              padding: '4px 10px',
              borderRadius: 6,
              display: 'inline-block',
              marginBottom: 12,
            }}
          >
            Showcase Curriculum Preview
          </span>
          <h3
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              margin: '0 0 10px 0',
              color: dark ? '#FFFFFF' : '#0F172A',
            }}
          >
            Experience the Active Interactive Pilot
          </h3>
          <p
            style={{
              fontSize: 14,
              color: dark ? '#94A3B8' : '#334155',
              maxWidth: 620,
              margin: '0 auto 20px auto',
              lineHeight: 1.6,
            }}
          >
            Interactive lesson player with LaTeX mathematical rendering, multi-turn AI Tutor assistance, rubric understanding checks, and outcome-based certification are fully active in Water Supply & Environmental Engineering.
          </p>
          <button
            onClick={() => onSelectCourse && onSelectCourse(waterEngineeringCourse)}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            }}
          >
            💧 Open Water Supply & Environmental Engineering →
          </button>
        </div>
      )}
    </div>
  );
}
