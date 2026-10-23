// src/components/academy/visuals/FlowsheetAerationDiagram.jsx
import React from 'react';

export default function FlowsheetAerationDiagram({ dark = true }) {
  const textColor = dark ? '#F1F5F9' : '#0F172A';
  const subTextColor = dark ? '#94A3B8' : '#64748B';
  const boxBg = dark ? '#1E293B' : '#F1F5F9';
  const boxBorder = dark ? '#334155' : '#CBD5E1';
  const waterBlue = '#38BDF8';
  const arrowColor = '#818CF8';

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
        aria-label="Process Flow Diagram: Municipal Water Treatment and Cascade Aerator"
        role="img"
      >
        <defs>
          <marker
            id="arrowhead-flow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={arrowColor} />
          </marker>
          <linearGradient id="cascadeWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Section 1: Top Treatment Sequence Schematic */}
        <text x="30" y="32" fill={textColor} fontSize="14" fontWeight="800" fontFamily="'Outfit', sans-serif">
          STAGE 1 & 2: RAW WATER INTAKE, SCREENING & CASCADE AERATION
        </text>
        <text x="30" y="52" fill={subTextColor} fontSize="11" fontFamily="'DM Sans', sans-serif">
          Standard Indian CPHEEO Multi-Barrier Water Treatment Train (Gravity Cascade Aerator Detail)
        </text>

        {/* Process Flow Mini Bar */}
        <g transform="translate(30, 68)">
          {[
            { name: '1. Intake', x: 0, w: 90, active: true },
            { name: '2. Screens', x: 105, w: 90, active: true },
            { name: '3. Aeration', x: 210, w: 95, active: true },
            { name: '4. Coagulation', x: 320, w: 100, active: false },
            { name: '5. Clarifier', x: 435, w: 95, active: false },
            { name: '6. Filter', x: 545, w: 85, active: false },
            { name: '7. Chlorination', x: 645, w: 105, active: false },
            { name: '8. Sump', x: 765, w: 75, active: false }
          ].map((item, idx) => (
            <g key={idx}>
              <rect
                x={item.x}
                y="0"
                width={item.w}
                height="28"
                rx="6"
                fill={item.active ? (dark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)') : boxBg}
                stroke={item.active ? '#6366F1' : boxBorder}
                strokeWidth={item.active ? 1.5 : 1}
              />
              <text
                x={item.x + item.w / 2}
                y="18"
                fill={item.active ? '#818CF8' : subTextColor}
                fontSize="11"
                fontWeight={item.active ? '700' : '500'}
                textAnchor="middle"
                fontFamily="'DM Sans', sans-serif"
              >
                {item.name}
              </text>
              {idx < 7 && (
                <line
                  x1={item.x + item.w + 2}
                  y1="14"
                  x2={item.x + item.w + 12}
                  y2="14"
                  stroke={arrowColor}
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead-flow)"
                />
              )}
            </g>
          ))}
        </g>

        {/* Section 2: Detailed Cross-Section of Bar Screen & Cascade Aerator */}
        {/* Left Sub-Unit: Bar Screen Channel */}
        <g transform="translate(30, 118)">
          <rect x="0" y="0" width="280" height="215" rx="10" fill={boxBg} stroke={boxBorder} strokeWidth="1" />
          <text x="16" y="24" fill={textColor} fontSize="13" fontWeight="700" fontFamily="'Outfit', sans-serif">
            A. Trash Rack & Bar Screen Channel
          </text>
          <text x="16" y="40" fill={subTextColor} fontSize="10.5">
            Approach Velocity: 0.6 – 0.9 m/s | Angle: 45°–60°
          </text>

          {/* Concrete Channel */}
          <path d="M 20 150 L 70 150 L 120 170 L 260 170" fill="none" stroke="#64748B" strokeWidth="4" />
          {/* Water in channel */}
          <path d="M 20 110 L 70 110 L 120 130 L 260 130 L 260 170 L 120 170 L 70 150 L 20 150 Z" fill={waterBlue} opacity="0.3" />

          {/* Bar Screen (inclined bars at 55 deg) */}
          <line x1="85" y1="80" x2="145" y2="175" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="80" x2="160" y2="175" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
          <line x1="115" y1="80" x2="175" y2="175" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />

          {/* Floating debris stopped */}
          <circle cx="82" cy="112" r="6" fill="#EF4444" />
          <text x="40" y="88" fill="#EF4444" fontSize="10" fontWeight="700">Trapped Debris</text>
          <line x1="80" y1="92" x2="82" y2="104" stroke="#EF4444" strokeWidth="1" />

          {/* Kirschmer formula hint */}
          <rect x="15" y="180" width="250" height="26" rx="5" fill={dark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)'} />
          <text x="22" y="197" fill="#818CF8" fontSize="10.5" fontFamily="monospace">
            h_L = β·(w/b)^(4/3)·(v²/2g)·sin(θ)
          </text>
        </g>

        {/* Right Sub-Unit: Cascade Aerator Steps */}
        <g transform="translate(330, 118)">
          <rect x="0" y="0" width="540" height="215" rx="10" fill={boxBg} stroke={boxBorder} strokeWidth="1" />
          <text x="18" y="24" fill={textColor} fontSize="13" fontWeight="700" fontFamily="'Outfit', sans-serif">
            B. Multi-Tier Cascade Aerator & Chemistry
          </text>
          <text x="18" y="40" fill={subTextColor} fontSize="10.5">
            4–6 Concrete Drops (1.2–3.0 m total) | Area: 0.015–0.045 m²/(m³/day)
          </text>

          {/* Central inlet pipe */}
          <rect x="35" y="60" width="30" height="110" fill="#475569" rx="2" />
          <polygon points="25,60 75,60 65,70 35,70" fill="#64748B" />
          <text x="50" y="185" fill={subTextColor} fontSize="9.5" textAnchor="middle">Raw Feed Pipe</text>

          {/* Cascade Trays (Tiered) */}
          {/* Top Tray 1 */}
          <rect x="80" y="70" width="60" height="10" fill="#64748B" rx="2" />
          {/* Tray 2 */}
          <rect x="140" y="95" width="65" height="10" fill="#64748B" rx="2" />
          {/* Tray 3 */}
          <rect x="205" y="120" width="70" height="10" fill="#64748B" rx="2" />
          {/* Tray 4 (Bottom collecting tray) */}
          <rect x="275" y="145" width="100" height="12" fill="#64748B" rx="2" />

          {/* Cascading Water Flow */}
          <path
            d="M 50 60 Q 65 55, 85 70 L 140 70 Q 145 75, 145 95 L 205 95 Q 210 100, 210 120 L 275 120 Q 280 125, 280 145 L 375 145"
            fill="none"
            stroke="url(#cascadeWater)"
            strokeWidth="5"
          />

          {/* Atmospheric Gas Exchange Arrows */}
          {/* Influx of O2 */}
          <g transform="translate(180, 56)">
            <text x="0" y="0" fill="#10B981" fontSize="11" fontWeight="700">O₂ Absorption ↓</text>
            <line x1="30" y1="4" x2="30" y2="24" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrowhead-flow)" />
          </g>

          {/* Outflux of H2S & CO2 */}
          <g transform="translate(260, 56)">
            <text x="0" y="0" fill="#F59E0B" fontSize="11" fontWeight="700">CO₂ & H₂S Stripping ↑</text>
            <line x1="45" y1="20" x2="45" y2="4" stroke="#F59E0B" strokeWidth="1.5" markerEnd="url(#arrowhead-flow)" />
          </g>

          {/* Chemical Reaction Callout Box */}
          <rect x="260" y="90" width="265" height="72" rx="6" fill={dark ? 'rgba(0,0,0,0.35)' : '#FFFFFF'} stroke={boxBorder} />
          <text x="270" y="108" fill="#10B981" fontSize="10.5" fontWeight="700">
            Chemical Oxidation Reaction:
          </text>
          <text x="270" y="124" fill={textColor} fontSize="10" fontFamily="monospace">
            4Fe²⁺ + O₂ + 10H₂O → 4Fe(OH)₃↓ + 8H⁺
          </text>
          <text x="270" y="140" fill={subTextColor} fontSize="9.5">
            • 1 mg/L O₂ oxidizes 7 mg/L Fe²⁺ to insoluble flocs
          </text>
          <text x="270" y="153" fill={subTextColor} fontSize="9.5">
            • Must precede sand filters to catch precipitate!
          </text>

          {/* Outlet to Coagulation Basin */}
          <line x1="375" y1="151" x2="520" y2="151" stroke="#38BDF8" strokeWidth="4" />
          <text x="445" y="170" fill="#38BDF8" fontSize="10.5" fontWeight="700" textAnchor="middle">
            Aerated Effluent to Rapid Mix →
          </text>
        </g>
      </svg>
    </div>
  );
}
