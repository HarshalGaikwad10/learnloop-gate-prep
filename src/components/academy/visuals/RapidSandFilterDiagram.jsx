// src/components/academy/visuals/RapidSandFilterDiagram.jsx
import React from 'react';

export default function RapidSandFilterDiagram({ dark = true }) {
  const textColor = dark ? '#F1F5F9' : '#0F172A';
  const subTextColor = dark ? '#94A3B8' : '#64748B';
  const boxBg = dark ? '#1E293B' : '#F1F5F9';
  const boxBorder = dark ? '#334155' : '#CBD5E1';

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '10px 0' }}>
      <svg
        viewBox="0 0 900 360"
        style={{
          width: '100%',
          minWidth: 700,
          maxHeight: 380,
          display: 'block',
          background: dark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
          borderRadius: 12,
          border: `1px solid ${boxBorder}`,
        }}
        aria-label="Engineering Schematic: Rapid Sand Filter Cross-Section and Dual Filtration/Backwash Modes"
        role="img"
      >
        <defs>
          <marker id="arrow-down-filt" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#38BDF8" />
          </marker>
          <marker id="arrow-up-back" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#10B981" />
          </marker>
          <pattern id="sandPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#D97706" opacity="0.6" />
            <circle cx="7" cy="7" r="1.5" fill="#B45309" opacity="0.7" />
          </pattern>
          <pattern id="gravelPattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <ellipse cx="5" cy="5" rx="3.5" ry="2.5" fill="#64748B" opacity="0.8" />
            <ellipse cx="12" cy="11" rx="4" ry="3" fill="#475569" opacity="0.8" />
          </pattern>
        </defs>

        <text x="30" y="32" fill={textColor} fontSize="14" fontWeight="800" fontFamily="'Outfit', sans-serif">
          RAPID SAND FILTER (RSF): MEDIA STRATIFICATION & BACKWASH HYDRAULICS
        </text>
        <text x="30" y="52" fill={subTextColor} fontSize="11" fontFamily="'DM Sans', sans-serif">
          Filtration Rate: 4.8 – 6.0 m³/m²/hr | Sand Depth: 60–75 cm (d₁₀ = 0.5 mm, Cu = 1.3–1.7) | Bed Expansion: 40–50%
        </text>

        {/* Filter Cross-Section Basin */}
        <g transform="translate(40, 70)">
          {/* Concrete Structure */}
          <rect x="50" y="20" width="460" height="240" fill={boxBg} stroke="#64748B" strokeWidth="3" rx="4" />

          {/* Supernatant Water Depth (1.5 - 2.0 m) */}
          <rect x="52" y="22" width="456" height="68" fill="rgba(56, 189, 248, 0.2)" />
          <text x="65" y="42" fill="#38BDF8" fontSize="10.5" fontWeight="700">Water Supernatant (1.5 – 2.0 m Head)</text>

          {/* Washwater Gullet / Troughs */}
          <rect x="360" y="35" width="85" height="35" fill="#475569" rx="3" stroke="#94A3B8" />
          <text x="402" y="57" fill="#F8FAFC" fontSize="9.5" textAnchor="middle" fontWeight="700">Wash Trough</text>

          {/* Silica Sand Layer (60 - 75 cm) */}
          <rect x="52" y="90" width="456" height="80" fill="url(#sandPattern)" />
          <line x1="52" y1="90" x2="508" y2="90" stroke="#D97706" strokeWidth="1.5" />
          <rect x="65" y="96" width="180" height="20" rx="3" fill={dark ? 'rgba(0,0,0,0.6)' : '#FFF'} />
          <text x="70" y="110" fill="#D97706" fontSize="10" fontWeight="700">
            Fine Quartz Sand Bed (d₁₀ = 0.5mm, 60–75cm)
          </text>

          {/* Supporting Graded Gravel Layer (40 - 50 cm) */}
          <rect x="52" y="170" width="456" height="50" fill="url(#gravelPattern)" />
          <line x1="52" y1="170" x2="508" y2="170" stroke="#64748B" strokeWidth="1.5" />
          <rect x="65" y="176" width="185" height="20" rx="3" fill={dark ? 'rgba(0,0,0,0.6)' : '#FFF'} />
          <text x="70" y="190" fill="#CBD5E1" fontSize="10" fontWeight="700">
            Graded Gravel Bed (2 to 40 mm, 45cm)
          </text>

          {/* Underdrain System (Wheeler / Perforated Pipe Strainers) */}
          <rect x="52" y="220" width="456" height="38" fill="rgba(99, 102, 241, 0.15)" stroke="#6366F1" strokeWidth="1" />
          {/* Strainer nozzles */}
          {[100, 160, 220, 280, 340, 400, 460].map((nx) => (
            <circle key={nx} cx={nx} cy="238" r="7" fill="#818CF8" />
          ))}
          <text x="280" y="242" fill="#818CF8" fontSize="9" fontWeight="700" textAnchor="middle">
            Underdrain Lateral Pipes & Strainers
          </text>

          {/* Flow Direction Annotations */}
          {/* Downward Filtration Flow */}
          <g transform="translate(18, 90)">
            <line x1="12" y1="0" x2="12" y2="60" stroke="#38BDF8" strokeWidth="3" markerEnd="url(#arrow-down-filt)" />
            <text x="12" y="80" fill="#38BDF8" fontSize="9.5" fontWeight="700" textAnchor="middle">
              Normal Filtration ↓
            </text>
          </g>

          {/* Right Side Control & Calculation Notes */}
          <g transform="translate(530, 20)">
            <rect x="0" y="0" width="290" height="240" rx="8" fill={boxBg} stroke={boxBorder} />
            <text x="16" y="24" fill="#10B981" fontSize="12" fontWeight="700" fontFamily="'Outfit', sans-serif">
              Backwash Fluidization Mechanism
            </text>

            <text x="16" y="44" fill={textColor} fontSize="10.5" fontWeight="600">
              Triggered when Head Loss reaches ~2.5 to 3.0 m
            </text>
            <text x="16" y="60" fill={subTextColor} fontSize="10">
              1. Air Scouring: 1.0–1.5 m³ air/m²/min (breaks mud balls)
            </text>
            <text x="16" y="75" fill={subTextColor} fontSize="10">
              2. Upward Water Wash: 36–54 m³/m²/hr (6–10 mins)
            </text>
            <text x="16" y="90" fill={subTextColor} fontSize="10">
              3. Bed expands by 40% – 50% for particle release
            </text>

            <line x1="16" y1="105" x2="274" y2="105" stroke={boxBorder} strokeWidth="1" />

            <text x="16" y="125" fill="#818CF8" fontSize="11" fontWeight="700">
              Key Engineering Formulas (GATE CE):
            </text>
            <rect x="14" y="135" width="262" height="42" rx="4" fill={dark ? 'rgba(0,0,0,0.4)' : '#FFF'} />
            <text x="22" y="152" fill="#818CF8" fontSize="9.5" fontFamily="monospace">
              Clean Bed (Carman-Kozeny):
            </text>
            <text x="22" y="167" fill="#818CF8" fontSize="9.5" fontFamily="monospace">
              hf = f·(L/d)·[(1-e)/e³]·(v²/g)
            </text>

            <rect x="14" y="185" width="262" height="42" rx="4" fill={dark ? 'rgba(0,0,0,0.4)' : '#FFF'} />
            <text x="22" y="202" fill="#10B981" fontSize="9.5" fontFamily="monospace">
              Expansion (Leva):
            </text>
            <text x="22" y="217" fill="#10B981" fontSize="9.5" fontFamily="monospace">
              L_exp · (1 - e_exp) = L_clean · (1 - e_clean)
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
