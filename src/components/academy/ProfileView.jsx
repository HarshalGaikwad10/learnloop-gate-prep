import React, { useState } from "react";
import { updateUserProfile, logoutUser } from "../../services/authService";
import { getUserProgress } from "../../services/progressService";

export default function ProfileView({ user, setUser, dark, onLogout }) {
  const isDark = dark;
  const progress = getUserProgress(user?.id);

  const [name, setName] = useState(user?.name || "");
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || "en");
  const [explanationStyle, setExplanationStyle] = useState(user?.explanationStyle || "simple");
  const [gateYear, setGateYear] = useState(user?.gateYear || 2027);
  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = () => {
    const updated = updateUserProfile(user.id, {
      name,
      preferredLanguage,
      explanationStyle,
      gateYear,
    });
    if (updated) {
      setUser(updated);
      setSavedMsg("Profile preferences saved successfully!");
      setTimeout(() => setSavedMsg(""), 3500);
    }
  };

  const handleLogout = () => {
    logoutUser();
    if (onLogout) onLogout();
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "36px 24px 80px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: isDark ? "#F1F5F9" : "#0F172A",
            margin: "0 0 6px",
          }}
        >
          Student Profile & Learning Preferences
        </h1>
        <p style={{ color: isDark ? "#94A3B8" : "#64748B", fontSize: 14, margin: 0 }}>
          Manage your account settings, multilingual AI teacher configuration, and view assessment records.
        </p>
      </div>

      {savedMsg && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#10B981",
            padding: "12px 18px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          ✓ {savedMsg}
        </div>
      )}

      {/* Main Settings Card */}
      <div
        style={{
          background: isDark ? "#111827" : "#FFFFFF",
          border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
          borderRadius: 18,
          padding: "30px",
          marginBottom: 30,
        }}
      >
        <h3
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: isDark ? "#F1F5F9" : "#0F172A",
            margin: "0 0 20px",
          }}
        >
          Personal & Academic Information
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isDark ? "#94A3B8" : "#64748B",
                display: "block",
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              FULL NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: isDark ? "#0D1117" : "#F8FAFC",
                color: isDark ? "#F1F5F9" : "#0F172A",
                border: `1px solid ${isDark ? "#253352" : "#CBD5E1"}`,
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isDark ? "#94A3B8" : "#64748B",
                display: "block",
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              EMAIL ADDRESS (LOGIN ID)
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: isDark ? "#182030" : "#E2E8F0",
                color: isDark ? "#64748B" : "#94A3B8",
                border: `1px solid ${isDark ? "#253352" : "#CBD5E1"}`,
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "not-allowed",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 26 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isDark ? "#94A3B8" : "#64748B",
              display: "block",
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            TARGET GATE EXAM YEAR
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setGateYear(yr)}
                style={{
                  background:
                    gateYear === yr
                      ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                      : isDark
                      ? "#0D1117"
                      : "#F8FAFC",
                  color: gateYear === yr ? "#fff" : isDark ? "#94A3B8" : "#475569",
                  border: `1px solid ${
                    gateYear === yr ? "#6366F1" : isDark ? "#253352" : "#CBD5E1"
                  }`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                GATE {yr}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`, paddingTop: 24, marginBottom: 26 }}>
          <h3
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: isDark ? "#F1F5F9" : "#0F172A",
              margin: "0 0 16px",
            }}
          >
            AI Teacher Language & Explanation Style
          </h3>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isDark ? "#94A3B8" : "#64748B",
                display: "block",
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              PREFERRED TEACHING LANGUAGE
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {[
                { code: "en", label: "English", desc: "Default technical medium" },
                { code: "hi", label: "हिंदी (Hindi)", desc: "Clear analogies in Hindi" },
                { code: "mr", label: "मराठी (Marathi)", desc: "Regional examples & clarity" },
                { code: "mni", label: "ꯃꯤꯇꯩꯂꯣꯟ (Manipuri)", desc: "Meetei script & terminology" },
              ].map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => setPreferredLanguage(lang.code)}
                  style={{
                    background:
                      preferredLanguage === lang.code
                        ? "rgba(99, 102, 241, 0.12)"
                        : isDark
                        ? "#0D1117"
                        : "#F8FAFC",
                    border: `1px solid ${
                      preferredLanguage === lang.code
                        ? "#6366F1"
                        : isDark
                        ? "#253352"
                        : "#CBD5E1"
                    }`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color:
                        preferredLanguage === lang.code
                          ? "#6366F1"
                          : isDark
                          ? "#F1F5F9"
                          : "#0F172A",
                    }}
                  >
                    {lang.label}
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", marginTop: 4 }}>
                    {lang.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isDark ? "#94A3B8" : "#64748B",
                display: "block",
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              DEFAULT EXPLANATION DEPTH
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {[
                {
                  id: "simple",
                  label: "Simple with Everyday Analogies",
                  desc: "Bucket/settling examples, intuitive first-principles",
                },
                {
                  id: "detailed",
                  label: "Rigorous Technical Engineering",
                  desc: "Formulas, IS codes, detention times, overflow rates",
                },
                {
                  id: "exam",
                  label: "High-Yield Exam Revision",
                  desc: "Quick bullet points, formulas, high-probability traps",
                },
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => setExplanationStyle(style.id)}
                  style={{
                    background:
                      explanationStyle === style.id
                        ? "rgba(139, 92, 246, 0.12)"
                        : isDark
                        ? "#0D1117"
                        : "#F8FAFC",
                    border: `1px solid ${
                      explanationStyle === style.id
                        ? "#8B5CF6"
                        : isDark
                        ? "#253352"
                        : "#CBD5E1"
                    }`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color:
                        explanationStyle === style.id
                          ? "#8B5CF6"
                          : isDark
                          ? "#F1F5F9"
                          : "#0F172A",
                    }}
                  >
                    {style.label}
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", marginTop: 4 }}>
                    {style.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={handleSave}
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
            }}
          >
            Save Profile Preferences
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              color: "#EF4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Assessment History Table */}
      <div
        style={{
          background: isDark ? "#111827" : "#FFFFFF",
          border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
          borderRadius: 18,
          padding: "30px",
        }}
      >
        <h3
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: isDark ? "#F1F5F9" : "#0F172A",
            margin: "0 0 16px",
          }}
        >
          Academic Assessment Record
        </h3>

        {Object.keys(progress.assessmentResults || {}).length === 0 && !progress.finalExamResult ? (
          <p style={{ color: isDark ? "#64748B" : "#94A3B8", fontSize: 13, margin: 0 }}>
            No formal assessments completed yet. Take the Unit 1–6 assessments or final exam to record scores here.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(progress.assessmentResults || {}).map(([modId, res]) => (
              <div
                key={modId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: isDark ? "#0D1117" : "#F8FAFC",
                  borderRadius: 10,
                  border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isDark ? "#F1F5F9" : "#0F172A" }}>
                    Module Assessment: {modId.replace("-", " ").toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8" }}>
                    Completed on {new Date(res.completedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: res.passed ? "#10B981" : "#EF4444",
                    }}
                  >
                    {res.percentage}% {res.passed ? "(Passed)" : "(Needs Retake)"}
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8" }}>
                    {res.score} / {res.total} Correct
                  </div>
                </div>
              </div>
            ))}

            {progress.finalExamResult && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  background: "rgba(99, 102, 241, 0.08)",
                  borderRadius: 10,
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  marginTop: 6,
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#6366F1" }}>
                    🏆 Comprehensive Final Examination
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? "#94A3B8" : "#64748B" }}>
                    Completed on {new Date(progress.finalExamResult.completedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: progress.finalExamResult.passed ? "#10B981" : "#EF4444",
                    }}
                  >
                    {progress.finalExamResult.percentage}% {progress.finalExamResult.passed ? "(Passed)" : "(Failed)"}
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? "#94A3B8" : "#64748B" }}>
                    {progress.finalExamResult.score} / {progress.finalExamResult.total} Correct
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
