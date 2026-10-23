// src/components/academy/visuals/SedimentationBasinDiagram.jsx
import React from 'react';

export default function SedimentationBasinDiagram({ dark = true }) {
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
        aria-label="Engineering Diagram: Continuous Flow Rectangular Sedimentation Basin (Settling Zones & Particle Trajectories)"
        role="img"
      >
        <defs>
          <marker id="arrow-sed" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6366F1" />
          </marker>
          <marker id="arrow-traj" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#EF4444" />
          </marker>
        </defs>

        <text x="30" y="32" fill={textColor} fontSize="14" fontWeight="800" fontFamily="'Outfit', sans-serif">
          CONTINUOUS-FLOW RECTANGULAR SEDIMENTATION BASIN (TYPE I & II SETTLING)
        </text>
        <text x="30" y="52" fill={subTextColor} fontSize="11" fontFamily="'DM Sans', sans-serif">
          Four Functional Zones: Inlet, Settling Zone, Sludge Hopper, and Effluent Weir Crest (SOR = Q / As)
        </text>

        {/* Main Settling Basin Tank Graphic */}
        <g transform="translate(40, 75)">
          {/* Water Body */}
          <rect x="70" y="30" width="670" height="150" fill="rgba(56, 189, 248, 0.15)" />
          {/* Concrete Basin Walls */}
          <path
            d="M 20 10 L 70 30 L 70 180 L 170 230 L 740 180 L 740 30 L 820 10"
            fill="none"
            stroke="#64748B"
            strokeWidth="3"
          />

          {/* 4 Functional Zones Division Lines */}
          {/* Zone 1: Inlet Zone (0 to 120) */}
          <line x1="120" y1="30" x2="120" y2="180" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x="80" y="22" fill="#818CF8" fontSize="10.5" fontWeight="700">1. Inlet Zone</text>
          {/* Perforated Baffle */}
          <line x1="100" y1="30" x2="100" y2="160" stroke="#94A3B8" strokeWidth="3" strokeDasharray="10,6" />

          {/* Zone 2: Settling Zone (120 to 680) */}
          <line x1="680" y1="30" x2="680" y2="180" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x="390" y="22" fill="#10B981" fontSize="11" fontWeight="700" textAnchor="middle">
            2. Settling Zone (Length = L, Depth = H)
          </text>

          {/* Zone 3: Outlet Weir Zone (680 to 740) */}
          <text x="715" y="22" fill="#F59E0B" fontSize="10.5" fontWeight="700">3. Outlet Weir</text>
          {/* Overflow Weir */}
          <rect x="735" y="45" width="8" height="40" fill="#F59E0B" />
          <path d="M 743 45 Q 755 50, 775 80" fill="none" stroke="#38BDF8" strokeWidth="3" />
          <text x="755" y="98" fill="#38BDF8" fontSize="9.5" fontWeight="700">Clarified Effluent →</text>

          {/* Zone 4: Sludge Zone Hopper */}
          <path d="M 70 180 L 170 230 L 220 230 L 250 180 Z" fill="rgba(180, 83, 9, 0.25)" stroke="#B45309" strokeWidth="1.5" />
          <text x="175" y="215" fill="#F59E0B" fontSize="10" fontWeight="700" textAnchor="middle">4. Sludge Hopper</text>

          {/* Velocity Vectors */}
          {/* Horizontal Flow Velocity v0 */}
          <g transform="translate(140, 60)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#6366F1" strokeWidth="2.5" markerEnd="url(#arrow-sed)" />
            <text x="30" y="-8" fill="#6366F1" fontSize="10.5" fontWeight="700" textAnchor="middle">Flow v₀ = Q / (B·H)</text>
          </g>

          {/* Critical Particle Settling Trajectory (Settles exactly at weir base) */}
          <line x1="120" y1="30" x2="680" y2="180" stroke="#10B981" strokeWidth="2.5" strokeDasharray="5,3" markerEnd="url(#arrow-sed)" />
          <text x="380" y="95" fill="#10B981" fontSize="10" fontWeight="700" transform="rotate(15, 380, 95)">
            Critical Particle: vs = vs0 (100% Removed)
          </text>

          {/* Sub-critical Particle Trajectory (Partial removal η = vs / vs0) */}
          <line x1="120" y1="30" x2="680" y2="130" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrow-traj)" />
          <text x="440" y="65" fill="#EF4444" fontSize="9.5" fontWeight="600">
            Escaping Particle: vs &lt; vs0 (Overweir loss)
          </text>

          {/* Stokes Law / SOR Formula Cards */}
          <rect x="290" y="195" width="460" height="48" rx="6" fill={dark ? 'rgba(0,0,0,0.45)' : '#FFF'} stroke={boxBorder} />
          <text x="305" y="214" fill="#818CF8" fontSize="10" fontFamily="monospace" fontWeight="700">
            SOR (Surface Overflow Rate) = Q / As = vs0  [m³/m²/day or m/s]
          </text>
          <text x="305" y="232" fill={subTextColor} fontSize="9.5">
            Stokes' Law: vs = g·(ρs - ρ)·d² / (18μ) | Basin Removal Efficiency η = (vs / vs0) × 100%
          </text>
        </g>
      </svg>
    </div>
  );
}
