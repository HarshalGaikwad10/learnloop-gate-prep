import React from "react";
import { waterSupplyAndSanitaryCourse } from "../../data/courses/waterEngineeringCourse";
import {
  getUserProgress,
  checkCertificateEligibility,
} from "../../services/progressService";
import FormattedContent from "../common/FormattedContent";

export default function DashboardView({
  user,
  dark,
  onOpenLesson,
  onOpenAssessment,
  onOpenFinalExam,
  onOpenCertificates,
  onSwitchTab,
}) {
  const isDark = dark;
  const course = waterSupplyAndSanitaryCourse || {};
  const progress = getUserProgress(user?.id) || {};
  const eligibility = checkCertificateEligibility(user?.id, course) || {};

  const isLessonDone = (lessonId) => {
    if (!progress?.completedLessons) return false;
    if (Array.isArray(progress.completedLessons)) {
      return progress.completedLessons.some(
        (l) => (typeof l === "string" ? l === lessonId : l.lessonId === lessonId)
      );
    }
    return !!progress.completedLessons[lessonId];
  };

  const completedLessonsCount = Array.isArray(progress?.completedLessons)
    ? progress.completedLessons.filter(
        (l) => typeof l === "string" || !l.courseId || l.courseId === course?.id
      ).length
    : Object.keys(progress?.completedLessons || {}).length;

  const modulesList = Array.isArray(course?.modules) ? course.modules : [];
  const mod2 =
    modulesList.find((m) => m?.id === "mod-2" || m?.unitNumber === 2) ||
    modulesList[1] ||
    modulesList[0];
  const mod2Lessons = Array.isArray(mod2?.lessons) ? mod2.lessons : [];
  const totalModule2Lessons = mod2Lessons.length || 6;

  const passedAssessmentsCount = Object.values(
    progress?.assessmentResults || progress?.moduleAssessments || {}
  ).filter((a) => a?.passed).length;

  const passedFinalExam = !!(
    progress?.finalExamResult?.passed || progress?.finalExam?.passed
  );

  // Find next recommended lesson in Module 2
  const nextLesson =
    mod2Lessons.find((l) => !isLessonDone(l.id)) ||
    mod2Lessons[0] || {
      id: "les-2-1",
      title: "Unit 2: Treatment Flowsheet, Screening & Aeration",
    };

  return (
    <div
      className="ll-dashboard-container"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "36px 24px 80px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Welcome Banner */}
      <div
        className="ll-dashboard-banner"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)"
            : "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)",
          border: `1px solid ${isDark ? "#253352" : "#C7D2FE"}`,
          borderRadius: 20,
          padding: "32px 36px",
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#6366F1",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 6,
            }}
          >
            StructaMind · Outcome-Based Learning
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 30,
              fontWeight: 800,
              color: isDark ? "#F1F5F9" : "#0F172A",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Welcome back, {user?.name || "Civil Engineering Student"}
          </h1>
          <p
            style={{
              color: isDark ? "#94A3B8" : "#475569",
              fontSize: 15,
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            Current Track:{" "}
            <strong style={{ color: isDark ? "#E2E8F0" : "#1E293B" }}>
              {course.title}
            </strong>{" "}
            (Core Civil Engineering Curriculum · GATE CE & ES Mapped)
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => onOpenLesson && onOpenLesson(mod2?.id || "mod-2", nextLesson.id)}
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "13px 24px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(99, 102, 241, 0.35)",
            }}
          >
            Continue Learning: {(nextLesson?.title ? (nextLesson.title.split(":")[1] || nextLesson.title) : "Treatment Flowsheet").trim()} →
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {[
          {
            label: "Module 2 Lessons Completed",
            value: `${completedLessonsCount} / ${totalModule2Lessons}`,
            subtext: `${Math.round((completedLessonsCount / totalModule2Lessons) * 100)}% of Unit 2 Mastered`,
            color: "#6366F1",
            icon: "📖",
          },
          {
            label: "Understanding Checks Passed",
            value: `${Object.keys(progress.understandingChecks || {}).length}`,
            subtext: "AI rubric validated explanations",
            color: "#10B981",
            icon: "🧠",
          },
          {
            label: "Module Assessments Passed",
            value: `${passedAssessmentsCount} / 6`,
            subtext: "Score threshold ≥ 70%",
            color: "#F59E0B",
            icon: "📝",
          },
          {
            label: "Final Certificate Status",
            value: eligibility.eligible ? "Unlocked 🏆" : "In Progress ⏳",
            subtext: passedFinalExam
              ? `Exam: ${progress.finalExamResult.percentage}%`
              : "Complete 6 units + final exam (≥70%)",
            color: eligibility.eligible ? "#10B981" : "#8B5CF6",
            icon: "🎓",
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: isDark ? "#111827" : "#FFFFFF",
              border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
              borderRadius: 16,
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{stat.icon}</span>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: stat.color,
                }}
              >
                {stat.value}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: isDark ? "#F1F5F9" : "#0F172A",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: 11,
                color: isDark ? "#94A3B8" : "#475569",
                marginTop: 4,
              }}
            >
              {stat.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Content: Left = Course Roadmap, Right = AI Study Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.7fr 1fr",
          gap: 28,
        }}
      >
        {/* Left Column: 6 Modules Syllabus Roadmap */}
        <div
          style={{
            background: isDark ? "#111827" : "#FFFFFF",
            border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
            borderRadius: 18,
            padding: "26px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: isDark ? "#F1F5F9" : "#0F172A",
                  margin: 0,
                }}
              >
                Curriculum Progression (42 Planned Hours)
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: isDark ? "#94A3B8" : "#64748B",
                  margin: "4px 0 0",
                }}
              >
                Core Civil Engineering Curriculum · GATE CE & ES Aligned
              </p>
            </div>
            <button
              onClick={() => onSwitchTab("academy")}
              style={{
                background: "transparent",
                border: `1px solid ${isDark ? "#334155" : "#CBD5E1"}`,
                borderRadius: 8,
                padding: "6px 14px",
                color: "#6366F1",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              View Full Syllabus →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {modulesList.map((mod, idx) => {
              const assessment = progress.assessmentResults?.[mod.id];
              const isMod2 = mod.id === "mod-2" || mod.id === "module-2";
              const mod2Pct = isMod2
                ? Math.round((completedLessonsCount / totalModule2Lessons) * 100)
                : assessment?.passed
                ? 100
                : 0;

              return (
                <div
                  key={mod.id}
                  style={{
                    background: isDark ? "#0D1117" : "#F8FAFC",
                    border: `1px solid ${
                      isMod2
                        ? "rgba(99, 102, 241, 0.4)"
                        : isDark
                        ? "#1E293B"
                        : "#E2E8F0"
                    }`,
                    borderRadius: 14,
                    padding: "16px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isMod2 ? "#6366F1" : isDark ? "#94A3B8" : "#64748B",
                        }}
                      >
                        Unit {idx + 1} · {mod.prescribedHours} Core Teaching Hours
                      </div>
                      <div
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 16,
                          fontWeight: 700,
                          color: isDark ? "#F1F5F9" : "#0F172A",
                          marginTop: 2,
                        }}
                      >
                        <FormattedContent inline content={mod.title} />
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      {assessment?.passed ? (
                        <span
                          style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10B981",
                            padding: "4px 10px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          Assessment: {assessment.percentage}% ✓
                        </span>
                      ) : isMod2 ? (
                        <span
                          style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            color: "#6366F1",
                            padding: "4px 10px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {completedLessonsCount}/{totalModule2Lessons} Lessons Active
                        </span>
                      ) : (
                        <span
                          style={{
                            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                            color: isDark ? "#94A3B8" : "#475569",
                            padding: "4px 10px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Structured Curriculum
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      background: isDark ? "#182030" : "#E2E8F0",
                      height: 6,
                      borderRadius: 3,
                      overflow: "hidden",
                      margin: "8px 0 12px",
                    }}
                  >
                    <div
                      style={{
                        background:
                          assessment?.passed || mod2Pct === 100
                            ? "#10B981"
                            : "linear-gradient(90deg, #6366F1, #8B5CF6)",
                        height: "100%",
                        width: `${mod2Pct}%`,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>

                  {/* Module action links */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {isMod2 && mod?.lessons?.[0] && (
                      <button
                        onClick={() =>
                          onOpenLesson && onOpenLesson(mod.id, mod.lessons[0].id)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#6366F1",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Explore {mod.lessons.length} Lessons →
                      </button>
                    )}
                    <button
                      onClick={() => onOpenAssessment(mod.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: assessment?.passed ? "#10B981" : isDark ? "#94A3B8" : "#475569",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {assessment?.passed ? "Retake Assessment" : "Take Unit Assessment"} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Teacher Actions, Revision suggestions, Certificate status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Certificate Readiness Card */}
          <div
            style={{
              background: isDark ? "#111827" : "#FFFFFF",
              border: `1px solid ${
                eligibility.eligible ? "rgba(16, 185, 129, 0.4)" : isDark ? "#1E293B" : "#E2E8F0"
              }`,
              borderRadius: 18,
              padding: "24px",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>🏆</div>
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: isDark ? "#F1F5F9" : "#0F172A",
                margin: "0 0 6px",
              }}
            >
              Civil Engineering Certificate
            </h3>
            <p
              style={{
                fontSize: 13,
                color: isDark ? "#94A3B8" : "#64748B",
                lineHeight: 1.5,
                margin: "0 0 16px",
              }}
            >
              Awarded upon completing all 6 units, validating understanding checks, and
              achieving ≥ 70% in module assessments and the final examination.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {(eligibility?.checklist || [
                {
                  label: `All ${eligibility?.totalLessons || 36} curriculum lessons completed (${completedLessonsCount}/${eligibility?.totalLessons || 36})`,
                  met: completedLessonsCount >= (eligibility?.totalLessons || 36),
                },
                {
                  label: `All ${eligibility?.totalModules || 6} Module Assessments passed with ≥ 70% (${passedAssessmentsCount}/${eligibility?.totalModules || 6})`,
                  met: passedAssessmentsCount >= (eligibility?.totalModules || 6),
                },
                {
                  label: "Comprehensive Final Examination passed with ≥ 70%",
                  met: passedFinalExam,
                },
              ]).map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: c.met ? "#10B981" : isDark ? "#94A3B8" : "#475569",
                  }}
                >
                  <span>{c.met ? "✓" : "○"}</span>
                  <span style={{ fontWeight: c.met ? 700 : 500 }}>{c.label}</span>
                </div>
              ))}
            </div>

            {eligibility.eligible ? (
              <button
                onClick={onOpenCertificates}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #10B981, #06B6D4)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View & Download Certificate →
              </button>
            ) : (
              <button
                onClick={onOpenFinalExam}
                style={{
                  width: "100%",
                  background: passedAssessmentsCount >= 6 ? "#6366F1" : isDark ? "#182030" : "#F1F5F9",
                  color: passedAssessmentsCount >= 6 ? "#fff" : isDark ? "#94A3B8" : "#64748B",
                  border: `1px solid ${isDark ? "#253352" : "#CBD5E1"}`,
                  borderRadius: 10,
                  padding: "12px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Attempt Final Examination →
              </button>
            )}
          </div>

          {/* Quick Revision & Practice Box */}
          <div
            style={{
              background: isDark ? "#111827" : "#FFFFFF",
              border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
              borderRadius: 18,
              padding: "24px",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>⚡</div>
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: isDark ? "#F1F5F9" : "#0F172A",
                margin: "0 0 6px",
              }}
            >
              GATE Practice & Question Bank
            </h3>
            <p
              style={{
                fontSize: 13,
                color: isDark ? "#94A3B8" : "#64748B",
                lineHeight: 1.5,
                margin: "0 0 16px",
              }}
            >
              Practice 287 curated GATE MCQs across Concrete Technology, access formula sheets,
              and test memory retention with our decay detector.
            </p>
            <button
              onClick={() => onSwitchTab("practice")}
              style={{
                width: "100%",
                background: "transparent",
                color: "#6366F1",
                border: "1px solid #6366F1",
                borderRadius: 10,
                padding: "10px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Open GATE Question Bank →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
