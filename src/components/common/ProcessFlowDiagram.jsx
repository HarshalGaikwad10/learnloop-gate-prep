// src/components/common/ProcessFlowDiagram.jsx — Responsive Engineering Process Flowchart
import React from 'react';

/**
 * Standard Municipal Water Treatment Plant Stages:
 * 1. Raw Water Intake
 * 2. Coarse/Fine Screening
 * 3. Aeration
 * 4. Coagulation (Rapid Mixing)
 * 5. Flocculation
 * 6. Sedimentation (Clarifier)
 * 7. Rapid Sand Filtration
 * 8. Disinfection (Chlorination)
 * 9. Clear Water Sump
 */
export default function ProcessFlowDiagram({
  stages = [],
  title = 'Municipal Surface Water Treatment Sequence',
  subtitle = 'Multi-barrier treatment train from raw surface source to potable clear water storage',
  className = ''
}) {
  // Normalize stages if given as array of strings, objects, or a single delimited string
  let normalizedStages = [];
  if (Array.isArray(stages)) {
    normalizedStages = stages.map((s, idx) => {
      if (typeof s === 'string') {
        return { step: idx + 1, name: s.trim() };
      }
      return { step: s.step || idx + 1, name: s.name || s.title || '', desc: s.desc || '' };
    });
  } else if (typeof stages === 'string') {
    // Split by arrows ->, \to, →, or newlines
    const rawItems = stages
      .replace(/\\to|->|→/g, '@@ARROW@@')
      .split('@@ARROW@@')
      .map(s => s.replace(/\\text\{([^}]+)\}/g, '$1').replace(/\$+/g, '').trim())
      .filter(s => s.length > 0);

    normalizedStages = rawItems.map((name, idx) => ({
      step: idx + 1,
      name
    }));
  }

  if (normalizedStages.length === 0) return null;

  return (
    <div
      className={`ll-process-flow-container ${className}`}
      role="region"
      aria-label={title || 'Process Flow Diagram'}
      data-testid="process-flow-diagram"
    >
      {(title || subtitle) && (
        <div className="ll-process-flow-header">
          {title && <h4 className="ll-process-flow-title">{title}</h4>}
          {subtitle && <p className="ll-process-flow-subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="ll-process-flow-track" role="list">
        {normalizedStages.map((stage, idx) => {
          const isLast = idx === normalizedStages.length - 1;
          return (
            <React.Fragment key={idx}>
              <div
                className="ll-process-step"
                role="listitem"
                data-step={stage.step}
              >
                <div className="ll-process-step-badge" aria-hidden="true">
                  {stage.step}
                </div>
                <div className="ll-process-step-content">
                  <span className="ll-process-step-name">{stage.name}</span>
                  {stage.desc && (
                    <span className="ll-process-step-desc">{stage.desc}</span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="ll-process-connector" aria-hidden="true">
                  {/* Horizontal Arrow (Desktop) */}
                  <svg
                    className="ll-connector-arrow horizontal"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  {/* Vertical Arrow (Mobile) */}
                  <svg
                    className="ll-connector-arrow vertical"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="5 12 12 19 19 12" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
