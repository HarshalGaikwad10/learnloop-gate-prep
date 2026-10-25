// src/services/chatService.js — Client-side service for LearnLoop AI Tutor & Understanding Evaluator

const API_ENDPOINT = '/api/chat';
const REQUEST_TIMEOUT_MS = 45000;

/**
 * Sends conversation messages and active context to LearnLoop AI Tutor.
 */
export async function sendChatMessage(messages, context = {}, externalSignal = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    const payloadMessages = messages.map(m => {
      const msg = {
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content || '').trim()
      };
      if (m.image) {
        msg.image = {
          mimeType: m.image.mimeType,
          data: m.image.base64Data || m.image.data
        };
      }
      return msg;
    }).filter(m => m.content.length > 0 || m.image);

    const payload = {
      mode: 'chat',
      messages: payloadMessages,
      context: {
        courseTitle: context.courseTitle || null,
        moduleTitle: context.moduleTitle || null,
        lessonTitle: context.lessonTitle || null,
        preferredLanguage: context.preferredLanguage || 'English',
        explanationStyle: context.explanationStyle || 'simple',
        essentialPoints: context.essentialPoints || null,
        topicName: context.topicName || null,
        gateYear: context.gateYear || null,
        currentQuestion: context.currentQuestion ? {
          q: context.currentQuestion.q,
          options: context.currentQuestion.options,
          hint: context.currentQuestion.hint
        } : null,
        recentScore: context.recentScore || null
      }
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: 'The chat server endpoint (/api/chat) was not found. Please ensure the local server is running (via "npx vercel dev" or "npm start") and that /api/chat is reachable.'
        };
      }
      return {
        error: data.error || `Server responded with status ${response.status}. Please try again.`
      };
    }

    if (!data.reply) {
      return { error: 'The tutor returned an empty response. Please rephrase your query.' };
    }

    return {
      reply: data.reply,
      model: data.model,
      finishReason: data.finishReason,
      isTruncated: !!data.isTruncated
    };

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { error: 'Request timed out after 45 seconds. Please check your connection and try again.' };
    }
    return {
      error: err.message || 'Unable to connect to LearnLoop AI Tutor. Please check your network connection.'
    };
  }
}

/**
 * Signature Feature: Evaluates student's open-ended conceptual explanation against the lesson rubric.
 */
export async function evaluateUnderstanding({
  studentAnswer,
  questionPrompt,
  rubric,
  lessonTitle,
  preferredLanguage = 'English'
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const payload = {
      mode: 'evaluate',
      studentAnswer,
      questionPrompt,
      rubric,
      lessonTitle,
      preferredLanguage
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Local client fallback evaluation if endpoint is 404/500
      return {
        result: generateLocalRubricFeedback(studentAnswer, rubric, preferredLanguage)
      };
    }

    return { result: data };

  } catch (err) {
    clearTimeout(timeoutId);
    // Reliable fallback so the student is never blocked
    return {
      result: generateLocalRubricFeedback(studentAnswer, rubric, preferredLanguage)
    };
  }
}

// Local client fallback evaluation if API is unavailable
function generateLocalRubricFeedback(answer, rubric, language = 'English') {
  const text = (answer || '').toLowerCase();
  const essential = rubric?.essentialPoints || [];
  const matched = [];
  const missing = [];

  essential.forEach(pt => {
    const words = pt.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 4);
    const hits = words.filter(w => text.includes(w)).length;
    if (hits >= Math.min(2, words.length)) {
      matched.push(pt);
    } else {
      missing.push(pt);
    }
  });

  const status = matched.length >= Math.ceil(essential.length * 0.6) ? 'understood' : matched.length > 0 ? 'partial' : 'needs_reteaching';

  return {
    status,
    strengths: matched.length > 0 ? matched : ['Demonstrated structured effort to describe the engineering concept.'],
    missingPoints: missing,
    misconceptions: [],
    explanation: rubric?.modelAnswer || 'Review the core process sequence and hydraulic parameters in the lesson notes.',
    example: 'In real municipal treatment, each unit is sized based on physical or chemical design limits.',
    followUpQuestion: 'How would you summarize the main physical or chemical mechanism in one concise sentence?',
    recommendedAction: status === 'understood' ? 'continue' : 'retry'
  };
}

/**
 * Optional AI Concept Illustration Generator
 * Communicates with server-side /api/chat keeping keys secure
 */
export async function generateConceptIllustration({ lessonTitle, topic, prompt }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const payload = {
      action: 'generate_concept_illustration',
      lessonTitle: lessonTitle || topic,
      topic,
      prompt: prompt || `Civil engineering process schematic for ${topic}`
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        fallback: true,
        message: data.error || 'Server endpoint returned an error. Using high-fidelity SVG fallback.',
        disclaimer: 'Illustrative concept visualization only — not a verified civil engineering design.'
      };
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      success: false,
      fallback: true,
      message: 'Network timeout communicating with concept visualizer. Using high-fidelity SVG fallback.',
      disclaimer: 'Illustrative concept visualization only — not a verified civil engineering design.'
    };
  }
}

