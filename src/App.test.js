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
