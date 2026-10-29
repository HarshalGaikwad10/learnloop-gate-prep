import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Chatbot from "./components/Chatbot";
import Navbar from "./components/Navbar";
import CourseCatalogueView from "./components/academy/CourseCatalogueView";
import CourseOverview from "./components/academy/CourseOverview";
import LessonPlayer from "./components/academy/LessonPlayer";
import ModuleAssessmentView from "./components/academy/ModuleAssessmentView";
import FinalExamView from "./components/academy/FinalExamView";
import CertificateView from "./components/academy/CertificateView";
import DashboardView from "./components/academy/DashboardView";
import ProfileView from "./components/academy/ProfileView";
import PublicLanding from "./components/academy/PublicLanding";
import { waterSupplyAndSanitaryCourse } from "./data/courses/waterEngineeringCourse";
import { civilEngineeringCatalogue, getCourseById } from "./data/courses/coursesCatalogueData";
import { getCurrentUser, loginUser, registerUser, logoutUser } from "./services/authService";
import { sendChatMessage } from "./services/chatService";
import FormattedContent from "./components/common/FormattedContent";
import "./styles/academy.css";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const loadFonts = () => {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap";
  l.rel = "stylesheet"; document.head.appendChild(l);
};

// ─── GATE DATE HELPERS (dynamic — based on user-selected year) ───────────────
// GATE is typically held in February. We use Feb 1 of the selected year as the
// tentative exam date. All countdown functions receive `year` as a parameter.
function getGateDate(year) { return new Date(year, 1, 1); } // Feb 1
function getDaysToGate(year) {
  if (!year) return 0;
  return Math.max(0, Math.ceil((getGateDate(year) - new Date()) / (1000 * 60 * 60 * 24)));
}
function getWeeksToGate(year) { return Math.floor(getDaysToGate(year) / 7); }
function getMonthsToGate(year) { return Math.floor(getDaysToGate(year) / 30.4); }

// Total prep window in days (from Jan 1 of the year before GATE to GATE date)
function getTotalPrepDays(year) {
  if (!year) return 730;
  const start = new Date(year - 2, 2, 20); // approx start = March 20 two years before
  return Math.ceil((getGateDate(year) - start) / (1000 * 60 * 60 * 24));
}

// Available GATE years the user can choose from
const GATE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  dark:  { bg:"#07090F", surface:"#0D1117", card:"#111827", elevated:"#182030", border:"#1E293B", borderMid:"#253352", text:"#F1F5F9", textMid:"#94A3B8", textDim:"#64748B", textFaint:"#334155", navBg:"rgba(7,9,15,0.92)", inputBg:"#0D1117" },
  light: { bg:"#F0F4FF", surface:"#FAFBFF", card:"#FFFFFF", elevated:"#EEF2FF", border:"#CBD5E1", borderMid:"#C7D2FE", text:"#0F172A", textMid:"#334155", textDim:"#475569", textFaint:"#64748B", navBg:"rgba(240,244,255,0.95)", inputBg:"#FFFFFF" },
};
const C = { primary:"#6366F1", purple:"#8B5CF6", accent:"#06B6D4", success:"#10B981", warn:"#F59E0B", danger:"#EF4444" };

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = ({ size=34 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs><radialGradient id="lg" cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#312E81"/></radialGradient></defs>
    <circle cx="50" cy="50" r="48" fill="url(#lg)"/>
    <path d="M50 18C33 18 21 31 21 45c0 11 6 20 16 24v8c0 2 2 4 4 4h18c2 0 4-2 4-4v-8c10-4 16-13 16-24 0-14-12-27-29-27z" fill="#C7D2FE" opacity="0.9"/>
    <circle cx="50" cy="36" r="3.5" fill="#312E81"/><circle cx="38" cy="48" r="3" fill="#312E81"/><circle cx="62" cy="48" r="3" fill="#312E81"/>
    <circle cx="44" cy="60" r="3" fill="#312E81"/><circle cx="56" cy="60" r="3" fill="#312E81"/>
    <line x1="50" y1="36" x2="38" y2="48" stroke="#4F46E5" strokeWidth="1.5"/><line x1="50" y1="36" x2="62" y2="48" stroke="#4F46E5" strokeWidth="1.5"/>
    <line x1="38" y1="48" x2="44" y2="60" stroke="#4F46E5" strokeWidth="1.5"/><line x1="62" y1="48" x2="56" y2="60" stroke="#4F46E5" strokeWidth="1.5"/>
    <line x1="44" y1="60" x2="56" y2="60" stroke="#4F46E5" strokeWidth="1.5"/>
    <line x1="50" y1="36" x2="50" y2="26" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="2,2"/>
  </svg>
);

// ─── QUESTION BANK (287 GATE Questions) ──────────────────────────────────────
const QB = {
  wcr:[
    {q:"(GATE 2015) According to Abram's Law, strength of fully compacted concrete is inversely proportional to:",options:["Aggregate-cement ratio","Water-cement ratio","Sand-aggregate ratio","Water-aggregate ratio"],ans:1,hint:"Duff Abrams (1919): the primary fluid governing paste porosity is the ultimate deciding factor for strength."},
    {q:"(GATE 1995) Theoretical minimum w/c for complete chemical hydration:",options:["0.15 to 0.20","0.23 to 0.25","0.38 to 0.42","0.50 to 0.60"],ans:2,hint:"23% chemically bound water + 15% gel water = 0.38 total minimum."},
    {q:"(GATE 2019) If w/c increased at constant cement content, which is true?",options:["Workability decreases, strength increases","Workability increases, strength decreases","Both workability and strength increase","Both decrease"],ans:1,hint:"More water lubricates the mix but leaves empty voids when it evaporates."},
    {q:"(GATE 2012) Gel-space ratio = 0.89, gel strength = 260 MPa. Theoretical concrete strength?",options:["183.2 MPa","205.5 MPa","231.4 MPa","260.0 MPa"],ans:0,hint:"S = 260 × x³ where x is gel-space ratio. 260 × 0.89³ ≈ 183 MPa."},
    {q:"(GATE 2008) 'Bound water' in a concrete mix is:",options:["Water for workability","Water filling gel pores","Water chemically combined with cement","Excess water that evaporates"],ans:2,hint:"Bound water becomes part of the crystal structure of C-S-H gel."},
    {q:"(GATE 2004) Maximum w/c ratio for 'Mild' exposure (IS 456:2000):",options:["0.45","0.50","0.55","0.60"],ans:2,hint:"Mild is least aggressive — highest permissible w/c among exposure classes."},
    {q:"(GATE 2017) As w/c increases, permeability of hardened concrete:",options:["Decreases linearly","Remains unaffected","Increases significantly","Decreases exponentially"],ans:2,hint:"Excess water forms capillary pores (tunnels) as it dries — increasing permeability."},
    {q:"(GATE 2010) For a given degree of hydration, capillary pore volume:",options:["Increases with w/c","Decreases with w/c","Independent of w/c","Depends only on curing temperature"],ans:0,hint:"Capillary pores = empty spaces left by mixing water beyond the 0.38 minimum."},
    {q:"(GATE 2001) High w/c affects transition zone (paste-aggregate interface) by:",options:["Making it denser and stronger","Increasing micro-cracking and porosity due to bleeding","Eliminating the zone","Reducing zone thickness"],ans:1,hint:"Water bleeds and gets trapped under aggregate, creating weak porous pockets."},
    {q:"(GATE 2014) If actual w/c < 0.38, what happens?",options:["Concrete never sets","Complete hydration is physically impossible","Concrete achieves infinite strength","Bleeding increases massively"],ans:1,hint:"Below 0.38, insufficient space/moisture for all clinker grains to react fully."},
    {q:"(GATE 2006) Most dominant factor influencing durability of concrete:",options:["Aggregate shape","Maximum aggregate size","Water-cement ratio","Cement brand"],ans:2,hint:"Permeability controls durability — and w/c ratio controls permeability."},
    {q:"(GATE 1999) With constant w/c, increasing maximum aggregate size:",options:["Increases compressive strength","Decreases compressive strength","No effect on strength","Increases cement requirement"],ans:1,hint:"Larger aggregates have less surface area — lower bond strength and greater ITZ stresses."},
    {q:"(GATE 2011) Abram's Law formula (S = compressive strength, x = w/c):",options:["S = A + Bx","S = A / B^x","S = A × B^x","S = A - B/x"],ans:1,hint:"Inverse exponential: as x increases, denominator grows, strength drops."},
    {q:"(GATE 2016) Bleeding in concrete primarily caused by:",options:["Low w/c ratio","High w/c + lack of fines","Excessive cement content","Over-vibration of dry mix"],ans:1,hint:"Too much water + insufficient fines → heavier solids settle, pushing water upward."},
    {q:"(GATE 2003) To achieve high workability without strength reduction from high w/c:",options:["Accelerators","Retarders","Air-entraining agents","Superplasticizers (HRWR)"],ans:3,hint:"Superplasticizers reduce water demand by up to 30% while maintaining flowability."},
    {q:"Water in microscopic pores of hydrated cement gel:",options:["Capillary water","Chemically bound water","Gel water","Free water"],ans:2,hint:"Physically held by surface tension in gel pores — not chemically bonded."},
    {q:"Effect of lowering w/c on modulus of elasticity:",options:["Decreases","Increases","Remains constant","Fluctuates"],ans:1,hint:"Fewer voids = stiffer, denser matrix that resists deformation better."},
    {q:"(IS 456:2000) Maximum w/c for 'Extreme' exposure:",options:["0.40","0.45","0.50","0.55"],ans:0,hint:"Extreme conditions need the tightest, most impermeable paste possible."},
    {q:"Which curve represents w/c vs compressive strength?",options:["Straight line through origin","Parabola opening upwards","Hyperbola (inversely proportional)","Bell-shaped curve"],ans:2,hint:"As ratio gets smaller, strength shoots up exponentially — a hyperbolic curve."},
    {q:"In HPC, the w/cm ratio is typically kept below:",options:["0.60","0.50","0.40","0.70"],ans:2,hint:"M60+ grades require severely restricted capillary voids — w/cm < 0.40."},
    {q:"(GATE 2021) 'Effective water-cement ratio' refers to:",options:["Total water added","Free water excluding absorption by dry aggregates","Water for workability only","Water in aggregates before mixing"],ans:1,hint:"Dry aggregates 'steal' water from paste. Only what remains is effective."},
    {q:"Using bone-dry aggregates without mix adjustment makes effective w/c:",options:["Higher than design","Lower than design","Equal to design","Zero"],ans:1,hint:"Bone-dry aggregates absorb mixing water, leaving less free water for cement paste."},
    {q:"Lower w/c reduces drying shrinkage because:",options:["Increases both plastic and drying shrinkage","Fewer capillary pores = less evaporable water = lower shrinkage","No effect","Only affects plastic shrinkage"],ans:1,hint:"Drying shrinkage = loss of capillary water. Fewer pores = less shrinkage."},
    {q:"Low w/c improves sulphate resistance by:",options:["Neutralizing sulphate ions","Reducing permeability, preventing sulphate penetration","Eliminating C₃A","Increasing pH to 14"],ans:1,hint:"Sulphate resistance is about keeping sulphates OUT — low w/c creates near-impermeable barrier."},
    {q:"Most likely visual defect with w/c = 0.65:",options:["Delamination of top layer","Laitance — weak milky layer on top","Pop-outs from ASR","Thermal cracks"],ans:1,hint:"Excess bleed water rises carrying fines, depositing a weak dusty whitish surface layer."},
    {q:"Water with NO chemical role in hydration (purely for workability):",options:["Bound water (0.23 w/c)","Gel water (0.15 w/c)","Capillary water (beyond 0.38 w/c)","Interlayer water"],ans:2,hint:"First 0.38 is used chemically. Any water beyond 0.38 is purely for workability."},
    {q:"Self-desiccation most commonly occurs when w/c is:",options:["Greater than 0.50","Between 0.40 and 0.50","Less than 0.38","Exactly 0.38"],ans:2,hint:"Below 0.38, insufficient water to fill gel pores — concrete dries itself out internally."},
    {q:"The concept of w/c ratio was first published by:",options:["T.C. Powers","Duff Abrams","R.W. Nurse","A.M. Neville"],ans:1,hint:"Abrams published at the Structural Materials Research Laboratory in 1919."},
    {q:"Replacing cement with fly ash at constant w/c generally:",options:["Reduces early but can increase long-term strength","Increases both uniformly","No effect","Increases early strength only"],ans:0,hint:"Fly ash is a slow pozzolan — lower early strength, higher long-term strength."},
    {q:"(GATE 2002) % water by weight of cement for chemical hydration:",options:["15%","23%","38%","50%"],ans:1,hint:"Chemically bound water = 23% — becomes part of the C-S-H crystal structure."},
    {q:"(GATE 2007) Target w/c in mix design primarily determined by:",options:["Desired slump only","Specified compressive strength and durability","Cost of water","Mixing equipment"],ans:1,hint:"Slump is achieved by water content; w/c RATIO is set by strength and durability."},
    {q:"(GATE 1996) Abram's Law is strictly valid only when:",options:["Concrete is air-entrained","Concrete is fully compacted (no entrapped air)","Aggregate is angular","w/c above 0.5"],ans:1,hint:"Law assumes void-free paste. Incomplete compaction introduces air voids that confound the relationship."},
    {q:"(GATE 2009) IS 456:2000 table providing max w/c limits for exposure conditions:",options:["Table 4","Table 5","Table 6","Table 7"],ans:1,hint:"Table 5 of IS 456 — most critical table for GATE. Lists exposure classes with w/c limits."},
    {q:"(GATE 2018) w/c = 0.45, cement = 350 kg/m³. Water content?",options:["150.5 litres","155.0 litres","157.5 litres","160.0 litres"],ans:2,hint:"Water = w/c × cement = 0.45 × 350 = 157.5 litres/m³."},
    {q:"(GATE 2010) Effect of higher w/c on creep:",options:["Decreases creep","Increases creep","No effect","Initially decreases then increases"],ans:1,hint:"Weaker, more porous paste deforms more readily under sustained load."},
    {q:"(GATE 1994) In SSD condition, aggregate is:",options:["Completely dry inside and outside","Dry on outside but saturated internally","Wet outside and dry inside","Completely saturated with surface water"],ans:1,hint:"SSD = neutral baseline — pores full, surface dry. No net gain or loss of water."},
    {q:"For underwater tremie concrete, recommended w/c:",options:["Below 0.35","0.40 to 0.45","0.50 to 0.55","Above 0.60"],ans:1,hint:"Tremie concrete needs cohesion and washout resistance while remaining fluid."},
    {q:"'w/cm' vs 'w/c': w/cm includes:",options:["Aggregate weight in denominator","Weight of SCMs (fly ash, GGBS, silica fume)","Only for prestressed concrete","Volume instead of weight"],ans:1,hint:"Modern mixes replace some cement with SCMs — they contribute to strength, so included."},
    {q:"Void ratio of hardened concrete is directly proportional to:",options:["Aggregate-cement ratio only","Compressive strength","Original water-cement ratio","Curing temperature only"],ans:2,hint:"Every capillary water drop (above 0.38 w/c) that evaporates leaves a void."},
    {q:"Typical w/c for normal strength structural concrete (M20-M40):",options:["0.20 to 0.30","0.30 to 0.40","0.40 to 0.55","0.55 to 0.70"],ans:2,hint:"IS 456 permits up to 0.55 (mild) to 0.40 (extreme). Normal work sits in 0.40-0.55 range."},
    {q:"High w/c in large flatwork (pavements) primarily leads to:",options:["Improved skid resistance","Excessive drying shrinkage and surface crazing","Increased flexural strength","Reduced setting time"],ans:1,hint:"Large flat surfaces with high w/c lose water fast — significant differential shrinkage and crazing."},
    {q:"Strength is largely determined by w/c because it directly controls:",options:["Aggregate particle size","Degree of crystallinity of C-S-H","Total porosity of hardened paste","Rate of heat of hydration"],ans:2,hint:"Porosity is the enemy. Every interconnected pore is a weakness pathway."},
    {q:"IS 456 max w/c for Plain Cement Concrete under Moderate exposure:",options:["0.50","0.55","0.60","0.65"],ans:2,hint:"PCC has no steel to protect — limits slightly more relaxed than for RCC."},
    {q:"Ferrocement typically uses w/c ratio of approximately:",options:["0.25 to 0.35","0.40 to 0.50","0.55 to 0.65","0.65 to 0.80"],ans:0,hint:"Very low w/c gives ferrocement its exceptional impermeability and thinness."},
    {q:"Adding plasticizer reducing water by 15% at constant workability — net effect:",options:["Strength decreases by 15%","Strength increases — effective w/c is now lower","Strength unchanged","Strength becomes unpredictable"],ans:1,hint:"Reduced water at constant cement = lower w/c = directly higher strength."},
    {q:"Gel water percentage of cement weight is approximately:",options:["5%","15%","23%","38%"],ans:1,hint:"Bound water = 23%, gel water = 15%. Together = 0.38 minimum for complete hydration."},
    {q:"w/c < 0.30 is rarely used without advanced admixtures because:",options:["Causes excessive bleeding","Mix becomes too stiff — proper compaction nearly impossible","Dangerously increases heat","Causes flash setting"],ans:1,hint:"Below 0.30, barely any free water remains. Need superplasticizers + silica fume."},
  ],
  wrk:[
    {q:"(GATE 2015) Increasing order of workability:",options:["High Vee-bee, low slump, low CF","Low Vee-bee, high slump, high CF","Low Vee-bee, low slump, high CF","High Vee-bee, high slump, low CF"],ans:1,hint:"Vee-bee seconds DECREASE as mix gets more fluid; slump and CF INCREASE."},
    {q:"(GATE 2012) Most suitable test for very low workability (dry mixes):",options:["Slump test","Compaction factor test","Vee-Bee consistometer test","Flow table test"],ans:2,hint:"Vee-Bee uses vibrating table to remold concrete from cone to cylinder shape."},
    {q:"(GATE 2018) Recommended slump for pumped concrete:",options:["25-50 mm","50-100 mm","100-150 mm","150-200 mm"],ans:2,hint:"Pumped concrete needs to flow through pipes without excessive friction or segregation."},
    {q:"(GATE 2007) Compaction factor test measures:",options:["Time for concrete to flow","Ratio of partially to fully compacted concrete weight","Diameter of spread after drops","Penetration resistance"],ans:1,hint:"Ratio shows how much additional compaction is still possible in the mix."},
    {q:"(GATE 2013) Slump test NOT suitable for:",options:["Medium workability (50-100mm)","Slump <25mm OR >175mm","20mm aggregate concrete","Warm weather concrete"],ans:1,hint:"Very stiff mixes collapse unpredictably; very wet mixes collapse entirely. Only works mid-range."},
    {q:"(GATE 2009) Effect of increasing aggregate-cement ratio at constant water:",options:["Workability increases","Workability decreases — more aggregate demands more water","Workability unaffected","Workability first increases then decreases"],ans:1,hint:"More aggregate = more surface area needing lubrication. Same water = stiffer mix."},
    {q:"(GATE 2016) Workability reduces fastest in:",options:["Cool (15°C) low humidity","Hot (35°C) with high wind","Concrete with chilled water","Early morning mixing"],ans:1,hint:"High temp accelerates hydration AND increases evaporation. Wind worsens it."},
    {q:"(GATE 2005) Bottom diameter of standard slump cone (IS 1199):",options:["150 mm","200 mm","100 mm","300 mm"],ans:1,hint:"IS 1199: 100mm top, 200mm bottom, 300mm height."},
    {q:"(GATE 2003) Factor with GREATEST single influence on workability:",options:["Water content (litres/m³)","Aggregate type and shape","Cement type","Temperature"],ans:0,hint:"Water is concrete's lubricant. Small increase dramatically raises workability."},
    {q:"(GATE 2011) Compaction Factor for 'Medium' workability:",options:["0.78 to 0.82","0.85 to 0.88","0.92 to 0.94","0.95 to 0.97"],ans:2,hint:"Scale: 0.78 (very stiff) → 0.95+ (highly workable). Medium = 0.92."},
    {q:"(GATE 2020) Flow table test: dropping the table:",options:["5 times from 40mm","15 times from 12.5mm","25 times with tamping rod","10 times from 25mm"],ans:1,hint:"Flow test: 15 drops from 12.5mm height. Measure diameter of spread."},
    {q:"(GATE 2014) Segregation in fresh concrete caused by:",options:["Using rounded aggregates","Very low w/c","High w/c + poor grading","Addition of fly ash"],ans:2,hint:"Segregation: too much water + insufficient fines. Coarse aggregate sinks."},
    {q:"(GATE 2000) Recommended slump for lightly reinforced beams/slabs:",options:["0-25 mm","25-75 mm","75-100 mm","100-150 mm"],ans:1,hint:"Lightly reinforced: some room for settling — low slump sufficient."},
    {q:"(GATE 1998) Harshness in concrete caused by:",options:["Excess fines","Insufficient fine aggregate (too much coarse)","High water content","Use of rounded aggregates"],ans:1,hint:"Fine aggregate lubricates between stones. Without it, mix feels rough and gritty."},
    {q:"(GATE 2017) SCC workability measured using:",options:["Slump cone only","Slump Flow Test (T500) and V-Funnel/L-Box","Compaction factor and Vee-Bee","SPT values"],ans:1,hint:"SCC needs to flow AND pass through reinforcement. Flow spread AND passing ability assessed."},
    {q:"(GATE 2022) Admixture for maintaining workability during 2-hour hot-day transit:",options:["Accelerator (CaCl₂)","Retarder (Sugar or lignosulfonate)","Silica Fume","Air Entraining Agent"],ans:1,hint:"Retarder delays setting reaction, giving concrete longer working window in hot weather."},
    {q:"(GATE 2004) 'Shear slump' (one side shears off) indicates:",options:["Concrete is too stiff","Good cohesion","Lack of cohesion, prone to segregation","Excess fine aggregate"],ans:2,hint:"Shear slump is a warning — the mix lacks internal cohesion to hold together."},
    {q:"(GATE 2019) Vee-Bee test uses vibration because:",options:["Faster than slump","Vibration mimics actual field compaction of stiff concrete","Requires less concrete","Measures both fresh and hardened"],ans:1,hint:"RCC dams and roads use vibratory compaction. Vee-Bee replicates this."},
    {q:"Max slump for lightly reinforced mass concrete footings:",options:["0-25 mm","25-50 mm","50-100 mm","100-175 mm"],ans:1,hint:"Mass footings: vibrator compaction used — low slump, just enough to fill form."},
    {q:"Aggregate property that MOST improves workability at given w/c:",options:["Crushed angular shape","Rounded river gravel","Flaky and elongated","Large size with continuous grading"],ans:1,hint:"Rounded aggregates act as ball bearings — less surface area, roll past each other easily."},
    {q:"Kelly Ball Test is an alternative to:",options:["Vee-Bee test","Flow table test","Slump test","Compaction factor test"],ans:2,hint:"Kelly Ball measures penetration resistance on-spot in formwork — alternative to slump cone."},
    {q:"Purpose of upper hopper being larger in compaction factor test:",options:["Standard sample size","Controlled release and consistent impact on lower hopper","Separate fine from coarse","Pre-wet the concrete"],ans:1,hint:"The cascade provides a controlled, repeatable pre-compaction energy."},
    {q:"Why does fly ash improve workability?",options:["Angular particles for interlocking","Spherical glassy particles act as 'ball-bearing' lubricant","Very high water demand","Accelerates hydration"],ans:1,hint:"Fly ash particles are perfectly spherical tiny glass beads — reduce friction dramatically."},
    {q:"Correct action when slump drops from 75mm to 20mm during placing:",options:["Add more water to restore slump","Add superplasticizer — restore slump without increasing w/c","Continue placing","Add more cement"],ans:1,hint:"Adding water increases w/c and reduces strength. Superplasticizer restores workability safely."},
    {q:"'Laitance' in concrete is:",options:["High-workability concrete","Weak milky surface layer of fines due to bleeding","IS code specification","Mineral admixture for flowability"],ans:1,hint:"Laitance is weak, porous, must be removed before next pour."},
    {q:"(GATE 2023) Correct statement about slump test:",options:["Suitable for all concrete types","Slump = mold height minus concrete height after removal","Higher slump = lower workability","Filled in 2 layers, 25 strokes each"],ans:1,hint:"Slump = 300mm - measured concrete height after mold is lifted."},
    {q:"What MOST reduces workability for fixed cement content:",options:["Replacing river sand with crushed stone dust (angular)","Adding fly ash","Increasing water temperature slightly","Using larger max aggregate size"],ans:0,hint:"Angular crushed stone has vastly higher surface area and friction than smooth river sand."},
    {q:"Consistency of cement paste measured by:",options:["Slump test","Vee-Bee test","Vicat apparatus","Flow table"],ans:2,hint:"Vicat needle apparatus measures standard consistency and setting times of CEMENT PASTE, not concrete."},
    {q:"Same workability, larger max aggregate size requires:",options:["More water and cement","Less water (less surface area) — lower w/c possible","Same water","More fine aggregate"],ans:1,hint:"Larger aggregates: less total surface area per kg → less water to coat surfaces → lower w/c possible."},
    {q:"Main disadvantage of calcium chloride for workability improvement:",options:["Too expensive","Chloride ions aggressively corrode steel reinforcement","Reduces strength significantly","Prevents proper hydration"],ans:1,hint:"CaCl₂ strictly prohibited in RCC by IS 456. Cl⁻ ions destroy passive oxide film on rebar."},
    {q:"'Collapse slump' during slump test indicates:",options:["Very high workability/SCC or mix prone to segregation","Very stiff unworkable concrete","Perfectly proportioned concrete","Excess fine aggregate"],ans:0,hint:"Complete collapse = mix too wet or lacks cohesion. For SCC it's intended; for normal concrete it's a warning."},
    {q:"Workability affected by temperature because:",options:["Heat changes water density","Higher temp accelerates hydration AND increases evaporation — both stiffen mix faster","Cold prevents hydration entirely","Temperature affects aggregate absorption only"],ans:1,hint:"In hot weather, both physical (evaporation) and chemical (faster hydration) steal workable water simultaneously."},
    {q:"For underwater tremie concreting, workability required:",options:["Very Low (0-25mm)","Low (25-50mm)","Medium (50-100mm)","Very High (>150mm, SCC preferred)"],ans:3,hint:"Tremie concrete must flow freely underwater under its own weight — no mechanical vibration possible."},
    {q:"Placement method requiring HIGHEST workability:",options:["Vibrated plain mass concrete","Manually placed lightly reinforced slab","Pumped concrete through 50m pipe","Precast heavily reinforced column"],ans:2,hint:"Pumped concrete must flow under pressure through long pipes. Any stiffening causes blockage."},
    {q:"Which does NOT improve workability:",options:["Adding a plasticizer","Increasing w/c ratio","Using angular crushed aggregate instead of rounded gravel","Adding air-entraining agent"],ans:2,hint:"Angular rough surfaces create MORE friction and demand MORE water — reduce workability."},
    {q:"Slump cone (Abrams Cone) dimensions per IS 1199:",options:["Top 150mm, Bottom 100mm, H 300mm","Top 100mm, Bottom 200mm, H 300mm","Top 200mm, Bottom 100mm, H 250mm","Top 100mm, Bottom 150mm, H 300mm"],ans:1,hint:"IS 1199: wider at bottom (200mm), narrower at top (100mm), standard height 300mm."},
    {q:"Vee-Bee time for 'Medium' workability:",options:["Greater than 20 seconds","10-20 seconds","5-10 seconds","Less than 5 seconds"],ans:2,hint:"Very stiff: >20s. Stiff: 10-20s. Medium: 5-10s. High workability: <5s."},
    {q:"Workability definition per IS 6461:",options:["Water content of fresh concrete","Property determining ease with which concrete can be mixed, placed, consolidated and finished","Slump value","Compaction factor value"],ans:1,hint:"Formal definition covers full lifecycle: mixing → placing → compaction → finishing."},
    {q:"'Stiffening' (slump loss before final set) caused by:",options:["Aggregate absorption only","Initial surface hydration of cement forming gel — reducing free water","Temperature below 5°C","Carbonation of surface"],ans:1,hint:"Cement grains form viscous gel shells as they hydrate, consuming water and stiffening the mix."},
    {q:"Retempering of concrete (adding water after stiffening) per IS 456:",options:["Acceptable within 2 hours","Prohibited — increases w/c ratio, weakening concrete","Acceptable below 25°C","Acceptable for PCC but not RCC"],ans:1,hint:"Adding water to stiffened concrete permanently increases w/c. Only makes more pores."},
    {q:"Placement method requiring LOWEST workability:",options:["Slip-form for tall towers","Roller-compacted concrete (RCC) for dams","Pumped concrete for high-rise","Underwater tremie concreting"],ans:1,hint:"RCC is placed like asphalt with a roller. Zero-slump stiff mix. The roller provides all compaction."},
    {q:"Slump of concrete at 35°C vs 20°C:",options:["Remains same","Increases significantly","Decreases (slump loss increases)","First increases then stabilizes"],ans:2,hint:"Heat speeds hydration which consumes water and forms early gel. Slump drops significantly."},
    {q:"Test assessing 'passing ability' of SCC through reinforcement:",options:["V-Funnel Test","L-Box Test","Slump Flow Test","U-Box Test"],ans:1,hint:"L-Box: vertical chamber + horizontal channel with rebar obstacles. Open gate — see if it passes through."},
    {q:"Compaction factor of 0.78 indicates:",options:["High workability","Very low workability (suitable for RCC dams)","Medium workability","Self-compacting range"],ans:1,hint:"CF = 0.78 means 22% more compaction achievable. Very stiff — almost zero slump."},
  ],
  hyd:[
    {q:"(GATE 2013) Bogue compound primarily responsible for EARLY strength:",options:["C₂S","C₃S","C₃A","C₄AF"],ans:1,hint:"C₃S hydrates rapidly in first few days — responsible for most strength in 1-14 days."},
    {q:"(GATE 2016) Cement compound generating MAXIMUM heat of hydration:",options:["C₃S","C₂S","C₃A","C₄AF"],ans:2,hint:"C₃A reacts almost instantaneously with water — enormous heat. That's why gypsum is added."},
    {q:"(GATE 2007) Role of gypsum in OPC:",options:["Increase early strength","Control hydration rate of C₃A — preventing flash set","Increase heat of hydration","Act as filler to reduce cost"],ans:1,hint:"Without gypsum, C₃A reacts in seconds — uncontrollable 'flash set' that ruins the mix."},
    {q:"(GATE 2010) Final hydration product of C₃S responsible for most strength:",options:["Calcium Hydroxide Ca(OH)₂","C-S-H Gel (Calcium Silicate Hydrate)","Ettringite","C₃A-H compound"],ans:1,hint:"C-S-H gel is the primary cementing material — fibrous 'glue' comprising ~70% of hydrated paste."},
    {q:"(GATE 2019) pH ~13 of pore water primarily due to:",options:["C-S-H gel products","Dissolution of Ca(OH)₂ formed during hydration","Presence of chloride ions","Carbonation"],ans:1,hint:"Ca(OH)₂ is a strong base. Its dissolution creates the highly alkaline environment that passivates steel."},
    {q:"(GATE 2004) C₃A reacts with gypsum to initially form:",options:["Ca(OH)₂","C-S-H gel","Ettringite (trisulfoaluminate hydrate)","Pozzolan"],ans:2,hint:"Ettringite — needle-like crystals coating C₃A grains like armour, slowing the reaction."},
    {q:"(GATE 2008) Compound responsible for LONG-TERM (ultimate) strength:",options:["C₃A","C₃S","C₂S","C₄AF"],ans:2,hint:"C₂S is a 'slow burner' — barely contributes at 28 days, continues hydrating for years."},
    {q:"(GATE 2015) Heat of hydration in increasing order:",options:["C₃A < C₄AF < C₂S < C₃S","C₂S < C₄AF < C₃S < C₃A","C₄AF < C₂S < C₃A < C₃S","C₃S < C₃A < C₂S < C₄AF"],ans:1,hint:"Low to high heat: C₂S, C₄AF, C₃S, C₃A. C₃A generates the maximum heat."},
    {q:"(GATE 2012) 'False Set' caused by:",options:["Rapid hydration of C₃A (no gypsum)","Premature hydration of gypsum (dehydration during milling)","Excessive water","Hot weather"],ans:1,hint:"Gypsum dehydrates to plaster during grinding. Plaster rehydrates rapidly. NO heat — REVERSIBLE by remixing."},
    {q:"(GATE 2017) Self-desiccation in very low w/c mixes:",options:["Water evaporates from surface","Hydration consumes internal water faster than replenished — pores dry out","Silica reacts with alkalis","Temperature drops cause condensation"],ans:1,hint:"Below w/c 0.38, insufficient water to fill gel pores — mix desiccates internally."},
    {q:"(GATE 2011) Cement clinker produced by heating to approximately:",options:["600-800°C","900-1100°C","1200-1500°C (clinkering zone)","1600-1800°C"],ans:2,hint:"Liquid phase forms and C₃S is created between 1250-1480°C — the clinkering temperature."},
    {q:"(GATE 2005) Cement with LOWEST heat — ideal for mass concrete:",options:["Rapid Hardening (IS 8041)","Ordinary Portland (IS 269)","Low Heat Portland (IS 12600)","Sulphate Resisting (IS 12330)"],ans:2,hint:"Low Heat PC: high C₂S, low C₃A/C₃S content — minimizes heat, prevents thermal cracking."},
    {q:"(GATE 2014) 'Dormant period' in cement hydration refers to:",options:["Final setting time","Period of slow reaction after initial C₃A hydration — the workability window","Time for complete curing","Cold weather setting time"],ans:1,hint:"After C₃A flash is controlled by ettringite, 1-3 hours of relative inactivity before C₃S main hydration."},
    {q:"(GATE 2001) Chemical formula for C₃S in oxide notation:",options:["3CaO.SiO₂","2CaO.SiO₂","3CaO.Al₂O₃","4CaO.Al₂O₃.Fe₂O₃"],ans:0,hint:"C=CaO, S=SiO₂, A=Al₂O₃, F=Fe₂O₃. C₃S = 3 parts CaO to 1 part SiO₂."},
    {q:"(GATE 2009) Grey colour of OPC is due to:",options:["C₃S","C₂S","C₃A","C₄AF (Tetracalcium Aluminoferrite)"],ans:3,hint:"Ferrite compound C₄AF gives OPC its grey color. White PC = minimized Fe₂O₃ content."},
    {q:"(GATE 2018) For mass concrete, percentage to keep LOW to minimize thermal cracking:",options:["C₂S","C₄AF","C₃A and C₃S (high-heat compounds)","All compounds equally"],ans:2,hint:"Both C₃A (highest heat) and C₃S (second highest) should be minimized. Maximize C₂S."},
    {q:"(GATE 2000) After all gypsum consumed, ettringite converts to:",options:["C-S-H gel","Ca(OH)₂","Monosulfoaluminate (AFm phase)","Calcium Carbonate"],ans:2,hint:"When gypsum runs out, excess C₃A attacks ettringite (AFt) converting it to monosulfoaluminate (AFm)."},
    {q:"(GATE 2023) Degree of hydration refers to:",options:["Temperature of water used","Fraction of cement that has reacted with water at any given time","Total water content","Age divided by 28 days"],ans:1,hint:"Hydration never 100% complete. Degree (0 to 1) tells what fraction of cement grains have reacted."},
    {q:"(GATE 2021) Pozzolanic reaction formula:",options:["Pozzolan + CaCl₂ → C-S-H","Pozzolan (SiO₂) + Ca(OH)₂ + H₂O → C-S-H gel (additional)","Pozzolan + C₃A → Ettringite","Pozzolan + CaSO₄ → Gypsum"],ans:1,hint:"Pozzolanic reaction converts weak Ca(OH)₂ into additional strength-giving C-S-H gel."},
    {q:"First rapid heat release peak in early hydration is due to:",options:["C₂S dissolution","C₃S hydration completing","C₃A reacting with water (before gypsum controls it)","C₄AF hydrating"],ans:2,hint:"First sharp peak on heat evolution curve = C₃A almost instantaneously reacting."},
    {q:"w/c needed for COMPLETE hydration of all cement grains:",options:["0.23","0.35","0.42","0.50"],ans:2,hint:"0.23 (chemical) + 0.15 (gel pores) = 0.38 minimum. For ALL grains to react, ~0.42 needed."},
    {q:"(GATE 2002) Specific gravity of OPC clinker:",options:["2.0 to 2.2","2.5 to 2.7","3.1 to 3.2","3.5 to 3.8"],ans:2,hint:"Portland cement specific gravity ≈ 3.15 — significantly denser than most rocks (2.65)."},
    {q:"(GATE 2006) RHPC achieves higher early strength by:",options:["Higher C₂S content","Higher C₃S content AND finer grinding","Adding factory accelerating admixtures","Using higher w/c"],ans:1,hint:"More C₃S = more fast-reacting compound. Finer grinding = more surface area = faster reactions."},
    {q:"Major compound in Portland cement by weight:",options:["C₃A (~45%)","C₄AF (~35%)","C₃S (~50-55%)","C₂S (~60%)"],ans:2,hint:"C₃S (Alite) is dominant — 50-60% by weight. Primary responsible for early and long-term strength."},
    {q:"(GATE 2022) At temperatures above 300°C, C-S-H gel:",options:["Gains strength through sintering","Dehydrates and loses bonding ability — strength loss","Converts to stronger crystalline phase","Absorbs water and expands"],ans:1,hint:"C-S-H gel is stabilized by water molecules. High temperatures drive out chemically bound water, collapsing the gel."},
    {q:"(GATE 2003) Correct decreasing order of Bogue compounds in OPC:",options:["C₃S > C₂S > C₃A > C₄AF","C₂S > C₃S > C₄AF > C₃A","C₃A > C₄AF > C₃S > C₂S","C₄AF > C₃A > C₂S > C₃S"],ans:0,hint:"C₃S (~50%), C₂S (~25%), C₃A (~10%), C₄AF (~8%). C₃S always dominant."},
    {q:"(GATE 2020) Cement type MOST resistant to sulphate attack:",options:["High Alumina Cement","Sulphate Resisting PC (SRPC), C₃A < 5%","Rapid Hardening PC","OPC 53 Grade"],ans:1,hint:"Sulphate attack targets C₃A. SRPC minimizes C₃A to below 5%, removing the target."},
    {q:"C₄AF hydration contributes mainly to:",options:["High early strength","Maximum heat of hydration","Grey color and modest strength (kiln flux)","Flash setting"],ans:2,hint:"C₄AF: slow reaction, moderate heat, grey color, minimal strength. Mainly a flux for clinker production."},
    {q:"(GATE 2016) In Powers' model, minimum w/c for complete hydration:",options:["0.23","0.38","0.42","0.50"],ans:1,hint:"Powers calculated 0.23 (chemically bound) + 0.15 (gel pores) = 0.38 kg per kg cement."},
    {q:"Compounds whose hydration produces Ca(OH)₂ concentrated at aggregate interfaces:",options:["C₃A","C₄AF","Both C₃S and C₂S during silicate hydration","Gypsum dissolution"],ans:2,hint:"Both C₃S and C₂S produce C-S-H gel AND Ca(OH)₂. Ca(OH)₂ concentrates at aggregate surfaces — weak ITZ."},
    {q:"Maximum heat of hydration for OPC typically occurs at:",options:["Within first 30 minutes","3 to 5 days","At 28 days","1 year"],ans:1,hint:"Main C₃S hydration peak occurs around 1-3 days. Total heat rate peaks ~3-5 days."},
    {q:"(GATE 1993) Typical % of C₃S in OPC:",options:["5-15%","20-30%","45-60%","70-80%"],ans:2,hint:"C₃S is dominant compound — roughly 45-65% of OPC clinker."},
    {q:"Cement hydration reaction is:",options:["Endothermic (absorbs heat)","Exothermic (releases heat)","Isothermal (constant temperature)","Reversible under dry conditions"],ans:1,hint:"All cement hydration reactions are exothermic — why large pours get hot internally."},
    {q:"Bogue calculation uses input data from:",options:["Physical tests: fineness, consistency, setting time","Chemical analysis of clinker: oxides (XRF)","Accelerated strength tests","Thermal analysis (DSC)"],ans:1,hint:"Bogue uses oxide composition (CaO, SiO₂, Al₂O₃, Fe₂O₃) from XRF to back-calculate compound %."},
    {q:"Cement property most directly related to rate of hydration and heat evolution:",options:["Soundness","Setting time","Fineness (specific surface area)","Specific gravity"],ans:2,hint:"Finer cement = more surface area = faster reaction = more heat per unit time."},
    {q:"'Thaumasite' is destructive because:",options:["It is a type of C-S-H gel","It forms from sulphate attack at low temperatures, consuming C-S-H gel itself","It is an expansive ASR compound","It is crystalline Ca(OH)₂"],ans:1,hint:"Thaumasite destroys the C-S-H strength gel itself — turning concrete to mush. Worst form of sulphate attack."},
    {q:"'Dormant Period' is practically important because:",options:["Concrete reaches final strength","This is the workable period for placing, shaping and compacting","Concrete gains characteristic strength","Heat of hydration is maximum"],ans:1,hint:"During dormant period, reactions are temporarily slowed. This is the contractor's window."},
    {q:"(GATE 1991) White Portland Cement differs from Grey PC because:",options:["Uses different limestone","Fe₂O₃ content minimized (<0.5%) — C₄AF essentially absent","Ground more finely","Higher C₃A content"],ans:1,hint:"Ferric oxide gives cement its grey color. White cement uses raw materials with very low iron content."},
    {q:"Rapid stiffening WITH significant heat that CANNOT be reversed by remixing:",options:["False Set","Flash Set (True Set)","Early stiffening","Premature hardening"],ans:1,hint:"Flash Set = uncontrolled C₃A reaction = heat = IRREVERSIBLE. False Set = no heat = REVERSIBLE. GATE favourite!"},
    {q:"Map/alligator skin cracking most likely associated with:",options:["Shrinkage from low cement","Sulphate attack","Alkali-Silica Reaction (ASR) — internal expansion","Flash set"],ans:2,hint:"ASR gel absorbs water and swells — random 'map cracking' pattern is the diagnostic sign."},
    {q:"'Soundness' of cement refers to:",options:["Acoustic properties","Ability to resist large disruptive volume changes after setting","Compressive strength at 28 days","Fineness of cement particles"],ans:1,hint:"Unsound cement expands after setting, causing cracking and disintegration. Tested with Le Chatelier test."},
    {q:"(GATE 2014) 'Initial Setting Time' by Vicat needle test:",options:["Paste completely hardened","1mm needle fails to penetrate 5mm into paste","Needle cannot penetrate to within 5mm from bottom","Ettringite crystallization begins"],ans:2,hint:"IS 269: initial set = Vicat needle fails to sink to within 5mm of mold bottom. OPC minimum: 30 minutes."},
    {q:"(GATE 2005) Pozzolanic activity of silica fume is due to:",options:["Al₂O₃","Fe₂O₃","CaO","SiO₂ (amorphous, 85-95% of silica fume)"],ans:3,hint:"Silica fume is essentially pure amorphous SiO₂. Extreme fineness + non-crystalline structure = highly reactive."},
    {q:"(GATE 2004) C₃A content in Sulphate Resisting Portland Cement (SRPC):",options:["Less than 15%","Less than 10%","Less than 5%","Less than 2%"],ans:2,hint:"SRPC limits C₃A to < 5% to minimize the target compounds for sulphate attack."},
    {q:"Minimum initial setting time for OPC per IS 269:",options:["15 minutes","30 minutes","45 minutes","60 minutes"],ans:1,hint:"IS 269: Initial setting time of OPC minimum 30 minutes, final setting time maximum 600 minutes."},
    {q:"(GATE 2019) Specific surface area of cement is measured using:",options:["Vicat apparatus","Blaine's air permeability apparatus","Le Chatelier apparatus","Autoclave test"],ans:1,hint:"Blaine's apparatus measures fineness as specific surface area (cm²/g). Higher Blaine = finer cement = faster hydration."},
  ],
  str:[
    {q:"(GATE 2014) Characteristic compressive strength fck is the strength below which:",options:["2% of results may fall","5% of results may fall","10% of results may fall","15% may fall"],ans:1,hint:"IS 456: fck is statistical — 95% of results must be above it. Only 5% allowed to fall below."},
    {q:"(GATE 2010) Modulus of elasticity for concrete per IS 456:2000:",options:["Ec = 3000√fck","Ec = 5000√fck","Ec = 5700√fck","Ec = 4500√fck"],ans:1,hint:"IS 456 Clause 6.2.3.1: Ec = 5000√fck (MPa). Most commonly tested IS formula in GATE."},
    {q:"(GATE 2008) Standard cube size for compressive strength testing (aggregate < 38mm):",options:["100×100×100 mm","150×150×150 mm","200×200×200 mm","300×300×300 mm"],ans:1,hint:"IS 516: 150mm cube is standard. For aggregates ≥ 38mm, 200mm cubes are used."},
    {q:"(GATE 2016) Modulus of rupture (flexural tensile strength) per IS 456:2000:",options:["fcr = 0.5√fck","fcr = 0.6√fck","fcr = 0.7√fck","fcr = 0.8√fck"],ans:2,hint:"IS 456 formula: fcr = 0.7√fck. Memorize: it's 0.7, not 0.5 or 0.6. Appears in GATE almost every year."},
    {q:"(GATE 2012) Target Mean Strength for M25 with standard deviation 4 MPa:",options:["25.0 MPa","28.6 MPa","31.6 MPa","33.8 MPa"],ans:2,hint:"fcm = fck + 1.65s = 25 + 1.65×4 = 25 + 6.6 = 31.6 MPa."},
    {q:"(GATE 2019) 150mm cube gives 30 MPa. Equivalent cylinder strength:",options:["30.0 MPa","26.7 MPa","24.0 MPa","20.0 MPa"],ans:2,hint:"Cylinder strength ≈ 0.8 × cube strength = 0.8 × 30 = 24 MPa."},
    {q:"(GATE 2007) Loading rate for 150mm cube testing per IS 516:",options:["7 MPa/minute","14 MPa/minute (140 kg/cm²/min)","20 MPa/minute","35 MPa/minute"],ans:1,hint:"IS 516: loading rate = 140 kg/cm²/min = 14 N/mm²/min."},
    {q:"(GATE 2004) 7-day strength as % of 28-day strength approximately:",options:["40%","65-75%","85%","95%"],ans:1,hint:"3 days ≈ 40%, 7 days ≈ 65-75%, 28 days = 100%, 1 year ≈ 125%."},
    {q:"(GATE 2017) Factor MOST significantly affecting compressive strength:",options:["Aggregate shape","Curing method and duration","Water-cement ratio","Mixing time"],ans:2,hint:"W/c ratio has dominant, overriding influence on compressive strength (Abrams' Law)."},
    {q:"(GATE 2011) Split tensile strength of 150mm dia × 300mm cylinder, failure load 150 kN:",options:["2.12 MPa","2.17 MPa","1.89 MPa","3.18 MPa"],ans:0,hint:"fct = 2P/(πDL) = 2×150,000/(π×150×300) = 300,000/141,372 ≈ 2.12 MPa."},
    {q:"(GATE 2015) Rebound Hammer gives an index of:",options:["Internal cracking","Tensile strength only","Surface hardness correlating indirectly with compressive strength","Modulus of elasticity"],ans:2,hint:"Rebound number measures surface hardness. Surface hardness correlates (imperfectly) to strength."},
    {q:"(GATE 2009) UPV testing is used to assess:",options:["Surface hardness","Internal quality, density, voids or cracks","Flexural strength only","Setting time"],ans:1,hint:"Sound travels faster through denser crack-free concrete. >4.5 km/s = excellent; <3 km/s = poor."},
    {q:"(GATE 2006) Creep in concrete is:",options:["Sudden failure under load","Elastic deformation that disappears when load removed","Gradual time-dependent deformation under sustained load","Deformation due to temperature"],ans:2,hint:"Creep is slow progressive deformation over months/years under sustained load."},
    {q:"(GATE 2020) Condition that INCREASES creep:",options:["High strength low w/c","High humidity (>90% RH)","Early loading when concrete is young","Low cement-aggregate ratio"],ans:2,hint:"Young concrete has immature gel structure — more susceptible to viscous flow under load."},
    {q:"(GATE 2003) Characteristic compressive strength of M30 grade:",options:["20 N/mm²","25 N/mm²","30 N/mm²","35 N/mm²"],ans:2,hint:"The grade NUMBER IS the characteristic strength. M30 = fck = 30 N/mm²."},
    {q:"(GATE 2018) NDT method for detecting INTERNAL cracks without surface contact:",options:["Rebound Hammer","UPV","Ground Penetrating Radar (GPR)","Carbonation depth test"],ans:2,hint:"GPR emits radar waves reflecting off material boundaries — can locate rebars and voids without contact."},
    {q:"(GATE 2022) Drying shrinkage caused by:",options:["Loss of chemically bound water","Loss of evaporable water from hardened paste — capillary menisci exert tension","Thermal contraction","Carbonation-induced volume change"],ans:1,hint:"As water evaporates, capillary menisci exert tensile suction on pore walls — pulling them inward."},
    {q:"(GATE 2013) Minimum test results required per IS 456 for valid standard deviation:",options:["10","15","30","50"],ans:2,hint:"IS 456 Clause 16.1: minimum 30 test results needed for reliable standard deviation."},
    {q:"(GATE 2021) M50 concrete indicates:",options:["50 kg cement/m³","50 MPa target mean strength","50 MPa characteristic cube strength at 28 days","50 mm slump"],ans:2,hint:"'M' = Mix, number = fck (MPa on 150mm cubes at 28 days)."},
    {q:"(GATE 2001) Tensile strength as fraction of compressive strength:",options:["5% to 8%","10% to 15%","20% to 25%","30%"],ans:1,hint:"Concrete is famously weak in tension — only 1/10 to 1/7 of compressive strength."},
    {q:"(GATE 2014) Practice MOST effectively increasing strength for given cement content:",options:["Increasing mixing time","Using 40mm aggregate instead of 20mm","Reducing w/c while maintaining workability using admixtures","Increasing curing beyond 90 days"],ans:2,hint:"Reducing w/c while maintaining workability directly attacks porosity without negative side effects."},
    {q:"(GATE 1999) 'Standard deviation' in IS 456 represents:",options:["Average strength of batch","Spread/variability of individual results around mean","Difference between 28-day and 7-day strength","Margin of safety"],ans:1,hint:"Low SD = consistent concrete. High SD = inconsistent — sometimes strong, sometimes weak."},
    {q:"(GATE 2005) Flexural Strength (Modulus of Rupture) test uses:",options:["150mm cube","150mm dia × 300mm cylinder","100×100×500mm prism in bending","Core cut from structure"],ans:2,hint:"IS 516: flexural strength measured by breaking a beam (prism) in bending."},
    {q:"(GATE 2002) Individual test result per IS 456 must not be less than:",options:["fck","fck - 4 MPa (for fck ≥ 25 MPa)","fck + 1.65 MPa","0.85 fck"],ans:1,hint:"IS 456 TWO criteria: (1) Average of 3 tests ≥ fck+4, AND (2) No individual < fck-4 MPa. Both must be satisfied."},
    {q:"(GATE 2011) Autoclave test for cement determines:",options:["Compressive strength","Soundness (expansion due to free lime and magnesia)","Setting time","Heat of hydration"],ans:1,hint:"Autoclave test: steam-cures cement bar at high pressure to force delayed expansion from free CaO or MgO."},
    {q:"(GATE 2010) Minimum curing period for OPC in hot/dry weather (IS 456):",options:["7 days","10 days","14 days","28 days"],ans:1,hint:"IS 456 Clause 13.5: 7 days normal conditions, 10 days for hot and dry exposure."},
    {q:"Core strength divided by 1.25 is approximately equivalent to:",options:["Target mean strength","Characteristic cube strength","7-day strength","Design strength"],ans:1,hint:"Core strengths are lower than cube strengths. Core ≥ 0.85fck is acceptance criterion."},
    {q:"(GATE 2017) Shrinkage cracking controlled by:",options:["Increasing w/c","Adding more cement paste","Using shrinkage-compensating cement or control joints","Increasing aggregate size only"],ans:2,hint:"Control joints give predetermined 'weak plane' to crack at. Shrinkage-compensating cement balances shrinkage."},
    {q:"(GATE 1996) 100mm cube strength vs 150mm cube:",options:["100mm cube = 1.25 × 150mm cube","100mm cube slightly HIGHER than 150mm (less size effect)","They give identical results","100mm cube = 0.8 × 150mm cube"],ans:1,hint:"Smaller specimens appear stronger — less likely to contain a large critical flaw."},
    {q:"(GATE 2015) Poisson's Ratio for concrete under uniaxial compression:",options:["0.05 to 0.10","0.15 to 0.20","0.30 to 0.35","0.40 to 0.45"],ans:1,hint:"Concrete Poisson's ratio ≈ 0.15-0.20. Compressed concrete bulges laterally by 15-20% of axial deformation."},
    {q:"(GATE 2007) Temperature curing (steam/autoclave) for precast concrete to:",options:["Reduce heat of hydration","Accelerate strength gain — faster form removal","Reduce long-term creep","Replace water curing"],ans:1,hint:"Steam curing: element taking 7 days normal curing can reach demolding strength in 8-18 hours."},
    {q:"Minimum grade for RCC per IS 456:2000:",options:["M10","M15","M20","M25"],ans:2,hint:"IS 456 explicitly states M20 minimum for structural (RCC) work. M15 allowed for Plain CC blinding only."},
    {q:"Autogenous shrinkage in HPC (very low w/c < 0.38) caused by:",options:["Surface evaporation","Chemical shrinkage — hydration products occupy less volume than reactants","Thermal contraction","Carbonation"],ans:1,hint:"Chemical shrinkage always present. In very low w/c HPC, no bleed water to compensate."},
    {q:"(GATE 2019) NDT measuring SURFACE hardness:",options:["Core cutting and compression","Rebound Hammer","Ultrasonic Pulse Velocity","Pull-off Test"],ans:1,hint:"Rebound Hammer's plunger hits surface and bounces back. Harder surface = higher rebound number."},
    {q:"Density of normal weight concrete:",options:["1500-1800 kg/m³","1800-2000 kg/m³","2200-2500 kg/m³","2800-3200 kg/m³"],ans:2,hint:"Normal concrete: aggregates ~2600-2900 kg/m³. Mix gives ~2300-2500 kg/m³ total."},
    {q:"(GATE 2001) Moist curing period for test cubes per IS 516:",options:["24 hours only","7 days","Until time of testing (minimum 28 days in water)","3 days then air curing"],ans:2,hint:"IS 516: 24 hours in moist air, then in clean water at 27±2°C until time of testing."},
    {q:"'Honeycombing' in concrete is:",options:["Pattern of micro-cracks","Voids due to incomplete compaction","Hexagonal aggregate arrangement","Surface dusting of cement"],ans:1,hint:"Honeycombing = voids from inadequate compaction, concrete flowing past rebar, or too-stiff mix."},
    {q:"(GATE 2018) Primary effect of silica fume on compressive strength:",options:["Reduces strength","Significantly increases strength by filling pores and improving ITZ","No effect","Increases early but reduces 28-day strength"],ans:1,hint:"Silica fume: 100× finer than cement. Fills pores (filler effect) + pozzolanic reaction = massive strength gain."},
    {q:"Ec = 5000√fck (IS 456) gives value in:",options:["kN/m²","N/mm² (MPa)","kN/cm²","kg/cm²"],ans:1,hint:"All IS 456 strength formulae use MPa. Ec in N/mm² when fck is in N/mm²."},
    {q:"(GATE 2022) Characteristic strength fck: probability of any result falling below it:",options:["1%","5%","10%","15%"],ans:1,hint:"By IS 456: exactly 5% probability of falling below fck. Statistical basis: mean - 1.645 × SD."},
    {q:"(GATE 2010) Secant modulus of elasticity measured between:",options:["Zero stress and 50% of ultimate","5% and 1/3 of ultimate load","Zero and ultimate load","10% and 40% of ultimate"],ans:1,hint:"IS 516: secant modulus measured between 5% and 1/3 (33%) of ultimate load."},
    {q:"(GATE 2016) Effect of temperature increase on modulus of elasticity of concrete:",options:["Increases significantly","Remains constant","Decreases as temperature increases","First increases then decreases"],ans:2,hint:"High temperatures cause micro-cracking, reducing the stiffness (Ec) of the concrete."},
    {q:"(GATE 2023) Design compressive strength of M30 concrete per IS 456:",options:["30 MPa","20 MPa","13.5 MPa (= 0.45 × 30)","20.1 MPa"],ans:2,hint:"Design compressive stress = 0.45 fck (IS 456 limit state design). Incorporates size effect and partial safety factor."},
    {q:"(GATE 2007) Modular ratio (m) in working stress method:",options:["m = Es/Ec","m = 280/3σcbc","m = fck/0.45","m = Es × Ec"],ans:1,hint:"In working stress method, m = 280/(3σcbc) where σcbc = permissible compressive stress in bending."},
    {q:"(GATE 2009) Split tensile strength of concrete is approximately:",options:["5-8% of compressive","10-15% of compressive","20-25% of compressive","30%"],ans:1,hint:"Split tensile strength ≈ 10-15% of compressive strength."},
    {q:"(GATE 2014) Split tensile test: direction of applied load:",options:["Perpendicular to cylinder axis (diametrically opposite)","Along cylinder axis","At 45° to axis","No preferred direction"],ans:0,hint:"Load applied diametrically (on opposite sides along a diameter). Creates tensile stress perpendicular to diametral plane."},
    {q:"(GATE 2001) Design mix (IS 10262) differs from nominal mix (IS 456) because:",options:["Design mix uses more cement","Design mix achieves target strength with less material — more economical","Nominal mix is always stronger","They produce identical results"],ans:1,hint:"Design mix is tailored to specific materials and site conditions. Nominal mix is a conservative prescriptive approach."},
    {q:"(GATE 2018) For split tensile test, failure load of 200 kN on 150mm dia × 300mm cylinder:",options:["2.83 MPa","1.41 MPa","5.66 MPa","4.24 MPa"],ans:0,hint:"fct = 2P/(πDL) = 2×200,000/(π×150×300) = 400,000/141,372 ≈ 2.83 MPa."},
    {q:"(GATE 2020) Which NDT method detects delamination in concrete bridge decks?",options:["Rebound Hammer","Chain Drag/Sounding Test or GPR","UPV through transmission","Core extraction"],ans:1,hint:"Chain drag: hollow sound indicates delamination. GPR shows delamination as reflectors. Both are quick field methods."},
    {q:"(GATE 2015) Creep strain in concrete is:",options:["Always less than elastic strain","Equal to elastic strain at all times","Can be 2-3 times the initial elastic strain under sustained load","Never exceeds 1% of total strain"],ans:2,hint:"Creep can be 2-3× the initial elastic strain for weak, young concrete loaded for many years."},
  ],
  adm:[
    {q:"(GATE 2008) Primary purpose of adding a superplasticizer:",options:["Accelerate setting time","Entrain air bubbles for freeze-thaw resistance","Achieve high workability or reduce water demand 20-30%","Retard initial setting"],ans:2,hint:"Superplasticizers (HRWRs) disperse cement particles, freeing up water to lubricate the mix."},
    {q:"(GATE 2015) IS 9103 Type A classification refers to:",options:["Type B — Retarder","Type C — Accelerator","Type A — Water Reducer (Plasticizer)","Type E — WR + Accelerator"],ans:2,hint:"IS 9103: Type A = Water Reducer (plasticizer). B = Retarder. C = Accelerator. D = WR+Retarder. E = WR+Accelerator."},
    {q:"(GATE 2012) Most effective accelerator PROHIBITED in reinforced concrete:",options:["Triethanolamine","Sodium Silicate","Calcium Chloride (CaCl₂)","Tartaric Acid"],ans:2,hint:"CaCl₂ is very effective but Cl⁻ ions cause catastrophic corrosion. IS 456 prohibits it in RCC."},
    {q:"(GATE 2018) A retarder (Type B) works by:",options:["Increasing water content","Forming thin coating on cement grains temporarily blocking hydration","Reducing w/c ratio","Entraining air bubbles"],ans:1,hint:"Retarders adsorb onto cement particle surfaces, blocking water from accessing reactive compounds."},
    {q:"(GATE 2010) Air-entraining agents improve freeze-thaw resistance because:",options:["They increase paste strength","Tiny uniformly spaced air voids act as pressure-relief chambers for freezing water","They reduce w/c","They prevent carbonation"],ans:1,hint:"Water expands ~9% when freezing. Entrained micro air bubbles (50-200 microns) provide 'escape valves' for expanding ice."},
    {q:"(GATE 2007) Mineral admixture MOST effectively reducing permeability due to extreme fineness:",options:["Fly Ash (Class F)","GGBS","Rice Husk Ash","Silica Fume (Micro-silica)"],ans:3,hint:"Silica fume particles are 100× smaller than Portland cement. Physical pore filling + highly reactive pozzolan."},
    {q:"(GATE 2013) Modern PCE superplasticizers work by:",options:["Electrostatic repulsion only","Steric hindrance — long polymer chains physically push cement particles apart","Reducing specific gravity of water","Reacting with C₃A to slow hydration"],ans:1,hint:"PCE molecules attach to cement particles and long comb-like polymer chains act as physical 'bumpers'."},
    {q:"(GATE 2004) Silica fume is a by-product of:",options:["Fly ash from coal plants","Steel blast furnace operations","Silicon or ferrosilicon alloy manufacturing","Lime calcination"],ans:2,hint:"Silica fume = ultrafine amorphous SiO₂ vapour condensate from electric arc furnaces producing silicon metal."},
    {q:"(GATE 2019) Pozzolanic reaction of fly ash:",options:["Fly Ash + CaSO₄ → Ettringite","Fly Ash (SiO₂+Al₂O₃) + Ca(OH)₂ + H₂O → C-S-H + C-A-H gel","Fly Ash + C₃A → Flash set","Fly Ash + H₂O → Ca(OH)₂"],ans:1,hint:"Fly ash waits for cement's Ca(OH)₂ then reacts to form additional C-S-H/C-A-H gel."},
    {q:"(GATE 2016) GGBS is classified as:",options:["Chemical admixture Type E","Latent hydraulic binder (inherent but slow cementitious activity)","Air-entraining agent","Pure pozzolan with no cementitious activity"],ans:1,hint:"Unlike purely pozzolanic fly ash, GGBS has latent hydraulic properties."},
    {q:"(GATE 2009) Typical dosage of standard plasticizer (Type A) % of cement weight:",options:["0.01% to 0.05%","0.1% to 0.5%","1% to 3%","5% to 10%"],ans:1,hint:"Plasticizers effective at low doses — 0.1-0.5% by weight of cement."},
    {q:"(GATE 2014) Concrete for marine structure in tidal zone should contain:",options:["High C₃A cement with high w/c","SCMs like GGBS/silica fume + low w/c + adequate cover","OPC only with max w/c 0.55","High Alumina Cement"],ans:1,hint:"Marine durability: dense microstructure (low w/c + SCMs) + reduced C₃A + adequate cover."},
    {q:"(GATE 2021) For stripping forms in 8 hours instead of 24 hours in precast yard:",options:["Retarder (Type B)","Air Entraining Agent","Accelerator (Type C) e.g., calcium nitrite","Superplasticizer (Type F)"],ans:2,hint:"Accelerator speeds hydration, achieving demolding strength much faster. Calcium nitrite preferred (no steel corrosion)."},
    {q:"(GATE 2006) Vinsol resin is used as:",options:["Superplasticizer","Accelerator for cold weather","Air-entraining agent","Retarder for hot weather"],ans:2,hint:"Vinsol resin is a classic AEA — refined wood rosin acting as surfactant, stabilizing micro air bubbles."},
    {q:"(GATE 2020) 28-day strength with 30% fly ash replacement will typically be:",options:["Higher than plain OPC","Equal to plain OPC","Lower than plain OPC but exceeding OPC at 56-90 days","Unpredictably variable"],ans:2,hint:"Fly ash is slow pozzolan — lower at 28 days, but extra C-S-H from pozzolanic reaction makes it stronger at 90+ days."},
    {q:"(GATE 2002) Overdosing of retarder (sugar) can result in:",options:["Flash set","Complete prevention of setting — concrete may never gain strength","Excessive air entrainment","Rapid strength gain"],ans:1,hint:"At very high doses, retarders can stop hydration entirely. Concrete remains permanently liquid — catastrophic."},
    {q:"Common retarder chemicals:",options:["CaCl₂, Calcium nitrite, Triethanolamine","Sucrose, Tartaric acid, Lignosulfonates","Naphthalene formaldehyde, PCE, Melamine formaldehyde","Vinsol resin, Tall oil, Synthetic detergents"],ans:1,hint:"Retarders include natural sugars and organic acids: sucrose, glucose, tartaric acid, gluconic acid, lignosulfonates."},
    {q:"(GATE 2011) As air content increases from 3% to 6%, compressive strength:",options:["Increases by 15%","Decreases by about 3-5% per 1% air entrained","Remains constant","Decreases only after 7%"],ans:1,hint:"Each 1% entrained air reduces strength by 3-5%. Sweet spot: 3-6% for freeze-thaw benefit."},
    {q:"(GATE 2022) Admixture for hydraulic structure to reduce permeability:",options:["Retarder","Accelerator","Integral waterproofing admixture (calcium stearate)","Air-entraining agent"],ans:2,hint:"Integral waterproofing: blocks capillary pores physically or chemically."},
    {q:"(GATE 2003) Type NOT in IS 9103 classification:",options:["Type A: Water Reducer","Type B: Retarder","Type G: HRWR + Retarder","Type H: Viscosity Modifying Agent"],ans:3,hint:"IS 9103 covers Types A-G. VMAs (Type H) are covered under a different specification."},
    {q:"(GATE 2017) Rice Husk Ash (RHA) is a SCM because:",options:["Produced by burning at 600-700°C producing highly reactive amorphous silica","By-product of steel manufacturing","Higher specific gravity than cement","Produces calcium silicate when mixed with water"],ans:0,hint:"Controlled burning of rice husks produces amorphous SiO₂ — highly reactive pozzolan."},
    {q:"(GATE 2023) Corrosion inhibitor admixtures (calcium nitrite) work by:",options:["Reducing chloride penetration physically","Chemically reinforcing passive oxide film on rebar against chloride attack","Increasing concrete cover chemically","Preventing carbonation"],ans:1,hint:"Calcium nitrite competes with Cl⁻ at steel surface. Nitrite ions react with iron to form stronger passive film."},
    {q:"(GATE 2008) Maximum dosage of admixtures % of cement weight per IS 9103:",options:["0.5%","2%","5%","10%"],ans:2,hint:"IS 9103 limits admixture dosage to maximum 5% by weight of cement."},
    {q:"(GATE 2014) Fly Ash Class F vs Class C: Class F has:",options:["Higher calcium content, self-cementitious","Low calcium (<10% CaO) — purely pozzolanic","Faster reaction than Class C","Produced from steel manufacturing"],ans:1,hint:"Class F (low-calcium) = purely pozzolanic, needs Ca(OH)₂. Class C (high-calcium) = self-cementing."},
    {q:"(GATE 2019) Main benefit of GGBS (up to 50% replacement) in thick foundation raft:",options:["Higher early strength","Significantly reduced heat of hydration, minimizing thermal cracking risk","Improved short-term workability","Acceleration of setting time"],ans:1,hint:"GGBS reacts slowly, releasing heat over a longer period — prevents dangerous temperature gradient in mass concrete."},
    {q:"(GATE 2001) Superplasticizers preferred over regular plasticizers because:",options:["They are cheaper","Much larger water reduction (20-30%) — flowing concrete without increasing w/c","Easier to manufacture","Improve freeze-thaw resistance"],ans:1,hint:"Regular plasticizer: 5-10% water reduction. Superplasticizer: 20-30%. Huge difference in performance."},
    {q:"(GATE 2010) Primary purpose of Viscosity Modifying Agent (VMA) in SCC:",options:["Increase water content","Prevent segregation and bleeding by increasing paste viscosity and cohesion","Accelerate hydration","Increase strength"],ans:1,hint:"SCC must flow yet resist segregation. VMAs thicken paste without reducing flow."},
    {q:"(GATE 2016) Admixture improving both workability AND durability without increasing w/c:",options:["Calcium Chloride accelerator","Superplasticizer (HRWR)","Air Entraining Agent","Sugar (retarder)"],ans:1,hint:"SP can reduce water 20-30%. At same water: higher workability. At reduced water: higher durability."},
    {q:"Primary purpose of shrinkage-reducing admixtures (SRAs):",options:["Prevent plastic shrinkage only","Reduce drying shrinkage by reducing surface tension of pore water — lower capillary stress","Accelerate strength gain","Improve freeze-thaw resistance"],ans:1,hint:"SRAs (glycol-based) reduce pore water surface tension. Lower tension = lower capillary pull = less shrinkage."},
    {q:"(GATE 2006) Corrosion inhibiting admixtures particularly important in:",options:["Mass concrete dams","RCC in marine/chloride environments","Plain CC footings","Self-compacting concrete"],ans:1,hint:"Where chlorides can reach rebar, corrosion inhibitors provide chemical protection to the passive layer."},
    {q:"(GATE 2020) Lignosulfonates (plasticizers and retarders) work by:",options:["Physical blockage of pores","Electrostatic repulsion — adsorb onto cement particles giving them negative charge","Chemical reaction with C₃A","Increasing pH of pore solution"],ans:1,hint:"Lignosulfonates: adsorb onto cement grains, create net negative charge — like-charged particles repel and disperse."},
    {q:"(GATE 2007) Admixture that is both water reducer AND retarder:",options:["Type A","Type B","Type C","Type D"],ans:3,hint:"IS 9103 Type D = Water-Reducing and Retarding Admixture."},
    {q:"(GATE 2012) 'Compatibility issues' with admixtures refer to:",options:["Cost incompatibility","Unexpected performance (setting anomalies) when admixture used with specific cement brand","Physical impossibility of mixing","Colour changes in concrete"],ans:1,hint:"Different cements have different gypsum types and C₃A levels. An SP that works with one cement may cause flash set with another."},
    {q:"(GATE 2018) Optimum cement replacement level with fly ash for typical RCC:",options:["5-10%","15-35%","40-60%","70-80%"],ans:1,hint:"Typical fly ash replacement: 15-35% by weight of cement."},
    {q:"(GATE 2022) Calcium nitrite preferred over CaCl₂ in RCC because:",options:["Calcium nitrite is cheaper","Provides acceleration WITHOUT introducing corrosion-causing chloride ions","Improves workability","Reduces heat of hydration"],ans:1,hint:"Calcium nitrite provides acceleration without Cl⁻. Additionally acts as a corrosion inhibitor — dual benefit."},
    {q:"(GATE 2019) Fly Ash spherical particles improve SCC by:",options:["Increasing void content","Reducing water demand, improving flow, reducing heat","Increasing early strength","Reducing setting time"],ans:1,hint:"Spherical fly ash particles reduce inter-particle friction (ball-bearing effect), reduce water demand, lower heat."},
    {q:"(GATE 2005) GGBS is obtained from:",options:["Coal-fired power plant electrostatic precipitators","By rapidly quenching molten slag from iron blast furnaces with water","Burning rice husks","Calcining natural pozzolans"],ans:1,hint:"GGBS: molten slag from iron blast furnace rapidly quenched with water. Quick quenching creates glassy, reactive structure."},
    {q:"(GATE 2015) Silica Fume improves concrete microstructure by:",options:["Increasing C₃A content","Filling spaces between cement grains AND pozzolanic reaction with Ca(OH)₂ — dual densification","Reducing cement without strength loss","Accelerating initial hydration only"],ans:1,hint:"Silica fume: (1) micro-filler effect and (2) pozzolanic reaction. Both densify the paste microstructure."},
    {q:"(GATE 2013) Typical water reduction by Superplasticizer (Type F):",options:["5-10%","10-15%","20-30%","40-50%"],ans:2,hint:"Type F (HRWR): 20-30% water reduction. Type A (regular plasticizer): 5-10%."},
    {q:"(GATE 2009) Air-Entraining Agents particularly important for concrete in:",options:["Tropical marine environments","Regions with repeated freeze-thaw cycles","Hot arid regions with sulphate soils","Moderate indoor environments"],ans:1,hint:"AEAs create tiny pressure-relief voids essential for freeze-thaw durability in cold climates."},
    {q:"(GATE 2021) Maximum chloride content in concrete for RCC (IS 456):",options:["0.15%","0.30%","0.40%","0.60%"],ans:1,hint:"IS 456 Table 7: For RCC structures, maximum acid-soluble chloride = 0.30% by weight of cement."},
  ],
  dur:[
    {q:"(GATE 2006) Most important factor influencing durability of concrete:",options:["Aggregate type","Curing temperature","Permeability (controlled by w/c, compaction, curing)","Cement grade"],ans:2,hint:"Durability = resistance to ingress. Permeability is the gateway — control it, control durability."},
    {q:"(GATE 2013) Carbonation involves CO₂ reacting with:",options:["C-S-H gel directly","Ca(OH)₂ in pore solution, producing CaCO₃","C₃A in the paste","Silica in aggregate"],ans:1,hint:"CO₂ + Ca(OH)₂ → CaCO₃ + H₂O. Drops pH from 13 to 8-9, destroying steel's protection."},
    {q:"(GATE 2010) Test to determine depth of carbonation uses:",options:["Litmus paper","Phenolphthalein (pink = alkaline, colourless = carbonated)","Silver nitrate solution","pH meter only"],ans:1,hint:"Spray phenolphthalein: uncarbonated (pH>9) = bright pink. Carbonated (pH<9) = colourless."},
    {q:"(GATE 2015) Correct sequence for reinforcement corrosion:",options:["Cathodic protection then anodic dissolution","Depassivation (Cl⁻ or carbonation) then active electrochemical corrosion","Flash set then ASR","Ettringite formation then C-S-H dissolution"],ans:1,hint:"First passive oxide film destroyed (by Cl⁻ or pH drop). THEN electrochemical corrosion cell forms."},
    {q:"(GATE 2011) ASR requires simultaneous presence of:",options:["Sulphates, moisture, and low C₃A","Reactive silica aggregate + high alkali cement + moisture","Chlorides, high temperature, carbonation","High w/c + freeze-thaw cycles"],ans:1,hint:"ASR needs all three: reactive aggregate (amorphous silica) + alkaline environment + moisture."},
    {q:"(GATE 2007) Minimum nominal cover for RCC in 'Extreme' exposure (IS 456):",options:["45 mm","50 mm","65 mm","75 mm"],ans:3,hint:"IS 456 Table 16: Extreme exposure requires maximum cover of 75mm."},
    {q:"(GATE 2019) Sulphate attack results in formation of:",options:["C-S-H gel","Ca(OH)₂","Ettringite and gypsum — volumetric expansion","ASR gel"],ans:2,hint:"External sulphates + C₃A products (+ Ca(OH)₂) → late-stage ettringite = expansive and destructive."},
    {q:"(GATE 2016) Tidal zone more aggressive than fully submerged zone because:",options:["Tidal zone has more sulphates","Both oxygen (wet-dry cycling) AND moisture; submerged zone has no oxygen","Tidal zone has higher temperatures","Fully submerged concrete is stronger"],ans:1,hint:"Corrosion needs both oxygen (cathode reactant) and moisture (electrolyte). Tidal zone has both — most aggressive."},
    {q:"(GATE 2004) Cathodic Protection works by:",options:["Applying waterproof coating","Supplying external current forcing steel to act as cathode (suppressing anodic corrosion)","Adding corrosion inhibiting admixtures","Increasing concrete cover"],ans:1,hint:"Forcing current INTO the steel from external source. Steel acts as cathode — anodic corrosion reaction thermodynamically unfavourable."},
    {q:"(GATE 2014) Aggregate MOST susceptible to ASR:",options:["Well-crystallized granite","Basalt","Opal, chert, flint, volcanic glasses (amorphous silica)","Pure limestone (calcite)"],ans:2,hint:"ASR requires REACTIVE silica — non-crystalline (amorphous) forms. Opal, flint, chert are notorious."},
    {q:"(GATE 2012) Minimum concrete grade for RCC in 'Moderate' exposure:",options:["M15","M20","M25","M30"],ans:2,hint:"IS 456 Table 3: Mild=M20, Moderate=M25, Severe=M30, Very Severe=M35, Extreme=M40."},
    {q:"(GATE 2009) Maximum w/c for 'Severe' exposure:",options:["0.50","0.45","0.40","0.55"],ans:1,hint:"IS 456 Table 3: Severe AND Very Severe both have max w/c = 0.45. Only Extreme drops to 0.40."},
    {q:"(GATE 2003) Minimum cover for main rebar in RCC column in Moderate exposure:",options:["20 mm","30 mm","40 mm","45 mm"],ans:1,hint:"IS 456 Table 16: Moderate exposure → beams/columns/slabs = 30mm minimum nominal cover."},
    {q:"(GATE 2020) Rate of carbonation maximum at relative humidity:",options:["0-10% (bone dry)","50-70%","80-90%","100% (saturated)"],ans:1,hint:"Too dry: no water for reaction. Too wet: saturated pores block CO₂ ingress. 50-70% RH = worst case."},
    {q:"(GATE 2017) RCPT (Rapid Chloride Permeability Test) measures:",options:["Strength reduction due to chlorides","Total electrical charge (Coulombs) passed in 6 hours","Rate of carbonation due to chlorides","Setting time in saline water"],ans:1,hint:"RCPT: 60V DC across 50mm thick disc for 6 hours. >4000 C = high permeability; <100 C = negligible."},
    {q:"(GATE 2022) SRPC recommended for concrete in contact with:",options:["Seawater with high chlorides","Soils/groundwater with high sulphate concentration","Freeze-thaw cycles","Marine splash zones"],ans:1,hint:"SRPC has very low C₃A (<5%). Sulphate attack targets C₃A products — removing the target is the strategy."},
    {q:"(GATE 2005) Corrosion of rebar causes spalling because:",options:["Steel contracts and pulls concrete inward","Iron oxide (rust) is 2-6× volume of original steel — massive internal expansive pressure cracks cover","Steel heats up and expands","Chloride ions dissolve the concrete"],ans:1,hint:"Fe → Fe₂O₃ = dramatic volumetric expansion. In confined space, creates stresses exceeding concrete's tensile strength."},
    {q:"(GATE 2018) ASR can be PREVENTED by:",options:["Increasing alkali content","Using very high w/c","Low-alkali cement + fly ash/GGBS/silica fume + non-reactive aggregates","Increasing C₃A content"],ans:2,hint:"Prevention targets all three ASR requirements: non-reactive aggregate + low-alkali cement + pozzolans."},
    {q:"(GATE 2008) For 'Very Severe' exposure, maximum free w/c (IS 456):",options:["0.50","0.45","0.40","0.55"],ans:1,hint:"IS 456: Very Severe → max w/c = 0.45, min grade M35. Both Severe AND Very Severe share max w/c of 0.45."},
    {q:"(GATE 2021) 'Biogenic Sulphuric Acid Attack' occurs in:",options:["Marine structures from seawater","Sewers where bacteria convert H₂S gas into H₂SO₄, attacking concrete crown","Dam structures from river water","Industrial floors from acid spills"],ans:1,hint:"Bacteria on damp sewer walls oxidize H₂S to H₂SO₄. This acid dissolves concrete at the crown — 'crown rot.'"},
    {q:"(GATE 2001) Threshold chloride concentration destroying passive film on steel:",options:["0.01% by weight of cement","0.2-0.4% by weight of cement (acid-soluble)","1.0% by weight","5.0% by weight"],ans:1,hint:"Critical threshold: acid-soluble chloride > 0.2-0.4% by weight of cement at rebar level."},
    {q:"(GATE 2023) Half-Cell Potential Test (ASTM C876) assesses:",options:["Compressive strength","Probability of active corrosion of steel in existing concrete structure","Depth of carbonation","Chloride content"],ans:1,hint:"Half-cell potential measures electrochemical potential between reference electrode and embedded steel."},
    {q:"(GATE 2016) Concrete bridge pier showing map cracking + white gel oozing from cracks:",options:["Sulphate attack from seawater","Carbonation-induced corrosion","Alkali-Silica Reaction (ASR) — white gel is characteristic","Freeze-thaw damage"],ans:2,hint:"Map cracking + white gel = classic diagnostic signs of ASR."},
    {q:"(GATE 2003) Galvanic (sacrificial anode) protection using zinc works because:",options:["Zinc coats steel with waterproof layer","Zinc is more active than iron — corrodes preferentially, making steel cathodic","Zinc reacts with chlorides to form stable compounds","Zinc fills concrete pores"],ans:1,hint:"Zinc is higher in galvanic series than iron. 'Sacrificial anode' — corrodes first to protect the steel."},
    {q:"(GATE 2014) Freeze-thaw damage to concrete causes:",options:["Strengthening through ice crystal formation","Tensile stress and surface scaling through repeated ice expansion (~9%) and contraction","Improved density through compaction","No damage if cover is adequate"],ans:1,hint:"Water expands ~9% when freezing. Repeated freeze-thaw cycles progressively crack and scale the surface."},
    {q:"(GATE 2019) Minimum nominal cover for 'Mild' exposure (IS 456):",options:["10 mm","15 mm","20 mm","25 mm"],ans:2,hint:"IS 456 Table 16: Mild exposure → minimum nominal cover = 20mm. Also: cover ≥ bar diameter."},
    {q:"(GATE 2010) Addition of fly ash in sulphate-rich environment improves durability because:",options:["Introduces more C₃A to bind sulphates","Dilutes C₃A content AND pozzolanic reaction consumes Ca(OH)₂ (also target for sulphate attack)","Increases w/c to allow sulphates to become inert","Prevents SO₄²⁻ physically only"],ans:1,hint:"Fly ash doubly helps: dilutes C₃A + consumes Ca(OH)₂ that would otherwise react with sulphates."},
    {q:"(GATE 2023) 'Plastic shrinkage cracking' occurs:",options:["After 28 days of curing","When concrete fully hardened under prolonged drying","While concrete is still fresh — surface evaporation rate exceeds bleeding water supply","Due to carbonation"],ans:2,hint:"Plastic shrinkage cracks appear before concrete sets — within first few hours on hot, windy, or low-humidity days."},
    {q:"(GATE 2007) Freeze-thaw in presence of de-icing salts causes:",options:["Sulphate attack","Freeze-thaw damage compounded by salt scaling — NaCl increases osmotic pressure differential","Alkali-silica reaction","Carbonation-induced spalling"],ans:1,hint:"De-icing NaCl creates osmotic pressure differences in pore system when refreezing — significantly worsens damage."},
    {q:"(GATE 2001) Phenolphthalein test: pink colouration disappears where pH is below:",options:["12","10","9","7"],ans:2,hint:"Phenolphthalein is pink/violet above pH ~9.2, colourless below. Carbonation drops pH to ~8."},
    {q:"(GATE 2020) 'Impressed Current Cathodic Protection (ICCP)' uses:",options:["Zinc sacrificial anode","External power source (rectifier) applying controlled current — making all steel cathodic permanently","Coated rebar system","Fusion Bonded Epoxy coating"],ans:1,hint:"ICCP uses rectifier to apply controlled current. All steel in structure becomes cathodic — corrosion permanently stopped."},
    {q:"(GATE 2017) Higher cement content at same w/c can REDUCE durability because:",options:["Higher cement = higher permeability","More Ca(OH)₂ (leachable) + more heat (thermal cracking) + more shrinkage (cracking)","Higher cement reduces strength","This is incorrect — higher cement always improves durability"],ans:1,hint:"Excess cement = more Ca(OH)₂ targets + more heat of hydration + more shrinkage."},
    {q:"(GATE 2022) Maximum chloride content for PRESTRESSED concrete per IS 456:",options:["0.10%","0.20%","0.30%","0.06%"],ans:3,hint:"Prestressed steel: very high tensile stress + small cross-section. Even tiny corrosion = catastrophic failure. IS 456 limit: 0.06%."},
    {q:"(GATE 2005) 'Extreme' exposure class per IS 456:",options:["Protected indoor surface","Concrete in heavy rainfall","Tidal zones, abrasive/chemical action, de-icing salts — Min grade M40","Sulphate-rich soil contact"],ans:2,hint:"IS 456 Extreme: most aggressive conditions. Tidal zones + chemical attack + de-icing. Min grade M40."},
    {q:"(GATE 2015) Depth of carbonation after t years is proportional to:",options:["t","t²","√t (square root of time)","1/t"],ans:2,hint:"Carbonation moves by diffusion — depth ∝ √t. Double the time → depth increases by √2 ≈ 1.41×."},
  ],
};

// ─── TOPICS ───────────────────────────────────────────────────────────────────
const TOPICS = [
  {id:"wcr",name:"Water Cement Ratio",icon:"💧",color:"#6366F1",desc:"IS 456 limits, Abrams' Law, gel-space ratio"},
  {id:"wrk",name:"Workability",icon:"🔄",color:"#8B5CF6",desc:"Slump, CF, Vee-Bee tests, factors affecting"},
  {id:"hyd",name:"Hydration",icon:"🔥",color:"#F59E0B",desc:"Bogue compounds, heat order, flash/false set"},
  {id:"str",name:"Compressive Strength",icon:"💪",color:"#10B981",desc:"IS 456 formulas, NDT, creep, shrinkage"},
  {id:"adm",name:"Admixtures",icon:"⚗️",color:"#EC4899",desc:"IS 9103 types, SCMs, pozzolans"},
  {id:"dur",name:"Durability",icon:"🛡️",color:"#06B6D4",desc:"Carbonation, ASR, sulphate attack, IS 456 exposure"},
];

// ─── REVISION NOTES ───────────────────────────────────────────────────────────
const NOTES = {
  wcr:`WATER-CEMENT RATIO
CORE: w/c dictates paste porosity. Empty space carries zero load.

KEY FORMULAS
  Abram's Law:      S = A / B^x  (x = w/c ratio)
  Gel-Space Ratio:  S = 260x³  [MPa]
  Target Strength:  fcm = fck + 1.65s

WATER REQUIREMENTS
  Bound Water: 23% of cement weight (chemically incorporated into C-S-H)
  Gel Water:   15% of cement weight (held by surface tension in gel pores)
  MINIMUM w/c = 0.38 for complete hydration
  Capillary Water: water > 0.38 → pores → ↓ strength & durability

IS 456:2000 LIMITS (MEMORISE THIS TABLE)
  Mild:        w/c ≤ 0.55  |  Min M20  |  Cover 20mm
  Moderate:    w/c ≤ 0.50  |  Min M25  |  Cover 30mm
  Severe:      w/c ≤ 0.45  |  Min M30  |  Cover 45mm
  Very Severe: w/c ≤ 0.45  |  Min M35  |  Cover 50mm
  Extreme:     w/c ≤ 0.40  |  Min M40  |  Cover 75mm

HIGH w/c EFFECTS: ↓ strength, ↑ permeability, ↑ bleeding, ↑ shrinkage`,
  wrk:`WORKABILITY OF CONCRETE
CORE: Ease of mixing, placing, compacting and finishing without loss of homogeneity.

FRESH CONCRETE DEFECTS
  Segregation: Coarse aggregate sinks (high w/c, over-vibration, drop from height)
  Bleeding:    Water rises → laitance (weak milky surface layer)
  Harshness:   Insufficient fine aggregate to lubricate mix

TEST RANGES
               Very Low  Low      Medium   High     Very High
  Slump (mm):  0-25      25-50    50-100   100-175  >175 (SCC)
  Comp.Factor: 0.78      0.85     0.92     0.95     >0.95
  Vee-Bee (s): >20       10-20    5-10     <5       —

SLUMP CONE (IS 1199): Top 100mm | Bottom 200mm | Height 300mm | 3 layers | 25 strokes/layer
WHEN TO USE: Slump=medium/high | Vee-Bee=very stiff | CF=wide range | Flow=SCC`,
  hyd:`HYDRATION OF CEMENT
CORE: Exothermic chemical reaction forming C-S-H gel — the strength "glue."

BOGUE'S COMPOUNDS (ALL FOUR MUST BE MEMORISED)
  C₃S (50-65%): EARLY strength | High heat | Main compound
  C₂S (15-30%): LONG-TERM strength | Low heat | Slow reaction
  C₃A  (5-12%): MAXIMUM heat | Flash set risk | No strength | Sulphate target
  C₄AF (5-15%): GREY colour | Least strength | Kiln flux

HEAT ORDER (LOW → HIGH):  C₂S < C₄AF < C₃S < C₃A

HYDRATION PRODUCTS
  C₃S + H₂O → C-S-H Gel (70%, PRIMARY strength) + Ca(OH)₂
  Ca(OH)₂: pH=13, protects steel rebar | weak link for chemical attacks

GYPSUM: Coats C₃A → forms Ettringite barrier → controls Flash Set

FLASH vs FALSE SET
  Flash Set: C₃A + H₂O (no gypsum) = IRREVERSIBLE | massive heat | ruined mix
  False Set: Gypsum dehydration to plaster = REVERSIBLE by remixing | no heat`,
  str:`COMPRESSIVE STRENGTH
CORE: Fundamental design property. All IS 456 structural capacity based on fck.

KEY IS 456 FORMULAS (GATE ESSENTIALS)
  Modulus of Elasticity:     Ec = 5000√fck  [MPa]
  Modulus of Rupture:        fcr = 0.7√fck  [MPa]
  Design Compressive Stress: 0.45 fck
  Target Mean Strength:      fcm = fck + 1.65s

TESTING (IS 516)
  Specimen:     150×150×150mm cube (for aggregate < 38mm)
  Loading Rate: 140 kg/cm²/min = 14 MPa/min
  Curing:       27±2°C in water until testing
  Cube vs Cylinder: Cylinder ≈ 0.80 × Cube strength

STRENGTH DEVELOPMENT
  3 days ≈ 40%  |  7 days ≈ 65-75%  |  28 days = 100%  |  1 year ≈ 125%

NDT: Rebound Hammer = surface hardness | UPV = internal quality | GPR = non-contact`,
  adm:`ADMIXTURES IN CONCRETE
CORE: Modify fresh/hardened properties. Max dosage: 5% by cement weight (IS 9103).

IS 9103 TYPES
  A: Plasticizer (5-10% water reduction)
  B: Retarder — delays set (hot weather)
  C: Accelerator — speeds set (cold weather)
  D: Plasticizer + Retarder
  E: Plasticizer + Accelerator
  F: Superplasticizer (20-30% reduction) — SNF, SMF, PCE
  G: Superplasticizer + Retarder

KEY FACTS
  CaCl₂ = PROHIBITED in RCC (corrodes steel!) → Use Calcium Nitrite instead
  Retarders: Sugar, tartaric acid, lignosulfonates
  AEA: Vinsol resin | 3-6% air | −3-5% strength per 1% air | freeze-thaw

POZZOLANS
  Fly Ash (F): Spherical | slow pozzolan | ↑ workability | ↓ early | ↑ long-term
  Silica Fume: 100× finer than cement | ↑↑ strength & impermeability
  GGBS:        Latent hydraulic | lowest heat | ideal for mass concrete`,
  dur:`DURABILITY OF CONCRETE
CORE: Permeability is the enemy. Low w/c + good compaction + curing = durable concrete.

1. CARBONATION
   CO₂ + Ca(OH)₂ → CaCO₃ | pH: 13→8-9 | Depassivates steel
   Rate ∝ √t | Max rate at 50-70% RH
   Test: Phenolphthalein (pink=safe, colourless=carbonated)

2. CHLORIDE ATTACK
   Cl⁻ destroys passive film → pitting corrosion
   Threshold: 0.2-0.4% acid-soluble Cl⁻ by wt. of cement
   Prestressed limit: 0.06% (VERY strict)

3. ALKALI-SILICA REACTION (ASR)
   Alkali + Reactive silica + Moisture → Swelling gel → MAP CRACKING
   Prevention: Low-alkali cement | Fly ash/GGBS | Non-reactive aggregate

4. SULPHATE ATTACK
   External SO₄²⁻ + C₃A products → Ettringite → Expansion
   Prevention: SRPC (C₃A < 5%) + Low w/c

5. FREEZE-THAW: Ice expansion (9%) → Internal pressure
   Prevention: Air Entrainment (3-6%)

IS 456 COVER: Mild=20mm | Moderate=30mm | Severe=45mm | VV=50mm | Extreme=75mm`,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getDecay(score,total){
  const p=(score/total)*100;
  if(p<50) return{level:"high",label:"High Decay",color:"#EF4444",emoji:"🔴",action:"Deep Revision Required"};
  if(p<75) return{level:"moderate",label:"Moderate Decay",color:"#F59E0B",emoji:"🟡",action:"Quick Revision Recommended"};
  return{level:"low",label:"Strong Retention",color:"#10B981",emoji:"🟢",action:"Concept Retained"};
}
function sampleQ(id,n){const a=[...(QB[id]||[])].sort(()=>Math.random()-0.5);return a.slice(0,Math.min(n,a.length));}
function getTopicById(id){return TOPICS.find(t=>t.id===id);}

// ─── MINI CALENDAR COMPONENT ─────────────────────────────────────────────────
function MiniCalendar({dark,th,C,year,month,gateYear}){
  const d=new Date();const isCurrentMonth=year===d.getFullYear()&&month===d.getMonth();
  const todayDate=isCurrentMonth?d.getDate():null;
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const isGateMonth=gateYear&&year===gateYear&&month===1; // Feb of gateYear
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const cells=[];
  for(let i=0;i<firstDay;i++)cells.push(null);
  for(let i=1;i<=daysInMonth;i++)cells.push(i);
  return(
    <div>
      <div style={{fontWeight:700,fontSize:12,textAlign:"center",marginBottom:8,color:th.text}}>{months[month]} {year}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
        {["S","M","T","W","T","F","S"].map((d,i)=>(<div key={i} style={{textAlign:"center",fontSize:9,color:th.textDim,padding:"2px 0"}}>{d}</div>))}
        {cells.map((d,i)=>{
          const isToday=d===todayDate;
          const isGate=isGateMonth&&d===5;
          return(<div key={i} style={{textAlign:"center",fontSize:10,padding:"3px 1px",borderRadius:4,background:isGate?"#EF4444":isToday?C.primary:"transparent",color:isGate||isToday?"#fff":d?th.text:"transparent",fontWeight:isGate||isToday?700:400}}>{d||""}</div>);
        })}
      </div>
      {isGateMonth&&<div style={{fontSize:9,color:"#EF4444",textAlign:"center",marginTop:4,fontWeight:600}}>● Feb 1 = GATE {gateYear}</div>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App({ initialScreen = "auth" }) {
  const [dark,setDark]         = useState(true);
  const [user,setUser]         = useState(null);
  const [authMode,setAuthMode] = useState("login");
  const [form,setForm]         = useState({name:"",email:"",password:""});
  const [authErr,setAuthErr]   = useState("");
  const [screen,setScreen]     = useState(initialScreen);
  const [activeTab,setActiveTab]= useState(initialScreen === "landing" ? "landing" : "practice");
  const [academySubView,setAcademySubView] = useState("catalogue"); // 'catalogue' | 'overview' | 'lesson' | 'assessment' | 'final-exam'
  const [selectedCourseId,setSelectedCourseId] = useState("water-sanitation-env-eng");
  const selectedCourse = getCourseById(selectedCourseId) || waterSupplyAndSanitaryCourse;
  const [activeModuleId,setActiveModuleId] = useState("mod-2");
  const [activeLessonId,setActiveLessonId] = useState("les-2-1");
  const [topic,setTopic]       = useState(null);
  const [qCount,setQCount]     = useState(10);
  const [qs,setQs]             = useState([]);
  const [curQ,setCurQ]         = useState(0);
  const [sel,setSel]           = useState(null);
  const [answers,setAnswers]   = useState([]);
  const [hint,setHint]         = useState(false);
  const [score,setScore]       = useState(null);
  const [history,setHistory]   = useState({});
  const [agentStep,setAgentStep]= useState(0);
  const [noteTab,setNoteTab]   = useState("notes");
  const [coach,setCoach]       = useState("");
  const [coachLoading,setCoachLoading] = useState(false);
  const [hov,setHov]           = useState(null);
  const [graphTopic,setGraphTopic] = useState(null);
  // Planner state
  const [revPlan,setRevPlan]   = useState(null);
  const [planLoading,setPlanLoading] = useState(false);
  const [planErr,setPlanErr]   = useState("");
  const [planStale,setPlanStale] = useState(false); // true = new test taken, plan needs refresh
  const [calYear,setCalYear]   = useState(new Date().getFullYear());
  const [calMonth,setCalMonth] = useState(new Date().getMonth());
  // User-chosen GATE exam year — null until picked on signup/login
  const [gateYear,setGateYear] = useState(null);
  const [showYearPicker,setShowYearPicker] = useState(false);

  // ── ACTIVE CHATBOT CONTEXT ────────────────────────────────────────────────
  const activeLessonObj = (waterSupplyAndSanitaryCourse?.modules || [])
    .flatMap((m) => m.lessons || [])
    .find((l) => l.id === activeLessonId);

  const activeChatContext = {
    gateYear,
    topicName: topic?.name || null,
    currentQuestion: (screen === "test" && qs && qs[curQ]) ? { q: qs[curQ].q, options: qs[curQ].options, hint: qs[curQ].hint } : null,
    recentScore: (screen === "result" && score !== null && topic) ? { score, total: qs.length, pct: Math.round((score/qs.length)*100), topic: topic.name } : null,
    activeNotes: (screen === "notes" && topic) ? NOTES[topic.id] : null,
    activeTab,
    courseTitle: selectedCourse?.title || waterSupplyAndSanitaryCourse?.title || "Water Supply, Sanitation and Environmental Engineering",
    currentModule: activeModuleId,
    currentLessonId: activeLessonId,
    lessonTitle: activeLessonObj?.title || null,
    learningObjectives: activeLessonObj?.learningObjectives || null,
    approvedContent: activeLessonObj?.content || null,
    rubric: activeLessonObj?.understandingCheck?.rubric || null,
    preferredLanguage: user?.preferredLanguage || "en",
    explanationStyle: user?.explanationStyle || "simple",
  };

  const th = T[dark?"dark":"light"];

  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.body.className = `${theme}-theme`;
  }, [dark]);

  useEffect(() => {
    loadFonts();
    const existing = getCurrentUser();
    if (existing) {
      setUser(existing);
      setGateYear(existing.gateYear || 2027);
      if (initialScreen === "auth" || initialScreen === "landing") {
        setActiveTab("academy");
        setScreen("academy");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=>{
    if(screen==="result"){setAgentStep(0);const ts=[0,1,2,3].map((i)=>setTimeout(()=>setAgentStep(i+1),i*700+500));return()=>ts.forEach(clearTimeout);}
  },[screen]);
  useEffect(()=>{
    if(screen==="result"&&score!==null&&topic){
      setCoachLoading(true);
      setCoach("");
      // Small timeout so result screen renders first, then coach appears instantly
      setTimeout(()=>fetchCoach(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[screen,score]);

  // ── STYLES ────────────────────────────────────────────────────────────────
  const appStyle={fontFamily:"'DM Sans',system-ui,sans-serif",background:th.bg,color:th.text,minHeight:"100vh",transition:"background 0.3s,color 0.3s"};
  const cardStyle=(extra={})=>({background:th.card,border:`1px solid ${th.border}`,borderRadius:16,padding:"20px 24px",transition:"all 0.2s",...extra});
  const inputStyle={width:"100%",boxSizing:"border-box",background:th.inputBg,color:th.text,border:`1px solid ${th.border}`,borderRadius:10,padding:"12px 16px",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",transition:"border 0.2s"};
  const btnPri=(extra={})=>({background:`linear-gradient(135deg,${C.primary},${C.purple})`,color:"#fff",border:"none",borderRadius:10,padding:"13px 24px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,cursor:"pointer",letterSpacing:"0.3px",transition:"all 0.2s",boxShadow:`0 4px 20px ${C.primary}30`,...extra});
  const btnGhost=(extra={})=>({background:"transparent",color:th.textMid,border:`1px solid ${th.border}`,borderRadius:10,padding:"11px 20px",fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:13,cursor:"pointer",...extra});
  const heading=(size=28)=>({fontFamily:"'Outfit',sans-serif",fontSize:size,fontWeight:800,color:th.text,margin:0,lineHeight:1.2});

  // ── NAV ───────────────────────────────────────────────────────────────────
  const Nav=({back,sub})=>(
    <>
      <Navbar
        dark={dark}
        setDark={setDark}
        activeTab={activeTab === "practice" ? "practice" : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setScreen(tab);
          if (tab === "academy") setAcademySubView("catalogue");
        }}
        user={user}
        setUser={setUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthErr("");
          setScreen("auth");
        }}
        gateYear={gateYear}
      />
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 24px",borderBottom:`1px solid ${th.border}`,background:th.navBg,backdropFilter:"blur(12px)",position:"sticky",top:68,zIndex:90}}>
        {back&&<button onClick={back} style={btnGhost({padding:"6px 14px",fontSize:12})}>← Back</button>}
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
          <Logo size={26}/>
          <div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,letterSpacing:"-0.3px"}}>
              <span style={{color:th.text}}>GATE Practice Track: Concrete Technology</span>
            </div>
          </div>
          {sub&&<span style={{color:th.textDim,fontSize:12,marginLeft:8}}>/ {sub}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {user&&<div style={{fontSize:13,color:th.textMid}}>Hi, <span style={{color:C.primary,fontWeight:600}}>{user.name}</span></div>}
          {screen!=="auth"&&<button onClick={()=>{setActiveTab("practice");setScreen("planner");}} style={{...btnGhost({padding:"6px 14px",fontSize:12}),color:C.warn,borderColor:`${C.warn}40`}}>📅 Study Plan</button>}
          <div style={{background:`${C.primary}20`,color:C.primary,fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:20}}>GATE {gateYear||"—"}</div>
        </div>
      </div>
    </>
  );

  // ── COACH — instant local, no API call ───────────────────────────────────
  function fetchCoach(){
    // eslint-disable-next-line no-unused-vars
    const decay=getDecay(score,qs.length);
    const pct=Math.round((score/qs.length)*100);
    const tips={
      wcr:{high:"Revise IS 456 Table 5 — memorise max w/c limits for all 5 exposure classes (0.55 to 0.40). Focus on Abrams' Law formula S = A/B^x and the minimum w/c of 0.38 for complete hydration.",moderate:"You know the basics — now nail the numbers. IS 456 Extreme exposure requires w/c ≤ 0.40 and min grade M40. Practise the gel-space ratio calculation S = 260x³.",low:"Strong grasp of w/c concepts. Challenge yourself with numerical problems on target mean strength: fcm = fck + 1.65s."},
      wrk:{high:"Memorise the slump cone dimensions: Top 100mm, Bottom 200mm, Height 300mm. Learn all 5 workability levels and their Compaction Factor values (0.78 to >0.95).",moderate:"Focus on which test suits which workability: Vee-Bee for very stiff, Slump for medium, Flow for SCC. Also revise why Shear Slump indicates poor cohesion.",low:"Excellent workability knowledge. Revise SCC-specific tests — Slump Flow T500, L-Box passing ability, and V-Funnel flow time."},
      hyd:{high:"Memorise Bogue compound heat order: C₂S < C₄AF < C₃S < C₃A. C₃S gives early strength, C₂S gives long-term. Gypsum prevents flash set by coating C₃A grains with ettringite.",moderate:"The critical GATE trap: Flash Set (irreversible, high heat) vs False Set (reversible, no heat). Also revise that C-S-H gel = 70% of paste and gives primary strength.",low:"Strong hydration knowledge. Revise pozzolanic reaction: SiO₂ + Ca(OH)₂ + H₂O → C-S-H gel. Know why GGBS suits mass concrete."},
      str:{high:"Memorise these IS 456 formulas: Ec = 5000√fck and fcr = 0.7√fck. Standard cube is 150×150×150mm, loaded at 14 MPa/min. Cylinder strength ≈ 0.8 × cube strength.",moderate:"Target mean strength formula: fcm = fck + 1.65s. Also revise UPV quality benchmarks: >4.5 km/s = Excellent, <3 km/s = Poor. Know split tensile formula: fct = 2P/(πDL).",low:"Excellent strength knowledge. Practise design stress calculations: design compressive stress = 0.45 fck per IS 456 Limit State."},
      adm:{high:"Memorise IS 9103 types: A=Plasticizer, B=Retarder, C=Accelerator, F=Superplasticizer (20-30% water reduction). CaCl₂ is PROHIBITED in RCC — use calcium nitrite instead.",moderate:"Key GATE fact: Silica Fume is 100× finer than cement — dual effect (filler + pozzolanic). Fly Ash is slower — lower 28-day but higher 90-day strength than plain OPC.",low:"Solid admixture knowledge. Revise VMA role in SCC — prevents segregation while maintaining flow. Also revise max admixture dosage: 5% by cement weight (IS 9103)."},
      dur:{high:"Memorise IS 456 cover: Mild=20mm, Moderate=30mm, Severe=45mm, Very Severe=50mm, Extreme=75mm. Carbonation depth ∝ √t. Phenolphthalein: pink=safe, colourless=carbonated.",moderate:"ASR needs all three: reactive silica + high alkali cement + moisture. Prevention: low-alkali cement + fly ash/GGBS. RCPT >4000 Coulombs = high permeability.",low:"Strong durability knowledge. Revise ICCP vs sacrificial anode protection and the chloride threshold: 0.2-0.4% by cement weight (0.06% for prestressed)."},
    };
    const topicTips=tips[topic?.id]||tips.wcr;
    const msg=pct<50?topicTips.high:pct<75?topicTips.moderate:topicTips.low;
    setCoach(msg);
    setCoachLoading(false);
  }

  // ── REVISION PLAN GENERATOR ───────────────────────────────────────────────
  async function generatePlan(updatedHistory){
    setPlanLoading(true);setPlanErr("");setPlanStale(false);
    const hist=updatedHistory||history;
    const yr=gateYear||2028;
    const days=getDaysToGate(yr);
    const weeks=getWeeksToGate(yr);
    const today=new Date();
    const todayStr=`${today.toLocaleString("default",{month:"long"})} ${today.getDate()}, ${today.getFullYear()}`;
    const perfData=TOPICS.map(t=>{
      const h=hist[t.id]||[];
      const last=h.length>0?h[h.length-1]:null;
      return{id:t.id,topic:t.name,attempts:h.length,lastScore:last?last.pct:null,trend:h.length>1?h[h.length-1].pct-h[h.length-2].pct:null,status:!last?"not_attempted":last.pct<50?"high_decay":last.pct<75?"moderate":"strong"};
    });
    const prompt=`You are a GATE Civil Engineering exam coaching AI. Today is ${todayStr}. The student is targeting GATE ${yr} (tentative date: February 1, ${yr}) — ${days} days (${weeks} weeks) away.

Student performance data on Concrete Technology topics:
${JSON.stringify(perfData,null,2)}

Generate a PERSONALIZED GATE ${yr} preparation revision plan. Respond ONLY with valid JSON — no markdown, no preamble, just the JSON object:
{
  "summary": "2-3 sentence overview of the student's current status and what they must do to succeed in GATE ${yr}",
  "dailyHours": 2,
  "phase": "Foundation/Consolidation/Revision/Mock Tests",
  "weeklyPlan": [
    {
      "week": 1,
      "dateRange": "specific date range starting from today",
      "topicId": "wcr",
      "topic": "Water Cement Ratio",
      "priority": "high",
      "hours": 10,
      "focus": "Specific concept or formula set to master this week",
      "tasks": ["Specific task mentioning IS code/formula", "Specific task 2", "Specific task 3"]
    }
  ],
  "conceptGaps": [
    {
      "topicId": "wcr",
      "topic": "Water Cement Ratio",
      "concept": "Specific concept name",
      "why": "Why this gap is critical for GATE ${yr}",
      "action": "Specific action (mention IS code clause, formula, exact values)",
      "priority": "critical"
    }
  ],
  "milestone": "What the student should achieve in the next 30 days",
  "examStrategy": "Final 2-month strategy before GATE ${yr} in 2 sentences"
}

Generate exactly 8 weeks of plan. Prioritize high-decay and unattempted topics. Be very specific — mention IS 456 clauses, formula numbers, exact code values.`;

    try {
      const res = await sendChatMessage([{ role: "user", content: prompt }]);
      if (res.reply) {
        const clean = res.reply.replace(/```json|```/g, "").trim();
        const plan = JSON.parse(clean);
        setRevPlan(plan);
      } else {
        setPlanErr(res.error || "Could not generate plan. Please try again.");
      }
    } catch(e) {
      setPlanErr("Could not generate plan. Please try again.");
    }
    setPlanLoading(false);
  }

  // ── TEST FUNCTIONS ────────────────────────────────────────────────────────
  function startTest(t,n){
    const q=sampleQ(t.id,n||qCount);
    setTopic(t);setQs(q);setCurQ(0);setSel(null);
    setAnswers([]);setHint(false);setScore(null);setCoach("");setScreen("test");
  }

  async function submitAns(){
    const na=[...answers,sel];
    if(curQ+1<qs.length){setAnswers(na);setCurQ(q=>q+1);setSel(null);setHint(false);}
    else{
      const correct=na.filter((a,i)=>a===qs[i].ans).length;
      setAnswers(na);setScore(correct);
      const newHistory={...history};
      const prev=newHistory[topic.id]||[];
      newHistory[topic.id]=[...prev,{score:correct,total:qs.length,pct:Math.round((correct/qs.length)*100),ts:Date.now(),attempt:prev.length+1}];
      setHistory(newHistory);
      // Mark plan as stale — it will prompt user to refresh when they open Planner
      setPlanStale(true);
      setScreen("result");
      // No auto-generatePlan here — that was causing the ~5-8s delay after every test
    }
  }

  // ── AUTH SCREEN ───────────────────────────────────────────────────────────
  async function handleAuth(){
    setAuthErr("");
    if(!gateYear){setAuthErr("Please select your GATE exam year to continue");return;}
    if(authMode==="signup"){
      if(!form.name.trim()){setAuthErr("Please enter your name");return;}
      if(!form.email.includes("@")){setAuthErr("Please enter a valid email");return;}
      if(form.password.length<6){setAuthErr("Password must be at least 6 characters");return;}
      const res = await registerUser(form.name, form.email, form.password, gateYear);
      if(!res.success){ setAuthErr(res.error); return; }
      setUser(res.user);
      setActiveTab("practice");
      setScreen("dashboard");
    }else{
      if(!form.email.includes("@")){setAuthErr("Please enter a valid email");return;}
      if(!form.password){setAuthErr("Please enter your password");return;}
      const res = await loginUser(form.email, form.password);
      if(!res.success){ setAuthErr(res.error); return; }
      setUser(res.user);
      setGateYear(res.user.gateYear || gateYear || 2027);
      setActiveTab("practice");
      setScreen("dashboard");
    }
  }

  if(screen==="auth") return (
    <div className="ll-auth-container" style={{...appStyle}}>
      {/* Left Hero */}
      <div className="ll-auth-hero" style={{background:dark?"linear-gradient(135deg,#07090F 0%,#1a1040 60%,#07090F 100%)":"linear-gradient(135deg,#EEF2FF 0%,#E0E7FF 50%,#F0F4FF 100%)"}}>
        <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:`repeating-linear-gradient(0deg,${C.primary} 0,${C.primary} 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,${C.primary} 0,${C.primary} 1px,transparent 1px,transparent 48px)`}}/>
        <div className="ll-auth-hero-inner">
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <div style={{background:dark?"rgba(99,102,241,0.1)":"rgba(99,102,241,0.06)",borderRadius:24,padding:18,border:`1px solid ${C.primary}25`}}><Logo size={56}/></div>
          </div>
          <h1 style={{...heading(32),background:`linear-gradient(135deg,${C.primary},${C.purple})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>LearnLoop</h1>
          <div style={{fontSize:10,color:th.textDim,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:16}}>INTELLIGENT CONCEPT · AI ACADEMY · STRUCTAMIND</div>
          <p style={{color:th.textMid,fontSize:14,lineHeight:1.6,marginBottom:22}}>Engineering Minds. Structuring Futures.<br/><strong style={{color:th.text}}>Civil & Environmental Engineering</strong></p>
          {/* GATE Countdown — updates live as user picks year on the right */}
          <div style={{background:dark?"rgba(239,68,68,0.08)":"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:14,padding:"14px 18px",marginBottom:20}}>
            <div style={{fontSize:10,color:"#EF4444",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>
              🗓️ {gateYear?`GATE ${gateYear} Countdown`:"Select Your GATE Year →"}
            </div>
            {gateYear?(
              <>
                <div style={{display:"flex",gap:16,justifyContent:"center"}}>
                  {[{v:getDaysToGate(gateYear),l:"Days"},{v:getWeeksToGate(gateYear),l:"Weeks"},{v:getMonthsToGate(gateYear),l:"Months"}].map(s=>(
                    <div key={s.l} style={{textAlign:"center"}}>
                      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:900,color:"#EF4444"}}>{s.v}</div>
                      <div style={{fontSize:10,color:th.textDim}}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:11,color:th.textDim,marginTop:4}}>Feb 1, {gateYear} — Tentative</div>
              </>
            ):(
              <div style={{fontSize:13,color:th.textDim,padding:"6px 0",textAlign:"center"}}>Pick your year below to see your countdown</div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[["🎓","Core Civil Engineering Curriculum with GATE CE & ES Highlights"],["🧠","Multilingual AI Teacher with Concept Checks"],["🏆","Outcome-based verifiable credentials"],["⚡","287 GATE MCQs with AI Coaching"]].map(([i,t])=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:10,background:dark?"rgba(99,102,241,0.06)":"rgba(99,102,241,0.04)",borderRadius:8,padding:"8px 12px",border:`1px solid ${C.primary}12`,textAlign:"left"}}>
                <span style={{fontSize:15}}>{i}</span><span style={{fontSize:12.5,color:th.textMid}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right Form */}
      <div className="ll-auth-form-panel" style={{background:th.surface}}>
        <div style={{marginBottom:8,display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>setDark(d=>!d)} style={btnGhost({padding:"6px 14px",fontSize:12,marginBottom:16})}>{dark?"☀️ Light Mode":"🌙 Dark Mode"}</button>
          <button onClick={()=>{setActiveTab("landing");setScreen("landing");}} style={btnGhost({padding:"6px 14px",fontSize:12,marginBottom:16})}>← Back to Course</button>
        </div>
        <h2 style={{...heading(26),marginBottom:8}}>{authMode==="login"?"Welcome back":"Create account"}</h2>
        <p style={{color:th.textMid,fontSize:13.5,marginBottom:20}}>{authMode==="login"?"Sign in to continue your Civil Engineering coursework":"Enrol free and unlock the 6-module curriculum"}</p>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* ── GATE YEAR PICKER ── */}
          <div>
            <label style={{fontSize:12,color:th.textMid,fontWeight:600,letterSpacing:0.5,display:"block",marginBottom:8}}>
              🎯 WHICH GATE ARE YOU TARGETING?
            </label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {GATE_YEARS.map(yr=>{
                const isPast = yr < new Date().getFullYear();
                const isSelected = gateYear===yr;
                const dDays = getDaysToGate(yr);
                return(
                  <button key={yr} onClick={()=>{if(!isPast)setGateYear(yr);}} style={{
                    background:isSelected?`linear-gradient(135deg,${C.primary},${C.purple})`:"transparent",
                    color:isSelected?"#fff":isPast?th.textFaint:th.text,
                    border:`${isSelected?"2px":"1px"} solid ${isSelected?C.primary:isPast?th.textFaint+40:th.border}`,
                    borderRadius:10, padding:"8px 4px", cursor:isPast?"default":"pointer",
                    fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"clamp(12px, 3.5vw, 15px)",
                    transition:"all 0.15s", opacity:isPast?0.35:1,
                    boxShadow:isSelected?`0 4px 16px ${C.primary}30`:"none",
                    display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                    minWidth: 0,
                  }}>
                    <span>GATE {yr}</span>
                    {!isPast&&<span style={{fontSize:9,fontWeight:400,fontFamily:"'DM Sans',sans-serif",opacity:0.75,color:isSelected?"#fff":th.textDim}}>{dDays>0?`${Math.floor(dDays/30)}mo away`:"This Year"}</span>}
                    {isPast&&<span style={{fontSize:9,fontFamily:"'DM Sans',sans-serif"}}>Passed</span>}
                  </button>
                );
              })}
            </div>
            {gateYear&&(
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:dark?"rgba(99,102,241,0.08)":"rgba(99,102,241,0.06)",borderRadius:8,border:`1px solid ${C.primary}20`}}>
                <span style={{fontSize:14}}>⏳</span>
                <span style={{fontSize:12,color:th.textMid}}>
                  <strong style={{color:C.primary}}>{getDaysToGate(gateYear)} days</strong> · <strong style={{color:C.primary}}>{getWeeksToGate(gateYear)} weeks</strong> · <strong style={{color:C.primary}}>{getMonthsToGate(gateYear)} months</strong> to GATE {gateYear}
                </span>
              </div>
            )}
          </div>

          <div style={{borderTop:`1px solid ${th.border}`,paddingTop:4}}/>

          {authMode==="signup"&&<div><label style={{fontSize:12,color:th.textMid,fontWeight:600,letterSpacing:0.5,display:"block",marginBottom:6}}>FULL NAME</label><input style={inputStyle} placeholder="Rahul Sharma" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>}
          <div><label style={{fontSize:12,color:th.textMid,fontWeight:600,letterSpacing:0.5,display:"block",marginBottom:6}}>EMAIL ADDRESS</label><input style={inputStyle} type="email" placeholder="student@iit.ac.in" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
          <div><label style={{fontSize:12,color:th.textMid,fontWeight:600,letterSpacing:0.5,display:"block",marginBottom:6}}>PASSWORD</label><input style={inputStyle} type="password" placeholder={authMode==="login"?"••••••••":"Min. 6 characters"} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/></div>
          {authErr&&<div style={{background:"#EF444415",border:"1px solid #EF444430",borderRadius:8,padding:"10px 14px",color:"#EF4444",fontSize:13}}>{authErr}</div>}
          <button onClick={handleAuth} style={btnPri({width:"100%",padding:"14px",fontSize:15,borderRadius:10,marginTop:4})}>{authMode==="login"?"Sign In →":"Create Account →"}</button>
          <div style={{textAlign:"center",paddingTop:4}}>
            <span style={{color:th.textDim,fontSize:13}}>{authMode==="login"?"Don't have an account? ":"Already have an account? "}</span>
            <button onClick={()=>{setAuthMode(m=>m==="login"?"signup":"login");setAuthErr("");}} style={{background:"none",border:"none",color:C.primary,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{authMode==="login"?"Sign Up":"Sign In"}</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PUBLIC LANDING PAGE ──────────────────────────────────────────────────
  if (screen === "landing" || (!user && activeTab === "landing")) {
    return (
      <div style={appStyle}>
        <Navbar
          dark={dark}
          setDark={setDark}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setScreen(tab);
          }}
          user={user}
          setUser={setUser}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthErr("");
            setScreen("auth");
          }}
          gateYear={gateYear}
        />
        <PublicLanding
          dark={dark}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthErr("");
            setScreen("auth");
          }}
          onExploreCourse={() => {
            setActiveTab("academy");
            setScreen("academy");
            setAcademySubView("catalogue");
          }}
          onVerifyCert={() => {
            setActiveTab("certificates-public");
            setScreen("certificates-public");
          }}
        />
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── PUBLIC CERTIFICATE VERIFICATION ───────────────────────────────────────
  if (screen === "certificates-public" || (activeTab === "certificates-public" && !user)) {
    return (
      <div style={appStyle}>
        <Navbar
          dark={dark}
          setDark={setDark}
          activeTab="certificates-public"
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setScreen(tab);
          }}
          user={user}
          setUser={setUser}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthErr("");
            setScreen("auth");
          }}
          gateYear={gateYear}
        />
        <CertificateView
          user={user}
          dark={dark}
          onNavigateBack={() => {
            setActiveTab("landing");
            setScreen("landing");
          }}
        />
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── ACADEMY COURSES & LESSON PLAYER ───────────────────────────────────────
  if (activeTab === "academy" || screen === "academy") {
    let academyContent = null;
    if (academySubView === "catalogue") {
      academyContent = (
        <CourseCatalogueView
          courses={civilEngineeringCatalogue}
          user={user}
          dark={dark}
          onSelectCourse={(course) => {
            setSelectedCourseId(course.id);
            setAcademySubView("overview");
          }}
        />
      );
    } else if (academySubView === "lesson") {
      academyContent = (
        <LessonPlayer
          user={user}
          dark={dark}
          initialModuleId={activeModuleId}
          initialLessonId={activeLessonId}
          onBackToCourse={() => setAcademySubView("overview")}
          onNavigateLesson={(targetLesson) => {
            const lessonId = typeof targetLesson === "object" ? targetLesson?.id : targetLesson;
            if (!lessonId) return;
            const parentMod = (waterSupplyAndSanitaryCourse?.modules || []).find((m) =>
              (m.lessons || []).some((l) => l.id === lessonId)
            );
            setActiveLessonId(lessonId);
            if (parentMod) setActiveModuleId(parentMod.id);
          }}
          onOpenAssessment={(modId) => {
            setActiveModuleId(typeof modId === "object" ? modId?.id : modId);
            setAcademySubView("assessment");
          }}
        />
      );
    } else if (academySubView === "assessment") {
      const activeMod = (waterSupplyAndSanitaryCourse?.modules || []).find((m) => m.id === activeModuleId);
      academyContent = (
        <ModuleAssessmentView
          user={user}
          dark={dark}
          module={activeMod}
          moduleId={activeModuleId}
          course={waterSupplyAndSanitaryCourse}
          onBack={() => setAcademySubView("overview")}
          onBackToCourse={() => setAcademySubView("overview")}
          onComplete={() => setAcademySubView("overview")}
        />
      );
    } else if (academySubView === "final-exam") {
      academyContent = (
        <FinalExamView
          user={user}
          dark={dark}
          onBack={() => setAcademySubView("overview")}
          onBackToCourse={() => setAcademySubView("overview")}
          onViewCertificates={() => {
            setActiveTab("certificates");
            setScreen("certificates");
          }}
          onComplete={() => {
            setActiveTab("certificates");
            setScreen("certificates");
          }}
        />
      );
    } else {
      academyContent = (
        <CourseOverview
          user={user}
          dark={dark}
          course={selectedCourse}
          onBackToCatalogue={() => setAcademySubView("catalogue")}
          onSelectCourse={(course) => {
            setSelectedCourseId(course.id);
            setAcademySubView("overview");
          }}
          onSelectLesson={(arg1, arg2) => {
            let lessonId = null;
            let moduleId = null;
            if (typeof arg1 === "object" && arg1 !== null) {
              lessonId = arg1.id;
              moduleId = arg2 || arg1.moduleId;
            } else if (typeof arg1 === "string" && typeof arg2 === "string") {
              moduleId = arg1;
              lessonId = arg2;
            } else if (typeof arg1 === "string") {
              lessonId = arg1;
              moduleId = arg2;
            }
            if (!moduleId && lessonId) {
              moduleId = (waterSupplyAndSanitaryCourse?.modules || []).find((m) =>
                (m.lessons || []).some((l) => l.id === lessonId)
              )?.id;
            }
            if (moduleId) setActiveModuleId(moduleId);
            if (lessonId) setActiveLessonId(lessonId);
            setAcademySubView("lesson");
          }}
          onStartModuleAssessment={(mod) => {
            const modId = typeof mod === "object" ? mod?.id : mod;
            if (modId) setActiveModuleId(modId);
            setAcademySubView("assessment");
          }}
          onTakeAssessment={(modId) => {
            const mId = typeof modId === "object" ? modId?.id : modId;
            if (mId) setActiveModuleId(mId);
            setAcademySubView("assessment");
          }}
          onStartFinalExam={() => {
            setAcademySubView("final-exam");
          }}
          onTakeFinalExam={() => {
            setAcademySubView("final-exam");
          }}
          onViewCertificates={() => {
            setActiveTab("certificates");
            setScreen("certificates");
          }}
        />
      );
    }

    return (
      <div style={appStyle} className={`ll-app-root ${dark ? "dark" : "light"}`} data-theme={dark ? "dark" : "light"}>
        <Navbar
          dark={dark}
          setDark={setDark}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setScreen(tab);
            if (tab === "academy") setAcademySubView("catalogue");
          }}
          user={user}
          setUser={setUser}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthErr("");
            setScreen("auth");
          }}
          gateYear={gateYear}
        />
        {academyContent}
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── ACADEMY DASHBOARD ─────────────────────────────────────────────────────
  if (activeTab === "dashboard") {
    return (
      <div style={appStyle}>
        <Navbar
          dark={dark}
          setDark={setDark}
          activeTab="dashboard"
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setScreen(tab);
            if (tab === "academy") setAcademySubView("catalogue");
          }}
          user={user}
          setUser={setUser}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthErr("");
            setScreen("auth");
          }}
          gateYear={gateYear}
        />
        <DashboardView
          user={user}
          dark={dark}
          onOpenLesson={(modId, lesId) => {
            setActiveTab("academy");
            setScreen("academy");
            setActiveModuleId(modId);
            setActiveLessonId(lesId);
            setAcademySubView("lesson");
          }}
          onOpenAssessment={(modId) => {
            setActiveTab("academy");
            setScreen("academy");
            setActiveModuleId(modId);
            setAcademySubView("assessment");
          }}
          onOpenFinalExam={() => {
            setActiveTab("academy");
            setScreen("academy");
            setAcademySubView("final-exam");
          }}
          onOpenCertificates={() => {
            setActiveTab("certificates");
            setScreen("certificates");
          }}
          onSwitchTab={(tab) => {
            setActiveTab(tab);
            setScreen(tab);
          }}
        />
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── CERTIFICATES ──────────────────────────────────────────────────────────
  if (activeTab === "certificates" || screen === "certificates") {
    return (
      <div style={appStyle}>
        <Navbar
          dark={dark}
          setDark={setDark}
          activeTab="certificates"
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setScreen(tab);
            if (tab === "academy") setAcademySubView("catalogue");
          }}
          user={user}
          setUser={setUser}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthErr("");
            setScreen("auth");
          }}
          gateYear={gateYear}
        />
        <CertificateView
          user={user}
          dark={dark}
          onNavigateBack={() => {
            setActiveTab("academy");
            setScreen("academy");
            setAcademySubView("overview");
          }}
        />
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── PROFILE & SETTINGS ────────────────────────────────────────────────────
  if (activeTab === "profile" || screen === "profile") {
    return (
      <div style={appStyle}>
        <Navbar
          dark={dark}
          setDark={setDark}
          activeTab="profile"
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setScreen(tab);
            if (tab === "academy") setAcademySubView("catalogue");
          }}
          user={user}
          setUser={setUser}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthErr("");
            setScreen("auth");
          }}
          gateYear={gateYear}
        />
        <ProfileView
          user={user}
          setUser={setUser}
          dark={dark}
          onLogout={() => {
            logoutUser();
            setUser(null);
            setActiveTab("landing");
            setScreen("landing");
          }}
        />
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }


  // ── PLANNER SCREEN ────────────────────────────────────────────────────────
  if(screen==="planner"){
    const days=getDaysToGate(gateYear||2028);const weeks=getWeeksToGate(gateYear||2028);const months=getMonthsToGate(gateYear||2028);
    const yr=gateYear||2028;
    const priorityColor={critical:"#EF4444",high:"#F59E0B",medium:"#6366F1",low:"#10B981"};
    const prevMonth=()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);};
    const nextMonth=()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);};
    const notAttempted=TOPICS.filter(t=>!(history[t.id]?.length>0));
    const weakTopics=TOPICS.filter(t=>{const h=history[t.id];return h&&h.length>0&&h[h.length-1].pct<50;});
    return(
      <div style={appStyle}>
        <Nav back={()=>setScreen("dashboard")} sub="Study Planner"/>
        <div style={{maxWidth:980,margin:"0 auto",padding:"32px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28}}>
            <div>
              <h1 style={{...heading(28),marginBottom:6}}>GATE {yr} Study Planner</h1>
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
                <p style={{color:th.textMid,fontSize:14,margin:0}}>AI-generated revision schedule · Auto-updates after every test</p>
                {/* Inline year changer */}
                {!showYearPicker?(
                  <button onClick={()=>setShowYearPicker(true)} style={{...btnGhost({padding:"4px 10px",fontSize:11}),color:C.primary,borderColor:`${C.primary}30`}}>
                    Change Year ✎
                  </button>
                ):(
                  <div style={{display:"flex",gap:6,alignItems:"center",background:th.elevated,borderRadius:10,padding:"4px 8px",border:`1px solid ${th.border}`}}>
                    {GATE_YEARS.filter(y=>y>=new Date().getFullYear()).map(y=>(
                      <button key={y} onClick={()=>{setGateYear(y);setShowYearPicker(false);setRevPlan(null);}} style={{
                        background:gateYear===y?C.primary:"transparent",
                        color:gateYear===y?"#fff":th.textMid,
                        border:"none",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",
                        fontFamily:"'Outfit',sans-serif"
                      }}>{y}</button>
                    ))}
                    <button onClick={()=>setShowYearPicker(false)} style={{background:"none",border:"none",cursor:"pointer",color:th.textDim,fontSize:14,padding:"0 4px"}}>✕</button>
                  </div>
                )}
              </div>
            </div>
            <button onClick={()=>generatePlan()} style={btnPri({padding:"11px 20px",fontSize:13})} disabled={planLoading}>
              {planLoading?"⟳ Generating...":"🤖 Generate AI Plan"}
            </button>
          </div>

          {/* Countdown + Calendar Row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:24}}>
            {/* Big countdown */}
            <div style={cardStyle({borderColor:"#EF444430",background:dark?"rgba(239,68,68,0.05)":"rgba(239,68,68,0.03)",gridColumn:"span 2"})}>
              <div style={{fontSize:11,color:"#EF4444",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>🗓️ GATE {yr} — February 1, {yr} (Tentative)</div>
              <div style={{display:"flex",gap:32,alignItems:"center",marginBottom:16}}>
                {[{v:days,l:"Days Remaining"},{v:weeks,l:"Weeks Left"},{v:months,l:"Months Left"}].map(s=>(
                  <div key={s.l}>
                    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:48,fontWeight:900,color:"#EF4444",lineHeight:1}}>{s.v}</div>
                    <div style={{fontSize:12,color:th.textDim,marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:th.textDim,marginBottom:5}}>
                  <span>Today ({new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"})})</span>
                  <span>GATE Feb {yr}</span>
                </div>
                <div style={{background:th.elevated,borderRadius:6,height:8,overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(90deg,#6366F1,#EF4444)",height:"100%",width:`${Math.min(99,Math.round((1-(days/getTotalPrepDays(yr)))*100))}%`,borderRadius:6}}/>
                </div>
                <div style={{fontSize:11,color:th.textDim,marginTop:4,textAlign:"right"}}>~{Math.min(99,Math.round((1-(days/getTotalPrepDays(yr)))*100))}% of prep time elapsed</div>
              </div>
            </div>
            {/* Calendar */}
            <div style={cardStyle({padding:"16px 18px"})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <button onClick={prevMonth} style={{background:"none",border:"none",cursor:"pointer",color:th.textMid,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>◀</button>
                <div style={{fontSize:11,color:th.textDim,fontWeight:600}}>Browse Months</div>
                <button onClick={nextMonth} style={{background:"none",border:"none",cursor:"pointer",color:th.textMid,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>▶</button>
              </div>
              <MiniCalendar dark={dark} th={th} C={C} year={calYear} month={calMonth} gateYear={yr}/>
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:4}}>
                <div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:th.textDim}}><span style={{width:10,height:10,borderRadius:2,background:C.primary,display:"inline-block"}}/>Today</div>
                <div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:"#EF4444",fontWeight:600}}><span style={{width:10,height:10,borderRadius:2,background:"#EF4444",display:"inline-block"}}/>GATE {yr} (Feb 1)</div>
              </div>
            </div>
          </div>

          {/* Current Status Cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
            {[
              {label:"Not Attempted",value:notAttempted.length,color:th.textDim,icon:"📋"},
              {label:"High Decay",value:weakTopics.length,color:"#EF4444",icon:"🔴"},
              {label:"Total Tests Taken",value:Object.values(history).reduce((a,v)=>a+v.length,0),color:C.primary,icon:"📝"},
              {label:"Topics Cleared (>75%)",value:TOPICS.filter(t=>{const h=history[t.id];return h&&h.length>0&&h[h.length-1].pct>=75;}).length,color:C.success,icon:"✅"},
            ].map(s=>(
              <div key={s.label} style={cardStyle({textAlign:"center",padding:"16px 12px"})}>
                <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontSize:26,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:11,color:th.textDim,marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* AI Plan */}

          {/* Stale plan banner — shown after a test was taken */}
          {planStale&&!planLoading&&(
            <div style={{...cardStyle({borderColor:`${C.warn}35`,background:dark?"rgba(245,158,11,0.06)":"rgba(245,158,11,0.04)",marginBottom:20,padding:"14px 20px"}),display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:22}}>⚡</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:C.warn}}>New test results available</div>
                <div style={{fontSize:12,color:th.textDim,marginTop:2}}>You've completed a test since your last plan was generated. Regenerate to reflect your latest scores.</div>
              </div>
              <button onClick={()=>generatePlan()} style={btnPri({padding:"10px 18px",fontSize:13,background:`linear-gradient(135deg,${C.warn},#D97706)`})}>
                🤖 Update Plan
              </button>
            </div>
          )}

          {planLoading&&(
            <div style={cardStyle({textAlign:"center",padding:"48px",marginBottom:24})}>
              <div style={{fontSize:36,marginBottom:16}}>🤖</div>
              <h3 style={{...heading(18),marginBottom:8}}>Generating Your Personalized Plan...</h3>
              <p style={{color:th.textMid,fontSize:14}}>Analysing your performance data and GATE {yr} timeline</p>
              <div style={{marginTop:20,display:"flex",justifyContent:"center",gap:4}}>
                {[0,1,2].map(i=>(<div key={i} style={{width:8,height:8,borderRadius:"50%",background:C.primary,opacity:0.4,animation:`pulse 1.4s ${i*0.3}s infinite`}}/>))}
              </div>
            </div>
          )}

          {!planLoading&&!revPlan&&!planErr&&(
            <div style={cardStyle({textAlign:"center",padding:"48px",marginBottom:24,borderStyle:"dashed"})}>
              <div style={{fontSize:40,marginBottom:16}}>📅</div>
              <h3 style={{...heading(20),marginBottom:8}}>No Plan Generated Yet</h3>
              <p style={{color:th.textMid,fontSize:14,marginBottom:24}}>Click "Generate AI Plan" to get your personalized GATE {yr} revision schedule.<br/>Regenerate it any time after taking a test.</p>
              <button onClick={()=>generatePlan()} style={btnPri()}>🤖 Generate My Revision Plan →</button>
            </div>
          )}

          {planErr&&<div style={{...cardStyle({borderColor:"#EF444430",background:"rgba(239,68,68,0.05)",padding:"16px 20px",marginBottom:24}),color:"#EF4444"}}>{planErr}</div>}

          {revPlan&&!planLoading&&(
            <>
              {/* Plan Summary */}
              <div style={cardStyle({borderColor:`${C.primary}25`,background:dark?"rgba(99,102,241,0.04)":"rgba(99,102,241,0.02)",marginBottom:20})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{background:`${C.primary}15`,color:C.primary,fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20,letterSpacing:0.8}}>🤖 AI REVISION STRATEGY</div>
                    {revPlan.phase&&<div style={{background:`${C.warn}15`,color:C.warn,fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20}}>{revPlan.phase}</div>}
                  </div>
                  <button onClick={()=>generatePlan()} style={btnGhost({padding:"6px 12px",fontSize:11})}>↻ Regenerate</button>
                </div>
                <p style={{color:th.textMid,fontSize:14,lineHeight:1.7,margin:"0 0 14px"}}>{revPlan.summary}</p>
                <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                  {revPlan.dailyHours&&<div style={{fontSize:13,color:th.text}}><span style={{color:C.primary,fontWeight:700}}>{revPlan.dailyHours} hrs/day</span> recommended</div>}
                  {revPlan.milestone&&<div style={{fontSize:13,color:th.textMid}}>🎯 <em>{revPlan.milestone}</em></div>}
                </div>
              </div>

              {/* Weekly Plan */}
              {revPlan.weeklyPlan?.length>0&&(
                <div style={{marginBottom:24}}>
                  <h3 style={{...heading(14),color:th.textDim,textTransform:"uppercase",letterSpacing:2,marginBottom:14}}>📅 Week-by-Week Revision Plan</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {revPlan.weeklyPlan.map((week,i)=>{
                      const t=getTopicById(week.topicId);
                      const pColor=priorityColor[week.priority]||C.primary;
                      return(
                        <div key={i} style={cardStyle({padding:"16px 20px",borderLeft:`3px solid ${t?.color||C.primary}`,borderRadius:"0 12px 12px 0",display:"flex",gap:20,alignItems:"flex-start"})}>
                          <div style={{minWidth:100}}>
                            <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:15,color:t?.color||C.primary}}>Week {week.week}</div>
                            <div style={{fontSize:10,color:th.textDim,lineHeight:1.4,marginTop:2}}>{week.dateRange}</div>
                            {week.hours&&<div style={{fontSize:10,color:th.textDim,marginTop:4}}>⏱ {week.hours}h total</div>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                              <span style={{fontSize:14}}>{t?.icon||"📚"}</span>
                              <span style={{fontWeight:700,fontSize:14,color:th.text}}>{week.topic}</span>
                              <span style={{background:`${pColor}15`,color:pColor,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,textTransform:"uppercase",letterSpacing:0.5}}>{week.priority}</span>
                            </div>
                            {week.focus&&<p style={{fontSize:12,color:th.textMid,margin:"0 0 8px",lineHeight:1.5}}>🎯 {week.focus}</p>}
                            {week.tasks?.length>0&&(
                              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                                {week.tasks.map((task,j)=>(<div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                                  <span style={{color:t?.color||C.primary,fontSize:11,marginTop:1,flexShrink:0}}>✦</span>
                                  <span style={{fontSize:12,color:th.textDim,lineHeight:1.4}}>{task}</span>
                                </div>))}
                              </div>
                            )}
                          </div>
                          <button onClick={()=>{setTopic(t||TOPICS[0]);setScreen("setup");}} style={{...btnGhost({padding:"7px 12px",fontSize:11}),flexShrink:0,whiteSpace:"nowrap"}}>Practice →</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Concept Gaps */}
              {revPlan.conceptGaps?.length>0&&(
                <div style={{marginBottom:24}}>
                  <h3 style={{...heading(14),color:th.textDim,textTransform:"uppercase",letterSpacing:2,marginBottom:14}}>⚠️ Concept Gaps — Action Required</h3>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {revPlan.conceptGaps.map((gap,i)=>{
                      const t=getTopicById(gap.topicId);
                      const pColor=priorityColor[gap.priority]||C.warn;
                      return(
                        <div key={i} style={cardStyle({padding:"16px 18px",borderColor:`${pColor}20`})}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                            <div style={{display:"flex",gap:6,alignItems:"center"}}>
                              <span style={{fontSize:14}}>{t?.icon||"📚"}</span>
                              <div>
                                <div style={{fontSize:11,color:th.textDim,fontWeight:600}}>{gap.topic}</div>
                                <div style={{fontWeight:700,fontSize:13,color:th.text}}><FormattedContent inline content={gap.concept} /></div>
                              </div>
                            </div>
                            <span style={{background:`${pColor}15`,color:pColor,fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:20,textTransform:"uppercase",flexShrink:0}}>{gap.priority}</span>
                          </div>
                          {gap.why&&<p style={{fontSize:11,color:th.textDim,margin:"0 0 6px",lineHeight:1.5,fontStyle:"italic"}}><FormattedContent inline content={gap.why} /></p>}
                          {gap.action&&<div style={{background:dark?`${pColor}08`:`${pColor}05`,borderRadius:8,padding:"8px 10px",fontSize:11,color:th.textMid,lineHeight:1.5}}>
                            <span style={{color:pColor,fontWeight:700}}>Action: </span><FormattedContent inline content={gap.action} />
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exam Strategy */}
              {revPlan.examStrategy&&(
                <div style={cardStyle({borderColor:`${C.success}25`,background:dark?"rgba(16,185,129,0.04)":"rgba(16,185,129,0.02)"})}>
                  <div style={{fontSize:11,color:C.success,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🎯 Final Exam Strategy</div>
                  <p style={{color:th.textMid,fontSize:14,lineHeight:1.7,margin:0}}>{revPlan.examStrategy}</p>
                </div>
              )}
            </>
          )}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  if(screen==="dashboard"){
    const attempted=Object.keys(history).length;
    const avgPct=attempted===0?0:Math.round(Object.entries(history).reduce((a,[id,arr])=>{const l=arr[arr.length-1];return a+l.pct;},0)/attempted);
    const weakTopics=TOPICS.filter(t=>{const h=history[t.id];return h&&h.length>0&&h[h.length-1].pct<50;});
    const totalAttempts=Object.values(history).reduce((a,v)=>a+v.length,0);
    return(
      <div style={appStyle}>
        <Nav/>
        <div style={{maxWidth:880,margin:"0 auto",padding:"32px 24px"}}>
          <div style={{marginBottom:28}}>
            <h1 style={{...heading(30),marginBottom:8}}>Good {new Date().getHours()<12?"Morning":"Afternoon"},<br/><span style={{background:`linear-gradient(135deg,${C.primary},${C.purple})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{user?.name||"Student"} 👋</span></h1>
            <p style={{color:th.textMid,fontSize:14}}>287 GATE Questions · Agentic AI · GATE {gateYear||"—"} Countdown</p>
          </div>

          {/* GATE Countdown Banner */}
          <div style={{...cardStyle({borderColor:"#EF444430",background:dark?"rgba(239,68,68,0.04)":"rgba(239,68,68,0.03)",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px"})}}>
            <div style={{display:"flex",gap:24,alignItems:"center"}}>
              <div style={{fontSize:9,color:"#EF4444",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>🗓️ GATE {gateYear||"—"} — Feb 1, {gateYear||"—"}</div>
              <div style={{display:"flex",gap:16}}>
                {[{v:getDaysToGate(gateYear),l:"days"},{v:getWeeksToGate(gateYear),l:"weeks"},{v:getMonthsToGate(gateYear),l:"months"}].map(s=>(
                  <div key={s.l} style={{display:"flex",gap:4,alignItems:"baseline"}}><span style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:900,color:"#EF4444"}}>{s.v}</span><span style={{fontSize:10,color:th.textDim}}>{s.l}</span></div>
                ))}
              </div>
            </div>
            <button onClick={()=>setScreen("planner")} style={btnPri({padding:"9px 18px",fontSize:13,background:"linear-gradient(135deg,#EF4444,#DC2626)"})}>
              📅 View Study Plan
            </button>
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {[{label:"Topics Attempted",value:`${attempted}/6`,icon:"📚",color:C.primary},{label:"Total Tests",value:totalAttempts||"0",icon:"🔄",color:C.accent},{label:"Average Score",value:attempted?`${avgPct}%`:"—",icon:"📊",color:avgPct>=75?C.success:avgPct>=50?C.warn:C.danger},{label:"High Decay Topics",value:weakTopics.length,icon:"⚠️",color:weakTopics.length>0?C.danger:C.success}].map(s=>(
              <div key={s.label} style={cardStyle({padding:"18px 16px",textAlign:"center",borderColor:`${s.color}15`})}>
                <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{color:th.textDim,fontSize:10,marginTop:3,fontWeight:500}}>{s.label}</div>
              </div>
            ))}
          </div>

          {weakTopics.length>0&&(
            <div style={cardStyle({borderColor:`${C.danger}30`,background:dark?"rgba(239,68,68,0.04)":"rgba(239,68,68,0.02)",marginBottom:20,padding:"16px 20px"})}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><div style={{width:7,height:7,borderRadius:"50%",background:C.danger}}/><span style={{color:C.danger,fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:1}}>High Decay — Revise These First</span></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {weakTopics.map(t=>(<button key={t.id} onClick={()=>{setTopic(t);setScreen("setup");}} style={{background:`${C.danger}10`,color:C.danger,border:`1px solid ${C.danger}25`,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t.icon} {t.name} — Revise Now</button>))}
              </div>
            </div>
          )}

          {/* Exams */}
          <div style={{marginBottom:24}}>
            <h3 style={{...heading(12),color:th.textDim,textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:14}}>Select Exam</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[{name:"GATE",sub:"Civil Engineering",active:true},{name:"UPSC",sub:"Engineering Services",active:false},{name:"SSC JE",sub:"Junior Engineer",active:false}].map(exam=>(
                <div key={exam.name} onClick={exam.active?()=>setScreen("subjects"):undefined} onMouseEnter={()=>exam.active&&setHov(exam.name)} onMouseLeave={()=>setHov(null)}
                  style={cardStyle({cursor:exam.active?"pointer":"default",opacity:exam.active?1:0.4,borderColor:hov===exam.name?C.primary:exam.active?`${C.primary}20`:th.border,transform:hov===exam.name?"translateY(-2px)":"none",boxShadow:hov===exam.name?`0 8px 30px ${C.primary}12`:"none"})}>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:20,color:th.text}}>{exam.name}</div>
                  <div style={{color:th.textDim,fontSize:12,marginTop:4}}>{exam.sub}</div>
                  <div style={{marginTop:14,fontSize:10,fontWeight:700,color:exam.active?C.primary:th.textFaint,letterSpacing:0.5}}>{exam.active?"● Active — 287 Questions":"Coming Soon"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agentic Loop */}
          <div style={cardStyle()}>
            <h3 style={{...heading(12),color:th.textDim,textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:16}}>🤖 Agentic AI Loop</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[{l:"Observe",d:"Records performance",i:"👁️",c:C.primary},{l:"Decide",d:"Detects concept decay",i:"🧠",c:C.purple},{l:"Act",d:"Updates revision plan",i:"⚡",c:C.warn},{l:"Verify",d:"Tracks improvement",i:"✅",c:C.success}].map((s,i)=>(
                <div key={s.l} style={{background:th.elevated,borderRadius:10,padding:"14px 12px",textAlign:"center",border:`1px solid ${s.c}15`,position:"relative"}}>
                  <div style={{fontSize:22,marginBottom:8}}>{s.i}</div>
                  <div style={{fontWeight:700,fontSize:13,color:s.c,marginBottom:4}}>{s.l}</div>
                  <div style={{color:th.textDim,fontSize:11,lineHeight:1.4}}>{s.d}</div>
                  {i<3&&<div style={{position:"absolute",right:-7,top:"50%",transform:"translateY(-50%)",color:th.textFaint,fontSize:12,zIndex:1}}>→</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── SUBJECTS ──────────────────────────────────────────────────────────────
  if(screen==="subjects"){
    const subjects=["Engineering Mathematics","Structural Engineering","Geotechnical Engineering","Environmental Engineering","Transportation Engineering","Water Resources","Concrete Technology","CPM / PERT","Engineering Mechanics","Aptitude","Strength of Materials","Fluid Mechanics"];
    return(
      <div style={appStyle}>
        <Nav back={()=>setScreen("dashboard")} sub="GATE Civil"/>
        <div style={{maxWidth:880,margin:"0 auto",padding:"32px 24px"}}>
          <h1 style={{...heading(26),marginBottom:6}}>Choose a Subject</h1>
          <p style={{color:th.textMid,fontSize:14,marginBottom:24}}>12 Subjects · Concrete Technology active with 287 GATE questions</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {subjects.map(s=>{const active=s==="Concrete Technology";return(<div key={s} onClick={active?()=>setScreen("topics"):undefined} onMouseEnter={()=>active&&setHov(s)} onMouseLeave={()=>setHov(null)} style={cardStyle({cursor:active?"pointer":"default",opacity:active?1:0.4,borderColor:hov===s?C.primary:active?`${C.primary}15`:th.border,transform:hov===s?"translateY(-2px)":"none",padding:"14px 16px"})}>
              <div style={{fontWeight:600,fontSize:14,color:active?th.text:th.textDim}}>{s}</div>
              <div style={{fontSize:11,marginTop:5,color:active?C.primary:th.textFaint,fontWeight:active?700:400}}>{active?"✓ 287 GATE questions":"Coming Soon"}</div>
            </div>);})}
          </div>
        </div>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── TOPICS ────────────────────────────────────────────────────────────────
  if(screen==="topics"){
    return(
      <div style={appStyle}>
        <Nav back={()=>setScreen("subjects")} sub="Concrete Technology"/>
        <div style={{maxWidth:880,margin:"0 auto",padding:"32px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24}}>
            <div>
              <h1 style={{...heading(26),marginBottom:6}}>Select a Topic</h1>
              <p style={{color:th.textMid,fontSize:14}}>6 Topics · 45–50 Real GATE MCQs · Hints Included</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setScreen("graph")} style={btnGhost({display:"flex",alignItems:"center",gap:6,fontSize:12})}>📈 Progress</button>
              <button onClick={()=>setScreen("planner")} style={btnGhost({display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.warn,borderColor:`${C.warn}40`})}>📅 Plan</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {TOPICS.map(t=>{
              const h=history[t.id]||[];const last=h.length>0?h[h.length-1]:null;const decay=last?getDecay(last.score,last.total):null;
              return(<div key={t.id} onClick={()=>{setTopic(t);setScreen("setup");}} onMouseEnter={()=>setHov(t.id)} onMouseLeave={()=>setHov(null)}
                style={cardStyle({cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"16px 20px",borderColor:hov===t.id?t.color:`${t.color}15`,transform:hov===t.id?"translateY(-2px)":"none",boxShadow:hov===t.id?`0 8px 24px ${t.color}15`:"none"})}>
                <div style={{width:48,height:48,borderRadius:12,background:`${t.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,border:`1px solid ${t.color}20`}}>{t.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:th.text}}>{t.name}</div>
                  <div style={{fontSize:11,color:th.textDim,marginTop:1}}>{t.desc}</div>
                  {last&&(<div style={{marginTop:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:decay.color,fontWeight:700}}>{decay.emoji} {last.score}/{last.total} · Attempt {h.length}</span><span style={{fontSize:10,color:th.textDim}}>{last.pct}%</span></div>
                    <div style={{background:th.elevated,borderRadius:4,height:3,overflow:"hidden"}}><div style={{background:decay.color,height:"100%",width:`${last.pct}%`,borderRadius:4}}/></div>
                  </div>)}
                  {!last&&<div style={{fontSize:10,color:th.textFaint,marginTop:5}}>Not attempted yet</div>}
                </div>
                <span style={{color:t.color,fontSize:16,flexShrink:0}}>→</span>
              </div>);
            })}
          </div>
        </div>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── TEST SETUP ────────────────────────────────────────────────────────────
  if(screen==="setup"&&topic){
    const maxQ=QB[topic.id]?.length||10;
    return(
      <div style={appStyle}>
        <Nav back={()=>setScreen("topics")} sub={topic.name}/>
        <div style={{maxWidth:560,margin:"0 auto",padding:"48px 24px"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <div style={{width:76,height:76,borderRadius:22,background:`${topic.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 18px",border:`1px solid ${topic.color}25`}}>{topic.icon}</div>
            <h1 style={{...heading(24),marginBottom:6}}>{topic.name}</h1>
            <p style={{color:th.textMid,fontSize:14}}>{maxQ} GATE questions available</p>
          </div>
          <div style={cardStyle({marginBottom:18})}>
            <div style={{fontSize:11,color:th.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:14}}>Number of Questions</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[10,20,30,maxQ].filter((v,i,a)=>a.indexOf(v)===i).map(n=>(
                <button key={n} onClick={()=>setQCount(n)} style={{background:qCount===n?`linear-gradient(135deg,${topic.color},${C.purple})`:"transparent",color:qCount===n?"#fff":th.textMid,border:qCount===n?"none":`1px solid ${th.border}`,borderRadius:10,padding:"13px 0",fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:14,cursor:"pointer",transition:"all 0.2s",boxShadow:qCount===n?`0 4px 14px ${topic.color}30`:"none"}}>
                  {n}{n===maxQ?" ★":""}
                </button>
              ))}
            </div>
          </div>
          <button onClick={()=>startTest(topic,qCount)} style={btnPri({width:"100%",padding:"15px",fontSize:15,borderRadius:12,marginBottom:10})}>Start Test — {qCount} Questions →</button>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>{setNoteTab("notes");setScreen("notes");}} style={btnGhost({padding:"11px",fontSize:12,textAlign:"center"})}>📖 Revision Notes</button>
            <button onClick={()=>{setNoteTab("formula");setScreen("notes");}} style={btnGhost({padding:"11px",fontSize:12,textAlign:"center"})}>📐 Formula Sheet</button>
          </div>
        </div>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── TEST SCREEN ───────────────────────────────────────────────────────────
  if(screen==="test"&&topic&&qs.length>0){
    const q=qs[curQ];const pct=(curQ/qs.length)*100;
    return(
      <div style={appStyle}>
        <Nav back={()=>setScreen("setup")} sub={topic.name}/>
        <div style={{maxWidth:680,margin:"0 auto",padding:"28px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{color:th.textDim,fontSize:13}}>Q {curQ+1} of {qs.length}</span>
            <span style={{color:topic.color,fontSize:13,fontWeight:600}}>{Math.round(pct)}%</span>
          </div>
          <div style={{background:th.elevated,borderRadius:4,height:3,marginBottom:22,overflow:"hidden"}}><div style={{background:`linear-gradient(90deg,${topic.color},${C.purple})`,height:"100%",width:`${pct}%`,transition:"width 0.4s",borderRadius:4}}/></div>
          <div style={cardStyle({marginBottom:14,borderColor:`${topic.color}25`})}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{background:`${topic.color}12`,color:topic.color,fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,letterSpacing:1}}>QUESTION {curQ+1}</div></div>
            <div style={{fontSize:16,lineHeight:1.7,color:th.text,margin:0,fontWeight:500}}><FormattedContent inline content={q.q} /></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {q.options.map((opt,i)=>(<button key={i} onClick={()=>setSel(i)} style={{background:sel===i?`${topic.color}12`:th.card,color:sel===i?th.text:th.textMid,border:`${sel===i?"2px":"1px"} solid ${sel===i?topic.color:th.border}`,borderRadius:12,padding:"13px 16px",textAlign:"left",cursor:"pointer",fontSize:13,lineHeight:1.4,transition:"all 0.15s",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"flex-start",gap:10,boxShadow:sel===i?`0 4px 14px ${topic.color}12`:"none"}}>
              <span style={{minWidth:22,height:22,borderRadius:6,background:sel===i?topic.color:th.elevated,color:sel===i?"#fff":th.textDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{["A","B","C","D"][i]}</span>
              <span><FormattedContent inline content={opt} /></span>
            </button>))}
          </div>
          {q.hint&&<div style={{marginBottom:14}}>
            <button onClick={()=>setHint(v=>!v)} style={{background:"transparent",color:C.warn,border:`1px solid ${C.warn}35`,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>💡 {hint?"Hide Hint":"Show Hint"}</button>
            {hint&&<div style={{marginTop:8,background:dark?"rgba(245,158,11,0.06)":"rgba(245,158,11,0.04)",border:`1px solid ${C.warn}20`,borderRadius:10,padding:"12px 16px"}}><span style={{color:C.warn,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:1}}>Hint </span><span style={{color:dark?"#FDE68A":"#92400E",fontSize:13,lineHeight:1.6}}><FormattedContent inline content={q.hint} /></span></div>}
          </div>}
          <button onClick={submitAns} disabled={sel===null} style={btnPri({width:"100%",padding:"14px",fontSize:14,borderRadius:12,opacity:sel===null?0.4:1,cursor:sel===null?"not-allowed":"pointer"})}>
            {curQ+1<qs.length?"Next Question →":"Submit & See Results 🎯"}
          </button>
        </div>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── RESULT SCREEN ─────────────────────────────────────────────────────────
  if(screen==="result"&&topic&&score!==null){
    const decay=getDecay(score,qs.length);const pct=Math.round((score/qs.length)*100);const h=history[topic.id]||[];
    const agentCards=[{l:"Observe",i:"👁️",d:`${qs.length} responses · ${topic.name}`,c:C.primary},{l:"Decide",i:"🧠",d:`Decay Level: ${decay.label} — ${pct}%`,c:C.purple},{l:"Act",i:"⚡",d:decay.action,c:C.warn},{l:"Verify",i:"✅",d:"Retake after revision to confirm improvement",c:C.success}];
    return(
      <div style={appStyle}>
        <Nav back={()=>setScreen("topics")} sub={`${topic.name} — Results`}/>
        <div style={{maxWidth:700,margin:"0 auto",padding:"28px 24px"}}>
          <div style={cardStyle({textAlign:"center",borderColor:`${decay.color}35`,marginBottom:14,padding:"28px 24px"})}>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:68,fontWeight:900,color:decay.color,lineHeight:1}}>{score}<span style={{fontSize:24,color:th.textDim,fontWeight:400}}>/{qs.length}</span></div>
            <div style={{color:decay.color,fontWeight:700,fontSize:18,marginTop:8}}>{decay.emoji} {decay.label}</div>
            <div style={{color:th.textDim,fontSize:13,marginTop:5}}>{pct}% · {topic.name}</div>
            {h.length>1&&<div style={{color:th.textFaint,fontSize:11,marginTop:6}}>Attempt {h.length} · Previous: {h.slice(0,-1).map(x=>`${x.score}/${x.total}`).join(", ")}</div>}
            <div style={{background:th.elevated,borderRadius:6,height:6,marginTop:16,overflow:"hidden",maxWidth:280,margin:"16px auto 0"}}><div style={{background:decay.color,height:"100%",width:`${pct}%`,borderRadius:6,transition:"width 1s ease"}}/></div>
          </div>
          <div style={cardStyle({marginBottom:14})}>
            <div style={{fontSize:10,color:th.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>🤖 Agentic AI Decision Loop</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {agentCards.map((step,i)=>(<div key={step.l} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px",borderRadius:10,background:agentStep>i?`${step.c}08`:th.elevated,border:`1px solid ${agentStep>i?step.c+"28":th.border}`,transition:"all 0.6s ease",opacity:agentStep>i?1:0.3}}>
                <span style={{fontSize:18}}>{step.i}</span>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:11,color:agentStep>i?step.c:th.textDim}}>{step.l}</div><div style={{fontSize:10,color:th.textDim,marginTop:1}}>{step.d}</div></div>
                {agentStep>i&&<div style={{width:18,height:18,borderRadius:"50%",background:step.c,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:700}}>✓</div>}
              </div>))}
            </div>
          </div>
          {/* Plan stale nudge — instant, no loading spinner */}
          <div style={cardStyle({borderColor:`${C.warn}25`,background:dark?"rgba(245,158,11,0.04)":"rgba(245,158,11,0.02)",marginBottom:14,padding:"12px 18px"})}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>📅</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:12,color:C.warn}}>Study Plan — Needs Refresh</div>
                <div style={{fontSize:11,color:th.textDim,marginTop:1}}>Open the Planner to regenerate your schedule based on this test result.</div>
              </div>
              <button onClick={()=>setScreen("planner")} style={{...btnGhost({padding:"7px 14px",fontSize:11}),color:C.warn,borderColor:`${C.warn}35`,whiteSpace:"nowrap",flexShrink:0}}>
                Update Plan →
              </button>
            </div>
          </div>
          <div style={cardStyle({borderColor:`${C.purple}20`,background:dark?"rgba(139,92,246,0.03)":"rgba(139,92,246,0.02)",marginBottom:14})}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><div style={{background:`${C.purple}15`,color:C.purple,fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20}}>🤖 AI STUDY COACH</div></div>
            {coachLoading?<div style={{color:`${C.purple}60`,fontSize:12,fontStyle:"italic"}}>Generating your personalized insight...</div>:<div style={{color:dark?"#C4B5FD":C.purple,fontSize:13,lineHeight:1.7,margin:0}}><FormattedContent content={coach} /></div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {decay.level!=="low"&&<button onClick={()=>setScreen("notes")} style={btnPri({background:`linear-gradient(135deg,${decay.level==="high"?C.danger:C.warn},${decay.level==="high"?"#DC2626":"#D97706"})`})}>{decay.level==="high"?"📖 Deep Revision Notes":"⚡ Quick Notes"}</button>}
            <button onClick={()=>startTest(topic,qCount)} style={btnPri()}>🔄 Retake Test</button>
            {decay.level==="low"&&<button onClick={()=>setScreen("topics")} style={btnPri({background:`linear-gradient(135deg,${C.success},#059669)`})}>→ Next Topic</button>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>setScreen("planner")} style={btnGhost({padding:"10px",fontSize:12,textAlign:"center",color:C.warn,borderColor:`${C.warn}35`})}>📅 View Updated Plan</button>
            <button onClick={()=>setScreen("graph")} style={btnGhost({padding:"10px",fontSize:12,textAlign:"center"})}>📈 Progress Graph</button>
          </div>
        </div>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── PROGRESS GRAPH ────────────────────────────────────────────────────────
  if(screen==="graph"){
    const topicsWithH=TOPICS.filter(t=>history[t.id]?.length>0);
    const selT=graphTopic||(topicsWithH[0]||null);
    const chartData=selT?(history[selT.id]||[]).map((e,i)=>({name:`A${e.attempt||i+1}`,score:e.pct})):[];
    const CustomTooltip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"10px 14px"}}><p style={{color:th.text,fontWeight:700,fontSize:12,marginBottom:4}}>{label}</p>{payload.map(p=>(<div key={p.dataKey} style={{fontSize:12,color:p.color,fontWeight:600}}>{p.value}%</div>))}</div>);};
    return(
      <div style={appStyle}>
        <Nav back={()=>setScreen("topics")} sub="Progress Graph"/>
        <div style={{maxWidth:880,margin:"0 auto",padding:"32px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28}}>
            <div><h1 style={{...heading(26),marginBottom:6}}>Your Progress</h1><p style={{color:th.textMid,fontSize:14}}>Track improvement and decay across all attempts</p></div>
            <button onClick={()=>setScreen("planner")} style={{...btnGhost({padding:"9px 16px",fontSize:12}),color:C.warn,borderColor:`${C.warn}35`}}>📅 View Study Plan</button>
          </div>
          {topicsWithH.length===0?(
            <div style={cardStyle({textAlign:"center",padding:"64px 32px"})}>
              <div style={{fontSize:44,marginBottom:14}}>📊</div>
              <h3 style={{...heading(18),marginBottom:8}}>No Attempts Yet</h3>
              <p style={{color:th.textMid,fontSize:14,marginBottom:20}}>Complete at least one topic test to see your progress graph</p>
              <button onClick={()=>setScreen("topics")} style={btnPri()}>Start Practicing →</button>
            </div>
          ):(
            <>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18}}>
                {topicsWithH.map(t=>(<button key={t.id} onClick={()=>setGraphTopic(t)} style={{background:(selT?.id===t.id)?`${t.color}12`:"transparent",color:(selT?.id===t.id)?t.color:th.textMid,border:`1px solid ${(selT?.id===t.id)?t.color:th.border}`,borderRadius:20,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t.icon} {t.name}</button>))}
              </div>
              {selT&&chartData.length>0&&(
                <div style={cardStyle({marginBottom:20})}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <h3 style={{...heading(15),color:th.text}}>{selT.icon} {selT.name} — Attempt History</h3>
                    <div style={{display:"flex",gap:14}}>
                      {[{label:"Best",value:`${Math.max(...chartData.map(d=>d.score))}%`,color:C.success},{label:"Latest",value:`${chartData[chartData.length-1]?.score}%`,color:selT.color},{label:"Attempts",value:chartData.length,color:th.textMid}].map(s=>(<div key={s.label} style={{textAlign:"center"}}><div style={{fontFamily:"'Outfit',sans-serif",fontSize:18,fontWeight:800,color:s.color}}>{s.value}</div><div style={{fontSize:10,color:th.textFaint,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div></div>))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData} margin={{top:10,right:24,left:0,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/>
                      <XAxis dataKey="name" tick={{fill:th.textDim,fontSize:12}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[0,100]} tick={{fill:th.textDim,fontSize:12}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                      <ReferenceLine y={75} stroke={C.success} strokeDasharray="4 4" label={{value:"Target 75%",fill:C.success,fontSize:10,position:"insideTopRight"}}/>
                      <ReferenceLine y={50} stroke={C.danger} strokeDasharray="4 4" label={{value:"Min 50%",fill:C.danger,fontSize:10,position:"insideTopRight"}}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Line type="monotone" dataKey="score" name="Score" stroke={selT.color} strokeWidth={3} dot={{fill:selT.color,r:6,strokeWidth:2,stroke:th.card}} activeDot={{r:8}} label={{position:"top",fill:selT.color,fontSize:11,fontWeight:700,formatter:v=>`${v}%`}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {topicsWithH.map(t=>{
                  const h=history[t.id]||[];const last=h[h.length-1];const best=Math.max(...h.map(x=>x.pct));const trend=h.length>1?h[h.length-1].pct-h[h.length-2].pct:null;
                  return(<div key={t.id} style={cardStyle({padding:"14px 16px",borderColor:`${t.color}15`})}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div><div style={{fontSize:11,color:th.textDim,fontWeight:600,marginBottom:2}}>{t.icon} {t.name}</div><div style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:800,color:t.color}}>{last.pct}%</div><div style={{fontSize:10,color:th.textDim,marginTop:1}}>{h.length} attempt{h.length>1?"s":""}</div></div>
                      {trend!==null&&<div style={{textAlign:"right"}}><div style={{fontSize:15,color:trend>0?C.success:trend<0?C.danger:th.textDim,fontWeight:700}}>{trend>0?"↑":trend<0?"↓":"→"}{Math.abs(trend)}%</div><div style={{fontSize:9,color:th.textFaint}}>vs prev</div></div>}
                    </div>
                    <div style={{background:th.elevated,borderRadius:4,height:3,marginTop:10,overflow:"hidden"}}><div style={{background:t.color,height:"100%",width:`${last.pct}%`,transition:"width 0.6s"}}/></div>
                    <div style={{fontSize:9,color:th.textFaint,marginTop:4,textAlign:"right"}}>Best: {best}%</div>
                  </div>);
                })}
              </div>
            </>
          )}
        </div>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  // ── NOTES SCREEN ──────────────────────────────────────────────────────────
  if(screen==="notes"&&topic){
    const FORMULA=`FORMULA & IS CODE CHEAT SHEET\n\nAbram's Law:           S = A / B^x\nGel-Space Ratio:       S = 260x³  [MPa]\nTarget Mean Strength:  fcm = fck + 1.65s\nModulus of Elasticity: Ec = 5000√fck  [MPa]\nModulus of Rupture:    fcr = 0.7√fck  [MPa]\nSplit Tensile:         fct = 2P/(πDL)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nIS 456:2000 EXPOSURE TABLE (RCC)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nExposure    | Grade | Max w/c | Cover\nMild        |  M20  |  0.55   | 20mm\nModerate    |  M25  |  0.50   | 30mm\nSevere      |  M30  |  0.45   | 45mm\nVery Severe |  M35  |  0.45   | 50mm\nExtreme     |  M40  |  0.40   | 75mm\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nWORKABILITY RANGES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDegree     | Slump  | CF   | Vee-Bee\nVery Low   | 0-25   | 0.78 | >20s\nLow        | 25-50  | 0.85 | 10-20s\nMedium     | 50-100 | 0.92 | 5-10s\nHigh       |100-150 | 0.95 | <5s\nVery High  | >150   |>0.95 | SCC\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTESTING REFERENCE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCube: 150×150×150mm | Loading: 14 MPa/min\nCylinder: 150mm dia × 300mm height\nCylinder str ≈ 0.8 × cube strength\nTensile str ≈ 10-15% of compressive\nCuring temp: 27±2°C\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBOGUE'S COMPOUNDS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nHEAT (low→high): C₂S < C₄AF < C₃S < C₃A\nC₃S  50-65%: Early + long-term strength\nC₂S  15-30%: Long-term strength only\nC₃A   5-12%: MAX heat, flash set risk\nC₄AF  5-15%: Grey color, kiln flux\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nIS 9103 ADMIXTURE TYPES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nA: Plasticizer (5-10% water reduction)\nB: Retarder\nC: Accelerator\nD: Plasticizer + Retarder\nE: Plasticizer + Accelerator\nF: Superplasticizer (20-30% reduction)\nG: Superplasticizer + Retarder`;
    return(
      <div style={appStyle}>
        <Nav back={()=>setScreen(score!==null?"result":"setup")} sub={`${topic.name} — Resources`}/>
        <div style={{maxWidth:720,margin:"0 auto",padding:"28px 24px"}}>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            {[["notes","📖 Revision Notes"],["formula","📐 Formula Sheet"]].map(([tab,label])=>(<button key={tab} onClick={()=>setNoteTab(tab)} style={{background:noteTab===tab?`linear-gradient(135deg,${C.primary},${C.purple})`:"transparent",color:noteTab===tab?"#fff":th.textMid,border:noteTab===tab?"none":`1px solid ${th.border}`,borderRadius:20,padding:"9px 18px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:noteTab===tab?`0 4px 14px ${C.primary}20`:"none"}}>{label}</button>))}
          </div>
          <div style={cardStyle({borderColor:`${noteTab==="notes"?C.purple:C.primary}15`})}>
            <div style={{color:noteTab==="notes"?C.purple:C.primary,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:1.5,marginBottom:14}}>
              {noteTab==="notes"?`Revision Notes — ${topic.name}`:"Formula & IS Code Cheat Sheet"}
            </div>
            <div style={{fontSize:13,color:th.text,lineHeight:1.85,fontFamily:"'DM Sans',system-ui,sans-serif",margin:0}}>
              <FormattedContent content={noteTab==="notes"?NOTES[topic.id]:FORMULA} />
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
            <button onClick={()=>startTest(topic,qCount)} style={btnPri()}>🔄 Take Test Now</button>
            <button onClick={()=>setScreen("topics")} style={btnGhost({textAlign:"center"})}>← All Topics</button>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <Chatbot dark={dark} user={user} activeContext={activeChatContext} />
      </div>
    );
  }

  return<div style={appStyle}><Nav/><div style={{padding:40,textAlign:"center",color:th.textDim}}>Loading...</div><Chatbot dark={dark} user={user} activeContext={activeChatContext} /></div>;
}
