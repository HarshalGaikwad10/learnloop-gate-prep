// src/components/academy/CourseCard.jsx — Reusable Showcase Course Card
import React from 'react';
import { checkCertificateEligibility } from '../../services/progressService';
import FormattedContent from '../common/FormattedContent';

export default function CourseCard({
  course,
  user,
  dark = true,
  onExplore
}) {
  const isDemo = Boolean(course?.isDemo);
  const isFeatured = Boolean(course?.isFeatured);

  // For active pilot course, show real student progress. For demo, show preview badge.
  const progressPct = !isDemo
    ? checkCertificateEligibility(user?.id, course)?.overallProgressPct || 0
    : 0;

  const cardBg = dark ? '#111827' : '#FFFFFF';
  const cardBorder = isFeatured
    ? '2px solid rgba(99, 102, 241, 0.6)'
    : dark
    ? '1px solid #1E293B'
    : '1px solid #E2E8F0';

  return (
    <div
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: 16,
        padding: '24px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: isFeatured
          ? '0 10px 30px rgba(99, 102, 241, 0.15)'
          : '0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
      className="ll-course-showcase-card"
    >
      <div>
        {/* Top Badges: Category & Demo / Active Pilot status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              color: dark ? '#818CF8' : '#4338CA',
              background: dark ? 'rgba(99, 102, 241, 0.12)' : '#EEF2FF',
              padding: '4px 9px',
              borderRadius: 6,
            }}
          >
            {course.category}
          </span>

          {isDemo ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#F59E0B',
                background: dark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '3px 8px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>🧪</span> Demo Course
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#10B981',
                background: dark ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 8px',
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>⭐</span> Active Pilot
            </span>
          )}
        </div>

        {/* Course Header: Icon + Title + Code */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1,
              background: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              width: 50,
              height: 50,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {course.icon || '📚'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', fontWeight: 600, letterSpacing: 0.5 }}>
              {course.code}
            </div>
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                margin: '2px 0 0 0',
                color: dark ? '#FFFFFF' : '#0F172A',
                lineHeight: 1.3,
              }}
            >
              <FormattedContent inline content={course.title} />
            </h3>
          </div>
        </div>

        {/* Short Description */}
        <p
          className="ll-card-desc"
          style={{
            fontSize: 13,
            color: dark ? '#94A3B8' : '#334155',
            lineHeight: 1.6,
            margin: '0 0 16px 0',
            minHeight: 58,
          }}
        >
          <FormattedContent inline content={course.shortDescription || course.description} />
        </p>

        {/* Metadata Chips: Hours, Modules, Level */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            color: dark ? '#CBD5E1' : '#475569',
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>⏱️</span> {course.plannedHours} Hours
          </span>
          <span style={{ color: dark ? '#475569' : '#CBD5E1' }}>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>📦</span> {course.moduleCount || course.modules?.length || 0} Modules
          </span>
          <span style={{ color: dark ? '#475569' : '#CBD5E1' }}>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>🎯</span> GATE CE
          </span>
        </div>
      </div>

      {/* Bottom Area: Progress Bar + Explore CTA */}
      <div>
        {/* Progress or Status */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            <span style={{ color: dark ? '#94A3B8' : '#475569' }}>
              {isDemo ? 'Status' : 'Progress'}
            </span>
            <span
              style={{
                color: isDemo ? '#F59E0B' : '#6366F1',
                fontWeight: 700,
              }}
            >
              {isDemo ? 'Curriculum Preview' : `${progressPct}% Complete`}
            </span>
          </div>

          <div
            style={{
              height: 6,
              background: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: isDemo ? '100%' : `${progressPct}%`,
                background: isDemo
                  ? 'repeating-linear-gradient(45deg, #F59E0B22, #F59E0B22 10px, #F59E0B44 10px, #F59E0B44 20px)'
                  : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                borderRadius: 6,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onExplore && onExplore(course)}
          id={`explore-course-${course.id}`}
          style={{
            width: '100%',
            background: isFeatured
              ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
              : dark
              ? 'rgba(99, 102, 241, 0.12)'
              : '#EEF2FF',
            color: isFeatured ? '#FFFFFF' : (dark ? '#818CF8' : '#4338CA'),
            border: isFeatured ? 'none' : (dark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #C7D2FE'),
            borderRadius: 10,
            padding: '11px 16px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          <span>{isDemo ? 'Explore Course Preview' : 'Explore Course'}</span>
          <span style={{ fontSize: 14 }}>→</span>
        </button>
      </div>
    </div>
  );
}
