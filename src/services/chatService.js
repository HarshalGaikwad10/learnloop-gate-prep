// src/services/chatService.js — Client-side service for LearnLoop AI Tutor

const API_ENDPOINT = '/api/chat';
const REQUEST_TIMEOUT_MS = 25000;

/**
 * Sends conversation messages and active context to the LearnLoop AI Tutor API.
 * 
 * @param {Array<{role: string, content: string}>} messages - Current conversation messages.
 * @param {Object} context - Optional compact context (active topic, question, scores).
 * @param {AbortSignal} [externalSignal] - Optional abort signal for cancelling requests.
 * @returns {Promise<{reply?: string, error?: string}>}
 */
export async function sendChatMessage(messages, context = {}, externalSignal = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Link external signal if provided
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    // Sanitize message list for transfer
    const payloadMessages = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').trim()
    })).filter(m => m.content.length > 0);

    const payload = {
      messages: payloadMessages,
      context: {
        topicName: context.topicName || null,
        gateYear: context.gateYear || null,
        currentQuestion: context.currentQuestion ? {
          q: context.currentQuestion.q,
          options: context.currentQuestion.options,
          hint: context.currentQuestion.hint
        } : null,
        recentScore: context.recentScore ? {
          score: context.recentScore.score,
          total: context.recentScore.total,
          pct: context.recentScore.pct,
          topic: context.recentScore.topic
        } : null,
        activeNotes: context.activeNotes ? String(context.activeNotes).slice(0, 300) : null
      }
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If 404 (common in local Create React App dev server when vercel dev isn't used)
      if (response.status === 404) {
        return {
          error: 'The chat server endpoint (/api/chat) was not found. If running locally with Create React App, deploy to Vercel or run with Vercel CLI (vercel dev) to test serverless API routes.'
        };
      }
      return {
        error: data.error || `Server responded with status ${response.status}. Please try again.`
      };
    }

    if (!data.reply) {
      return {
        error: 'The tutor returned an empty response. Please try rephrasing your question.'
      };
    }

    return { reply: data.reply };

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        error: 'Request timed out after 25 seconds. Please check your internet connection and try again.'
      };
    }

    return {
      error: err.message || 'Unable to connect to LearnLoop AI Tutor. Please check your network connection.'
    };
  }
}
