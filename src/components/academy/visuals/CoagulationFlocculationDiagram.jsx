// src/components/academy/visuals/CoagulationFlocculationDiagram.jsx
import React from 'react';

export default function CoagulationFlocculationDiagram({ dark = true }) {
  const textColor = dark ? '#F1F5F9' : '#0F172A';
  const subTextColor = dark ? '#94A3B8' : '#475569';
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
        aria-label="Process Diagram: Rapid Mix Coagulation Basin and Flocculation Chamber"
        role="img"
      >
        <defs>
          <marker id="arrow-coag" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#818CF8" />
          </marker>
        </defs>

        <text x="30" y="32" fill={textColor} fontSize="14" fontWeight="800" fontFamily="'Outfit', sans-serif">
          COAGULATION & FLOCCULATION: HYDRAULIC & CHEMICAL KINETICS
        </text>
        <text x="30" y="52" fill={subTextColor} fontSize="11" fontFamily="'DM Sans', sans-serif">
          From Flash Chemical Dispersion (G = 300–1000 s⁻¹) to Gentle Floc Agglomeration (G = 20–70 s⁻¹)
        </text>

        {/* Tank 1: Rapid Mix Flash Mixer */}
        <g transform="translate(30, 70)">
          <rect x="0" y="0" width="280" height="260" rx="10" fill={boxBg} stroke={boxBorder} strokeWidth="1" />
          <text x="16" y="24" fill="#818CF8" fontSize="13" fontWeight="700" fontFamily="'Outfit', sans-serif">
            1. Rapid Mix Unit (Flash Mixer)
          </text>
          <text x="16" y="40" fill={subTextColor} fontSize="10.5">
            Detention: 30–60 s | G = 600–1000 s⁻¹
          </text>

          {/* Tank body */}
          <rect x="35" y="65" width="210" height="150" fill="rgba(56, 189, 248, 0.15)" stroke="#64748B" strokeWidth="2" rx="4" />

          {/* High speed motor & shaft */}
          <rect x="125" y="45" width="30" height="20" fill="#6366F1" rx="3" />
          <text x="140" y="58" fill="#FFF" fontSize="9" textAnchor="middle" fontWeight="700">MOTOR</text>
          <line x1="140" y1="65" x2="140" y2="175" stroke="#CBD5E1" strokeWidth="4" />

          {/* Impeller blades */}
          <ellipse cx="140" cy="175" rx="45" ry="12" fill="#818CF8" stroke="#4F46E5" strokeWidth="2" />

          {/* Turbulent vortex curls */}
          <path d="M 80 140 Q 65 175, 100 190" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3,3" />
          <path d="M 200 140 Q 215 175, 180 190" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3,3" />

          {/* Chemical Dosing Pipe */}
          <line x1="10" y1="90" x2="60" y2="90" stroke="#F59E0B" strokeWidth="3" markerEnd="url(#arrow-coag)" />
          <text x="6" y="82" fill="#F59E0B" fontSize="10" fontWeight="700">Alum / Fe Dosing</text>

          {/* Camp-Stein Formula Tag */}
          <rect x="25" y="222" width="230" height="26" rx="4" fill={dark ? 'rgba(0,0,0,0.3)' : '#FFF'} />
          <text x="140" y="239" fill="#818CF8" fontSize="10" fontFamily="monospace" textAnchor="middle">
            G = √(P / μV)  |  Camp: G·t ≈ 30,000
          </text>
        </g>

        {/* Transition Arrow */}
        <g transform="translate(320, 180)">
          <line x1="0" y1="0" x2="30" y2="0" stroke="#818CF8" strokeWidth="3" markerEnd="url(#arrow-coag)" />
          <text x="15" y="-12" fill={subTextColor} fontSize="10" textAnchor="middle">Microflocs</text>
        </g>

        {/* Tank 2: Slow Mix Flocculator (Baffled / Paddle) */}
        <g transform="translate(365, 70)">
          <rect x="0" y="0" width="505" height="260" rx="10" fill={boxBg} stroke={boxBorder} strokeWidth="1" />
          <text x="18" y="24" fill="#10B981" fontSize="13" fontWeight="700" fontFamily="'Outfit', sans-serif">
            2. Slow Mix Flocculation Chamber (Mechanical Paddles)
          </text>
          <text x="18" y="40" fill={subTextColor} fontSize="10.5">
            Detention: 20–30 mins | G = 20–70 s⁻¹ (Tapered Velocity Gradient)
          </text>

          {/* Flocculator basin with 3 stages (tapered G) */}
          <rect x="20" y="55" width="465" height="160" fill="rgba(56, 189, 248, 0.12)" stroke="#64748B" strokeWidth="2" rx="4" />

          {/* Compartment 1 (G = 60 s⁻¹) */}
          <line x1="170" y1="55" x2="170" y2="185" stroke="#475569" strokeWidth="3" strokeDasharray="5,3" />
          <text x="95" y="75" fill="#CBD5E1" fontSize="10" textAnchor="middle" fontWeight="700">Stage 1: G = 60 s⁻¹</text>
          {/* Paddle 1 */}
          <circle cx="95" cy="135" r="30" fill="none" stroke="#10B981" strokeWidth="2" />
          <line x1="95" y1="105" x2="95" y2="165" stroke="#10B981" strokeWidth="4" />
          <line x1="65" y1="135" x2="125" y2="135" stroke="#10B981" strokeWidth="4" />
          <circle cx="80" cy="150" r="3" fill="#F59E0B" />
          <circle cx="110" cy="120" r="3" fill="#F59E0B" />

          {/* Compartment 2 (G = 40 s⁻¹) */}
          <line x1="330" y1="85" x2="330" y2="215" stroke="#475569" strokeWidth="3" strokeDasharray="5,3" />
          <text x="250" y="75" fill="#CBD5E1" fontSize="10" textAnchor="middle" fontWeight="700">Stage 2: G = 40 s⁻¹</text>
          {/* Paddle 2 */}
          <circle cx="250" cy="135" r="30" fill="none" stroke="#10B981" strokeWidth="2" />
          <line x1="250" y1="105" x2="250" y2="165" stroke="#10B981" strokeWidth="4" />
          <line x1="220" y1="135" x2="280" y2="135" stroke="#10B981" strokeWidth="4" />
          <circle cx="235" cy="150" r="5" fill="#F59E0B" />
          <circle cx="265" cy="120" r="5" fill="#F59E0B" />

          {/* Compartment 3 (G = 20 s⁻¹) */}
          <text x="410" y="75" fill="#CBD5E1" fontSize="10" textAnchor="middle" fontWeight="700">Stage 3: G = 20 s⁻¹</text>
          {/* Paddle 3 */}
          <circle cx="410" cy="135" r="30" fill="none" stroke="#10B981" strokeWidth="2" />
          <line x1="410" y1="105" x2="410" y2="165" stroke="#10B981" strokeWidth="4" />
          <line x1="380" y1="135" x2="440" y2="135" stroke="#10B981" strokeWidth="4" />
          {/* Dense large flocs */}
          <circle cx="395" cy="150" r="8" fill="#F59E0B" />
          <circle cx="425" cy="120" r="9" fill="#F59E0B" />
          <circle cx="450" cy="160" r="8" fill="#F59E0B" />

          {/* Bottom Explanation Footer */}
          <rect x="20" y="222" width="465" height="26" rx="4" fill={dark ? 'rgba(0,0,0,0.3)' : '#FFF'} />
          <text x="252" y="239" fill="#10B981" fontSize="10.5" textAnchor="middle">
            Tapering G prevents high shear from breaking large flocs before settling!
          </text>
        </g>
      </svg>
    </div>
  );
}
