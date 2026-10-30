// src/components/academy/CourseCatalogueView.jsx — Civil Engineering Course Catalogue
import React, { useState, useMemo } from 'react';
import CourseCard from './CourseCard';
import '../../styles/academy.css';

const CATEGORIES = [
  'All Courses',
  'Environmental Engineering',
  'Structural Engineering',
  'Geotechnical Engineering',
  'Water Resources',
  'Transportation & Surveying',
  'Applied Math & Management',
];

export default function CourseCatalogueView({
  courses = [],
  user,
  dark = true,
  onSelectCourse
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Category match
      let matchesCat = true;
      if (selectedCategory === 'Transportation & Surveying') {
        matchesCat =
          course.category === 'Transportation Engineering' ||
          course.category === 'Geomatics Engineering';
      } else if (selectedCategory === 'Applied Math & Management') {
        matchesCat =
          course.category === 'Engineering Mathematics' ||
          course.category === 'Construction Management';
      } else if (selectedCategory !== 'All Courses') {
        matchesCat = course.category === selectedCategory;
      }

      // Search query match (title, code, description, category)
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        (course.shortDescription && course.shortDescription.toLowerCase().includes(q)) ||
        course.category.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  return (
    <div className="ll-academy-container" style={{ paddingBottom: 60 }}>
      {/* Hero Catalogue Header */}
      <div
        className="ll-catalogue-hero"
        style={{
          background: dark
            ? 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #172554 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 60%, #E0E7FF 100%)',
          border: '1px solid var(--ll-border, #1E293B)',
          borderRadius: 20,
          padding: '36px 32px',
          marginBottom: 32,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 840, position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: dark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#818CF8',
              marginBottom: 16,
            }}
          >
            <span>🏛️</span> LearnLoop AI Academy · Civil Engineering Catalogue
          </div>

          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(24px, 5vw, 34px)',
              fontWeight: 800,
              margin: '0 0 12px 0',
              color: dark ? '#FFFFFF' : '#0F172A',
              lineHeight: 1.25,
            }}
          >
            Civil Engineering Academic Catalogue
          </h1>

          <p
            style={{
              fontSize: 15,
              color: dark ? '#CBD5E1' : '#475569',
              lineHeight: 1.7,
              margin: '0 0 24px 0',
            }}
          >
            A comprehensive curriculum designed for Indian undergraduate civil engineering students and mapped to the official GATE CE syllabus. Explore our active pilot course in Water Supply & Environmental Engineering, or preview curriculum frameworks, module breakdowns, and sample quizzes across all core disciplines.
          </p>

          {/* Quick Metrics Bar */}
          <div
            className="ll-catalogue-stats"
            style={{
              borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              paddingTop: 18,
            }}
          >
            <div className="ll-stat-item">
              <div style={{ fontSize: 20, fontWeight: 800, color: '#818CF8' }}>10</div>
              <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', fontWeight: 600 }}>Disciplines</div>
            </div>
            <div className="ll-stat-divider" style={{ width: 1, background: dark ? '#334155' : '#CBD5E1' }} />
            <div className="ll-stat-item">
              <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981' }}>417</div>
              <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', fontWeight: 600 }}>Planned Hours</div>
            </div>
            <div className="ll-stat-divider" style={{ width: 1, background: dark ? '#334155' : '#CBD5E1' }} />
            <div className="ll-stat-item">
              <div style={{ fontSize: 20, fontWeight: 800, color: '#F59E0B' }}>52</div>
              <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', fontWeight: 600 }}>Modules</div>
            </div>
            <div className="ll-stat-divider" style={{ width: 1, background: dark ? '#334155' : '#CBD5E1' }} />
            <div className="ll-stat-item">
              <div style={{ fontSize: 20, fontWeight: 800, color: '#6366F1' }}>1 Active Pilot</div>
              <div style={{ fontSize: 11, color: dark ? '#94A3B8' : '#475569', fontWeight: 600 }}>Interactive System</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <span
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 16,
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search courses by title, course code (e.g., CE-STR-202), or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="academy-course-search-input"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: dark ? '#111827' : '#FFFFFF',
              border: '1px solid var(--ll-border, #1E293B)',
              borderRadius: 12,
              padding: '14px 16px 14px 44px',
              fontSize: 14,
              color: dark ? '#F1F5F9' : '#0F172A',
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'border-color 0.2s',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div
          className="ll-category-pills"
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                    : dark
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                  color: isSelected ? '#FFFFFF' : dark ? '#94A3B8' : '#475569',
                  border: isSelected
                    ? '1px solid transparent'
                    : dark
                    ? '1px solid #1E293B'
                    : '1px solid #E2E8F0',
                  borderRadius: 20,
                  padding: '8px 16px',
                  fontSize: 12.5,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Results Counter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          fontSize: 13,
          color: dark ? '#94A3B8' : '#475569',
        }}
      >
        <span>
          Showing <strong style={{ color: dark ? '#F1F5F9' : '#0F172A' }}>{filteredCourses.length}</strong> {filteredCourses.length === 1 ? 'course' : 'courses'}
          {selectedCategory !== 'All Courses' && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>

        {(selectedCategory !== 'All Courses' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All Courses');
              setSearchQuery('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: dark ? '#818CF8' : '#4338CA',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Responsive Course Grid */}
      {filteredCourses.length === 0 ? (
        <div
          style={{
            background: dark ? '#111827' : '#FFFFFF',
            border: '1px solid var(--ll-border, #1E293B)',
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <h3
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 20,
              margin: '0 0 8px 0',
              color: dark ? '#FFFFFF' : '#0F172A',
            }}
          >
            No courses found
          </h3>
          <p style={{ color: dark ? '#94A3B8' : '#475569', fontSize: 14, margin: '0 0 16px 0' }}>
            We could not find any course matching your current search or category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All Courses');
              setSearchQuery('');
            }}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View All Courses
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
            gap: 22,
          }}
        >
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              user={user}
              dark={dark}
              onExplore={onSelectCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
}
