import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import Chatbot from './components/Chatbot';

// Mock recharts ResponsiveContainer to avoid SVG measuring issues in jsdom
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div className="recharts-responsive-container">{children}</div>,
  };
});

// Mock window.scrollTo for jsdom
window.scrollTo = jest.fn();

describe('LearnLoop GATE Prep & Chatbot Integration', () => {
  test('renders LearnLoop brand and GATE year selection options', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /LearnLoop/i })).toBeInTheDocument();
    expect(screen.getByText(/INTELLIGENT CONCEPT/i)).toBeInTheDocument();
    expect(screen.getByText(/WHICH GATE ARE YOU TARGETING\?/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE 2027/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE 2028/i)).toBeInTheDocument();
  });

  test('requires selecting a GATE year before logging in', () => {
    render(<App />);
    const signInBtn = screen.getByRole('button', { name: /Sign In →/i });
    fireEvent.click(signInBtn);
    expect(screen.getByText(/Please select your GATE exam year to continue/i)).toBeInTheDocument();
  });

  test('allows selecting GATE year and logging in to display the dashboard', async () => {
    render(<App />);
    // Select GATE 2028
    const gate2028Btn = screen.getByText(/GATE 2028/i).closest('button');
    fireEvent.click(gate2028Btn);

    // Enter credentials
    const emailInput = screen.getByPlaceholderText(/student@iit\.ac\.in/i);
    const passInput = screen.getByPlaceholderText(/••••••••/i);

    fireEvent.change(emailInput, { target: { value: 'rahul@gate.ac.in' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });

    const signInBtn = screen.getByRole('button', { name: /Sign In →/i });
    fireEvent.click(signInBtn);

    // Should now be on dashboard
    await waitFor(() => {
      expect(screen.getByText(/Good/i)).toBeInTheDocument();
      expect(screen.getAllByText(/rahul/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Topics Attempted/i)).toBeInTheDocument();
    });

    // Chatbot launcher should be present on dashboard
    expect(screen.getByTestId('chat-launcher-btn')).toBeInTheDocument();
    expect(screen.getByText(/Ask AI Tutor/i)).toBeInTheDocument();
  });
});

describe('Chatbot Component Standalone Tests', () => {
  test('renders launcher button by default and opens chat panel on click', () => {
    render(<Chatbot dark={true} user={{ name: 'Rahul' }} />);
    const launcher = screen.getByTestId('chat-launcher-btn');
    expect(launcher).toBeInTheDocument();

    // Click to open panel
    fireEvent.click(launcher);

    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    expect(screen.getByText(/LearnLoop AI Tutor/i)).toBeInTheDocument();
    expect(screen.getAllByText(/GATE Civil Engineering Teacher/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Namaste Rahul!/i)).toBeInTheDocument();
  });

  test('displays suggested prompts and quick action chips', () => {
    render(<Chatbot dark={true} user={{ name: 'Student' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    // Check suggested prompt
    expect(screen.getByText(/Explain Abram's Law simply/i)).toBeInTheDocument();
    expect(screen.getByText(/Flash Set vs False Set/i)).toBeInTheDocument();

    // Check quick actions
    expect(screen.getByText(/💡 Explain Simply/i)).toBeInTheDocument();
    expect(screen.getByText(/🔍 Give Example/i)).toBeInTheDocument();
    expect(screen.getByText(/📐 Show Formula/i)).toBeInTheDocument();
    expect(screen.getByText(/🔢 Solve Step by Step/i)).toBeInTheDocument();
    expect(screen.getByText(/🎯 Quiz Me/i)).toBeInTheDocument();
  });

  test('disables send button when input is empty or whitespace', () => {
    render(<Chatbot dark={true} user={{ name: 'Student' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const sendBtn = screen.getByTestId('chat-send-btn');
    expect(sendBtn).toBeDisabled();

    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: '   ' } });
    expect(sendBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'What is Abram law?' } });
    expect(sendBtn).not.toBeDisabled();
  });

  test('displays active context pill when context is provided', () => {
    const context = {
      topicName: 'Water Cement Ratio',
      currentQuestion: {
        q: 'According to Abram\'s Law, strength of fully compacted concrete is inversely proportional to what?',
        options: ['Aggregate ratio', 'Water-cement ratio', 'Sand ratio', 'Water-sand ratio'],
        hint: 'Duff Abrams 1919'
      }
    };

    render(<Chatbot dark={true} user={{ name: 'Student' }} activeContext={context} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const pill = screen.getByTestId('chat-context-pill');
    expect(pill).toBeInTheDocument();
    expect(screen.getByText(/Test Question/i)).toBeInTheDocument();
  });

  test('can minimize and reopen chat without losing state', () => {
    render(<Chatbot dark={true} user={{ name: 'Student' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Draft query' } });

    // Minimize
    const closeBtn = screen.getByTestId('chat-close-btn');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();

    // Reopen
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toHaveValue('Draft query');
  });

  test('toggles confirmation dialog when clicking new chat reset', () => {
    render(<Chatbot dark={true} user={{ name: 'Student' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    // Trigger a message click from suggested chip
    const chip = screen.getByText(/Explain Abram's Law simply/i);
    fireEvent.click(chip);

    // Reset button
    const resetBtn = screen.getByTestId('chat-reset-btn');
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Start New Conversation\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Keep Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear & Restart/i)).toBeInTheDocument();

    // Cancel reset
    fireEvent.click(screen.getByText(/Keep Chat/i));
    expect(screen.queryByText(/Start New Conversation\?/i)).not.toBeInTheDocument();
  });
});

describe('LearnLoop AI Academy — Civil Engineering Pilot Course', () => {
  const mockUser = {
    id: 'usr_test_1',
    name: 'Rahul Sharma',
    email: 'rahul@gate.ac.in',
    preferredLanguage: 'English',
    explanationStyle: 'simple',
    gateYear: 2027
  };

  test('CourseOverview renders 6 modules with Core Civil Engineering curriculum and unified GATE CE & ES integration', () => {
    const CourseOverview = require('./components/academy/CourseOverview').default;
    render(
      <CourseOverview
        user={mockUser}
        dark={true}
        onSelectLesson={jest.fn()}
        onTakeAssessment={jest.fn()}
        onTakeFinalExam={jest.fn()}
        onViewCertificates={jest.fn()}
      />
    );

    expect(screen.getByText(/Water Supply, Sanitation and Environmental Engineering/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Core Civil Engineering Curriculum/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Unified GATE CE & GATE ES Integration/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE Civil Engineering \(CE — Section 6\)/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE Environmental Science & Engineering \(ES\)/i)).toBeInTheDocument();
    expect(screen.getByText(/42 Planned Core Hours/i)).toBeInTheDocument();

    // Verify all 6 units are present
    expect(screen.getByText(/Basics of Water Supply Engineering/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Water Treatment Units/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Water Distribution and Advancement in System/i)).toBeInTheDocument();
    expect(screen.getByText(/Characterization and Collection of Sewage/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary and Secondary Wastewater Treatment/i)).toBeInTheDocument();
    expect(screen.getByText(/Tertiary Wastewater Treatment/i)).toBeInTheDocument();
  });

  test('LessonPlayer renders lesson content, contextual GATE CE highlights, preserved GATE ES notes, multilingual bar, and understanding check section', () => {
    const LessonPlayer = require('./components/academy/LessonPlayer').default;
    render(
      <LessonPlayer
        user={mockUser}
        dark={true}
        initialModuleId="mod-2"
        initialLessonId="les-2-1"
        onBackToCourse={jest.fn()}
        onOpenAssessment={jest.fn()}
      />
    );

    // Verify lesson title and learning objectives
    expect(screen.getAllByText(/Treatment Flowsheet, Screening & Aeration/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Learning Objectives/i)).toBeInTheDocument();

    // Contextual GATE CE and preserved GATE ES annotations
    expect(screen.getByText(/Important for GATE CE/i)).toBeInTheDocument();
    expect(screen.getByText(/Gas Transfer Kinetics & Aeration Principles/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE ES Reference/i)).toBeInTheDocument();
    expect(screen.getByText(/Dissolved Gas Equilibria & Atmospheric Reaeration/i)).toBeInTheDocument();

    // Multilingual bar
    expect(screen.getByText(/Explain in My Language/i)).toBeInTheDocument();
    expect(screen.getAllByText(/English/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/हिन्दी/i)).toBeInTheDocument();
    expect(screen.getByText(/मराठी/i)).toBeInTheDocument();
    expect(screen.getByText(/Manipuri/i)).toBeInTheDocument();

    // Signature Feature: Conceptual Understanding Check
    expect(screen.getByText(/SIGNATURE LEARNING CHECK/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Explanation for AI Feedback/i })).toBeInTheDocument();
  });

  test('LessonPlayer navigates smoothly with Next and Previous buttons without throwing error', () => {
    const LessonPlayer = require('./components/academy/LessonPlayer').default;
    const onNavigateMock = jest.fn();
    render(
      <LessonPlayer
        user={mockUser}
        dark={true}
        initialModuleId="mod-2"
        initialLessonId="les-2-1"
        onNavigateLesson={onNavigateMock}
        onBackToCourse={jest.fn()}
      />
    );

    // Initial lesson title
    expect(screen.getAllByText(/Treatment Flowsheet, Screening & Aeration/i).length).toBeGreaterThanOrEqual(1);

    // Click Next button: Coagulation & Flocculation Chemistry & Design
    const nextBtn = screen.getByRole('button', { name: /Next: Coagulation & Flocculation Chemistry & Design/i });
    expect(nextBtn).toBeInTheDocument();
    fireEvent.click(nextBtn);

    // Verified callback was called with the next lesson object
    expect(onNavigateMock).toHaveBeenCalledTimes(1);
    expect(onNavigateMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'les-2-2' }));

    // Now verified the rendered lesson updated to lesson 2
    expect(screen.getAllByText(/Coagulation & Flocculation Chemistry & Design/i).length).toBeGreaterThanOrEqual(1);

    // Now Click Previous button to return to lesson 1
    const prevBtn = screen.getByRole('button', { name: /Previous:.*Treatment Flowsheet/i });
    expect(prevBtn).toBeInTheDocument();
    fireEvent.click(prevBtn);

    expect(onNavigateMock).toHaveBeenCalledTimes(2);
    expect(onNavigateMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'les-2-1' }));
    expect(screen.getAllByText(/Treatment Flowsheet, Screening & Aeration/i).length).toBeGreaterThanOrEqual(1);
  });

  test('LessonPlayer handles Next navigation safely even when onNavigateLesson callback is omitted', () => {
    const LessonPlayer = require('./components/academy/LessonPlayer').default;
    render(
      <LessonPlayer
        user={mockUser}
        dark={true}
        initialModuleId="mod-2"
        initialLessonId="les-2-1"
        // onNavigateLesson is intentionally omitted
        onBackToCourse={jest.fn()}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /Next: Coagulation & Flocculation Chemistry & Design/i });
    expect(nextBtn).toBeInTheDocument();
    // Must not throw TypeError: onNavigateLesson is not a function
    expect(() => fireEvent.click(nextBtn)).not.toThrow();

    // Internal state updates and displays Lesson 2
    expect(screen.getAllByText(/Coagulation & Flocculation Chemistry & Design/i).length).toBeGreaterThanOrEqual(1);
  });

  test('LessonPlayer safely handles first lesson (no previous) and last lesson (return to course)', () => {
    const LessonPlayer = require('./components/academy/LessonPlayer').default;
    const backMock = jest.fn();
    const { unmount } = render(
      <LessonPlayer
        user={mockUser}
        dark={true}
        initialModuleId="mod-1"
        initialLessonId="les-1-1"
        onBackToCourse={backMock}
      />
    );

    // First lesson: no Previous button should be rendered
    expect(screen.queryByRole('button', { name: /Previous:/i })).toBeNull();
    unmount();

    // Last lesson: les-6-1 (Anaerobic Sludge Digestion & Biogas Recovery)
    render(
      <LessonPlayer
        user={mockUser}
        dark={true}
        initialModuleId="mod-6"
        initialLessonId="les-6-1"
        onBackToCourse={backMock}
      />
    );

    // Next button should be replaced by "Return to Course Modules ✓"
    expect(screen.queryByRole('button', { name: /Next:/i })).toBeNull();
    const returnBtn = screen.getByRole('button', { name: /Return to Course Modules ✓/i });
    expect(returnBtn).toBeInTheDocument();
    fireEvent.click(returnBtn);
    expect(backMock).toHaveBeenCalledTimes(1);
  });

  test('CertificateView verifies valid certificate IDs and exposes public verification tool', () => {
    const CertificateView = require('./components/academy/CertificateView').default;
    render(
      <CertificateView
        user={mockUser}
        dark={true}
        onNavigateBack={jest.fn()}
      />
    );

    expect(screen.getByText(/Course Completion Certificates/i)).toBeInTheDocument();
    expect(screen.getByText(/Public Credential Verification/i)).toBeInTheDocument();

    const verifyInput = screen.getByPlaceholderText(/LL-2027-WSE-/i);
    const verifyBtn = screen.getByRole('button', { name: /Verify Authenticity/i });

    expect(verifyInput).toBeInTheDocument();
    expect(verifyBtn).toBeInTheDocument();

    // Test verifying demo certificate
    fireEvent.change(verifyInput, { target: { value: 'LL-2027-WSE-849201' } });
    fireEvent.click(verifyBtn);

    expect(screen.getByText(/Verified Official LearnLoop Credential/i)).toBeInTheDocument();
    expect(screen.getByText(/Certified Civil Engineering Scholar/i)).toBeInTheDocument();
  });

  test('DashboardView renders without runtime errors for new guest users with no saved progress', () => {
    const DashboardView = require('./components/academy/DashboardView').default;
    render(
      <DashboardView
        user={null}
        dark={true}
        onOpenLesson={jest.fn()}
        onOpenAssessment={jest.fn()}
        onOpenFinalExam={jest.fn()}
        onOpenCertificates={jest.fn()}
        onSwitchTab={jest.fn()}
      />
    );

    expect(screen.getByText(/Welcome back, Civil Engineering Student/i)).toBeInTheDocument();
    expect(screen.getByText(/Curriculum Progression \(42 Planned Hours\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Civil Engineering Certificate/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE Practice & Question Bank/i)).toBeInTheDocument();
  });

  test('DashboardView renders correctly for user with existing progress and checklist items', () => {
    const DashboardView = require('./components/academy/DashboardView').default;
    const progressService = require('./services/progressService');
    const testUser = { id: 'test-student-42', name: 'Aarav Sharma' };

    // Set up mock progress
    progressService.markLessonCompleted(testUser.id, 'water-sanitation-env-eng', 'les-2-1');
    progressService.recordModuleAssessment(testUser.id, 'water-sanitation-env-eng', 'mod-2', 5, 5);

    render(
      <DashboardView
        user={testUser}
        dark={false}
        onOpenLesson={jest.fn()}
        onOpenAssessment={jest.fn()}
        onOpenFinalExam={jest.fn()}
        onOpenCertificates={jest.fn()}
        onSwitchTab={jest.fn()}
      />
    );

    expect(screen.getByText(/Welcome back, Aarav Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Module 2 Lessons Completed/i)).toBeInTheDocument();
  });
});

describe('Mathematical and Formatted Content Rendering Engine', () => {
  const MathRenderer = require('./components/common/MathRenderer').default;
  const FormattedContent = require('./components/common/FormattedContent').default;

  test('MathRenderer renders mathematical fractions, square roots, and Greek symbols', () => {
    const { container } = render(
      <MathRenderer math="G = \\sqrt{\\frac{P}{\\mu \\cdot V}}" block={true} />
    );

    expect(container.querySelector('.math-block-container')).toBeInTheDocument();
    expect(container.querySelector('.math-sqrt')).toBeInTheDocument();
    expect(container.querySelector('.math-frac')).toBeInTheDocument();
    expect(container.querySelector('.math-num')).toHaveTextContent('P');
    expect(container.querySelector('.math-symbol')).toHaveTextContent('μ');
  });

  test('MathRenderer renders subscripts and superscripts accurately', () => {
    const { container } = render(
      <MathRenderer math="v_s = \\frac{g (\\rho_s - \\rho) d^2}{18\\mu}" block={false} />
    );

    expect(container.querySelector('.math-inline')).toBeInTheDocument();
    expect(container.querySelector('.math-sub')).toHaveTextContent('s');
    expect(container.querySelector('.math-sup')).toHaveTextContent('2');
  });

  test('FormattedContent renders markdown headings, lists, bold text, and responsive tables', () => {
    const sampleMarkdown = `### Rapid Sand Filtration
- Effective size $d_{10} = 0.45\\text{ mm}$
- Uniformity coefficient $C_u = \\frac{d_{60}}{d_{10}} \\le 1.65$

| Parameter | Rapid Sand Filter | Slow Sand Filter |
| Rate of filtration | 3000 to 6000 L/m2/h | 100 to 200 L/m2/h |
| Sand effective size | 0.45 to 0.70 mm | 0.20 to 0.35 mm |`;

    const { container } = render(<FormattedContent content={sampleMarkdown} />);

    // Check heading
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/Rapid Sand Filtration/i);

    // Check list
    expect(container.querySelector('.ll-prose-list')).toBeInTheDocument();

    // Check responsive table wrapper
    expect(container.querySelector('.ll-table-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.ll-table')).toBeInTheDocument();
    expect(screen.getByText(/Rapid Sand Filter/i)).toBeInTheDocument();
    expect(screen.getByText(/Slow Sand Filter/i)).toBeInTheDocument();
  });

  test('FormattedContent safely handles inline math and chemical subscripts without raw HTML injection', () => {
    const textWithChemicals = "Aeration oxidizes soluble Fe2+ and strips foul gases like H2S and excess CO2.";
    const { container } = render(<FormattedContent content={textWithChemicals} />);

    expect(container.querySelectorAll('.ll-chem-formula').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Aeration oxidizes soluble/i)).toBeInTheDocument();
  });

  test('ProcessFlowDiagram renders all 9 municipal surface water treatment stages with badges and connectors', () => {
    const stages = [
      'Raw Water Intake',
      'Coarse/Fine Screening',
      'Aeration',
      'Coagulation (Rapid Mixing)',
      'Flocculation',
      'Sedimentation (Clarifier)',
      'Rapid Sand Filtration',
      'Disinfection (Chlorination)',
      'Clear Water Sump'
    ];

    const { container } = render(<FormattedContent content={`\`\`\`process-flow\n${stages.join(' -> ')}\n\`\`\``} />);

    expect(container.querySelector('.ll-process-flow-container')).toBeInTheDocument();
    const stepElements = container.querySelectorAll('.ll-process-step');
    expect(stepElements.length).toBe(9);

    // Verify all 9 stages are present and visible
    stages.forEach((stageName, idx) => {
      expect(screen.getByText(stageName)).toBeInTheDocument();
      expect(stepElements[idx].querySelector('.ll-process-step-badge')).toHaveTextContent(String(idx + 1));
    });

    // Verify connectors between stages (8 connectors for 9 steps)
    const connectors = container.querySelectorAll('.ll-process-connector');
    expect(connectors.length).toBe(8);
  });

  test('FormattedContent automatically converts multi-stage LaTeX to responsive ProcessFlowDiagram', () => {
    const legacyLatex = `$$\\text{Raw Water Intake} \\to \\text{Coarse/Fine Screens} \\to \\text{Aeration} \\to \\text{Coagulation} \\to \\text{Flocculation} \\to \\text{Sedimentation} \\to \\text{Filtration} \\to \\text{Disinfection} \\to \\text{Clear Water Sump}$$`;
    const { container } = render(<FormattedContent content={legacyLatex} />);

    expect(container.querySelector('.ll-process-flow-container')).toBeInTheDocument();
    expect(screen.getByText('Raw Water Intake')).toBeInTheDocument();
    expect(screen.getByText('Clear Water Sump')).toBeInTheDocument();
  });

  test('MathRenderer renders \\implies, \\cdots, \\quad, and labeled \\xrightarrow without raw text leakage', () => {
    const { container } = render(
      <MathRenderer math="A \\implies B \\quad \\cdots \\quad C \\xrightarrow{\\text{Biomass}} D" block={true} />
    );

    expect(container.querySelector('.math-block-container')).toBeInTheDocument();
    const text = container.textContent;
    expect(text).toContain('⟹');
    expect(text).toContain('···');
    expect(text).toContain('→');
    expect(text).not.toContain('\\implies');
    expect(text).not.toContain('\\cdots');
    expect(text).not.toContain('\\xrightarrow');
  });
});

describe('Civil Engineering Course Catalogue & Demo Course Showcase', () => {
  const mockUser = {
    id: 'usr_test_cat_1',
    name: 'Ananya Roy',
    email: 'ananya@gate.ac.in',
    preferredLanguage: 'English',
    explanationStyle: 'simple',
    gateYear: 2027
  };

  test('CourseCatalogueView renders all 10 showcase courses and key statistics', () => {
    const CourseCatalogueView = require('./components/academy/CourseCatalogueView').default;
    const { civilEngineeringCatalogue } = require('./data/courses/coursesCatalogueData');

    render(
      <CourseCatalogueView
        courses={civilEngineeringCatalogue}
        user={mockUser}
        dark={true}
        onSelectCourse={jest.fn()}
      />
    );

    // Verify Title & Statistics
    expect(screen.getByText(/Civil Engineering Academic Catalogue/i)).toBeInTheDocument();
    expect(screen.getByText(/417/i)).toBeInTheDocument();
    expect(screen.getByText(/52/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Active Pilot/i)).toBeInTheDocument();

    // Verify all 10 subjects are displayed as headings
    expect(screen.getByRole('heading', { name: /Water Supply, Sanitation and Environmental Engineering/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Structural Analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Reinforced Concrete and Steel Design/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Geotechnical Engineering/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Fluid Mechanics and Hydraulics/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Transportation Engineering/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Surveying and Geomatics/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hydrology and Irrigation Engineering/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Construction Planning and Management/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Engineering Mathematics for GATE CE/i })).toBeInTheDocument();

    // Verify demo badges vs active pilot badges
    expect(screen.getAllByText(/Active Pilot/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Demo Course/i).length).toBe(9);
  });

  test('Category filtering narrows courses accurately', () => {
    const CourseCatalogueView = require('./components/academy/CourseCatalogueView').default;
    const { civilEngineeringCatalogue } = require('./data/courses/coursesCatalogueData');

    render(
      <CourseCatalogueView
        courses={civilEngineeringCatalogue}
        user={mockUser}
        dark={true}
        onSelectCourse={jest.fn()}
      />
    );

    // Filter to Structural Engineering
    const structuralBtn = screen.getByRole('button', { name: /^Structural Engineering$/i });
    fireEvent.click(structuralBtn);

    expect(screen.getByRole('heading', { name: /Structural Analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Reinforced Concrete and Steel Design/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Fluid Mechanics and Hydraulics/i })).not.toBeInTheDocument();
  });

  test('Search input filters courses by code and keywords', () => {
    const CourseCatalogueView = require('./components/academy/CourseCatalogueView').default;
    const { civilEngineeringCatalogue } = require('./data/courses/coursesCatalogueData');

    render(
      <CourseCatalogueView
        courses={civilEngineeringCatalogue}
        user={mockUser}
        dark={true}
        onSelectCourse={jest.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search courses by title, course code/i);
    fireEvent.change(searchInput, { target: { value: 'CE-GEO-204' } });

    expect(screen.getByRole('heading', { name: /Geotechnical Engineering/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Structural Analysis/i })).not.toBeInTheDocument();
  });

  test('CourseOverview in demo mode displays curriculum outcomes, preview banner, and sample quiz preview', () => {
    const CourseOverview = require('./components/academy/CourseOverview').default;
    const { getCourseById } = require('./data/courses/coursesCatalogueData');
    const demoCourse = getCourseById('structural-analysis');

    render(
      <CourseOverview
        course={demoCourse}
        user={mockUser}
        dark={true}
        onBackToCatalogue={jest.fn()}
        onSelectCourse={jest.fn()}
      />
    );

    // Check back button & preview notices
    expect(screen.getByText(/Back to Civil Engineering Catalogue/i)).toBeInTheDocument();
    expect(screen.getByText(/Demonstration & Curriculum Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Curriculum Preview Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Course Learning Outcomes \(CLOs\)/i)).toBeInTheDocument();

    // Check Sample Quiz preview button
    const previewQuizBtn = screen.getByRole('button', { name: /Preview Sample GATE Quiz/i });
    expect(previewQuizBtn).toBeInTheDocument();
    fireEvent.click(previewQuizBtn);

    // Verify quiz question and GATE insight
    expect(screen.getByText(/Conceptual Question 1 of/i)).toBeInTheDocument();
    expect(screen.getByText(/GATE Civil Engineering Insight:/i)).toBeInTheDocument();
  });
});



