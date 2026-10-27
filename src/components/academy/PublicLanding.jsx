import React from "react";
import { waterSupplyAndSanitaryCourse } from "../../data/courses/waterEngineeringCourse";

export default function PublicLanding({ dark, onOpenAuth, onExploreCourse, onVerifyCert }) {
  const isDark = dark;
  const course = waterSupplyAndSanitaryCourse;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "70px 24px 90px",
          background: isDark
            ? "linear-gradient(180deg, #07090F 0%, #0F1422 100%)"
            : "linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)",
          borderBottom: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: 30,
              padding: "6px 16px",
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 13 }}>🏗️</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#6366F1",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              StructaMind · Engineering Minds. Structuring Futures.
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(34px, 5vw, 56px)",
              fontWeight: 900,
              color: isDark ? "#F8FAFC" : "#0F172A",
              lineHeight: 1.15,
              margin: "0 auto 20px",
              maxWidth: 900,
              letterSpacing: "-1px",
            }}
          >
            The Intelligent, Multilingual{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Civil Engineering Academy
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: isDark ? "#94A3B8" : "#475569",
              maxWidth: 780,
              margin: "0 auto 36px",
              lineHeight: 1.6,
            }}
          >
            Master university coursework and GATE engineering fundamentals through a complete, outcome-based
            learning cycle: lesson-aware AI tutoring, deep conceptual checks in 4 languages, and verified certificates.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 48,
            }}
          >
            <button
              onClick={() => onOpenAuth("signup")}
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "16px 36px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                boxShadow: "0 6px 24px rgba(99, 102, 241, 0.4)",
              }}
            >
              Enrol Free & Start Learning →
            </button>
            <button
              onClick={() => onOpenAuth("login")}
              style={{
                background: isDark ? "#182030" : "#FFFFFF",
                color: isDark ? "#F1F5F9" : "#0F172A",
                border: `1px solid ${isDark ? "#253352" : "#CBD5E1"}`,
                borderRadius: 12,
                padding: "16px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Student Sign In
            </button>
            <button
              onClick={onVerifyCert}
              style={{
                background: "transparent",
                color: isDark ? "#94A3B8" : "#475569",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Verify an Existing Certificate
            </button>
          </div>

          {/* 3 Accreditation & Authority Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              maxWidth: 960,
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            <div
              style={{
                background: isDark ? "rgba(17, 24, 39, 0.7)" : "#FFFFFF",
                border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                borderRadius: 14,
                padding: "18px 22px",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>🏫</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: isDark ? "#F1F5F9" : "#0F172A" }}>
                Core Civil Engineering Curriculum
              </div>
              <div style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#475569", marginTop: 4 }}>
                Comprehensive Water Supply & Sanitation Engineering: 6 units, 42 planned teaching hours across municipal water supply, hydraulics, and wastewater engineering.
              </div>
            </div>

            <div
              style={{
                background: isDark ? "rgba(17, 24, 39, 0.7)" : "#FFFFFF",
                border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                borderRadius: 14,
                padding: "18px 22px",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>🎯</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: isDark ? "#F1F5F9" : "#0F172A" }}>
                Source B: GATE 2027 ES Alignment
              </div>
              <div style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#475569", marginTop: 4 }}>
                Integrated Environmental Science & Engineering topics: BOD kinetics, clariflocculation, hydraulics, and sludge management.
              </div>
            </div>

            <div
              style={{
                background: isDark ? "rgba(17, 24, 39, 0.7)" : "#FFFFFF",
                border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                borderRadius: 14,
                padding: "18px 22px",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>🌐</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: isDark ? "#F1F5F9" : "#0F172A" }}>
                Multilingual AI Pedagogics
              </div>
              <div style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#475569", marginTop: 4 }}>
                Instant explanations in <strong>English, Hindi, Marathi, and Manipuri</strong> using everyday physical engineering analogies.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 8-Step Complete Learning Cycle */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#6366F1", textTransform: "uppercase", letterSpacing: 1.5 }}>
            Outcome-Based Pedagogic Loop
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: isDark ? "#F1F5F9" : "#0F172A",
              margin: "8px 0",
            }}
          >
            How Civil Engineering Students Learn with Us
          </h2>
          <p style={{ color: isDark ? "#94A3B8" : "#475569", fontSize: 15, margin: 0 }}>
            We move beyond passive lecture videos. LearnLoop enforces active recall and self-explanation.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {[
            { step: "1", title: "Enrol", desc: "Select the pilot course with 42 hours across 6 structured modules.", icon: "📝" },
            { step: "2", title: "Learn", desc: "Read structured lessons with formulas, IS code clauses, and schematics.", icon: "📖" },
            { step: "3", title: "Ask Questions", desc: "Chat with the lesson-aware AI teacher in English, Hindi, Marathi, or Manipuri.", icon: "💬" },
            { step: "4", title: "Explain Back", desc: "Our Signature Feature: Summarize the engineering concept in your own words.", icon: "✍️" },
            { step: "5", title: "AI Rubric Feedback", desc: "Receive instant rubric analysis: strengths, missing points, and misconceptions.", icon: "🧠" },
            { step: "6", title: "Practise MCQs", desc: "Solve curated GATE-level numericals and conceptual questions with hints.", icon: "⚡" },
            { step: "7", title: "Unit Assessments", desc: "Test module mastery under timed conditions (minimum 70% pass threshold).", icon: "📊" },
            { step: "8", title: "Earn Certificate", desc: "Pass the comprehensive final exam to unlock a verifiable PDF credential.", icon: "🏆" },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                background: isDark ? "#111827" : "#FFFFFF",
                border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                borderRadius: 16,
                padding: "22px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 14,
                }}
              >
                {item.step}
              </div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A", marginBottom: 6 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: isDark ? "#94A3B8" : "#64748B", lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Pilot Course Preview */}
      <section
        style={{
          padding: "70px 24px",
          background: isDark ? "#0A0D14" : "#F1F5F9",
          borderTop: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
          borderBottom: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#6366F1", textTransform: "uppercase", letterSpacing: 1.5 }}>
                Core Pilot Curriculum
              </div>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: isDark ? "#F1F5F9" : "#0F172A",
                  margin: "6px 0 0",
                }}
              >
                {course.title}
              </h2>
            </div>
            <button
              onClick={() => onOpenAuth("signup")}
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Enrol in Course Now →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
            {(course?.modules || []).map((mod, i) => (
              <div
                key={mod.id}
                style={{
                  background: isDark ? "#111827" : "#FFFFFF",
                  border: `1px solid ${mod.id === "mod-2" || mod.id === "module-2" ? "#6366F1" : isDark ? "#1E293B" : "#E2E8F0"}`,
                  borderRadius: 16,
                  padding: "22px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#6366F1", textTransform: "uppercase" }}>
                    Unit {i + 1} · {mod.prescribedHours} Hours
                  </span>
                  {(mod.id === "mod-2" || mod.id === "module-2") && (
                    <span
                      style={{
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "#6366F1",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      ★ Complete Demo Module
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: isDark ? "#F1F5F9" : "#0F172A",
                    margin: "0 0 8px",
                  }}
                >
                  {mod.title}
                </h3>
                <p style={{ fontSize: 13, color: isDark ? "#94A3B8" : "#334155", margin: "0 0 16px", lineHeight: 1.5 }}>
                  {mod.description}
                </p>

                {Array.isArray(mod?.lessons) && mod.lessons.length > 0 && (
                  <div style={{ borderTop: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`, paddingTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? "#94A3B8" : "#475569", marginBottom: 6 }}>
                      FEATURED LESSONS:
                    </div>
                    {mod.lessons.slice(0, 3).map((l) => (
                      <div key={l.id} style={{ fontSize: 12, color: isDark ? "#CBD5E1" : "#334155", marginBottom: 4 }}>
                        • {l.title}
                      </div>
                    ))}
                    {mod.lessons.length > 3 && (
                      <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 600 }}>
                        + {mod.lessons.length - 3} more lessons in this unit
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "50px 24px 60px",
          borderTop: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
          background: isDark ? "#07090F" : "#FFFFFF",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            Learn<span style={{ color: "#6366F1" }}>Loop</span> AI Academy
          </div>
          <div style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#475569", fontWeight: 600, letterSpacing: 0.5 }}>
            StructaMind · Engineering Minds. Structuring Futures.
          </div>

          <p style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#475569", lineHeight: 1.6, marginTop: 16 }}>
            Accreditation Disclaimer: This course is designed for undergraduate Civil Engineering students across Indian colleges and universities.
            Curriculum content covers core Civil Engineering water supply and sanitation principles alongside contextual competitive examination preparation (GATE CE & GATE ES).
            Certificates acknowledge completion of LearnLoop AI Academy requirements.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20, fontSize: 13 }}>
            <button onClick={() => onOpenAuth("login")} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer" }}>
              Sign In
            </button>
            <button onClick={() => onOpenAuth("signup")} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer" }}>
              Register
            </button>
            <button onClick={onVerifyCert} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer" }}>
              Verify Certificate
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
