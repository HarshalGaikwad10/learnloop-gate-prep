// src/components/academy/visuals/BreakpointChlorinationDiagram.jsx
import React from 'react';

export default function BreakpointChlorinationDiagram({ dark = true }) {
  const textColor = dark ? '#F1F5F9' : '#0F172A';
  const subTextColor = dark ? '#94A3B8' : '#64748B';
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
        aria-label="Process Diagram: Four Zones of Breakpoint Chlorination and Inactivation Kinetics"
        role="img"
      >
        <defs>
          <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="65%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        <text x="30" y="32" fill={textColor} fontSize="14" fontWeight="800" fontFamily="'Outfit', sans-serif">
          BREAKPOINT CHLORINATION PROFILE & CHEMICAL DISINFECTION ZONES
        </text>
        <text x="30" y="52" fill={subTextColor} fontSize="11" fontFamily="'DM Sans', sans-serif">
          Chlorine Residual vs Applied Chlorine Dose: Identifying the Dip and Free Available Chlorine (HOCl + OCl⁻)
        </text>

        {/* Graph Canvas Area */}
        <g transform="translate(60, 75)">
          {/* Axes */}
          <line x1="40" y1="220" x2="780" y2="220" stroke="#64748B" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="220" stroke="#64748B" strokeWidth="2" />

          {/* Axis Labels */}
          <text x="410" y="246" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
            Applied Chlorine Dose (mg/L) →
          </text>
          <text x="-120" y="15" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle" transform="rotate(-90)">
            Chlorine Residual (mg/L) →
          </text>

          {/* 4 Distinct Zones Shading */}
          {/* Zone 1: 40 to 180 */}
          <rect x="40" y="30" width="140" height="190" fill="rgba(148, 163, 184, 0.08)" />
          <line x1="180" y1="30" x2="180" y2="220" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />
          <text x="110" y="45" fill="#94A3B8" fontSize="10.5" fontWeight="700" textAnchor="middle">Zone 1</text>
          <text x="110" y="60" fill={subTextColor} fontSize="9" textAnchor="middle">Fe²⁺, Mn²⁺, H₂S</text>
          <text x="110" y="73" fill={subTextColor} fontSize="9" textAnchor="middle">Oxidation (Zero Residual)</text>

          {/* Zone 2: 180 to 360 */}
          <rect x="180" y="30" width="180" height="190" fill="rgba(245, 158, 11, 0.08)" />
          <line x1="360" y1="30" x2="360" y2="220" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />
          <text x="270" y="45" fill="#F59E0B" fontSize="10.5" fontWeight="700" textAnchor="middle">Zone 2</text>
          <text x="270" y="60" fill={subTextColor} fontSize="9" textAnchor="middle">Combined Residual</text>
          <text x="270" y="73" fill={subTextColor} fontSize="9" textAnchor="middle">(NH₂Cl, NHCl₂)</text>

          {/* Zone 3: 360 to 520 */}
          <rect x="360" y="30" width="160" height="190" fill="rgba(239, 68, 68, 0.08)" />
          <line x1="520" y1="30" x2="520" y2="220" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />
          <text x="440" y="45" fill="#EF4444" fontSize="10.5" fontWeight="700" textAnchor="middle">Zone 3</text>
          <text x="440" y="60" fill={subTextColor} fontSize="9" textAnchor="middle">Destruction of</text>
          <text x="440" y="73" fill={subTextColor} fontSize="9" textAnchor="middle">Chloramines (N₂ ↑)</text>

          {/* Zone 4: 520 to 780 */}
          <rect x="520" y="30" width="260" height="190" fill="rgba(16, 185, 129, 0.08)" />
          <text x="650" y="45" fill="#10B981" fontSize="10.5" fontWeight="700" textAnchor="middle">Zone 4: Free Residual</text>
          <text x="650" y="60" fill={subTextColor} fontSize="9" textAnchor="middle">HOCl + OCl⁻ (45° Line)</text>
          <text x="650" y="73" fill={subTextColor} fontSize="9" textAnchor="middle">True Pathogen Inactivation</text>

          {/* The Iconic Breakpoint Curve */}
          <path
            d="M 40 220 L 180 220 C 220 200, 270 120, 360 110 C 420 110, 480 180, 520 195 L 750 40"
            fill="none"
            stroke="url(#curveGrad)"
            strokeWidth="4"
          />

          {/* Peak Callout (Combined Chloramine Peak) */}
          <circle cx="360" cy="110" r="5" fill="#F59E0B" />
          <text x="360" y="98" fill="#F59E0B" fontSize="9.5" fontWeight="700" textAnchor="middle">
            Chloramine Peak
          </text>

          {/* The Breakpoint Dip Callout */}
          <circle cx="520" cy="195" r="7" fill="#EF4444" stroke="#FFF" strokeWidth="2" />
          <rect x="470" y="145" width="105" height="26" rx="4" fill="#EF4444" />
          <text x="522" y="162" fill="#FFF" fontSize="10" fontWeight="800" textAnchor="middle">
            ★ BREAKPOINT
          </text>
          <line x1="522" y1="172" x2="520" y2="187" stroke="#EF4444" strokeWidth="2" />

          {/* Chick-Watson Kinetics Formula Tag */}
          <rect x="540" y="170" width="220" height="42" rx="5" fill={dark ? 'rgba(0,0,0,0.5)' : '#FFF'} stroke={boxBorder} />
          <text x="550" y="188" fill="#10B981" fontSize="10" fontFamily="monospace" fontWeight="700">
            ln(Nt / N0) = -k · C^n · t
          </text>
          <text x="550" y="203" fill={subTextColor} fontSize="9">
            HOCl is 80-100× more lethal than OCl⁻ (pH &lt; 7.5 preferred)
          </text>
        </g>
      </svg>
    </div>
  );
}
