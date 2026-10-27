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

describe('Visual Learning Mode for Unit 2 (Water Treatment Units)', () => {
  const VisualLearningSection = require('./components/academy/VisualLearningSection').default;

  test('VisualLearningSection renders process diagram, tabs, and topic title for les-2-1', () => {
    render(
      <VisualLearningSection
        lessonId="les-2-1"
        lessonTitle="Treatment Flowsheet, Screening & Aeration"
        dark={true}
      />
    );

    // Header & Section Elements
    expect(screen.getByTestId('visual-learning-section')).toBeInTheDocument();
    expect(screen.getByText(/Visual Learning Mode/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Municipal Water Treatment Flowsheet & Cascade Aerator/i })).toBeInTheDocument();

    // Tab buttons
    expect(screen.getByRole('tab', { name: /Process Diagram/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Step-by-Step Breakdown/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Engineering Graph/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Worked Calculation/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Explore Further/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI Concept Visualizer/i })).toBeInTheDocument();

    // Default tab is Diagram: SVG role img should be present
    expect(screen.getByRole('img', { name: /Municipal Water Treatment and Cascade Aerator/i })).toBeInTheDocument();
  });

  test('Step-by-step breakdown toggles between Simple and Technical explanations', () => {
    render(
      <VisualLearningSection
        lessonId="les-2-2"
        lessonTitle="Coagulation & Flocculation Chemistry & Design"
        dark={true}
      />
    );

    // Switch to Step-by-Step tab
    fireEvent.click(screen.getByRole('tab', { name: /Step-by-Step Breakdown/i }));

    // Both should be visible initially (Side-by-side mode)
    expect(screen.getByText(/Simple Language & Physical Intuition/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Civil Engineering Specification/i)).toBeInTheDocument();
    expect(screen.getByText(/Flash Coagulant Dispersion/i)).toBeInTheDocument();

    // Click Simple Language only
    fireEvent.click(screen.getByRole('button', { name: /Simple Language/i }));
    expect(screen.getByText(/Simple Language & Physical Intuition/i)).toBeInTheDocument();
    expect(screen.queryByText(/Technical Civil Engineering Specification/i)).not.toBeInTheDocument();

    // Click Technical only
    fireEvent.click(screen.getByRole('button', { name: /^Technical Engineering$/i }));
    expect(screen.queryByText(/Simple Language & Physical Intuition/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Technical Civil Engineering Specification/i)).toBeInTheDocument();
  });

  test('Engineering Graph tab renders Recharts container and key GATE CE takeaway', () => {
    render(
      <VisualLearningSection
        lessonId="les-2-3"
        lessonTitle="Sedimentation Basin & Clariflocculator Design"
        dark={true}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: /Engineering Graph/i }));

    expect(screen.getByRole('heading', { name: /Particle Settling Velocity & Removal Efficiency/i })).toBeInTheDocument();
    expect(screen.getByText(/Key GATE CE Takeaway:/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineering Interpretation:/i)).toBeInTheDocument();
  });

  test('Worked Calculation tab renders problem statement, given data, and final answer', () => {
    render(
      <VisualLearningSection
        lessonId="les-2-4"
        lessonTitle="Filtration: Rapid & Slow Sand Hydraulics"
        dark={true}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: /Worked Calculation/i }));

    expect(screen.getByText(/Expanded Bed Depth Calculation during Backwashing/i)).toBeInTheDocument();
    expect(screen.getByText(/Problem Statement:/i)).toBeInTheDocument();
    expect(screen.getByText(/GIVEN DATA \(WITH UNITS\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Expanded Bed Depth L_exp = 1.27 m/i)).toBeInTheDocument();
  });

  test('Explore Further tab contains valid, safe Google and YouTube external links', () => {
    render(
      <VisualLearningSection
        lessonId="les-2-5"
        lessonTitle="Disinfection Kinetics & Breakpoint Chlorination"
        dark={true}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: /Explore Further/i }));

    const googleLink = screen.getByRole('link', { name: /Search on Google/i });
    expect(googleLink).toBeInTheDocument();
    expect(googleLink).toHaveAttribute('target', '_blank');
    expect(googleLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(googleLink.getAttribute('href')).toContain('https://www.google.com/search?q=');
    expect(googleLink.getAttribute('href')).toContain('breakpoint');

    const youtubeLink = screen.getByRole('link', { name: /Watch Videos on YouTube/i });
    expect(youtubeLink).toBeInTheDocument();
    expect(youtubeLink).toHaveAttribute('target', '_blank');
    expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(youtubeLink.getAttribute('href')).toContain('https://www.youtube.com/results?search_query=');
  });

  test('Safely returns null when no visual data is available for a lesson', () => {
    const { container } = render(
      <VisualLearningSection
        lessonId="non-existent-lesson-id"
        lessonTitle="Unknown Topic"
        dark={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('Collapses and expands visual section on header click', () => {
    render(
      <VisualLearningSection
        lessonId="les-2-1"
        lessonTitle="Treatment Flowsheet, Screening & Aeration"
        dark={true}
      />
    );

    // Initial state: expanded
    expect(screen.getByRole('tab', { name: /Process Diagram/i })).toBeInTheDocument();

    // Click collapse button
    fireEvent.click(screen.getByRole('button', { name: /Collapse/i }));

    // Tabs should be hidden while header stays
    expect(screen.queryByRole('tab', { name: /Process Diagram/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Expand Visuals/i)).toBeInTheDocument();

    // Click expand again
    fireEvent.click(screen.getByText(/Expand Visuals/i));
    expect(screen.getByRole('tab', { name: /Process Diagram/i })).toBeInTheDocument();
  });

  test('AI Concept Visualizer displays action button and engineering disclaimer', () => {
    render(
      <VisualLearningSection
        lessonId="les-2-6"
        lessonTitle="Water Softening & Advanced Membrane Treatment"
        dark={true}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: /AI Concept Visualizer/i }));

    expect(screen.getByRole('button', { name: /Generate Concept Image/i })).toBeInTheDocument();
    expect(screen.getByText(/Pedagogical Visualization Notice:/i)).toBeInTheDocument();
    expect(screen.getByText(/constitute verified civil engineering designs/i)).toBeInTheDocument();
  });
});

describe('AI Tutor Image Question Upload & Validation Suite', () => {
  const { validateImageFile } = require('./utils/imageUtils');
  const imageUtils = require('./utils/imageUtils');

  test('validateImageFile accepts valid PNG, JPEG, and WebP files under 2 MB', () => {
    const validPng = new File(['fake-png-data'], 'question.png', { type: 'image/png' });
    Object.defineProperty(validPng, 'size', { value: 1024 * 500 }); // 500 KB

    const validJpg = new File(['fake-jpg-data'], 'diagram.jpg', { type: 'image/jpeg' });
    Object.defineProperty(validJpg, 'size', { value: 1024 * 1024 }); // 1 MB

    const validWebp = new File(['fake-webp-data'], 'formula.webp', { type: 'image/webp' });
    Object.defineProperty(validWebp, 'size', { value: 1024 * 200 }); // 200 KB

    expect(validateImageFile(validPng)).toBeNull();
    expect(validateImageFile(validJpg)).toBeNull();
    expect(validateImageFile(validWebp)).toBeNull();
  });

  test('validateImageFile rejects unsupported file formats with helpful message', () => {
    const gifFile = new File(['fake-gif'], 'animation.gif', { type: 'image/gif' });
    const pdfFile = new File(['fake-pdf'], 'notes.pdf', { type: 'application/pdf' });
    const txtFile = new File(['hello'], 'question.txt', { type: 'text/plain' });

    expect(validateImageFile(gifFile)).toMatch(/Unsupported image format/i);
    expect(validateImageFile(pdfFile)).toMatch(/Unsupported image format/i);
    expect(validateImageFile(txtFile)).toMatch(/Unsupported image format/i);
  });

  test('validateImageFile rejects oversized files exceeding 10 MB', () => {
    const largeFile = new File(['oversized'], 'large-scan.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 12 * 1024 * 1024 }); // 12 MB

    const result = validateImageFile(largeFile);
    expect(result).toMatch(/exceeds the 10 MB limit/i);
  });

  test('validateImageFile rejects empty 0-byte files', () => {
    const emptyFile = new File([], 'empty.png', { type: 'image/png' });
    Object.defineProperty(emptyFile, 'size', { value: 0 });

    const result = validateImageFile(emptyFile);
    expect(result).toMatch(/selected image file is empty/i);
  });

  test('Chatbot renders paperclip attach button and hidden file input with correct accept types', () => {
    render(<Chatbot dark={true} user={{ name: 'Priya' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const attachBtn = screen.getByTestId('chat-attach-btn');
    expect(attachBtn).toBeInTheDocument();
    expect(attachBtn).toHaveAttribute('aria-label', 'Attach question image');

    const fileInput = screen.getByTestId('chat-file-input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/png,image/jpeg,image/webp');
  });

  test('selecting an image displays preview and enables send button for image-only question', async () => {
    // Mock processImageForUpload to resolve with sample processed image
    jest.spyOn(imageUtils, 'processImageForUpload').mockResolvedValueOnce({
      dataUrl: 'data:image/jpeg;base64,samplebase64data',
      mimeType: 'image/jpeg',
      base64Data: 'samplebase64data',
      originalName: 'reinforcement_detail.jpg',
      width: 1200,
      height: 900,
      sizeBytes: 150000
    });

    render(<Chatbot dark={true} user={{ name: 'Priya' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const sendBtn = screen.getByTestId('chat-send-btn');
    const input = screen.getByTestId('chat-input');
    expect(sendBtn).toBeDisabled();

    // Select file
    const fileInput = screen.getByTestId('chat-file-input');
    const sampleFile = new File(['dummy'], 'reinforcement_detail.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [sampleFile] } });

    await waitFor(() => {
      expect(screen.getByTestId('chat-image-preview')).toBeInTheDocument();
      expect(screen.getByText('reinforcement_detail.jpg')).toBeInTheDocument();
      expect(screen.getByText(/1200×900px/i)).toBeInTheDocument();
    });

    // Send button should now be enabled even though input text is empty!
    expect(input.value).toBe('');
    expect(sendBtn).not.toBeDisabled();

    // Clicking remove button should clear preview and disable send button
    const removeBtn = screen.getByTestId('chat-image-remove-btn');
    fireEvent.click(removeBtn);

    expect(screen.queryByTestId('chat-image-preview')).not.toBeInTheDocument();
    expect(sendBtn).toBeDisabled();

    imageUtils.processImageForUpload.mockRestore();
  });

  test('displays error banner when an invalid file is selected', async () => {
    jest.spyOn(imageUtils, 'processImageForUpload').mockRejectedValueOnce(
      new Error('Unsupported image format. Please upload a PNG, JPEG/JPG, or WebP image.')
    );

    render(<Chatbot dark={true} user={{ name: 'Priya' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const fileInput = screen.getByTestId('chat-file-input');
    const invalidFile = new File(['dummy'], 'document.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Unsupported image format/i)).toBeInTheDocument();
    });

    imageUtils.processImageForUpload.mockRestore();
  });

  test('displays continue solution button when tutor response is marked as truncated', async () => {
    const chatService = require('./services/chatService');
    jest.spyOn(chatService, 'sendChatMessage').mockResolvedValueOnce({
      reply: '### Step 1: Given Data\nPopulation = 50,000\n(Truncated)',
      model: 'gemini-3.5-flash-lite',
      finishReason: 'MAX_TOKENS',
      isTruncated: true
    });

    render(<Chatbot dark={true} user={{ name: 'Priya' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const input = screen.getByTestId('chat-input');
    const sendBtn = screen.getByTestId('chat-send-btn');

    fireEvent.change(input, { target: { value: 'Design slow sand filter beds' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByTestId('chat-continue-btn')).toBeInTheDocument();
      expect(screen.getByText(/▶ Continue Solution/i)).toBeInTheDocument();
    });

    chatService.sendChatMessage.mockRestore();
  });
});

describe('Chatbot Display Modes (Normal, Expanded, Full-Screen)', () => {
  test('defaults to normal floating mode without backdrop or mode badge', () => {
    render(<Chatbot dark={true} user={{ name: 'Engineer' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const panel = screen.getByTestId('chat-panel');
    expect(panel).toHaveClass('mode-normal');
    expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-mode-badge')).not.toBeInTheDocument();

    const expandBtn = screen.getByTestId('chat-expand-btn');
    const fullscreenBtn = screen.getByTestId('chat-fullscreen-btn');
    expect(expandBtn).toHaveAttribute('title', expect.stringMatching(/expand/i));
    expect(fullscreenBtn).toHaveAttribute('title', expect.stringMatching(/full-screen/i));
  });

  test('toggles to expanded mode, displays backdrop, and restores to normal mode', () => {
    render(<Chatbot dark={true} user={{ name: 'Engineer' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const panel = screen.getByTestId('chat-panel');
    const expandBtn = screen.getByTestId('chat-expand-btn');

    // Click Expand
    fireEvent.click(expandBtn);
    expect(panel).toHaveClass('mode-expanded');
    expect(screen.getByTestId('chat-backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('chat-mode-badge')).toHaveTextContent(/expanded/i);
    expect(expandBtn).toHaveAttribute('title', expect.stringMatching(/restore/i));

    // Click Expand again to restore normal mode
    fireEvent.click(expandBtn);
    expect(panel).toHaveClass('mode-normal');
    expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-mode-badge')).not.toBeInTheDocument();
  });

  test('restores normal mode when clicking on the expanded mode backdrop', () => {
    render(<Chatbot dark={true} user={{ name: 'Engineer' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const panel = screen.getByTestId('chat-panel');
    const expandBtn = screen.getByTestId('chat-expand-btn');

    fireEvent.click(expandBtn);
    expect(panel).toHaveClass('mode-expanded');

    const backdrop = screen.getByTestId('chat-backdrop');
    fireEvent.click(backdrop);

    expect(panel).toHaveClass('mode-normal');
    expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument();
  });

  test('toggles to full-screen mode and steps down cleanly with Escape key', () => {
    render(<Chatbot dark={true} user={{ name: 'Engineer' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const panel = screen.getByTestId('chat-panel');
    const fullscreenBtn = screen.getByTestId('chat-fullscreen-btn');

    // Enter Fullscreen
    fireEvent.click(fullscreenBtn);
    expect(panel).toHaveClass('mode-fullscreen');
    expect(screen.getByTestId('chat-mode-badge')).toHaveTextContent(/full screen/i);
    expect(fullscreenBtn).toHaveAttribute('title', expect.stringMatching(/exit/i));

    // Press Escape -> steps down to expanded
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(panel).toHaveClass('mode-expanded');
    expect(screen.getByTestId('chat-mode-badge')).toHaveTextContent(/expanded/i);

    // Press Escape again -> steps down to normal
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(panel).toHaveClass('mode-normal');
    expect(screen.queryByTestId('chat-mode-badge')).not.toBeInTheDocument();
  });

  test('preserves user input text and chat state across display mode switches', () => {
    render(<Chatbot dark={true} user={{ name: 'Engineer' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Design 6 slow sand filter beds' } });

    const expandBtn = screen.getByTestId('chat-expand-btn');
    const fullscreenBtn = screen.getByTestId('chat-fullscreen-btn');

    // Switch to expanded
    fireEvent.click(expandBtn);
    expect(input.value).toBe('Design 6 slow sand filter beds');

    // Switch to fullscreen
    fireEvent.click(fullscreenBtn);
    expect(input.value).toBe('Design 6 slow sand filter beds');

    // Restore to normal
    fireEvent.click(fullscreenBtn);
    expect(input.value).toBe('Design 6 slow sand filter beds');
  });
});

describe('Gemini API Authentication & Upstream Error Classification Suite', () => {
  const chatHandler = require('../api/chat');

  function createMockReqRes(body, envKey = 'mock-key') {
    const originalKey = process.env.GEMINI_API_KEY;
    if (envKey === null) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = envKey;
    }

    const req = {
      method: 'POST',
      headers: { 'x-forwarded-for': '127.0.0.1' },
      body
    };

    let statusCode = 200;
    let jsonResponse = null;

    const res = {
      setHeader: jest.fn(),
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      },
      end: jest.fn()
    };

    const cleanup = () => {
      if (originalKey === undefined) {
        delete process.env.GEMINI_API_KEY;
      } else {
        process.env.GEMINI_API_KEY = originalKey;
      }
    };

    return { req, res, getStatus: () => statusCode, getBody: () => jsonResponse, cleanup };
  }

  test('reports clear 503 error when GEMINI_API_KEY is not configured on the server', async () => {
    const { req, res, getStatus, getBody, cleanup } = createMockReqRes(
      { messages: [{ role: 'user', content: 'What is Abram law?' }] },
      null // No key
    );

    try {
      await chatHandler(req, res);
      expect(getStatus()).toBe(503);
      expect(getBody().error).toMatch(/GEMINI_API_KEY is not configured on the server/i);
      expect(getBody().error).toMatch(/Vercel/i);
    } finally {
      cleanup();
    }
  });

  test('sanitizes GEMINI_API_KEY by trimming quotes and whitespace', async () => {
    // Key wrapped with quotes and whitespace
    const { req, res, getStatus, getBody, cleanup } = createMockReqRes(
      { messages: [{ role: 'user', content: '' }] }, // empty message triggers 400 validation after key check
      '  "AIzaSyDummyKeyWithQuotes"  '
    );

    try {
      await chatHandler(req, res);
      // If it passed the key check, it reaches message validation: 400
      expect(getStatus()).toBe(400);
      expect(getBody().error).toMatch(/Please enter a message or upload an image question/i);
    } finally {
      cleanup();
    }
  });

  test('displays safe frontend error when Gemini API returns invalid key failure (401)', async () => {
    const chatService = require('./services/chatService');
    jest.spyOn(chatService, 'sendChatMessage').mockResolvedValueOnce({
      error: 'Gemini API key is invalid or has expired. Please verify GEMINI_API_KEY in Vercel settings.'
    });

    render(<Chatbot dark={true} user={{ name: 'Engineer' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const input = screen.getByTestId('chat-input');
    const sendBtn = screen.getByTestId('chat-send-btn');
    fireEvent.change(input, { target: { value: 'Explain BOD kinetics' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Gemini API key is invalid or has expired/i)).toBeInTheDocument();
      expect(screen.getByTestId('chat-retry-btn')).toBeInTheDocument();
    });

    chatService.sendChatMessage.mockRestore();
  });

  test('displays safe frontend error when Gemini API returns key restriction error (403)', async () => {
    const chatService = require('./services/chatService');
    jest.spyOn(chatService, 'sendChatMessage').mockResolvedValueOnce({
      error: 'Gemini API key restriction error: Serverless requests from this origin/IP are blocked. In Google Cloud Console, ensure Application Restrictions are set to "None".'
    });

    render(<Chatbot dark={true} user={{ name: 'Engineer' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const input = screen.getByTestId('chat-input');
    const sendBtn = screen.getByTestId('chat-send-btn');
    fireEvent.change(input, { target: { value: 'Calculate settling velocity' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Gemini API key restriction error/i)).toBeInTheDocument();
    });

    chatService.sendChatMessage.mockRestore();
  });

  test('displays safe frontend error when rate limit / quota is exceeded (429)', async () => {
    const chatService = require('./services/chatService');
    jest.spyOn(chatService, 'sendChatMessage').mockResolvedValueOnce({
      error: 'LearnLoop AI rate limit or quota exceeded. Please wait a moment before sending another question.'
    });

    render(<Chatbot dark={true} user={{ name: 'Engineer' }} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const input = screen.getByTestId('chat-input');
    const sendBtn = screen.getByTestId('chat-send-btn');
    fireEvent.change(input, { target: { value: 'Explain Stokes Law' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/rate limit or quota exceeded/i)).toBeInTheDocument();
    });

    chatService.sendChatMessage.mockRestore();
  });
});

describe('Light Mode Readability, Theme Tokens, and Dynamic Theme Switching', () => {
  const mockUser = {
    id: 'test-user-theme',
    name: 'Harshal Civil',
    email: 'harshal@example.com',
    preferredLanguage: 'en',
    gateYear: '2027'
  };

  test('Navbar theme toggle switches between Dark and Light mode, updating DOM attributes', () => {
    const Navbar = require('./components/Navbar').default;
    let isDark = true;
    const setDark = jest.fn((newVal) => {
      isDark = typeof newVal === 'function' ? newVal(isDark) : newVal;
    });

    const { rerender } = render(
      <Navbar
        dark={isDark}
        setDark={setDark}
        activeTab="academy"
        setActiveTab={jest.fn()}
        user={mockUser}
        setUser={jest.fn()}
        onOpenAuth={jest.fn()}
      />
    );

    const toggleBtn = screen.getByLabelText(/toggle dark\/light theme/i);
    expect(toggleBtn).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(setDark).toHaveBeenCalledWith(false);

    // Simulate re-render with dark=false
    rerender(
      <Navbar
        dark={false}
        setDark={setDark}
        activeTab="academy"
        setActiveTab={jest.fn()}
        user={mockUser}
        setUser={jest.fn()}
        onOpenAuth={jest.fn()}
      />
    );

    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  test('LessonPlayer in light mode renders syllabus headings, read times, and prose with dark readable colors', () => {
    const LessonPlayer = require('./components/academy/LessonPlayer').default;
    const { waterEngineeringCourse } = require('./data/courses/waterEngineeringCourse');
    const lesson = waterEngineeringCourse.modules[0].lessons[0];

    render(
      <LessonPlayer
        lesson={lesson}
        course={waterEngineeringCourse}
        user={mockUser}
        dark={false}
        onBackToCourse={jest.fn()}
      />
    );

    // Assert main lesson title is rendered
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/mins read/i)).toBeInTheDocument();
    expect(screen.getByText(/Learning Objectives/i)).toBeInTheDocument();
    expect(screen.getByText(/Outcome-Based Conceptual Verification/i)).toBeInTheDocument();
  });

  test('AI Tutor Chatbot in light mode renders with .light class and tutor bubble styles', () => {
    render(<Chatbot dark={false} user={mockUser} />);
    fireEvent.click(screen.getByTestId('chat-launcher-btn'));

    const chatbotRoot = screen.getByTestId('chatbot-root');
    expect(chatbotRoot).toHaveClass('light');
    expect(chatbotRoot).not.toHaveClass('dark');
  });

  test('MathRenderer renders mathematical formulas with high-contrast elements in light mode', () => {
    const MathRenderer = require('./components/common/MathRenderer').default;
    const { container } = render(
      <MathRenderer math="v_s = \frac{g (\rho_p - \rho_w) d^2}{18 \mu}" block={true} />
    );

    expect(container.querySelector('.math-block-container')).toBeInTheDocument();
    expect(container.textContent).toContain('18');
    expect(container.textContent).toContain('μ');
  });
});




