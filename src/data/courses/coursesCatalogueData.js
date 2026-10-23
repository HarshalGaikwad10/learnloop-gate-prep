// src/data/courses/coursesCatalogueData.js — Authoritative Civil Engineering Course Catalogue
import { waterEngineeringCourse } from './waterEngineeringCourse';

export const civilEngineeringCatalogue = [
  // 1. FEATURED FULL PILOT COURSE
  {
    ...waterEngineeringCourse,
    id: 'water-sanitation-env-eng',
    code: 'CE-WSE-201',
    title: 'Water Supply, Sanitation and Environmental Engineering',
    category: 'Environmental Engineering',
    plannedHours: 42,
    moduleCount: 6,
    icon: '💧',
    isFeatured: true,
    isDemo: false,
    badgeText: '⭐ Active Pilot Course',
    level: 'Undergraduate Core & GATE CE/ES',
    shortDescription: 'Comprehensive municipal water demand, physical-chemical treatment units, sewer hydraulics, ASP kinetics, and anaerobic sludge digestion with contextual GATE highlights.'
  },

  // 2. STRUCTURAL ANALYSIS (Demo Course)
  {
    id: 'structural-analysis',
    code: 'CE-STR-202',
    title: 'Structural Analysis',
    category: 'Structural Engineering',
    plannedHours: 45,
    moduleCount: 5,
    icon: '🏛️',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Core Civil Engineering & GATE CE',
    shortDescription: 'Determinacy and stability, energy methods (Castigliano), slope deflection and moment distribution, matrix stiffness method, and influence line diagrams for rolling loads.',
    learningOutcomes: [
      'Evaluate static and kinematic indeterminacy for indeterminate beams, frames, and trusses.',
      'Analyze redundant structures using Castigliano energy theorems and unit load method.',
      'Apply Slope Deflection and Moment Distribution methods to continuous beams with support settlement.',
      'Construct Influence Line Diagrams (ILD) for bending moment, shear force, and reactions using Müller-Breslau principle.',
      'Formulate element and global stiffness matrices for pin-jointed and rigid-jointed plane frames.'
    ],
    modules: [
      {
        id: 'mod-str-1',
        unitNumber: 1,
        title: 'Determinate Structures & Energy Principles',
        plannedHours: 9,
        summary: 'Static and kinematic determinacy, strain energy in axial and flexural members, Castigliano first and second theorems, and Betti-Maxwell reciprocal theorem.',
        sampleTopics: ['Degree of Static Indeterminacy (Ds)', 'Castigliano Theorem II for Deflection', 'Unit Load Method for Trusses', 'Maxwell-Betti Reciprocal Theorem']
      },
      {
        id: 'mod-str-2',
        unitNumber: 2,
        title: 'Classical Displacement Methods',
        plannedHours: 10,
        summary: 'Slope deflection equations, sway and non-sway frame analysis, moment distribution method with distribution and carry-over factors, and support settlement effects.',
        sampleTopics: ['Slope Deflection Equations', 'Moment Distribution for Continuous Beams', 'Support Settlement Analysis', 'Portal Frame Sway Correction']
      },
      {
        id: 'mod-str-3',
        unitNumber: 3,
        title: 'Influence Line Diagrams (ILD)',
        plannedHours: 9,
        summary: 'Müller-Breslau principle for determinate and indeterminate beams, moving loads, absolute maximum bending moment, and focal length concepts.',
        sampleTopics: ['Müller-Breslau Principle', 'ILD for Continuous Beams', 'Wheel Load Trains on Girders', 'Absolute Maximum Bending Moment']
      },
      {
        id: 'mod-str-4',
        unitNumber: 4,
        title: 'Arches, Cables & Suspension Bridges',
        plannedHours: 8,
        summary: 'Three-hinged and two-hinged circular and parabolic arches, rib shortening, temperature stresses, cable tension, and anchor cables.',
        sampleTopics: ['Three-Hinged Parabolic Arch', 'Two-Hinged Arch Rib Shortening', 'Stiffening Girders in Suspension Bridges', 'Temperature Stresses in Arches']
      },
      {
        id: 'mod-str-5',
        unitNumber: 5,
        title: 'Matrix Stiffness Method',
        plannedHours: 9,
        summary: 'Member coordinate transformation, element stiffness formulation, global equilibrium equations, and direct stiffness method for computer analysis.',
        sampleTopics: ['Member Coordinate Systems', 'Stiffness Matrix for Beam Element', 'Global Assembly & Boundary Conditions', 'Direct Stiffness Formulation']
      }
    ],
    sampleQuiz: [
      {
        q: 'What is the kinematic indeterminacy (degrees of freedom) of a fixed-ended beam with no axial deformation?',
        options: ['0', '1', '2', '3'],
        ans: 0,
        explanation: 'For a fixed beam with inextensible member, rotations and translations at both ends are zero, hence kinematic indeterminacy is 0.'
      },
      {
        q: 'According to the Müller-Breslau principle, the influence line for any stress function is:',
        options: ['Directly proportional to the deflected shape when that restraint is released and a unit displacement is applied', 'Always parabolic regardless of determinacy', 'Equal to the bending moment diagram under self weight', 'Zero at all internal hinges'],
        ans: 0,
        explanation: 'Müller-Breslau states that the ILD for a reaction or internal action is identical to the deflected shape obtained by removing that restraint and introducing a corresponding unit deformation.'
      }
    ]
  },

  // 3. REINFORCED CONCRETE AND STEEL DESIGN (Demo Course)
  {
    id: 'rc-steel-design',
    code: 'CE-DES-203',
    title: 'Reinforced Concrete and Steel Design',
    category: 'Structural Engineering',
    plannedHours: 48,
    moduleCount: 6,
    icon: '🏗️',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Core Civil Engineering & GATE CE',
    shortDescription: 'Limit State Method (IS 456:2000) for flexure, shear, compression and torsion in RCC; Limit State Design of Steel Structures (IS 800:2007) for tension, compression, and plastic design.',
    learningOutcomes: [
      'Design singly and doubly reinforced rectangular and flanged beams per IS 456 Limit State Method.',
      'Check shear resistance, diagonal tension, development length, and anchorage bond.',
      'Design short and slender axially and uniaxially loaded columns with lateral ties.',
      'Apply plastic analysis theorems to determine collapse mechanisms and plastic moment capacity (Mp).',
      'Design bolted and welded connections, tension members (block shear), and built-up columns (IS 800:2007).'
    ],
    modules: [
      {
        id: 'mod-des-1',
        unitNumber: 1,
        title: 'Limit State of Collapse in Flexure (IS 456)',
        plannedHours: 9,
        summary: 'Stress-strain block parameters, parabolic stress distribution, balanced, under-reinforced, and over-reinforced sections, and moment of resistance formulas.',
        sampleTopics: ['Stress Block Factor (0.36 fck b xu)', 'Limiting Depth of Neutral Axis (xu,max)', 'Doubly Reinforced Beam Design', 'Flanged T-Beam Effective Width']
      },
      {
        id: 'mod-des-2',
        unitNumber: 2,
        title: 'Shear, Bond, Torsion & Serviceability',
        plannedHours: 8,
        summary: 'Nominal shear stress, design shear strength (tau_c), vertical stirrups and bent-up bars, development length (Ld), and deflection control criteria.',
        sampleTopics: ['Design Shear Reinforcement (Vus)', 'Development Length & Anchorage', 'Equivalent Shear for Combined Torsion', 'Span-to-Depth Deflection Limits']
      },
      {
        id: 'mod-des-3',
        unitNumber: 3,
        title: 'RCC Columns & Isolated Footings',
        plannedHours: 8,
        summary: 'Short column axial capacity formula (0.4 fck Ac + 0.67 fy Asc), minimum eccentricity, uniaxial and biaxial bending interaction charts (SP 16), and one-way/two-way punching shear.',
        sampleTopics: ['Short Axial Column Capacity', 'Helical Reinforcement Strength Boost', 'Punching Shear in Isolated Footings', 'Biaxial Bending per IS 456']
      },
      {
        id: 'mod-des-4',
        unitNumber: 4,
        title: 'Plastic Analysis of Steel Structures (IS 800)',
        plannedHours: 7,
        summary: 'Plastic hinge formation, shape factors for standard cross sections, upper bound and lower bound theorems, and collapse mechanisms for continuous beams and portal frames.',
        sampleTopics: ['Shape Factor Calculations', 'Plastic Section Modulus (Zp)', 'Beam and Frame Collapse Mechanisms', 'Minimum Weight Design']
      },
      {
        id: 'mod-des-5',
        unitNumber: 5,
        title: 'Steel Connections & Tension Members',
        plannedHours: 8,
        summary: 'High-strength friction grip (HSFG) bolts, fillet and butt welds, net effective area of tension angles, and block shear failure criteria (IS 800:2007 Clause 6.4).',
        sampleTopics: ['Bearing vs HSFG Bolted Joints', 'Fillet Weld Effective Throat Thickness', 'Shear Lag Factor in Tension Angles', 'Block Shear Failure Mode']
      },
      {
        id: 'mod-des-6',
        unitNumber: 6,
        title: 'Compression Members & Plate Girders',
        plannedHours: 8,
        summary: 'Buckling curves a, b, c, d, effective length factors, design of laced and battened built-up columns, and web buckling/crippling in plate girders.',
        sampleTopics: ['Euler Buckling & Slenderness Ratio', 'Lacing and Battening Rules (IS 800)', 'Web Crippling & Buckling Stiffeners', 'Tension Field Action in Girders']
      }
    ],
    sampleQuiz: [
      {
        q: 'Per IS 456:2000, what is the maximum permissible compressive strain in concrete in bending at the extreme fiber at failure?',
        options: ['0.0020', '0.0035', '0.0045', '0.0015'],
        ans: 1,
        explanation: 'IS 456 Clause 38.1 stipulates that the maximum strain in concrete at the outermost compression fiber is taken as 0.0035 in bending.'
      },
      {
        q: 'What is the theoretical Shape Factor for a solid rectangular cross-section of width b and depth d?',
        options: ['1.12', '1.50', '1.70', '2.00'],
        ans: 1,
        explanation: 'Shape factor S = Zp / Ze = (b*d^2 / 4) / (b*d^2 / 6) = 1.50 for a rectangular cross section.'
      }
    ]
  },

  // 4. GEOTECHNICAL ENGINEERING (Demo Course)
  {
    id: 'geotechnical-engineering',
    code: 'CE-GEO-204',
    title: 'Geotechnical Engineering',
    category: 'Geotechnical Engineering',
    plannedHours: 46,
    moduleCount: 6,
    icon: '⛰️',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Core Civil Engineering & GATE CE',
    shortDescription: 'Phase relationships, soil classification (USCS/IS), effective stress principle, consolidation kinetics, shear strength parameters (Mohr-Coulomb), and Terzaghi shallow foundation bearing capacity.',
    learningOutcomes: [
      'Calculate void ratio, porosity, saturation, and unit weights from three-phase relationships.',
      'Determine permeability and seepage force using flow nets and Laplace equation.',
      'Compute vertical stress increments using Boussinesq and Westergaard equations.',
      'Estimate primary consolidation settlement and time rate using Terzaghi 1D consolidation theory.',
      'Evaluate cohesion and angle of internal friction using Direct Shear, Triaxial (UU, CU, CD), and Vane Shear tests.',
      'Calculate ultimate bearing capacity using Terzaghi, Meyerhof, and IS 6403 formulas with water table correction.'
    ],
    modules: [
      {
        id: 'mod-geo-1',
        unitNumber: 1,
        title: 'Soil Properties, Phase Relations & Classification',
        plannedHours: 8,
        summary: 'Three-phase diagrams, void ratio, water content, specific gravity, Atterberg limits, A-line plasticity chart, and IS soil classification (IS 1498).',
        sampleTopics: ['Phase System Formulas (Se = wG)', 'Relative Density of Sands', 'Plasticity Chart (Ip = 0.73(wL - 20))', 'Activity of Clays']
      },
      {
        id: 'mod-geo-2',
        unitNumber: 2,
        title: 'Permeability, Effective Stress & Seepage Analysis',
        plannedHours: 8,
        summary: 'Darcy law, constant and falling head permeameters, effective stress concept under hydrostatic and seepage conditions, critical hydraulic gradient, and quicksand condition.',
        sampleTopics: ['Effective Stress Equation (sigma = sigma_total - u)', 'Critical Hydraulic Gradient (icr = (G - 1)/(1 + e))', 'Flow Nets & Seepage Discharge', 'Exit Gradient and Piping Safety Factor']
      },
      {
        id: 'mod-geo-3',
        unitNumber: 3,
        title: 'Compaction & 1D Consolidation Theory',
        plannedHours: 8,
        summary: 'Standard and Modified Proctor compaction, zero air voids line, Terzaghi 1D consolidation differential equation, compression index (Cc), and coefficient of consolidation (Cv).',
        sampleTopics: ['Optimum Moisture Content (OMC)', 'Consolidation Settlement (Sc)', 'Time Factor (Tv) & Degree of Consolidation', 'Over-Consolidation Ratio (OCR)']
      },
      {
        id: 'mod-geo-4',
        unitNumber: 4,
        title: 'Shear Strength of Soils',
        plannedHours: 8,
        summary: 'Mohr-Coulomb failure envelope, effective stress shear parameters, Triaxial UU, CU, and CD tests, pore pressure parameters (Skempton A and B), and stress paths.',
        sampleTopics: ['Mohr-Coulomb Criterion', 'Unconfined Compression Test', 'Skempton Pore Pressure Parameters', 'Liquefaction Potential in Saturated Sand']
      },
      {
        id: 'mod-geo-5',
        unitNumber: 5,
        title: 'Earth Pressure & Slope Stability',
        plannedHours: 7,
        summary: 'Rankine and Coulomb active and passive earth pressure theories, tension cracks in cohesive soils, Culmann graphical method, and Swedish slip circle analysis.',
        sampleTopics: ['Rankine Active & Passive Coefficients (Ka, Kp)', 'Tension Crack Depth (zc = 2c / (gamma * sqrt(Ka)))', 'Taylor Stability Number', 'Friction Circle Method']
      },
      {
        id: 'mod-geo-6',
        unitNumber: 6,
        title: 'Shallow & Deep Foundations',
        plannedHours: 7,
        summary: 'Terzaghi general shear bearing capacity equation, bearing capacity factors (Nc, Nq, Ngamma), shape and depth factors, water table effects, and single/group pile capacity.',
        sampleTopics: ['Terzaghi Bearing Capacity Equation', 'Water Table Correction Factors', 'Standard Penetration Test (SPT N-Value Corrections)', 'Group Efficiency of Friction Piles']
      }
    ],
    sampleQuiz: [
      {
        q: 'What is the critical hydraulic gradient for a soil having specific gravity G = 2.65 and void ratio e = 0.65?',
        options: ['0.80', '1.00', '1.20', '1.65'],
        ans: 1,
        explanation: 'icr = (G - 1) / (1 + e) = (2.65 - 1) / (1 + 0.65) = 1.65 / 1.65 = 1.00.'
      },
      {
        q: 'In a consolidated-undrained (CU) triaxial test on normally consolidated clay, total pore water pressure developed during shear is characterized by:',
        options: ['Skempton parameter A > 0 (positive pore pressure)', 'Negative pore pressure dilation', 'Pore pressure is always zero', 'Only Skempton B parameter matters'],
        ans: 0,
        explanation: 'Normally consolidated clays contract during undrained shear, creating positive excess pore water pressure (Skempton A between 0.5 and 1.0).'
      }
    ]
  },

  // 5. FLUID MECHANICS AND HYDRAULICS (Demo Course)
  {
    id: 'fluid-mechanics-hydraulics',
    code: 'CE-FLM-205',
    title: 'Fluid Mechanics and Hydraulics',
    category: 'Water Resources Engineering',
    plannedHours: 44,
    moduleCount: 6,
    icon: '🌊',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Core Civil Engineering & GATE CE',
    shortDescription: 'Fluid statics and pressure measurement, kinematics (stream/velocity potential), Euler and Bernoulli energy equations, laminar and turbulent pipe flow, boundary layer theory, and open channel flow.',
    learningOutcomes: [
      'Calculate hydrostatic pressure, center of pressure, and metacenter metacentric height.',
      'Derive stream functions and velocity potentials for irrotational flow fields.',
      'Apply Bernoulli equation with head loss to pipe networks and flow meters (Venturi, orifice).',
      'Analyze laminar boundary layers, displacement/momentum thicknesses, and boundary separation.',
      'Solve Open Channel Flow equations: Chezy, Manning, critical depth (yc), specific energy, and hydraulic jump energy dissipation.'
    ],
    modules: [
      {
        id: 'mod-flm-1',
        unitNumber: 1,
        title: 'Fluid Statics & Buoyancy',
        plannedHours: 7,
        summary: 'Fluid properties, viscosity, capillarity, hydrostatic forces on submerged plane and curved surfaces, center of pressure, metacenter, and floating body stability.',
        sampleTopics: ['Newton Law of Viscosity', 'Center of Pressure on Inclined Gates', 'Metacentric Height (GM)', 'U-Tube Differential Manometers']
      },
      {
        id: 'mod-flm-2',
        unitNumber: 2,
        title: 'Fluid Kinematics',
        plannedHours: 7,
        summary: 'Lagrangian vs Eulerian descriptions, continuity equation in 3D cartesian coordinates, circulation, vorticity, stream function (psi), velocity potential (phi), and flow nets.',
        sampleTopics: ['3D Continuity Equation', 'Equipotential and Stream Lines Orthogonality', 'Rotational vs Irrotational Flow', 'Acceleration Components (Convective & Local)']
      },
      {
        id: 'mod-flm-3',
        unitNumber: 3,
        title: 'Fluid Dynamics & Momentum Principle',
        plannedHours: 7,
        summary: 'Euler equation along a streamline, Bernoulli equation assumptions and limitations, momentum integral equation, force exerted on pipe bends, and Venturimeter discharge calibration.',
        sampleTopics: ['Bernoulli Equation & HGL/EGL', 'Momentum Equation on Pipe Bends', 'Venturimeter and Orifice Plate Discharge', 'Pitot Tube Stagnation Pressure']
      },
      {
        id: 'mod-flm-4',
        unitNumber: 4,
        title: 'Pipe Flow & Boundary Layer Theory',
        plannedHours: 8,
        summary: 'Hagen-Poiseuille laminar flow, Darcy-Weisbach friction factor, Moody chart, minor losses, pipe networks (Hardy Cross), von Kármán momentum integral, and drag coefficients.',
        sampleTopics: ['Hagen-Poiseuille Equation', 'Darcy-Weisbach Friction Factor', 'Boundary Layer Thickness (delta, delta*, theta)', 'Form Drag vs Skin Friction Drag']
      },
      {
        id: 'mod-flm-5',
        unitNumber: 5,
        title: 'Open Channel Flow Fundamentals',
        plannedHours: 8,
        summary: 'Geometric properties of prismatic channels, Chezy and Manning formulas, specific energy diagram, critical flow condition (Froude number Fr = 1), and alternate depths.',
        sampleTopics: ['Specific Energy Curve (E vs y)', 'Critical Depth Formula (yc = (q^2/g)^(1/3))', 'Froude Number Regimes', 'Most Economical Channel Sections']
      },
      {
        id: 'mod-flm-6',
        unitNumber: 6,
        title: 'Gradually & Rapidly Varied Flow (Hydraulic Jumps)',
        plannedHours: 7,
        summary: 'Dynamic equation of GVF, water surface profiles (M1, M2, M3, S1, S2, S3), Belanger hydraulic jump momentum equation, conjugate depths, and jump energy loss.',
        sampleTopics: ['Water Surface Profile Classification', 'Direct Step Method for GVF', 'Hydraulic Jump Conjugate Depths (y2/y1)', 'Energy Dissipation in Stilling Basins']
      }
    ],
    sampleQuiz: [
      {
        q: 'For a rectangular open channel carrying unit discharge q = 2.0 m3/s/m, what is the critical depth yc? (take g = 9.81 m/s2)',
        options: ['0.74 m', '0.85 m', '1.02 m', '1.25 m'],
        ans: 0,
        explanation: 'yc = (q^2 / g)^(1/3) = (4.0 / 9.81)^(1/3) = (0.4077)^(1/3) = 0.741 m.'
      },
      {
        q: 'In laminar flow through a circular pipe of diameter D, the ratio of maximum centerline velocity to average cross-sectional velocity is exactly:',
        options: ['1.33', '1.50', '2.00', '2.50'],
        ans: 2,
        explanation: 'For Hagen-Poiseuille laminar flow, velocity distribution is parabolic: u(r) = umax(1 - (r/R)^2), resulting in umax / uavg = 2.0.'
      }
    ]
  },

  // 6. TRANSPORTATION ENGINEERING (Demo Course)
  {
    id: 'transportation-engineering',
    code: 'CE-TRN-206',
    title: 'Transportation Engineering',
    category: 'Transportation & Infrastructure',
    plannedHours: 42,
    moduleCount: 5,
    icon: '🛣️',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Core Civil Engineering & GATE CE',
    shortDescription: 'Geometric design of highways per IRC (sight distances, superelevation, transition curves), traffic engineering (Greenshields, Webster signal design), and flexible/rigid pavement design (IRC 37 & IRC 58).',
    learningOutcomes: [
      'Calculate Stopping Sight Distance (SSD) and Overtaking Sight Distance (OSD) per IRC 73.',
      'Design horizontal alignment: superelevation (e), centrifugal ratio, widening, and spiral transition curves.',
      'Design summit and valley vertical curves for comfort and head-light sight distance criteria.',
      'Analyze traffic stream parameters (flow, speed, density) using Greenshields linear model.',
      'Design isolated traffic signals using Webster method and determine optimum cycle time.',
      'Design flexible pavements using California Bearing Ratio (CBR) method and rigid slabs using Westergaard stress equations.'
    ],
    modules: [
      {
        id: 'mod-trn-1',
        unitNumber: 1,
        title: 'Highway Geometric Design: Cross Section & Sight Distances',
        plannedHours: 9,
        summary: 'Right of way, camber, PIEV theory of perception-reaction time, stopping sight distance (SSD), overtaking sight distance (OSD), and intermediate sight distance.',
        sampleTopics: ['PIEV Theory & Reaction Time', 'SSD Formula with Grade Effects', 'Overtaking Sight Distance Components (d1, d2, d3)', 'Pavement Camber Standards']
      },
      {
        id: 'mod-trn-2',
        unitNumber: 2,
        title: 'Horizontal & Vertical Alignment',
        plannedHours: 9,
        summary: 'Centrifugal force, equilibrium and maximum superelevation (e = 0.07), mechanical and psychological extra widening (We), clothoid transition curves, and vertical summit/valley curves.',
        sampleTopics: ['Superelevation Design per IRC', 'Extra Widening on Curves', 'Length of Transition Curve (Rate of Change of Acceleration)', 'Valley Curve Comfort & Headlight Criteria']
      },
      {
        id: 'mod-trn-3',
        unitNumber: 3,
        title: 'Traffic Engineering & Signal Design',
        plannedHours: 8,
        summary: 'Speed-flow-density fundamental relationships, Greenshields linear model, capacity and level of service (LOS), Webster method for optimum cycle length, and collision diagrams.',
        sampleTopics: ['Greenshields Model (qmax = vf * kj / 4)', 'Webster Formula for Cycle Time', 'Saturation Flow & Green Split', 'Rotary Intersection Capacity']
      },
      {
        id: 'mod-trn-4',
        unitNumber: 4,
        title: 'Pavement Materials & Testing',
        plannedHours: 8,
        summary: 'Subgrade soil CBR test, aggregate crushing, impact, and Los Angeles abrasion values, bitumen penetration, softening point, ductility, and Marshall mix design.',
        sampleTopics: ['CBR Testing & Soaked Value', 'Aggregate Toughness & Abrasion', 'Bitumen Viscosity Grading (VG 30)', 'Marshall Stability & Voids in Mineral Aggregate']
      },
      {
        id: 'mod-trn-5',
        unitNumber: 5,
        title: 'Pavement Design (IRC 37 & IRC 58)',
        plannedHours: 8,
        summary: 'Equivalent single axle load (ESAL), cumulative standard axles (msa), flexible pavement layer composition (IRC 37), Westergaard wheel load and thermal stresses in concrete slabs (IRC 58).',
        sampleTopics: ['Vehicle Damage Factor (VDF)', 'Design Traffic Computation (msa)', 'Westergaard Corner, Edge, and Interior Stresses', 'Thermal Warping Stresses in Concrete Pavements']
      }
    ],
    sampleQuiz: [
      {
        q: 'Under Greenshields model, if free-flow speed vf = 70 km/h and jam density kj = 120 veh/km, what is the maximum theoretical capacity qmax?',
        options: ['1500 veh/h', '2100 veh/h', '2800 veh/h', '4200 veh/h'],
        ans: 1,
        explanation: 'qmax = (vf * kj) / 4 = (70 * 120) / 4 = 8400 / 4 = 2100 vehicles per hour.'
      },
      {
        q: 'According to IRC specifications, the maximum allowable superelevation in plain and rolling terrain with mixed traffic is:',
        options: ['4% (0.04)', '7% (0.07)', '10% (0.10)', '12% (0.12)'],
        ans: 1,
        explanation: 'IRC recommends a maximum superelevation of 7% (0.07) for plain and rolling terrain to prevent slow-moving vehicles from toppling inward.'
      }
    ]
  },

  // 7. SURVEYING AND GEOMATICS (Demo Course)
  {
    id: 'surveying-geomatics',
    code: 'CE-SUR-207',
    title: 'Surveying and Geomatics',
    category: 'Surveying & Geomatics',
    plannedHours: 40,
    moduleCount: 5,
    icon: '📐',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Core Civil Engineering & GATE CE',
    shortDescription: 'Chain and tape corrections, compass traversing and local attraction, leveling (HI and Rise & Fall), theodolite traverse adjustments, tachometry, aerial photogrammetry, and GPS/GIS basics.',
    learningOutcomes: [
      'Apply tape corrections for temperature, pull, sag, and slope.',
      'Compute whole circle bearings (WCB), reduced bearings (RB), and correct for local magnetic attraction.',
      'Perform differential and reciprocal leveling and calculate reduced levels with curvature and refraction corrections.',
      'Balance closed traverses using Bowditch and Transit rules.',
      'Solve horizontal and vertical curves, tachometric constants, scale of aerial photographs, and relief displacement.'
    ],
    modules: [
      {
        id: 'mod-sur-1',
        unitNumber: 1,
        title: 'Fundamental Measurements & Tape Corrections',
        plannedHours: 8,
        summary: 'Principles of surveying (working from whole to part), errors and uncertainties, tape temperature, tension, sag, and mean sea level (MSL) reduction corrections.',
        sampleTopics: ['Principle of Working from Whole to Part', 'Tape Sag Correction Formula', 'Cumulative vs Compensating Errors', 'Correction for Absolute Length']
      },
      {
        id: 'mod-sur-2',
        unitNumber: 2,
        title: 'Compass Traversing & Local Attraction',
        plannedHours: 8,
        summary: 'Prismatic and surveyor compass, magnetic declination, isogonic and agonic lines, fore and back bearings, identification of stations affected by local magnetic attraction.',
        sampleTopics: ['Magnetic Declination and Dip', 'Fore Bearing - Back Bearing = 180° Rule', 'Detecting Local Attraction via Included Angles', 'Traverse Angular Error Closure']
      },
      {
        id: 'mod-sur-3',
        unitNumber: 3,
        title: 'Leveling, Contouring & Earthwork',
        plannedHours: 8,
        summary: 'Height of instrument (HI) and Rise & Fall methods, reciprocal leveling for river crossings, combined correction for earth curvature and atmospheric refraction, and contour intervals.',
        sampleTopics: ['Rise and Fall vs HI Arithmetic Checks', 'Curvature and Refraction Combined Correction (-0.0673 d^2)', 'Reciprocal Leveling Collimation Elimination', 'Prismoidal and Trapezoidal Earthwork Volumes']
      },
      {
        id: 'mod-sur-4',
        unitNumber: 4,
        title: 'Theodolite Traversing & Curve Setting',
        plannedHours: 8,
        summary: 'Latitudes and departures, closing error, Bowditch rule, Transit rule, simple circular curves (Rankine deflection angles), and vertical parabolic curves.',
        sampleTopics: ['Latitude (L cos theta) & Departure (L sin theta)', 'Bowditch Compass Rule Adjustment', 'Rankine Method of Tangential Angles', 'Setting Out Simple Circular Curves by Offsets']
      },
      {
        id: 'mod-sur-5',
        unitNumber: 5,
        title: 'Photogrammetry & Modern Geomatics (GPS/GIS)',
        plannedHours: 8,
        summary: 'Aerial photograph scale, relief displacement, flight planning (overlap and coverage), total station electronic distance measurement (EDM), and GPS trilateration principles.',
        sampleTopics: ['Photo Scale Formula (f / (H - h))', 'Relief Displacement on Vertical Aerial Photos', 'Overlap and Number of Photographs Required', 'Differential GPS (DGPS) Positioning']
      }
    ],
    sampleQuiz: [
      {
        q: 'In leveling, what is the combined correction for earth curvature and atmospheric refraction for a sight distance of 1.0 km?',
        options: ['-0.057 m', '-0.067 m', '+0.067 m', '-0.078 m'],
        ans: 1,
        explanation: 'Combined correction C = 0.0673 * d^2 (in meters, where d is in km). For d = 1 km, correction = -0.0673 m (always subtractive).'
      },
      {
        q: 'If the fore bearing of a survey line AB is 40° 30\', what is its back bearing BA?',
        options: ['139° 30\'', '220° 30\'', '319° 30\'', '40° 30\''],
        ans: 1,
        explanation: 'Back Bearing = Fore Bearing + 180° = 40° 30\' + 180° = 220° 30\'.'
      }
    ]
  },

  // 8. HYDROLOGY AND IRRIGATION ENGINEERING (Demo Course)
  {
    id: 'hydrology-irrigation',
    code: 'CE-HYD-208',
    title: 'Hydrology and Irrigation Engineering',
    category: 'Water Resources Engineering',
    plannedHours: 42,
    moduleCount: 5,
    icon: '🌧️',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Core Civil Engineering & GATE CE',
    shortDescription: 'Hydrologic cycle, precipitation analysis (Thiessen polygons), infiltration indices (phi and W index), unit hydrograph theory, flood routing (Muskingum), crop water requirements (duty, delta), and gravity dam design.',
    learningOutcomes: [
      'Calculate average areal precipitation using Arithmetic mean, Thiessen Polygon, and Isohyetal methods.',
      'Compute infiltration rates, phi-index, and runoff volume from hyetographs.',
      'Derive Unit Hydrographs (UH) and S-curve hydrographs for different storm durations.',
      'Perform reservoir and channel flood routing using Muskingum equation.',
      'Calculate crop water requirements, delta, duty, base period, and irrigation efficiencies.',
      'Design lined canals, regime channels (Kennedy and Lacey theories), and check gravity dam stability.'
    ],
    modules: [
      {
        id: 'mod-hyd-1',
        unitNumber: 1,
        title: 'Precipitation, Evaporation & Infiltration',
        plannedHours: 8,
        summary: 'Hydrologic budget equation, rain gauge network adequacy, Thiessen polygon weights, Pan evaporation coefficients, Horton infiltration model, and phi-index calculation.',
        sampleTopics: ['Catchment Water Balance Equation', 'Optimum Rain Gauge Network Formula', 'Thiessen Polygon Weighting Method', 'Phi-Index and Direct Runoff Volume']
      },
      {
        id: 'mod-hyd-2',
        unitNumber: 2,
        title: 'Hydrograph Analysis & Unit Hydrograph Theory',
        plannedHours: 9,
        summary: 'Direct runoff hydrograph (DRH), baseflow separation techniques, Sherman unit hydrograph assumptions, convolution, S-curve derivation, and synthetic unit hydrographs.',
        sampleTopics: ['Unit Hydrograph Assumptions (Linearity & Time Invariance)', 'Deriving D-hour UH from Storm DRH', 'S-Curve Technique for Duration Conversion', 'Peak Discharge Scaling']
      },
      {
        id: 'mod-hyd-3',
        unitNumber: 3,
        title: 'Flood Frequency & Reservoir Routing',
        plannedHours: 8,
        summary: 'Gumbel extreme value distribution, flood return period and risk, Muskingum channel routing coefficients (C0, C1, C2), and modified Puls reservoir routing.',
        sampleTopics: ['Gumbel EV1 Distribution Frequency Factor', 'Hydrologic Risk of Failure: 1 - (1 - 1/T)^n', 'Muskingum Routing Equation & Wedge Storage', 'Attenuation and Lag Time']
      },
      {
        id: 'mod-hyd-4',
        unitNumber: 4,
        title: 'Crop Water Requirements & Irrigation Systems',
        plannedHours: 9,
        summary: 'Soil moisture constants (Field Capacity, Wilting Point), duty-delta-base period relationship (Delta = 8.64 B / D), consumptive use, leaching requirement, and irrigation efficiencies.',
        sampleTopics: ['Duty-Delta Formula (Delta = 8.64 B / D)', 'Readily Available Soil Moisture', 'Water Application and Storage Efficiencies', 'Salinity Control & Leaching Fraction']
      },
      {
        id: 'mod-hyd-5',
        unitNumber: 5,
        title: 'Canal Design & Gravity Dam Stability',
        plannedHours: 8,
        summary: 'Lacey regime theory (perimeter P = 4.75 sqrt(Q), velocity v, slope S), Kennedy critical velocity ratio, Bligh and Lane creep theories for weirs, and gravity dam force balance.',
        sampleTopics: ['Lacey Regime Equations for Alluvial Canals', 'Kennedy Silt Theory Comparison', 'Seepage Piping Failure per Bligh & Khosla', 'Forces on Gravity Dams (Water, Uplift, Silt, Earthquake)']
      }
    ],
    sampleQuiz: [
      {
        q: 'If the base period of a crop is 120 days and the duty of irrigation water is 1000 hectares/cumec, what is the total delta (depth of water) required by the crop?',
        options: ['0.864 m', '1.037 m', '1.200 m', '1.440 m'],
        ans: 1,
        explanation: 'Delta = 8.64 * B / D = 8.64 * 120 / 1000 = 1036.8 / 1000 = 1.037 m (approx 104 cm).'
      },
      {
        q: 'According to Lacey regime theory, the wetted perimeter P of an alluvial channel carrying a discharge of 100 cumecs is:',
        options: ['37.5 m', '47.5 m', '52.5 m', '64.0 m'],
        ans: 1,
        explanation: 'Perimeter P = 4.75 * sqrt(Q) = 4.75 * sqrt(100) = 4.75 * 10 = 47.5 meters.'
      }
    ]
  },

  // 9. CONSTRUCTION PLANNING AND MANAGEMENT (Demo Course)
  {
    id: 'construction-planning-mgmt',
    code: 'CE-CPM-209',
    title: 'Construction Planning and Management',
    category: 'Construction Management',
    plannedHours: 38,
    moduleCount: 4,
    icon: '📊',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Core Civil Engineering & GATE CE',
    shortDescription: 'Project planning and scheduling, Critical Path Method (CPM), PERT probabilistic time estimates, project crashing and cost optimization, and heavy construction equipment economics.',
    learningOutcomes: [
      'Construct network diagrams using Activity-on-Arrow (AOA) and Activity-on-Node (AON) conventions.',
      'Compute Earliest/Latest event times, Total Float, Free Float, and Independent Float in CPM networks.',
      'Calculate expected activity duration (te) and variance (sigma^2) in PERT using beta distribution.',
      'Perform time-cost trade-off analysis by crashing critical activities with minimum cost slope.',
      'Optimize earthwork hauling using mass haul diagrams and calculate equipment depreciation.'
    ],
    modules: [
      {
        id: 'mod-cpm-1',
        unitNumber: 1,
        title: 'Network Analysis: Critical Path Method (CPM)',
        plannedHours: 10,
        summary: 'Work breakdown structure (WBS), network logic rules, forward and backward pass, early/late start and finish, total float, free float, and identifying the critical path.',
        sampleTopics: ['Forward and Backward Pass Calculations', 'Total Float (TF = LST - EST)', 'Free Float (FF) and Independent Float (IF)', 'Critical Path Determination']
      },
      {
        id: 'mod-cpm-2',
        unitNumber: 2,
        title: 'Project Evaluation & Review Technique (PERT)',
        plannedHours: 10,
        summary: 'Probabilistic time estimates (optimistic to, most likely tm, pessimistic tp), beta distribution mean te = (to + 4tm + tp)/6, standard deviation, and project completion probability (Z-table).',
        sampleTopics: ['Expected Duration te and Variance sigma^2', 'Central Limit Theorem in Project Completion', 'Probability of Completing within Target Time (Z)', 'Subcritical Paths and Merge Event Risk']
      },
      {
        id: 'mod-cpm-3',
        unitNumber: 3,
        title: 'Project Crashing & Cost Optimization',
        plannedHours: 9,
        summary: 'Direct and indirect costs, normal and crash durations, cost slope calculation (Cost Slope = (Cc - Cn) / (tn - tc)), and step-by-step least-cost crashing algorithm.',
        sampleTopics: ['Direct vs Indirect Project Costs', 'Cost Slope Formula', 'Iterative Critical Path Crashing', 'Optimum Project Duration and Total Minimum Cost']
      },
      {
        id: 'mod-cpm-4',
        unitNumber: 4,
        title: 'Construction Equipment & Material Management',
        plannedHours: 9,
        summary: 'Earthmoving equipment (dozers, scrapers, power shovels, draglines), hauling balancing, Mass Haul Diagram, inventory control models (EOQ, ABC analysis), and depreciation.',
        sampleTopics: ['Mass Haul Diagram Balancing & Lead', 'Equipment Output & Cycle Time', 'Economic Order Quantity (EOQ)', 'Straight Line vs Written Down Value Depreciation']
      }
    ],
    sampleQuiz: [
      {
        q: 'If the optimistic, most likely, and pessimistic times of an activity are 4 days, 7 days, and 16 days respectively, what is the expected duration te and variance sigma^2?',
        options: ['te = 8 days, sigma^2 = 4 days^2', 'te = 7 days, sigma^2 = 2 days^2', 'te = 9 days, sigma^2 = 4 days^2', 'te = 8 days, sigma^2 = 2 days^2'],
        ans: 0,
        explanation: 'te = (4 + 4*7 + 16)/6 = (4 + 28 + 16)/6 = 48/6 = 8 days. Standard deviation sigma = (tp - to)/6 = (16 - 4)/6 = 12/6 = 2 days. Variance sigma^2 = 2^2 = 4 days^2.'
      },
      {
        q: 'Which float represents the excess time available if preceding activities finish at their latest times and succeeding activities start at their earliest times?',
        options: ['Total Float', 'Free Float', 'Independent Float', 'Interfering Float'],
        ans: 2,
        explanation: 'Independent Float is the float under worst-case boundary conditions: IF = ES_j - LF_i - t_ij. If negative, it is taken as zero.'
      }
    ]
  },

  // 10. ENGINEERING MATHEMATICS FOR GATE CE (Demo Course)
  {
    id: 'engineering-math-gate-ce',
    code: 'CE-MTH-210',
    title: 'Engineering Mathematics for GATE CE',
    category: 'Applied Mathematics',
    plannedHours: 40,
    moduleCount: 5,
    icon: '🧮',
    isFeatured: false,
    isDemo: true,
    badgeText: '🧪 Curriculum Preview',
    level: 'Mandatory Section 1 of GATE CE (13 Marks)',
    shortDescription: 'Linear algebra (rank, eigenvalues, eigenvectors), calculus (Taylor series, maxima-minima, line/surface integrals), differential equations, complex variables, and probability & statistics.',
    learningOutcomes: [
      'Compute matrix rank, determinants, eigenvalues, eigenvectors, and solve systems of linear equations (Cramer rule, Gauss elimination).',
      'Evaluate limits using L\'Hôpital rule, expand multivariate functions via Taylor series, and find constrained extrema.',
      'Apply Green, Gauss Divergence, and Stokes theorems to vector field integrals.',
      'Solve first-order ODEs (integrating factor) and higher-order linear ODEs with constant coefficients.',
      'Calculate probabilities using Binomial, Poisson, and Normal distributions, and evaluate hypothesis tests.'
    ],
    modules: [
      {
        id: 'mod-mth-1',
        unitNumber: 1,
        title: 'Linear Algebra: Matrices & Eigenvalues',
        plannedHours: 9,
        summary: 'Matrix algebra, row echelon form, rank-nullity theorem, system of linear equations (homogeneous and non-homogeneous), Cayley-Hamilton theorem, and diagonalizability.',
        sampleTopics: ['Rank of Matrix & Consistency Conditions', 'Eigenvalues & Eigenvectors Properties', 'Cayley-Hamilton Theorem Application', 'Orthogonal Matrices']
      },
      {
        id: 'mod-mth-2',
        unitNumber: 2,
        title: 'Calculus & Vector Calculus',
        plannedHours: 9,
        summary: 'Functions of single and multiple variables, mean value theorems, Taylor and Maclaurin series, gradient, divergence, curl, line, surface, and volume integrals with vector integral theorems.',
        sampleTopics: ['L\'Hôpital Rule for Indeterminate Forms', 'Maxima & Minima of Two-Variable Functions', 'Gradient, Divergence and Curl Identities', 'Gauss Divergence & Stokes Theorems']
      },
      {
        id: 'mod-mth-3',
        unitNumber: 3,
        title: 'Differential Equations',
        plannedHours: 8,
        summary: 'First-order differential equations (linear and exact), integrating factor, Cauchy-Euler equations, second-order linear ODEs with constant coefficients, and method of variation of parameters.',
        sampleTopics: ['Integrating Factor for Linear First-Order ODEs', 'Particular Integral Short Methods', 'Cauchy-Euler Equidimensional Equations', 'Orthogonal Trajectories']
      },
      {
        id: 'mod-mth-4',
        unitNumber: 4,
        title: 'Probability & Statistics',
        plannedHours: 8,
        summary: 'Conditional probability, Bayes theorem, discrete (Binomial, Poisson) and continuous (Uniform, Exponential, Normal) probability distributions, expectation, variance, and regression analysis.',
        sampleTopics: ['Bayes Theorem for Posterior Probability', 'Poisson Distribution (P(X=k) = e^-lambda * lambda^k / k!)', 'Normal Standard Distribution (Z-Scores)', 'Linear Regression & Correlation Coefficient']
      },
      {
        id: 'mod-mth-5',
        unitNumber: 5,
        title: 'Numerical Methods',
        plannedHours: 6,
        summary: 'Root finding algorithms (Newton-Raphson, Bisection), numerical integration (Trapezoidal rule, Simpson 1/3 and 3/8 rules), and single-step ODE solutions (Euler, Runge-Kutta 4th order).',
        sampleTopics: ['Newton-Raphson Order of Convergence (Quadratic)', 'Simpson 1/3 Rule Error Order (O(h^4))', 'Trapezoidal Rule for Unequal Intervals', 'Runge-Kutta 4th Order Algorithm']
      }
    ],
    sampleQuiz: [
      {
        q: 'For a 3x3 square matrix A, if the sum of eigenvalues is 10 and the product of eigenvalues is 24, what are the trace and determinant of A?',
        options: ['Trace = 10, Det = 24', 'Trace = 24, Det = 10', 'Trace = 5, Det = 12', 'Cannot be determined without matrix elements'],
        ans: 0,
        explanation: 'By fundamental properties of eigenvalues, Trace(A) = sum of eigenvalues = 10, and Det(A) = product of eigenvalues = 24.'
      },
      {
        q: 'What is the order of convergence of the Newton-Raphson method for finding a simple root of f(x) = 0?',
        options: ['1 (Linear)', '2 (Quadratic)', '3 (Cubic)', '1.618 (Golden ratio)'],
        ans: 1,
        explanation: 'Newton-Raphson has quadratic convergence (order p = 2) in the vicinity of a simple root where f\'(x) != 0.'
      }
    ]
  }
];

export const getCourseById = (courseId) => {
  return civilEngineeringCatalogue.find(c => c.id === courseId) || civilEngineeringCatalogue[0];
};
