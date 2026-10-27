// src/components/academy/VisualLearningSection.jsx — Comprehensive Visual Learning Section for Unit 2
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { getLessonVisualData } from '../../data/courses/unit2VisualsData';
import { generateConceptIllustration } from '../../services/chatService';
import FormattedContent from '../common/FormattedContent';

export default function VisualLearningSection({ lessonId, lessonTitle, dark = true }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'stepByStep' | 'chart' | 'example' | 'explore' | 'aiConcept'
  const [explanationMode, setExplanationMode] = useState('both'); // 'simple' | 'technical' | 'both'

  // AI Concept Image generation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const visualData = getLessonVisualData(lessonId);

  // If no visual data for this lesson (e.g. non-Unit-2 lesson), render nothing safely
  if (!visualData) {
    return null;
  }

  const {
    topic,
    diagramComponent: DiagramComponent,
    diagramTitle,
    diagramDescription,
    stepByStep,
    engineeringChart,
    workedExample,
    exploreFurther
  } = visualData;

  const handleGenerateAiConcept = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await generateConceptIllustration({
        lessonTitle: lessonTitle || topic,
        topic,
        prompt: `Civil engineering conceptual process diagram for ${topic}`
      });

      if (res?.error) {
        setAiError(res.error);
      } else {
        setAiResult(res);
      }
    } catch (err) {
      setAiError('Failed to communicate with concept visualizer. You can retry or inspect the verified SVG diagram.');
    } finally {
      setAiLoading(false);
    }
  };

  const containerBg = dark ? '#0F172A' : '#F8FAFC';
  const cardBorder = dark ? '1px solid #1E293B' : '1px solid #E2E8F0';
  const contentBg = dark ? '#111827' : '#FFFFFF';
  const textColor = dark ? '#F1F5F9' : '#0F172A';
  const subTextColor = dark ? '#94A3B8' : '#475569';
  const accentColor = dark ? '#818CF8' : '#4338CA';

  // Construct safe external search URLs with encoded query parameters
  const encodedGoogleQuery = encodeURIComponent(exploreFurther?.googleSearchQuery || `${topic} CPHEEO water treatment`);
  const encodedYoutubeQuery = encodeURIComponent(exploreFurther?.youtubeSearchQuery || `${topic} civil engineering animation`);
  const googleSearchUrl = `https://www.google.com/search?q=${encodedGoogleQuery}`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedYoutubeQuery}`;

  return (
    <div
      className="ll-visual-learning-container"
      data-testid="visual-learning-section"
      style={{
        background: containerBg,
        border: cardBorder,
        borderRadius: 18,
        padding: '24px',
        marginBottom: 32,
        boxShadow: dark ? '0 10px 25px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header Bar with Collapsible Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          paddingBottom: isExpanded ? 16 : 0,
          borderBottom: isExpanded ? cardBorder : 'none',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label="Toggle Visual Learning Mode"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              flexShrink: 0,
            }}
          >
            🎨
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  color: accentColor,
                  background: dark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
                  padding: '3px 8px',
                  borderRadius: 6,
                }}
              >
                Visual Learning Mode
              </span>
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                • Unit 2 Interactive Suite
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                margin: '3px 0 0 0',
                color: textColor,
                lineHeight: 1.3,
              }}
            >
              {diagramTitle || `Visual Engineering Guide: ${topic}`}
            </h2>
          </div>
        </div>

        <button
          style={{
            background: 'transparent',
            border: cardBorder,
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            color: accentColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          <span>{isExpanded ? 'Collapse' : 'Expand Visuals'}</span>
          <span>{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div style={{ marginTop: 18 }}>
          {/* Sub-Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 20,
              scrollbarWidth: 'thin',
            }}
            role="tablist"
          >
            {[
              { id: 'diagram', label: '🖼️ Process Diagram' },
              { id: 'stepByStep', label: '🪜 Step-by-Step Breakdown' },
              { id: 'chart', label: '📈 Engineering Graph' },
              { id: 'example', label: '🧮 Worked Calculation' },
              { id: 'explore', label: '🔍 Explore Further' },
              { id: 'aiConcept', label: '✨ AI Concept Visualizer' }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                      : dark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : '#FFFFFF',
                    color: active ? '#FFFFFF' : subTextColor,
                    border: active ? '1px solid transparent' : cardBorder,
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Conceptual Diagram */}
          {activeTab === 'diagram' && (
            <div
              style={{
                background: contentBg,
                border: cardBorder,
                borderRadius: 14,
                padding: '20px',
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#818CF8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Technical Layout & Flow Mechanics
                </div>
                <p style={{ fontSize: 13, color: subTextColor, margin: '4px 0 0 0', lineHeight: 1.6 }}>
                  {diagramDescription}
                </p>
              </div>

              {/* Responsive SVG Diagram */}
              {DiagramComponent && <DiagramComponent dark={dark} />}

              <div
                style={{
                  marginTop: 14,
                  fontSize: 11.5,
                  color: subTextColor,
                  borderTop: cardBorder,
                  paddingTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span>💡 Tip: Click and drag or scroll horizontally to inspect sub-components in detail.</span>
                <span style={{ color: '#F59E0B' }}>• Illustrative Engineering Schematic</span>
              </div>
            </div>
          )}

          {/* TAB 2: Step-by-Step Breakdown (Simple vs Technical Toggle) */}
          {activeTab === 'stepByStep' && (
            <div
              style={{
                background: contentBg,
                border: cardBorder,
                borderRadius: 14,
                padding: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: textColor,
                    }}
                  >
                    Step-by-Step Process Mechanism
                  </h3>
                  <div style={{ fontSize: 12, color: subTextColor, marginTop: 2 }}>
                    Compare everyday conceptual intuition with formal civil engineering design criteria.
                  </div>
                </div>

                {/* Perspective Toggle Buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { id: 'both', label: 'Side-by-Side' },
                    { id: 'simple', label: 'Simple Language' },
                    { id: 'technical', label: 'Technical Engineering' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setExplanationMode(mode.id)}
                      style={{
                        background: explanationMode === mode.id
                          ? (dark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)')
                          : 'transparent',
                        color: explanationMode === mode.id ? '#818CF8' : subTextColor,
                        border: explanationMode === mode.id ? '1px solid #6366F1' : cardBorder,
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overview Paragraphs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: explanationMode === 'both' ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {(explanationMode === 'both' || explanationMode === 'simple') && (
                  <div
                    style={{
                      background: dark ? 'rgba(56, 189, 248, 0.08)' : '#F0F9FF',
                      borderLeft: '4px solid #38BDF8',
                      borderRadius: '0 10px 10px 0',
                      padding: '16px',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', marginBottom: 6 }}>
                      🌱 Simple Language & Physical Intuition
                    </div>
                    <p style={{ fontSize: 13, color: textColor, lineHeight: 1.7, margin: 0 }}>
                      {stepByStep.simpleLanguage}
                    </p>
                  </div>
                )}

                {(explanationMode === 'both' || explanationMode === 'technical') && (
                  <div
                    style={{
                      background: dark ? 'rgba(99, 102, 241, 0.08)' : '#EEF2FF',
                      borderLeft: '4px solid #6366F1',
                      borderRadius: '0 10px 10px 0',
                      padding: '16px',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', marginBottom: 6 }}>
                      🏛️ Technical Civil Engineering Specification
                    </div>
                    <div style={{ fontSize: 13, color: textColor, lineHeight: 1.7, margin: 0 }}>
                      <FormattedContent content={stepByStep.technicalEngineering} />
                    </div>
                  </div>
                )}
              </div>

              {/* Sequential Stages Cards */}
              <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, margin: '0 0 12px 0', color: textColor }}>
                Detailed Stage Sequence
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stepByStep.stages?.map((stage) => (
                  <div
                    key={stage.stageNumber}
                    style={{
                      border: cardBorder,
                      borderRadius: 10,
                      padding: '14px 18px',
                      background: dark ? 'rgba(255, 255, 255, 0.02)' : '#FAFAFA',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#6366F1',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {stage.stageNumber}
                      </span>
                      <strong style={{ fontSize: 14, color: textColor }}>{stage.name}</strong>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 12,
                        fontSize: 12.5,
                        lineHeight: 1.6,
                      }}
                    >
                      <div style={{ color: subTextColor }}>
                        <span style={{ color: '#38BDF8', fontWeight: 600 }}>In Simple Terms: </span>
                        {stage.simpleAction}
                      </div>
                      <div style={{ color: textColor }}>
                        <span style={{ color: '#818CF8', fontWeight: 600 }}>Engineering Basis: </span>
                        <FormattedContent inline content={stage.engineeringMechanism} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Engineering Graph or Chart (Recharts) */}
          {activeTab === 'chart' && (
            <div
              style={{
                background: contentBg,
                border: cardBorder,
                borderRadius: 14,
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: textColor,
                    }}
                  >
                    {engineeringChart.title}
                  </h3>
                  {engineeringChart.isIllustrative ? (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#F59E0B',
                        background: dark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      Illustrative Trend
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#10B981',
                        background: dark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      Curated Values
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: subTextColor }}>
                  {engineeringChart.dataNote}
                </div>
              </div>

              {/* Recharts LineChart */}
              <div style={{ width: '100%', height: 320, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={engineeringChart.data}
                    margin={{ top: 15, right: 25, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#E2E8F0'} />
                    <XAxis
                      dataKey={engineeringChart.xAxisKey}
                      stroke={subTextColor}
                      tick={{ fill: subTextColor, fontSize: 11 }}
                      label={{
                        value: engineeringChart.xAxisLabel,
                        position: 'insideBottom',
                        offset: -12,
                        fill: textColor,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    />
                    <YAxis
                      stroke={subTextColor}
                      tick={{ fill: subTextColor, fontSize: 11 }}
                      label={{
                        value: engineeringChart.yAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        offset: 0,
                        fill: textColor,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: dark ? '#1E293B' : '#FFFFFF',
                        border: cardBorder,
                        borderRadius: 8,
                        fontSize: 12,
                        color: textColor,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    {engineeringChart.lines?.map((line) => (
                      <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        name={line.name}
                        stroke={line.color}
                        strokeWidth={2.5}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Explanation & GATE Takeaway */}
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: dark ? 'rgba(255, 255, 255, 0.03)' : '#F1F5F9',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 13,
                    color: textColor,
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: accentColor }}>Engineering Interpretation: </strong>
                  {engineeringChart.explanation}
                </div>

                <div
                  style={{
                    background: dark ? 'rgba(99, 102, 241, 0.08)' : '#EEF2FF',
                    borderLeft: '4px solid #6366F1',
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 14px',
                    fontSize: 12.5,
                    color: dark ? '#CBD5E1' : '#334155',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: accentColor }}>🎯 Key GATE CE Takeaway: </strong>
                  <FormattedContent inline content={engineeringChart.gateTakeaway} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Step-by-Step Worked Example */}
          {activeTab === 'example' && (
            <div
              style={{
                background: contentBg,
                border: cardBorder,
                borderRadius: 14,
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#10B981',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  Engineering Calculation & Sizing
                </span>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    margin: '3px 0 0 0',
                    color: textColor,
                  }}
                >
                  {workedExample.title}
                </h3>
              </div>

              {/* Problem Statement */}
              <div
                style={{
                  background: dark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                  border: cardBorder,
                  borderRadius: 10,
                  padding: '14px 18px',
                  fontSize: 13.5,
                  color: textColor,
                  lineHeight: 1.7,
                  marginBottom: 18,
                }}
              >
                <strong style={{ color: accentColor }}>Problem Statement: </strong>
                {workedExample.problemStatement}
              </div>

              {/* Given Data */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: subTextColor, margin: '0 0 8px 0' }}>
                  GIVEN DATA (WITH UNITS):
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: textColor, lineHeight: 1.8 }}>
                  {workedExample.givenData?.map((item, idx) => (
                    <li key={idx}>
                      <FormattedContent inline content={item} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Governing Formula */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: subTextColor, margin: '0 0 8px 0' }}>
                  GOVERNING DESIGN EQUATION:
                </h4>
                <div
                  style={{
                    background: dark ? 'rgba(0,0,0,0.3)' : '#EEF2FF',
                    border: cardBorder,
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}
                >
                  <FormattedContent content={workedExample.formula} />
                </div>
              </div>

              {/* Step-by-Step Substitution */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: subTextColor, margin: '0 0 8px 0' }}>
                  STEP-BY-STEP CALCULATION:
                </h4>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: textColor, lineHeight: 1.9 }}>
                  {workedExample.stepByStepSolution?.map((step, sIdx) => (
                    <li key={sIdx}>
                      <FormattedContent inline content={step} />
                    </li>
                  ))}
                </ol>
              </div>

              {/* Final Answer Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>
                  Final Solution:
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#10B981', marginTop: 2 }}>
                  {workedExample.finalAnswer}
                </div>
              </div>

              {/* Practical Significance */}
              <div style={{ fontSize: 12.5, color: subTextColor, lineHeight: 1.6 }}>
                <strong style={{ color: textColor }}>Practical Field Significance: </strong>
                {workedExample.significance}
              </div>
            </div>
          )}

          {/* TAB 5: Explore Further (Safe External Search Links) */}
          {activeTab === 'explore' && (
            <div
              style={{
                background: contentBg,
                border: cardBorder,
                borderRadius: 14,
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    margin: '0 0 4px 0',
                    color: textColor,
                  }}
                >
                  Explore Further: External Reference Tools
                </h3>
                <div style={{ fontSize: 12, color: subTextColor }}>
                  Direct deep-search query links configured with safe external browser tab handlers.
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {/* Google Search Card */}
                <div
                  style={{
                    border: cardBorder,
                    borderRadius: 12,
                    padding: '18px',
                    background: dark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: textColor, marginBottom: 4 }}>
                      Google Academic Search
                    </div>
                    <div style={{ fontSize: 12, color: subTextColor, lineHeight: 1.5, marginBottom: 14 }}>
                      Search Indian Standard specifications (IS codes), CPHEEO manuals, and academic research on <em>{topic}</em>.
                    </div>
                  </div>

                  <a
                    href={googleSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`google-search-${lessonId}`}
                    style={{
                      background: 'linear-gradient(135deg, #4285F4, #3367D6)',
                      color: '#FFFFFF',
                      borderRadius: 8,
                      padding: '10px 16px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'inline-block',
                    }}
                  >
                    Search on Google (New Tab) ↗
                  </a>
                </div>

                {/* YouTube Video Search Card */}
                <div
                  style={{
                    border: cardBorder,
                    borderRadius: 12,
                    padding: '18px',
                    background: dark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>📺</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: textColor, marginBottom: 4 }}>
                      YouTube Animation Search
                    </div>
                    <div style={{ fontSize: 12, color: subTextColor, lineHeight: 1.5, marginBottom: 14 }}>
                      Watch animated physical treatment flows, pilot plant tours, and civil engineering lectures on <em>{topic}</em>.
                    </div>
                  </div>

                  <a
                    href={youtubeSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`youtube-search-${lessonId}`}
                    style={{
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      color: '#FFFFFF',
                      borderRadius: 8,
                      padding: '10px 16px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'inline-block',
                    }}
                  >
                    Watch Videos on YouTube (New Tab) ↗
                  </a>
                </div>
              </div>

              {/* Recommended Topic Suggestions */}
              {exploreFurther?.recommendedTopics?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: subTextColor, marginBottom: 8 }}>
                    RECOMMENDED RESEARCH & CODING TOPICS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {exploreFurther.recommendedTopics.map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 12,
                          background: dark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF',
                          color: accentColor,
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          borderRadius: 6,
                          padding: '4px 10px',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AI Concept Visualizer (Optional Image Generation Action) */}
          {activeTab === 'aiConcept' && (
            <div
              style={{
                background: contentBg,
                border: cardBorder,
                borderRadius: 14,
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: accentColor,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  AI Diagram Assistant
                </span>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    margin: '3px 0 0 0',
                    color: textColor,
                  }}
                >
                  AI-Generated Concept Visualizer
                </h3>
                <div style={{ fontSize: 12, color: subTextColor, marginTop: 4 }}>
                  Generate an AI conceptual layout or explore the high-fidelity SVG schematic fallback.
                </div>
              </div>

              {/* Initial Action or Retry Button */}
              {!aiLoading && !aiResult && !aiError && (
                <div
                  style={{
                    border: '1px dashed #6366F1',
                    borderRadius: 12,
                    padding: '32px 20px',
                    textAlign: 'center',
                    background: dark ? 'rgba(99, 102, 241, 0.04)' : '#F0F4FF',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🎨</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: textColor, margin: '0 0 8px 0' }}>
                    Generate Concept Illustration for {topic}
                  </h4>
                  <p style={{ fontSize: 13, color: subTextColor, maxWidth: 520, margin: '0 auto 18px auto', lineHeight: 1.6 }}>
                    Request an AI-generated schematic representation of this water treatment unit. If the server-side image API is unavailable, the system safely falls back to our verified interactive SVG diagram.
                  </p>
                  <button
                    onClick={handleGenerateAiConcept}
                    id={`generate-concept-image-${lessonId}`}
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 10,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    ✨ Generate Concept Image
                  </button>
                </div>
              )}

              {/* Loading State */}
              {aiLoading && (
                <div
                  style={{
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: dark ? 'rgba(99, 102, 241, 0.05)' : '#F0F4FF',
                    borderRadius: 12,
                    border: '1px dashed #818CF8',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      border: '3px solid rgba(99, 102, 241, 0.2)',
                      borderTopColor: '#6366F1',
                      borderRadius: '50%',
                      margin: '0 auto 14px auto',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <div style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>
                    Consulting AI Model for {topic}...
                  </div>
                  <div style={{ fontSize: 12, color: subTextColor, marginTop: 4 }}>
                    Verifying server credentials and rendering conceptual components
                  </div>
                </div>
              )}

              {/* Error State */}
              {aiError && (
                <div
                  style={{
                    background: dark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 12,
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>
                    Image Generation Notice
                  </div>
                  <div style={{ fontSize: 12.5, color: subTextColor, maxWidth: 540, margin: '0 auto 16px auto', lineHeight: 1.6 }}>
                    {aiError}
                  </div>
                  <button
                    onClick={handleGenerateAiConcept}
                    style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🔄 Retry Generation
                  </button>
                </div>
              )}

              {/* Success Result or Fallback */}
              {aiResult && !aiLoading && (
                <div>
                  {aiResult.imageUrl ? (
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <img
                        src={aiResult.imageUrl}
                        alt={`AI concept schematic for ${topic}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: 400,
                          borderRadius: 12,
                          border: cardBorder,
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        background: dark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: 12,
                        padding: '18px 20px',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, marginBottom: 4 }}>
                        ℹ️ {aiResult.message || 'AI concept visualization active with high-fidelity SVG fallback.'}
                      </div>
                      <div style={{ fontSize: 12, color: subTextColor }}>
                        Our built-in SVG engineering schematic provides full structural annotation.
                      </div>
                    </div>
                  )}

                  {/* Fallback to SVG diagram below */}
                  {DiagramComponent && (
                    <div style={{ marginTop: 16 }}>
                      <DiagramComponent dark={dark} />
                    </div>
                  )}

                  <div style={{ marginTop: 14, textAlign: 'center' }}>
                    <button
                      onClick={handleGenerateAiConcept}
                      style={{
                        background: 'transparent',
                        border: cardBorder,
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 12,
                        color: subTextColor,
                        cursor: 'pointer',
                      }}
                    >
                      🔄 Regenerate / Refresh AI Concept
                    </button>
                  </div>
                </div>
              )}

              {/* Crucial Engineering Disclaimer (Prompt Section 4 Requirement) */}
              <div
                style={{
                  marginTop: 20,
                  background: dark ? 'rgba(245, 158, 11, 0.08)' : '#FEF3C7',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 11.5,
                  color: dark ? '#FDE68A' : '#92400E',
                  lineHeight: 1.5,
                }}
              >
                <strong>⚠️ Pedagogical Visualization Notice:</strong> AI-generated illustrations and diagrams are intended solely for educational intuition and schematic understanding. They do NOT constitute verified civil engineering designs, structural drawings, or construction specifications.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Persistent Bottom Pedagogical Disclaimer */}
      <div
        style={{
          marginTop: isExpanded ? 18 : 0,
          paddingTop: isExpanded ? 12 : 0,
          borderTop: isExpanded ? cardBorder : 'none',
          fontSize: 11,
          color: subTextColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        <span>🏛️ LearnLoop AI Academy · Civil Engineering Visual Learning Suite</span>
        <span>Curated per CPHEEO & IS 10500 Standards</span>
      </div>
    </div>
  );
}
