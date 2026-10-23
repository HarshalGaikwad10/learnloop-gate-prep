// src/data/courses/unit2VisualsData.js — Master Visual Learning Data for Unit 2: Water Treatment Units
import FlowsheetAerationDiagram from '../../components/academy/visuals/FlowsheetAerationDiagram';
import CoagulationFlocculationDiagram from '../../components/academy/visuals/CoagulationFlocculationDiagram';
import SedimentationBasinDiagram from '../../components/academy/visuals/SedimentationBasinDiagram';
import RapidSandFilterDiagram from '../../components/academy/visuals/RapidSandFilterDiagram';
import BreakpointChlorinationDiagram from '../../components/academy/visuals/BreakpointChlorinationDiagram';
import MembraneSofteningDiagram from '../../components/academy/visuals/MembraneSofteningDiagram';

export const unit2VisualsData = {
  // ── LESSON 2.1: Flowsheet, Screening & Aeration ───────────────────────────
  'les-2-1': {
    lessonId: 'les-2-1',
    topic: 'Treatment Flowsheet, Screening & Aeration',
    diagramComponent: FlowsheetAerationDiagram,
    diagramTitle: 'Municipal Water Treatment Flowsheet & Cascade Aerator',
    diagramDescription: 'Cross-sectional hydraulic profile showing multi-barrier unit operations from raw river intake through bar racks and tiered cascade aeration trays.',
    stepByStep: {
      simpleLanguage: 'Raw river or lake water first flows through large metal grates (bar screens) that stop tree branches, plastic bags, and floating debris from wrecking pumps. The water is then pumped to the top of concrete steps (cascade aerator) where it tumbles down like a waterfall. Tapping atmospheric air allows trapped smelly gases (like rotten-egg hydrogen sulfide) to escape, while dissolved oxygen naturally turns invisible dissolved iron into visible reddish-brown rust specks that can later be caught and filtered out.',
      technicalEngineering: 'Surface water treatment operates as a sequential physical-chemical barrier train. Coarse screens (50–100 mm openings) and fine bar screens (6–20 mm openings) maintain an approach velocity between 0.6 and 0.9 m/s to prevent both debris extrusion and sediment deposition. Head loss is governed by the Kirschmer formula based on bar cross-section factor β, clear spacing b, and inclination θ. The cascade aerator provides atmospheric oxygen mass transfer (governed by dC/dt = K_L·a·(C_s - C)) and strips aggressive CO₂ (elevating pH) while stoichiometrically oxidizing soluble ferrous iron (4Fe²⁺ + O₂ + 10H₂O → 4Fe(OH)₃↓ + 8H⁺).',
      stages: [
        {
          stageNumber: 1,
          name: 'Raw Water Intake & Bar Screening',
          simpleAction: 'Blocks large floating solids like tree logs, plastic bottles, and weeds.',
          engineeringMechanism: 'Trash racks and bar screens inclined at 45°–60° maintain channel velocity of 0.6–0.9 m/s with Kirschmer head loss h_L = β(w/b)^(4/3)·(v²/2g)·sin(θ).'
        },
        {
          stageNumber: 2,
          name: 'Gravity Cascade Aeration',
          simpleAction: 'Water splashes over concrete tiers to breathe in oxygen and vent out foul gases.',
          engineeringMechanism: 'Thin film cascading across 4–6 concrete steps (1.2–3.0 m total drop; 0.015–0.045 m²/(m³/day)) provides two-film gas absorption and stripping.'
        },
        {
          stageNumber: 3,
          name: 'Iron & Manganese Precipitation',
          simpleAction: 'Turns dissolved invisible metals into solid rust flakes.',
          engineeringMechanism: 'Stoichiometric oxidation converts Fe²⁺ to insoluble Fe(OH)₃ flocs (1 mg/L O₂ oxidizes 7 mg/L Fe²⁺), strictly preceding downstream sand filtration.'
        }
      ]
    },
    engineeringChart: {
      title: 'Dissolved Oxygen (DO) Absorption vs. Cascade Drop Height',
      chartType: 'line',
      xAxisKey: 'dropHeightMeters',
      xAxisLabel: 'Total Cascade Drop Height (m)',
      yAxisKey: 'doConcentrationMgL',
      yAxisLabel: 'Dissolved Oxygen Concentration (mg/L)',
      isIllustrative: true,
      dataNote: 'Values based on empirical CPHEEO cascade aerator performance for 25°C water with initial DO = 2.0 mg/L and saturation C_s = 8.4 mg/L.',
      data: [
        { dropHeightMeters: 0, doConcentrationMgL: 2.0, saturationDeficitMgL: 6.4 },
        { dropHeightMeters: 0.5, doConcentrationMgL: 4.1, saturationDeficitMgL: 4.3 },
        { dropHeightMeters: 1.0, doConcentrationMgL: 5.7, saturationDeficitMgL: 2.7 },
        { dropHeightMeters: 1.5, doConcentrationMgL: 6.8, saturationDeficitMgL: 1.6 },
        { dropHeightMeters: 2.0, doConcentrationMgL: 7.4, saturationDeficitMgL: 1.0 },
        { dropHeightMeters: 2.5, doConcentrationMgL: 7.8, saturationDeficitMgL: 0.6 },
        { dropHeightMeters: 3.0, doConcentrationMgL: 8.1, saturationDeficitMgL: 0.3 }
      ],
      lines: [
        { key: 'doConcentrationMgL', color: '#38BDF8', name: 'Dissolved Oxygen (mg/L)' },
        { key: 'saturationDeficitMgL', color: '#F59E0B', name: 'Deficit (Cs - C) (mg/L)' }
      ],
      explanation: 'As total drop height increases, cumulative air contact time and film turbulence diminish the oxygen deficit exponentially following first-order kinetics. A 2.0–2.5 m total drop yields over 85% oxygen saturation efficiently without excessive pumping energy.',
      gateTakeaway: 'GATE CE problems frequently test the oxygen deficit formula: D_t = D_0 · exp(-K_L·a·t) and calculation of minimum drop heights.'
    },
    workedExample: {
      title: 'Head Loss Calculation across a Bar Screen (Kirschmer Formula)',
      problemStatement: 'A municipal water intake channel carries 30 MLD of raw water through a clean bar screen composed of rectangular bars (thickness w = 10 mm, clear opening b = 25 mm). The screen is inclined at 60° to the horizontal. If the approach velocity in the channel is v = 0.8 m/s, calculate the head loss across the clean screen. Assume bar shape factor β = 2.42 for rectangular bars.',
      givenData: [
        'Flow rate Q = 30 MLD',
        'Bar thickness w = 10 mm = 0.010 m',
        'Clear opening between bars b = 25 mm = 0.025 m',
        'Inclination angle θ = 60°',
        'Approach velocity v = 0.8 m/s',
        'Bar shape factor β = 2.42 (for sharp-edged rectangular bars)',
        'Acceleration due to gravity g = 9.81 m/s²'
      ],
      formula: '$$h_L = \\beta \\left(\\frac{w}{b}\\right)^{4/3} \\frac{v^2}{2g} \\sin \\theta$$',
      stepByStepSolution: [
        'Calculate the ratio of bar thickness to clear opening: w / b = 10 / 25 = 0.40',
        'Raise the ratio to the power 4/3: (0.40)^(4/3) = (0.40)^1.3333 = 0.2930',
        'Calculate the velocity head: v² / (2g) = (0.8)² / (2 × 9.81) = 0.64 / 19.62 = 0.0326 m',
        'Compute the inclination sine: sin(60°) = 0.8660',
        'Substitute all parameters into Kirschmer formula: h_L = 2.42 × 0.2930 × 0.0326 × 0.8660',
        'Calculate final head loss: h_L = 0.0200 m = 20.0 mm'
      ],
      finalAnswer: 'Head loss across clean screen h_L = 20.0 mm (0.020 m)',
      units: 'mm of water column',
      significance: 'Head loss across a clean screen is modest (~20 mm). However, during seasonal floods when leaves and debris blind 50% of the screen area, velocity doubles and head loss can spike by 4×, requiring mechanical raking.'
    },
    exploreFurther: {
      googleSearchQuery: 'Kirschmer formula bar screen design CPHEEO water treatment',
      youtubeSearchQuery: 'cascade aerator water treatment plant operation',
      recommendedTopics: [
        'Kirschmer head loss formula derivation',
        'Cascade aerator tray design per CPHEEO',
        'Two-film theory for gas absorption in water'
      ]
    }
  },

  // ── LESSON 2.2: Coagulation & Flocculation Chemistry & Design ─────────────
  'les-2-2': {
    lessonId: 'les-2-2',
    topic: 'Coagulation & Flocculation Chemistry & Design',
    diagramComponent: CoagulationFlocculationDiagram,
    diagramTitle: 'Rapid Mix Flash Mixer & Baffled Tapered Flocculator',
    diagramDescription: 'Mechanical agitation transition showing flash high-shear chemical dispersion (G = 600–1000 s⁻¹) feeding into a 3-stage tapered velocity flocculator (G = 60 → 40 → 20 s⁻¹).',
    stepByStep: {
      simpleLanguage: 'Microscopic clay and silt particles in raw river water carry negative electrical charges, causing them to repel each other like matching magnets and stay floating indefinitely. In the Rapid Mixer, chemical coagulant (alum) is flash-mixed at violent speed for 30–60 seconds, releasing trivalent aluminum ions that instantly neutralize the negative charges. The water then flows into the slow-mixing Flocculator, where gentle rotating paddles gently bump the neutralized particles together over 20–30 minutes to build heavy, fluffy floc clusters.',
      technicalEngineering: 'Colloidal stability is maintained by electrostatic repulsion governed by the electrical double layer and Zeta Potential (-15 to -30 mV). Rapid mixing introduces Al³⁺/Fe³⁺ ions causing charge neutralization and compression of the diffuse double layer within seconds, followed by sweep coagulation (insoluble Al(OH)₃ precipitation). Mechanical power dissipation P generates velocity gradient G = √(P / (μ·V)). The subsequent flocculation tank employs tapered G (e.g. 60 → 40 → 20 s⁻¹) with total Camp number G·t = 20,000–60,000 to maximize interparticle collisions while preventing floc shear breakup.',
      stages: [
        {
          stageNumber: 1,
          name: 'Flash Coagulant Dispersion',
          simpleAction: 'Chemical alum is blasted throughout the water in under a minute.',
          engineeringMechanism: 'High velocity gradient G = 600–1000 s⁻¹ in a 30–60 s retention basin dissipates mechanical power to disperse trivalent coagulants evenly.'
        },
        {
          stageNumber: 2,
          name: 'Zeta Potential Neutralization & Sweep Floc',
          simpleAction: 'Cancels out repulsive particle charges so dirt particles can touch.',
          engineeringMechanism: 'Hydrolyzed species Al_8(OH)₂₀⁴⁺ neutralize negative colloids, while excess alum precipitates amorphous Al(OH)₃ sweep floc.'
        },
        {
          stageNumber: 3,
          name: 'Tapered Paddle Flocculation',
          simpleAction: 'Gentle stirring grows small specks into heavy clumps.',
          engineeringMechanism: 'Paddles rotate at 2–5 rpm, decreasing G from 60 to 20 s⁻¹ to promote orthokinetic flocculation without hydrodynamic floc cleavage.'
        }
      ]
    },
    engineeringChart: {
      title: 'Jar Test Coagulation Curve: Residual Turbidity vs. Alum Dose',
      chartType: 'line',
      xAxisKey: 'alumDoseMgL',
      xAxisLabel: 'Alum Dosage (mg/L)',
      yAxisKey: 'residualTurbidityNTU',
      yAxisLabel: 'Settled Water Turbidity (NTU)',
      isIllustrative: true,
      dataNote: 'Typical laboratory jar test response for surface water with initial turbidity = 45 NTU and alkalinity = 80 mg/L as CaCO3.',
      data: [
        { alumDoseMgL: 0, residualTurbidityNTU: 45.0, zetaPotentialMv: -28 },
        { alumDoseMgL: 5, residualTurbidityNTU: 32.0, zetaPotentialMv: -20 },
        { alumDoseMgL: 10, residualTurbidityNTU: 18.0, zetaPotentialMv: -12 },
        { alumDoseMgL: 15, residualTurbidityNTU: 4.5, zetaPotentialMv: -4 },
        { alumDoseMgL: 20, residualTurbidityNTU: 1.2, zetaPotentialMv: 0 },
        { alumDoseMgL: 25, residualTurbidityNTU: 1.0, zetaPotentialMv: +3 },
        { alumDoseMgL: 35, residualTurbidityNTU: 3.8, zetaPotentialMv: +12 },
        { alumDoseMgL: 50, residualTurbidityNTU: 12.0, zetaPotentialMv: +22 }
      ],
      lines: [
        { key: 'residualTurbidityNTU', color: '#38BDF8', name: 'Settled Turbidity (NTU)' },
        { key: 'zetaPotentialMv', color: '#10B981', name: 'Zeta Potential (mV)' }
      ],
      explanation: 'The curve illustrates the classic Jar Test optimum zone. At 20–25 mg/L alum, Zeta Potential approaches zero and settled turbidity plummets below 1.5 NTU. Overdosing beyond 35 mg/L causes charge reversal (positive Zeta Potential) and restabilization of colloids, wasting chemical and increasing sludge.',
      gateTakeaway: 'GATE CE exams frequently ask to determine optimal coagulant dosage from jar test curves and calculate natural alkalinity consumption: 1 mg/L alum consumes 0.45 mg/L natural alkalinity as CaCO3.'
    },
    workedExample: {
      title: 'Rapid Mixer Power Dissipation & Motor Sizing (Camp-Stein Formula)',
      problemStatement: 'A rapid mixing tank treats 25 MLD of municipal water with a detention time of 45 seconds. The design requires a velocity gradient G = 750 s⁻¹. If dynamic viscosity of water is μ = 1.00 × 10⁻³ Pa·s (N·s/m²) and motor efficiency is 80%, calculate: (1) Volume of the rapid mix tank, (2) Power dissipated into the water, and (3) Required motor power in kilowatts.',
      givenData: [
        'Flow rate Q = 25 MLD = 25,000 m³/day = 0.2894 m³/s',
        'Detention time t_d = 45 seconds',
        'Velocity gradient G = 750 s⁻¹',
        'Dynamic viscosity μ = 1.00 × 10⁻³ N·s/m²',
        'Motor efficiency η = 80% = 0.80'
      ],
      formula: '$$V = Q \\cdot t_d \\quad \\text{and} \\quad P = G^2 \\cdot \\mu \\cdot V \\quad \\text{and} \\quad P_{\\text{motor}} = \\frac{P}{\\eta}$$',
      stepByStepSolution: [
        'Convert flow rate to m³/s: Q = 25,000 / (24 × 3600) = 0.28935 m³/s',
        'Calculate tank volume: V = Q × t_d = 0.28935 m³/s × 45 s = 13.02 m³',
        'Square the velocity gradient: G² = (750)² = 562,500 s⁻²',
        'Calculate water power dissipation: P = G² × μ × V = 562,500 × (1.00 × 10⁻³) × 13.02 = 7,323.75 Watts',
        'Convert to kilowatts: P = 7.324 kW',
        'Account for motor efficiency: P_motor = 7.324 kW / 0.80 = 9.155 kW'
      ],
      finalAnswer: 'Tank Volume = 13.02 m³, Dissipated Power = 7.32 kW, Motor Required = 9.16 kW (~12.5 HP standard)',
      units: 'kW (Kilowatts)',
      significance: 'Camp-Stein velocity gradient G links hydrodynamic power directly to shearing kinetics. If G is too low (<300 s⁻¹), alum does not disperse before hydrolyzing; if G is maintained in flocculation, flocs shear.'
    },
    exploreFurther: {
      googleSearchQuery: 'Camp-Stein velocity gradient rapid mixer design calculation CPHEEO',
      youtubeSearchQuery: 'jar test procedure coagulation water treatment',
      recommendedTopics: [
        'Camp-Stein formula derivation P = G² μ V',
        'Alum alkalinity stoichiometry and lime addition',
        'Tapered flocculation design criteria'
      ]
    }
  },

  // ── LESSON 2.3: Sedimentation Basin & Clariflocculator Design ─────────────
  'les-2-3': {
    lessonId: 'les-2-3',
    topic: 'Sedimentation Basin & Clariflocculator Design',
    diagramComponent: SedimentationBasinDiagram,
    diagramTitle: 'Continuous-Flow Sedimentation Basin & Stokes Settling Trajectory',
    diagramDescription: 'Longitudinal cross-section defining the 4 functional zones (Inlet Baffle, Settling Zone, Sludge Hopper, and Effluent Weir) with critical particle trajectory vs0 = Q / As.',
    stepByStep: {
      simpleLanguage: 'After flocculation, water enters a large, calm rectangular concrete swimming-pool-sized tank. Water travels slowly from left to right. Because water moves so gently, heavy floc clumps fall down toward the floor due to gravity. Any particle that reaches the floor before getting to the far end is captured in a sludge pit and scraped away. Clean, clear water overflows over a notched metal edge (weir) at the top and heads to the sand filters.',
      technicalEngineering: 'Continuous sedimentation operates on Type I (discrete non-flocculent) or Type II (flocculent) gravity separation. The basin is characterized by Surface Overflow Rate SOR (v_s0 = Q / A_s). In an ideal horizontal flow basin of depth H and length L, a particle settling with critical velocity v_s0 enters at top water level and reaches the floor exactly at the outlet end. All particles with v_s ≥ v_s0 are 100% removed. Particles with v_s < v_s0 have fractional removal efficiency η = (v_s / v_s0) × 100%, completely independent of basin depth for ideal discrete particles.',
      stages: [
        {
          stageNumber: 1,
          name: 'Inlet Baffle Flow Distribution',
          simpleAction: 'Calms down incoming churning water so it flows evenly.',
          engineeringMechanism: 'Perforated baffle wall dissipates kinetic energy and provides uniform horizontal laminar approach across width B and depth H.'
        },
        {
          stageNumber: 2,
          name: 'Settling Zone Trajectory Separation',
          simpleAction: 'Particles sink to the floor while water glides across.',
          engineeringMechanism: 'Vector sum of horizontal velocity v₀ and terminal settling velocity v_s (governed by Stokes Law v_s = g(ρ_s - ρ)d² / 18μ) defines diagonal settling path.'
        },
        {
          stageNumber: 3,
          name: 'Sludge Scraping & Weir Overflow',
          simpleAction: 'Sludge scraped from bottom; clear water overflows the top crest.',
          engineeringMechanism: 'Mechanical scrapers push sludge into hoppers for periodic blowing, while clarified effluent spills over perimeter weirs at weir loading rate ≤ 150 m³/(m·day).'
        }
      ]
    },
    engineeringChart: {
      title: 'Particle Settling Velocity & Removal Efficiency vs. Particle Diameter',
      chartType: 'line',
      xAxisKey: 'particleDiameterMm',
      xAxisLabel: 'Particle Diameter d (mm)',
      yAxisKey: 'removalEfficiencyPct',
      yAxisLabel: 'Removal Efficiency η (%)',
      isIllustrative: false,
      dataNote: 'Calculated using Stokes Law for discrete particles with specific gravity G_s = 2.65, water temperature = 20°C (μ = 1.005 × 10⁻³ Pa·s), and design SOR = 30 m³/m²/day (0.347 mm/s).',
      data: [
        { particleDiameterMm: 0.010, settlingVelocityMmS: 0.089, removalEfficiencyPct: 25.6 },
        { particleDiameterMm: 0.015, settlingVelocityMmS: 0.201, removalEfficiencyPct: 57.9 },
        { particleDiameterMm: 0.020, settlingVelocityMmS: 0.358, removalEfficiencyPct: 100.0 },
        { particleDiameterMm: 0.025, settlingVelocityMmS: 0.559, removalEfficiencyPct: 100.0 },
        { particleDiameterMm: 0.030, settlingVelocityMmS: 0.805, removalEfficiencyPct: 100.0 },
        { particleDiameterMm: 0.040, settlingVelocityMmS: 1.431, removalEfficiencyPct: 100.0 },
        { particleDiameterMm: 0.050, settlingVelocityMmS: 2.236, removalEfficiencyPct: 100.0 }
      ],
      lines: [
        { key: 'removalEfficiencyPct', color: '#10B981', name: 'Basin Removal Efficiency (%)' }
      ],
      explanation: 'Particles equal to or larger than the critical diameter (0.0197 mm in this design, where v_s = v_s0 = 0.347 mm/s) are 100% removed. Below this threshold, fractional removal follows η = (v_s / v_s0) × 100% proportional to d² per Stokes Law.',
      gateTakeaway: 'A classic GATE CE trap: In an ideal settling basin, increasing depth H without changing surface area A_s does NOT improve discrete particle removal efficiency because SOR = Q / A_s remains identical.'
    },
    workedExample: {
      title: 'Design of a Rectangular Sedimentation Tank (SOR & Sizing)',
      problemStatement: 'Design a continuous-flow rectangular sedimentation basin to treat 20 MLD of water. The design Surface Overflow Rate is SOR = 30 m³/m²/day, and the detention time is 3.5 hours. Assuming a length-to-width ratio L:B = 4:1 and water depth H = 3.5 m (plus 0.5 m freeboard), determine: (1) Surface area required, (2) Plan dimensions (Length and Width), and (3) Flow velocity v0.',
      givenData: [
        'Design flow Q = 20 MLD = 20,000 m³/day = 833.33 m³/hr = 0.2315 m³/s',
        'Surface Overflow Rate SOR = 30 m³/m²/day = 30 m/day',
        'Detention time t_d = 3.5 hours = 0.1458 days',
        'Length-to-width ratio L / B = 4',
        'Liquid depth H = 3.5 m'
      ],
      formula: '$$A_s = \\frac{Q}{\\text{SOR}} \\quad \\text{and} \\quad A_s = L \\cdot B = 4B^2 \\quad \\text{and} \\quad v_0 = \\frac{Q}{B \\cdot H}$$',
      stepByStepSolution: [
        'Calculate required surface plan area: A_s = Q / SOR = 20,000 m³/day / 30 m/day = 666.67 m²',
        'Substitute L = 4B into plan area: 4B² = 666.67 m² → B² = 166.67 m²',
        'Calculate width: B = √(166.67) = 12.91 m → Adopt B = 13.0 m',
        'Calculate length: L = 4 × 13.0 m = 52.0 m',
        'Actual surface area provided: A_s,prov = 52.0 m × 13.0 m = 676.0 m²',
        'Check actual SOR: SOR_actual = 20,000 / 676 = 29.59 m³/m²/day (≤ 30 m³/m²/day, safe)',
        'Calculate horizontal flow velocity: v₀ = Q / (B × H) = (0.2315 m³/s) / (13.0 m × 3.5 m) = 0.00508 m/s = 0.305 m/min',
        'Verify check: v₀ = 0.305 m/min is well below maximum scouring velocity limit of 0.9 m/min per CPHEEO'
      ],
      finalAnswer: 'Basin Dimensions: Length L = 52.0 m, Width B = 13.0 m, Liquid Depth H = 3.5 m (Total Depth = 4.0 m with freeboard)',
      units: 'Meters (m)',
      significance: 'Ensuring v₀ is well below 0.9 m/min guarantees settled sludge particles on the floor will not be scoured or resuspended back into the clarified effluent stream.'
    },
    exploreFurther: {
      googleSearchQuery: 'surface overflow rate sedimentation basin design CPHEEO',
      youtubeSearchQuery: 'clariflocculator water treatment plant operation animation',
      recommendedTopics: [
        'Stokes Law assumptions and terminal settling velocity',
        'Surface overflow rate vs detention time in settling tanks',
        'Weir loading rate calculation for circular and rectangular clarifiers'
      ]
    }
  },

  // ── LESSON 2.4: Filtration: Rapid & Slow Sand Hydraulics ──────────────────
  'les-2-4': {
    lessonId: 'les-2-4',
    topic: 'Filtration: Rapid & Slow Sand Hydraulics',
    diagramComponent: RapidSandFilterDiagram,
    diagramTitle: 'Rapid Sand Filter (RSF) Stratification & Backwash Hydraulics',
    diagramDescription: 'Cutaway profile detailing quartz sand layer (d₁₀ = 0.5 mm), graded gravel support, washwater gullet, and underdrain strainer manifolds with head loss expansion physics.',
    stepByStep: {
      simpleLanguage: 'Water leaving the clarifier still has tiny microscopic cloudy specks. The Rapid Sand Filter acts like an ultra-fine sieve. Water trickles downwards through 60–75 cm of clean quartz sand, which traps the micro-particles inside tiny pore gaps between grains. Over 24 to 48 hours, dirt clogs the sand pores, choking water flow. To clean it, clean water and compressed air are pumped backwards UPWARDS from the bottom, causing the sand bed to lift, float, and expand by 50%, washing all captured dirt into side gutters.',
      technicalEngineering: 'Filtration removes sub-micron turbidity through straining, sedimentation, interception, and electrostatic attachment within the porous bed. Clean bed head loss is calculated using the Carman-Kozeny or Ergun formulation based on bed porosity e (0.40–0.45), media depth L, and sphericity ψ. Clogging elevates frictional head loss until the terminal limit (~2.5–3.0 m) or turbidity breakthrough occurs. Backwashing requires bed fluidization: upward velocity v_b must exceed minimum fluidization velocity v_mf, producing 40%–50% bed expansion (L_exp·(1 - e_exp) = L_clean·(1 - e_clean)) to scrub grains cleanly.',
      stages: [
        {
          stageNumber: 1,
          name: 'Downward Granular Filtration',
          simpleAction: 'Clarified water trickles down through quartz sand bed.',
          engineeringMechanism: 'Filtration rate of 4.8–6.0 m³/m²/hr removes particles via pore straining and Van der Waals attachment.'
        },
        {
          stageNumber: 2,
          name: 'Pore Clogging & Head Loss Rise',
          simpleAction: 'Trapped dirt fills gaps, causing resistance to water flow to climb.',
          engineeringMechanism: 'Pore constriction causes hydraulic gradient dh/dL to increase until maximum permissible terminal head loss (2.5–3.0 m) is reached.'
        },
        {
          stageNumber: 3,
          name: 'Air Scour & Fluidized Backwashing',
          simpleAction: 'Air bubbles vibrate sand; reverse water wash flushes out mud.',
          engineeringMechanism: 'Air scour (1.0–1.5 m³ air/m²/min) breaks cohesive mud balls, followed by upward wash (36–54 m³/m²/hr) expanding bed by 40%–50% for 6–10 minutes.'
        }
      ]
    },
    engineeringChart: {
      title: 'Filter Run Cycle: Frictional Head Loss and Effluent Turbidity vs. Time',
      chartType: 'line',
      xAxisKey: 'runTimeHours',
      xAxisLabel: 'Filter Run Time (Hours)',
      yAxisKey: 'headLossMeters',
      yAxisLabel: 'Head Loss (m) / Effluent Turbidity (NTU)',
      isIllustrative: true,
      dataNote: 'Simulated filter run at constant rate 5.0 m/hr with influent turbidity = 3.0 NTU and sand depth = 70 cm.',
      data: [
        { runTimeHours: 0, headLossMeters: 0.35, effluentTurbidityNTU: 1.8, description: 'Filter Ripening' },
        { runTimeHours: 1, headLossMeters: 0.45, effluentTurbidityNTU: 0.2, description: 'Stable Run' },
        { runTimeHours: 6, headLossMeters: 0.85, effluentTurbidityNTU: 0.2, description: 'Stable Run' },
        { runTimeHours: 12, headLossMeters: 1.35, effluentTurbidityNTU: 0.25, description: 'Stable Run' },
        { runTimeHours: 18, headLossMeters: 1.90, effluentTurbidityNTU: 0.3, description: 'Stable Run' },
        { runTimeHours: 24, headLossMeters: 2.50, effluentTurbidityNTU: 0.45, description: 'Terminal Head Loss' },
        { runTimeHours: 28, headLossMeters: 3.10, effluentTurbidityNTU: 1.6, description: 'Breakthrough Point' }
      ],
      lines: [
        { key: 'headLossMeters', color: '#EF4444', name: 'Head Loss (m)' },
        { key: 'effluentTurbidityNTU', color: '#38BDF8', name: 'Effluent Turbidity (NTU)' }
      ],
      explanation: 'The initial 15–30 minutes experience a ripening spike before filter skin matures. From 1 to 24 hours, effluent turbidity stays crisp (<0.3 NTU) while head loss climbs linearly. At ~24 hours, terminal head loss (2.5 m) is reached, and backwash must be triggered before the turbidity breakthrough at 28 hours.',
      gateTakeaway: 'A key GATE CE concept: Filter run length is governed by whichever comes FIRST — Terminal Head Loss (~2.5–3.0 m) OR Turbidity Breakthrough (>1.0 NTU).'
    },
    workedExample: {
      title: 'Expanded Bed Depth Calculation during Backwashing (Leva Formula)',
      problemStatement: 'A rapid sand filter bed has a clean depth of L = 0.70 m (70 cm) with a clean unexpanded bed porosity of e = 0.42. During backwashing, the upward water velocity fluidizes the sand bed, increasing the porosity of the expanded bed to e_exp = 0.68. Calculate: (1) The expanded depth of the sand bed L_exp, and (2) The percentage bed expansion.',
      givenData: [
        'Clean sand bed depth L_clean = 0.70 m',
        'Clean sand bed porosity e_clean = 0.42',
        'Expanded sand bed porosity e_exp = 0.68'
      ],
      formula: '$$L_{\\text{exp}} (1 - e_{\\text{exp}}) = L_{\\text{clean}} (1 - e_{\\text{clean}}) \\quad \\text{and} \\quad \\% \\text{ Expansion} = \\frac{L_{\\text{exp}} - L_{\\text{clean}}}{L_{\\text{clean}}} \\times 100$$',
      stepByStepSolution: [
        'Solid grain volume remains constant during expansion: Volume_solids = L_clean × (1 - e_clean)',
        'Calculate solid fraction of clean bed: (1 - e_clean) = 1 - 0.42 = 0.58',
        'Calculate solid fraction of expanded bed: (1 - e_exp) = 1 - 0.68 = 0.32',
        'Equate solid depths: L_exp × 0.32 = 0.70 m × 0.58',
        'Compute clean solid depth: 0.70 × 0.58 = 0.406 m',
        'Calculate expanded depth: L_exp = 0.406 / 0.32 = 1.2688 m ≈ 1.27 m',
        'Calculate percentage expansion: % Expansion = [(1.269 - 0.70) / 0.70] × 100 = (0.569 / 0.70) × 100 = 81.25%'
      ],
      finalAnswer: 'Expanded Bed Depth L_exp = 1.27 m (Expansion = 81.3%)',
      units: 'Meters (m) & Percentage (%)',
      significance: 'Engineers use L_exp to set the height of backwash troughs above the sand bed. If troughs are placed lower than L_exp, fluidized sand grains will spill over into the waste drain and be lost.'
    },
    exploreFurther: {
      googleSearchQuery: 'rapid sand filter backwash expansion Leva formula CPHEEO',
      youtubeSearchQuery: 'rapid sand filter backwash animation civil engineering',
      recommendedTopics: [
        'Carman-Kozeny clean bed head loss formula',
        'Rapid sand filter vs slow sand filter comprehensive comparison',
        'Underdrain manifold and lateral sizing'
      ]
    }
  },

  // ── LESSON 2.5: Disinfection Kinetics & Breakpoint Chlorination ───────────
  'les-2-5': {
    lessonId: 'les-2-5',
    topic: 'Disinfection Kinetics & Breakpoint Chlorination',
    diagramComponent: BreakpointChlorinationDiagram,
    diagramTitle: 'Breakpoint Chlorination Curve & Disinfection Chemistry',
    diagramDescription: 'Chemical profile tracing residual chlorine across all 4 reaction zones: immediate mineral oxidation, chloramine formation, chloramine destruction (dip), and free chlorine buildup.',
    stepByStep: {
      simpleLanguage: 'When chlorine is added to filtered water, it does not immediately start killing germs. First (Zone 1), it gets consumed by background chemicals like iron and sulfides. Next (Zone 2), it reacts with ammonia to form weak disinfectants called chloramines. As more chlorine is poured in (Zone 3), a chemical explosion happens that destroys these chloramines with a sudden dip in residual chlorine. The lowest point of this dip is called the BREAKPOINT. Adding chlorine past this point (Zone 4) creates pure Free Available Chlorine (HOCl) that kills viruses and bacteria in seconds.',
      technicalEngineering: 'Chlorine gas (Cl₂) hydrolyzes instantaneously into hypochlorous acid (Cl₂ + H₂O ⇌ HOCl + H⁺ + Cl⁻). In the presence of ammonia, combined chlorine species form: monochloramine (NH₂Cl), dichloramine (NHCl₂), and trichloramine (NCl₃). Between Cl₂:NH₃ molar ratios of 1.5:1 to 2:1, chloramines oxidize into nitrogen gas (2NH₂Cl + HOCl → N₂↑ + 3H⁺ + 3Cl⁻ + H₂O), driving the residual down to the Breakpoint minimum. Beyond the breakpoint, all ammonia is eliminated, and additional chlorine exists as Free Available Chlorine (HOCl and OCl⁻). Pathogen disinfection kinetics follow the Chick-Watson law ln(N_t/N_0) = -k·C^n·t.',
      stages: [
        {
          stageNumber: 1,
          name: 'Immediate Reducing Demand',
          simpleAction: 'Chlorine consumed by minerals; zero germ killing.',
          engineeringMechanism: 'Oxidation of inorganic reducing agents (Fe²⁺, Mn²⁺, H₂S, NO₂⁻) consumes chlorine with zero measurable residual.'
        },
        {
          stageNumber: 2,
          name: 'Chloramine Formation',
          simpleAction: 'Chlorine links with ammonia to form weak swimming-pool smelling compounds.',
          engineeringMechanism: 'Reaction with ammonia produces combined chlorine (NH₂Cl, NHCl₂) which are weaker disinfectants requiring longer contact times.'
        },
        {
          stageNumber: 3,
          name: 'Chloramine Destruction (The Breakpoint Dip)',
          simpleAction: 'More chlorine destroys the chloramines, releasing nitrogen gas.',
          engineeringMechanism: 'Excess HOCl oxidizes chloramines into N₂ gas and nitrous oxide, causing the measured residual to fall sharply to the Breakpoint trough.'
        },
        {
          stageNumber: 4,
          name: 'Free Residual Chlorine Buildup',
          simpleAction: 'Pure potent germ-killing chlorine accumulates at a 45° angle.',
          engineeringMechanism: 'Residual rises linearly with applied dose as Free Available Chlorine (HOCl + OCl⁻); IS 10500 mandates minimum 0.2 mg/L free residual at consumer taps.'
        }
      ]
    },
    engineeringChart: {
      title: 'Breakpoint Chlorination Profile: Total, Free & Combined Residual vs. Chlorine Dose',
      chartType: 'line',
      xAxisKey: 'chlorineDoseMgL',
      xAxisLabel: 'Applied Chlorine Dose (mg/L)',
      yAxisKey: 'totalResidualMgL',
      yAxisLabel: 'Chlorine Residual (mg/L)',
      isIllustrative: true,
      dataNote: 'Simulated water containing 0.5 mg/L ammonia-nitrogen (NH3-N) and 1.0 mg/L initial mineral demand.',
      data: [
        { chlorineDoseMgL: 0, totalResidualMgL: 0.0, freeResidualMgL: 0.0, combinedResidualMgL: 0.0, zone: 'Raw Water' },
        { chlorineDoseMgL: 1.0, totalResidualMgL: 0.0, freeResidualMgL: 0.0, combinedResidualMgL: 0.0, zone: 'Zone 1 (Demand)' },
        { chlorineDoseMgL: 2.0, totalResidualMgL: 0.9, freeResidualMgL: 0.0, combinedResidualMgL: 0.9, zone: 'Zone 2 (Chloramines)' },
        { chlorineDoseMgL: 3.5, totalResidualMgL: 2.2, freeResidualMgL: 0.1, combinedResidualMgL: 2.1, zone: 'Chloramine Peak' },
        { chlorineDoseMgL: 4.5, totalResidualMgL: 1.3, freeResidualMgL: 0.1, combinedResidualMgL: 1.2, zone: 'Zone 3 (Destruction)' },
        { chlorineDoseMgL: 5.5, totalResidualMgL: 0.4, freeResidualMgL: 0.2, combinedResidualMgL: 0.2, zone: 'Breakpoint Dip' },
        { chlorineDoseMgL: 6.5, totalResidualMgL: 1.3, freeResidualMgL: 1.1, combinedResidualMgL: 0.2, zone: 'Zone 4 (Free HOCl)' },
        { chlorineDoseMgL: 8.0, totalResidualMgL: 2.8, freeResidualMgL: 2.6, combinedResidualMgL: 0.2, zone: 'Zone 4 (Free HOCl)' }
      ],
      lines: [
        { key: 'totalResidualMgL', color: '#818CF8', name: 'Total Residual (mg/L)' },
        { key: 'freeResidualMgL', color: '#10B981', name: 'Free Available Chlorine (mg/L)' },
        { key: 'combinedResidualMgL', color: '#F59E0B', name: 'Combined Chloramines (mg/L)' }
      ],
      explanation: 'From 0 to 1.0 mg/L, initial mineral demand eats all chlorine. From 1.0 to 3.5 mg/L, combined chloramines rise to a peak. Between 3.5 and 5.5 mg/L, chloramines are destroyed into N₂ gas, reaching the Breakpoint at 5.5 mg/L. Beyond 5.5 mg/L, all residual accumulates as potent Free Available Chlorine.',
      gateTakeaway: 'GATE CE questions frequently ask: (1) At what point does Free Chlorine first appear? (At the Breakpoint), and (2) Why is HOCl far more effective than OCl⁻? (HOCl is neutral and easily penetrates negatively charged bacterial cell walls).'
    },
    workedExample: {
      title: 'Bleaching Powder Requirement for Municipal Disinfection',
      problemStatement: 'A municipal water supply scheme pumps 15 MLD of treated water into the service reservoir. Laboratory tests determine that the water has a chlorine demand of 1.6 mg/L to reach breakpoint. An additional free chlorine residual of 0.4 mg/L is required to satisfy IS 10500 residual safety in the distribution network. Disinfection is achieved using commercial bleaching powder containing 30% available chlorine. Calculate the daily quantity of bleaching powder required in kilograms per day.',
      givenData: [
        'Flow rate Q = 15 MLD = 15 × 10⁶ L/day',
        'Chlorine demand = 1.6 mg/L',
        'Required free residual = 0.4 mg/L',
        'Available chlorine in bleaching powder = 30% = 0.30'
      ],
      formula: '$$\\text{Total Dose} = \\text{Demand} + \\text{Residual} \\quad \\text{and} \\quad \\text{Powder (kg/day)} = \\frac{Q \\cdot \\text{Total Dose} \\times 10^{-6}}{\\text{Purity Fraction}}$$',
      stepByStepSolution: [
        'Calculate total pure chlorine dosage required: Total Dose = 1.6 mg/L + 0.4 mg/L = 2.0 mg/L (ppm)',
        'Calculate pure chlorine needed per day: Pure Cl₂ = 15 × 10⁶ L/day × 2.0 mg/L = 30 × 10⁶ mg/day = 30.0 kg/day',
        'Account for commercial purity (30% available chlorine): Commercial Powder = Pure Cl₂ / 0.30',
        'Compute bleaching powder quantity: Powder = 30.0 kg/day / 0.30 = 100.0 kg/day'
      ],
      finalAnswer: 'Required Commercial Bleaching Powder = 100.0 kg/day',
      units: 'Kilograms per day (kg/day)',
      significance: 'Understanding purity fraction is crucial in public health engineering. Because bleaching powder loses chlorine over time when exposed to atmospheric moisture, operators must test available chlorine strength regularly.'
    },
    exploreFurther: {
      googleSearchQuery: 'breakpoint chlorination curve chlorine demand calculation CPHEEO',
      youtubeSearchQuery: 'breakpoint chlorination explained environmental engineering',
      recommendedTopics: [
        'HOCl vs OCl- dissociation equilibrium with pH',
        'Chick-Watson disinfection kinetics and CT concept',
        'Chlorine dioxide vs chloramines vs ozone comparison'
      ]
    }
  },

  // ── LESSON 2.6: Water Softening & Advanced Membrane Treatment ────────────
  'les-2-6': {
    lessonId: 'les-2-6',
    topic: 'Water Softening & Advanced Membrane Treatment',
    diagramComponent: MembraneSofteningDiagram,
    diagramTitle: 'Chemical Precipitation (Lime-Soda) vs. Cross-Flow Membrane RO',
    diagramDescription: 'Comparative process layout showing chemical stoichiometry (Ca(OH)2 + Na2CO3) alongside high-pressure spiral-wound Reverse Osmosis (RO) cross-flow separation.',
    stepByStep: {
      simpleLanguage: 'Hard water contains excessive dissolved calcium and magnesium from underground limestone, which causes white crust in kettles and prevents soap from lathering. There are two major ways to fix this: (1) The Chemical Way (Lime-Soda): We add hydrated lime and soda ash powders. These chemicals react with the dissolved calcium and magnesium to turn them into solid chalk flakes (CaCO3 and Mg(OH)2) that drop out of the water. (2) The Modern Membrane Way (Reverse Osmosis / RO): Water is squeezed under massive pressure (15–70 bars) through molecular plastic sheets with holes so microscopic that only pure water molecules can squeeze through, while all salts and minerals are rejected into a drain stream.',
      technicalEngineering: 'Hardness is categorized as Carbonate Hardness CH (associated with HCO₃⁻/CO₃²⁻, temporary) and Non-Carbonate Hardness NCH (associated with SO₄²⁻, Cl⁻, permanent). Lime (Ca(OH)₂) neutralizes free CO₂, converts Ca(HCO₃)₂ to CaCO₃↓, and precipitates Mg²⁺ as Mg(OH)₂↓ at pH 10.8. Soda ash (Na₂CO₃) removes non-carbonate calcium and magnesium. Conversely, membrane separation operates by size exclusion and solution-diffusion. Microfiltration (MF, 0.1–10 μm) and Ultrafiltration (UF, 0.01–0.1 μm) remove turbidity and pathogens. Nanofiltration (NF, 0.001–0.01 μm) softens divalent ions. Reverse Osmosis (RO, <0.001 μm) overcomes osmotic pressure ΔΠ to reject >99% of total dissolved solids.',
      stages: [
        {
          stageNumber: 1,
          name: 'Lime-Soda Softening Precipitation',
          simpleAction: 'Chemical powders turn dissolved chalk into insoluble flakes.',
          engineeringMechanism: 'Lime Ca(OH)₂ precipitates carbonate hardness as CaCO₃↓ and Mg(OH)₂↓ (at pH 10.8); soda ash Na₂CO₃ precipitates non-carbonate hardness.'
        },
        {
          stageNumber: 2,
          name: 'Recarbonation Stabilization',
          simpleAction: 'Bubbling carbon dioxide gas prevents pipes from getting coated in chalk.',
          engineeringMechanism: 'Injection of CO₂ neutralizes excess caustic alkalinity and converts supersaturated CaCO₃ to soluble Ca(HCO₃)₂, preventing distribution pipe encrustation.'
        },
        {
          stageNumber: 3,
          name: 'Cross-Flow Membrane Separation (RO/NF)',
          simpleAction: 'High pressure pumps squeeze pure water through molecular sieves.',
          engineeringMechanism: 'High pressure pumps overcome osmotic pressure (ΔP > ΔΠ) to drive water flux J_w = A(ΔP - ΔΠ) across spiral-wound polyamide membranes, yielding permeate and concentrate streams.'
        }
      ]
    },
    engineeringChart: {
      title: 'Membrane Filtration Spectrum: Pore Size vs. Operating Pressure & Solute Rejection',
      chartType: 'line',
      xAxisKey: 'membraneType',
      xAxisLabel: 'Membrane Separation Technology',
      yAxisKey: 'operatingPressureBar',
      yAxisLabel: 'Typical Operating Pressure (bar)',
      isIllustrative: false,
      dataNote: 'Compiled from standard CPHEEO and industrial membrane manufacturer specifications.',
      data: [
        { membraneType: 'Microfiltration (MF)', poreSizeMicrons: 0.200, operatingPressureBar: 1.5, tdsRejectionPct: 5, target: 'Bacteria, Suspended Solids' },
        { membraneType: 'Ultrafiltration (UF)', poreSizeMicrons: 0.020, operatingPressureBar: 3.5, tdsRejectionPct: 15, target: 'Viruses, Colloids, Macromolecules' },
        { membraneType: 'Nanofiltration (NF)', poreSizeMicrons: 0.002, operatingPressureBar: 8.0, tdsRejectionPct: 65, target: 'Divalent Hardness (Ca²⁺, Mg²⁺)' },
        { membraneType: 'Reverse Osmosis (RO)', poreSizeMicrons: 0.0003, operatingPressureBar: 28.0, tdsRejectionPct: 99, target: 'Monovalent Salts (NaCl), TDS' }
      ],
      lines: [
        { key: 'operatingPressureBar', color: '#F59E0B', name: 'Operating Pressure (bar)' },
        { key: 'tdsRejectionPct', color: '#38BDF8', name: 'TDS Rejection (%)' }
      ],
      explanation: 'As membrane pore size tightens from MF (0.2 μm) to RO (<0.001 μm), the required operating pressure escalates exponentially from 1.5 bar to 28+ bar to overcome increasing hydraulic resistance and thermodynamic osmotic pressure, achieving 99% salt rejection in RO.',
      gateTakeaway: 'GATE CE Section 6 tests: (1) Nanofiltration is also known as "Membrane Softening" because it selectively rejects divalent ions (Ca²⁺, Mg²⁺, SO₄²⁻), and (2) Water flux formula J_w = A(ΔP - ΔΠ).'
    },
    workedExample: {
      title: 'Stoichiometric Lime & Soda Ash Requirement for Water Softening',
      problemStatement: 'A raw groundwater sample contains the following chemical constituents: Free CO2 = 22 mg/L, Ca²⁺ = 80 mg/L, Mg²⁺ = 24 mg/L, Total Alkalinity = 200 mg/L as CaCO3. Calculate the stoichiometric quantities of pure hydrated lime Ca(OH)2 (molecular weight 74) and pure soda ash Na2CO3 (molecular weight 106) needed per 10,000 m³ of water treated to achieve complete softening.',
      givenData: [
        'Water volume V = 10,000 m³ = 10 × 10⁶ Litres',
        'Free CO₂ = 22 mg/L (equivalent weight = 22)',
        'Ca²⁺ = 80 mg/L (equivalent weight = 20)',
        'Mg²⁺ = 24 mg/L (equivalent weight = 12.2)',
        'Total Alkalinity = 200 mg/L as CaCO3 (equivalent weight = 50)',
        'Equivalent weight of Ca(OH)₂ = 74 / 2 = 37',
        'Equivalent weight of Na₂CO₃ = 106 / 2 = 53'
      ],
      formula: '$$\\text{Lime (mg/L)} = \\left( \\frac{\\text{CO}_2}{22} + \\frac{\\text{Ca}^{2+}}{20} + \\frac{\\text{Mg}^{2+}}{12.2} + \\frac{\\text{Alkalinity}}{50} \\right) \\times 37$$',
      stepByStepSolution: [
        'Express concentrations in milliequivalents per liter (meq/L):',
        'CO₂ in meq/L = 22 / 22 = 1.00 meq/L',
        'Ca²⁺ in meq/L = 80 / 20 = 4.00 meq/L (Total Calcium Hardness = 4.00 × 50 = 200 mg/L as CaCO₃)',
        'Mg²⁺ in meq/L = 24 / 12.2 = 1.967 meq/L (Total Magnesium Hardness = 1.967 × 50 = 98.35 mg/L as CaCO₃)',
        'Total Hardness = 200 + 98.35 = 298.35 mg/L as CaCO₃',
        'Carbonate Hardness CH = min(Total Hardness, Alkalinity) = min(298.35, 200) = 200 mg/L as CaCO₃ = 4.00 meq/L',
        'Non-Carbonate Hardness NCH = Total Hardness - CH = 298.35 - 200 = 98.35 mg/L as CaCO₃ = 1.967 meq/L',
        'Lime is required for: CO₂ + Carbonate Hardness + Magnesium Hardness',
        'Lime (meq/L) = CO₂(1.00) + CH(4.00) + Mg²⁺(1.967) = 6.967 meq/L',
        'Lime dose (mg/L) = 6.967 meq/L × 37 mg/meq = 257.78 mg/L',
        'Total Lime for 10,000 m³ = 257.78 g/m³ × 10,000 m³ = 2,577.8 kg ≈ 2,578 kg',
        'Soda Ash is required only for Non-Carbonate Hardness: NCH = 1.967 meq/L',
        'Soda ash dose (mg/L) = 1.967 meq/L × 53 mg/meq = 104.25 mg/L',
        'Total Soda Ash for 10,000 m³ = 104.25 g/m³ × 10,000 m³ = 1,042.5 kg ≈ 1,043 kg'
      ],
      finalAnswer: 'Hydrated Lime Ca(OH)₂ required = 2,578 kg/10,000 m³; Soda Ash Na₂CO₃ required = 1,043 kg/10,000 m³',
      units: 'Kilograms (kg)',
      significance: 'Lime neutralizes CO₂ and removes carbonate hardness plus all magnesium, while soda ash exclusively handles non-carbonate hardness. Commercial lime and soda purity factors must be multiplied in practice.'
    },
    exploreFurther: {
      googleSearchQuery: 'lime soda softening chemical stoichiometry calculation CPHEEO',
      youtubeSearchQuery: 'reverse osmosis membrane filtration environmental engineering',
      recommendedTopics: [
        'Lime soda softening reaction equations and recarbonation',
        'Reverse osmosis vs nanofiltration flux and recovery rate',
        'Silt Density Index (SDI) and membrane fouling control'
      ]
    }
  }
};

/**
 * Helper to retrieve visual learning data for a given lesson ID
 */
export function getLessonVisualData(lessonId) {
  if (!lessonId) return null;
  return unit2VisualsData[lessonId] || null;
}
