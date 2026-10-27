import React from "react";
import { logoutUser } from "../services/authService";

export default function Navbar({
  dark,
  setDark,
  activeTab,
  setActiveTab,
  user,
  setUser,
  onOpenAuth,
  gateYear,
}) {
  const isDark = dark;
  const brandGradient = "linear-gradient(135deg, #6366F1, #8B5CF6)";

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setActiveTab("landing");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: isDark ? "rgba(13, 17, 23, 0.95)" : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
        padding: "0 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        {/* Brand & Tagline */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
          onClick={() => setActiveTab(user ? "academy" : "landing")}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: brandGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 20,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            L
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: isDark ? "#F1F5F9" : "#0F172A",
                  letterSpacing: "-0.5px",
                }}
              >
                Learn<span style={{ color: "#6366F1" }}>Loop</span>
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#8B5CF6",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  background: isDark ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.1)",
                  padding: "2px 7px",
                  borderRadius: 6,
                }}
              >
                AI Academy
              </span>
            </div>
            <div
              style={{
                fontSize: 10,
                color: isDark ? "#64748B" : "#64748B",
                fontWeight: 600,
                letterSpacing: 0.4,
              }}
            >
              StructaMind · Engineering Minds. Structuring Futures.
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (when logged in or browsing) */}
        {user ? (
          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[
              { id: "academy", label: "Academy Courses", icon: "🎓" },
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "practice", label: "GATE Practice", icon: "📝" },
              { id: "certificates", label: "Certificates", icon: "🏆" },
              { id: "profile", label: "Profile", icon: "👤" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: active
                      ? isDark
                        ? "rgba(99, 102, 241, 0.16)"
                        : "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    color: active ? "#6366F1" : isDark ? "#94A3B8" : "#475569",
                    border: active ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                    borderRadius: 9,
                    padding: "8px 14px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.18s ease",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setActiveTab("landing")}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "landing" ? "#6366F1" : isDark ? "#94A3B8" : "#475569",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Curriculum Overview
            </button>
            <button
              onClick={() => setActiveTab("certificates-public")}
              style={{
                background: "none",
                border: "none",
                color: activeTab === "certificates-public" ? "#6366F1" : isDark ? "#94A3B8" : "#475569",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Verify Certificate
            </button>
          </nav>
        )}

        {/* Right actions (Theme toggle, Gate year badge, User account / Auth) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Theme toggle */}
          <button
            onClick={() => setDark(!isDark)}
            aria-label="Toggle dark/light theme"
            style={{
              background: isDark ? "#182030" : "#F1F5F9",
              border: `1px solid ${isDark ? "#253352" : "#CBD5E1"}`,
              borderRadius: 20,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 12,
              color: isDark ? "#CBD5E1" : "#334155",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span>{isDark ? "☀️" : "🌙"}</span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{isDark ? "Light" : "Dark"}</span>
          </button>

          {/* User profile / Auth buttons */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 12px",
                  borderRadius: 24,
                  background: isDark ? "#111827" : "#F8FAFC",
                  border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10B981, #06B6D4)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {(user.name || user.email || "S")[0].toUpperCase()}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isDark ? "#F1F5F9" : "#0F172A",
                      lineHeight: 1.1,
                    }}
                  >
                    {user.name || "Student"}
                  </div>
                  <div style={{ fontSize: 10, color: isDark ? "#94A3B8" : "#475569" }}>
                    {user.preferredLanguage ? user.preferredLanguage.toUpperCase() : "EN"} · GATE {user.gateYear || gateYear || "2027"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log out of LearnLoop"
                style={{
                  background: "transparent",
                  border: `1px solid ${isDark ? "#334155" : "#CBD5E1"}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: isDark ? "#94A3B8" : "#475569",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => onOpenAuth("login")}
                style={{
                  background: "transparent",
                  border: `1px solid ${isDark ? "#334155" : "#CBD5E1"}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDark ? "#F1F5F9" : "#0F172A",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("signup")}
                style={{
                  background: brandGradient,
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                }}
              >
                Enrol Free →
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
