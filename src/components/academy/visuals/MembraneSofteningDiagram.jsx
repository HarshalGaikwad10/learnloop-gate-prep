// src/components/academy/visuals/MembraneSofteningDiagram.jsx
import React from 'react';

export default function MembraneSofteningDiagram({ dark = true }) {
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
        aria-label="Process Diagram: Chemical Lime-Soda Precipitation vs Cross-Flow Membrane Reverse Osmosis"
        role="img"
      >
        <defs>
          <marker id="arrow-mem" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#818CF8" />
          </marker>
        </defs>

        <text x="30" y="32" fill={textColor} fontSize="14" fontWeight="800" fontFamily="'Outfit', sans-serif">
          WATER SOFTENING (LIME-SODA) & ADVANCED MEMBRANE SEPARATION (RO / NF)
        </text>
        <text x="30" y="52" fill={subTextColor} fontSize="11" fontFamily="'DM Sans', sans-serif">
          Precipitation of Hardness (CaCO₃↓ & Mg(OH)₂↓) vs Cross-Flow Semi-Permeable Exclusion (Jw = A·(ΔP - ΔΠ))
        </text>

        {/* Left Side: Lime-Soda Softening Process Train */}
        <g transform="translate(30, 75)">
          <rect x="0" y="0" width="370" height="255" rx="10" fill={boxBg} stroke={boxBorder} strokeWidth="1" />
          <text x="16" y="24" fill="#F59E0B" fontSize="13" fontWeight="700" fontFamily="'Outfit', sans-serif">
            A. Lime-Soda Chemical Precipitation
          </text>
          <text x="16" y="40" fill={subTextColor} fontSize="10.5">
            Hydrated Lime Ca(OH)₂ + Soda Ash Na₂CO₃
          </text>

          {/* Sequence boxes */}
          {[
            { title: '1. Quick Mixing', desc: 'Lime + Soda Dosing (pH ~10.8)' },
            { title: '2. Flocculation & Settling', desc: 'CaCO₃ & Mg(OH)₂ Precipitates Settle' },
            { title: '3. Recarbonation Basin', desc: 'CO₂ injection prevents pipe scaling' }
          ].map((step, idx) => (
            <g key={idx} transform={`translate(16, ${55 + idx * 56})`}>
              <rect x="0" y="0" width="338" height="46" rx="6" fill={dark ? 'rgba(0,0,0,0.3)' : '#FFF'} stroke={boxBorder} />
              <text x="12" y="19" fill="#F59E0B" fontSize="11" fontWeight="700">{step.title}</text>
              <text x="12" y="35" fill={subTextColor} fontSize="10">{step.desc}</text>
            </g>
          ))}

          {/* Bottom Note */}
          <text x="16" y="240" fill="#10B981" fontSize="9.5" fontWeight="600">
            • Lime removes CO₂ + Carbonate Hardness | Soda removes Non-Carbonate Hardness
          </text>
        </g>

        {/* Right Side: Cross-Flow Membrane Unit (RO/NF) */}
        <g transform="translate(425, 75)">
          <rect x="0" y="0" width="445" height="255" rx="10" fill={boxBg} stroke={boxBorder} strokeWidth="1" />
          <text x="18" y="24" fill="#38BDF8" fontSize="13" fontWeight="700" fontFamily="'Outfit', sans-serif">
            B. Cross-Flow Membrane Module (RO / NF)
          </text>
          <text x="18" y="40" fill={subTextColor} fontSize="10.5">
            Pressure Vessel with Spiral-Wound Polyamide Elements
          </text>

          {/* Pressure Vessel Tube */}
          <rect x="40" y="70" width="320" height="90" rx="10" fill="rgba(56, 189, 248, 0.12)" stroke="#0284C7" strokeWidth="2" />
          {/* Semi-permeable membrane core */}
          <line x1="40" y1="115" x2="360" y2="115" stroke="#38BDF8" strokeWidth="3" strokeDasharray="6,4" />
          <text x="200" y="110" fill="#38BDF8" fontSize="9.5" textAnchor="middle" fontWeight="700">
            Semi-Permeable Membrane Barrier (0.0001 – 0.001 μm)
          </text>

          {/* Feed Water Inflow */}
          <line x1="5" y1="95" x2="40" y2="95" stroke="#F59E0B" strokeWidth="3" markerEnd="url(#arrow-mem)" />
          <text x="2" y="85" fill="#F59E0B" fontSize="10" fontWeight="700">High-P Feed</text>
          <text x="2" y="130" fill={subTextColor} fontSize="8.5">(15–70 bar)</text>

          {/* Concentrate / Retentate Outflow */}
          <line x1="360" y1="95" x2="420" y2="95" stroke="#EF4444" strokeWidth="3" markerEnd="url(#arrow-mem)" />
          <text x="365" y="85" fill="#EF4444" fontSize="10" fontWeight="700">Brine / Retentate</text>
          <text x="365" y="130" fill={subTextColor} fontSize="8.5">(Rejected Salts)</text>

          {/* Permeate Water Flow (Clean Water Out) */}
          <line x1="200" y1="115" x2="200" y2="185" stroke="#10B981" strokeWidth="3" markerEnd="url(#arrow-mem)" />
          <rect x="135" y="190" width="130" height="24" rx="4" fill="#10B981" />
          <text x="200" y="206" fill="#FFF" fontSize="10" fontWeight="700" textAnchor="middle">
            Pure Permeate Out ↓
          </text>

          {/* Flux Equation Box */}
          <rect x="25" y="222" width="395" height="26" rx="4" fill={dark ? 'rgba(0,0,0,0.4)' : '#FFF'} />
          <text x="222" y="239" fill="#818CF8" fontSize="10" fontFamily="monospace" textAnchor="middle">
            Water Flux: Jw = A·(ΔP - ΔΠ)  |  Solute Flux: Js = B·(Cf - Cp)
          </text>
        </g>
      </svg>
    </div>
  );
}
