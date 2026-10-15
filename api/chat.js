// api/chat.js — Vercel Serverless Function for LearnLoop AI Tutor
// Communicates securely with Google Gemini API from server-side only

const https = require('https');

// Rate limiting in-memory map: IP -> { count, resetTime }
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25; // 25 requests per minute per IP
const ipRateLimits = new Map();

// Helper to cleanup stale rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimits.entries()) {
    if (now > record.resetTime) {
      ipRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Comprehensive server-side system instruction for GATE Civil Engineering Tutor
const SYSTEM_INSTRUCTION = `You are LearnLoop AI Tutor, a patient, technically rigorous, and encouraging Civil Engineering teacher built by StructaMind for GATE (Graduate Aptitude Test in Engineering) Civil Engineering aspirants.

YOUR TEACHING PRINCIPLES:
1. Concept Explanations:
   - Always start with an intuitive, real-world explanation in simple language.
   - Follow with a concrete engineering example or practical analogy.
   - Conclude with exact technical specifications, IS codes, and mathematical relations where helpful.

2. Numerical Solutions (MANDATORY STRUCTURE for numericals):
   When solving numerical questions or calculations, strictly use this structure:
   - **Given Data**: List all provided parameters with units.
   - **To Find**: Clearly identify the target unknown.
   - **Formula**: State the standard formula(s) used.
   - **Assumptions**: State any standard assumptions (e.g., standard temperature, fully compacted concrete). Do NOT invent missing input values; if data is missing, explicitly point it out.
   - **Substitution**: Show all numerical values substituted into the formula.
   - **Calculation**: Show intermediate arithmetic steps clearly.
   - **Final Answer & Units**: Highlight the numerical result with correct units (e.g., MPa, N/mm², %, litres).
   - **Brief Engineering Significance**: 1-2 sentences on what this result means in real engineering practice.

3. Multiple Choice Questions (MCQ) & Question Explanations:
   - When discussing a question, clearly explain why the correct option is right.
   - Discuss why the relevant alternative options (distractors) are incorrect or in which scenario they would apply.
   - Never claim an unverified or generated question is a previous-year GATE question unless verified.

4. Interactive Teaching & Follow-up:
   - When useful, conclude with ONE short, thought-provoking follow-up question to check the student's conceptual understanding.
   - Do NOT force a quiz on every single turn or make responses unnecessarily long or repetitive. Keep explanations clear, structured, and easy to read.

5. Technical Accuracy & Standards:
   - Reference Indian Standards accurately (IS 456:2000 for Plain and Reinforced Concrete, IS 10262 for Mix Design, IS 9103 for Admixtures, IS 383 for Aggregates, IS 516 for Strength Tests, IS 1199 for Fresh Concrete Tests).
   - NEVER fabricate IS code clauses, standards, official answer keys, or historical exam references.
   - If you are uncertain about any value, code clause, or fact, explicitly admit uncertainty: "I am not completely certain of this specific clause/value; please verify with the latest IS code."

6. Tone and Context Continuity:
   - Maintain a supportive, patient, mentor-like tone.
   - Respect earlier conversational context (e.g., if the user asks "explain that again in simpler terms" or "why option B?").
   - If the student provides context regarding their current test question, score, or topic, adapt your answer directly to that context.`;

// Call Gemini API via HTTPS
function callGemini(apiKey, payload) {
  return new Promise((resolve, reject) => {
    // Model fallback sequence
    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash'];
    
    function tryNextModel(index) {
      if (index >= modelsToTry.length) {
        return reject(new Error('All candidate Gemini models failed or are currently unavailable.'));
      }
      const model = modelsToTry[index];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = JSON.stringify(payload);

      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 25000 // 25s timeout
      }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const replyText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (replyText) {
                return resolve({ text: replyText, model });
              }
            }
            // If model is unsupported/not found, try next candidate
            if (parsed.error && (parsed.error.code === 404 || parsed.error.status === 'NOT_FOUND')) {
              return tryNextModel(index + 1);
            }
            // Return structured error
            const err = new Error(parsed.error?.message || `Gemini API returned status ${res.statusCode}`);
            err.statusCode = res.statusCode;
            err.status = parsed.error?.status;
            return reject(err);
          } catch (e) {
            return reject(new Error('Failed to parse response from Gemini API'));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request to Gemini API timed out after 25 seconds.'));
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(body);
      req.end();
    }

    tryNextModel(0);
  });
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const rateRecord = ipRateLimits.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > rateRecord.resetTime) {
    rateRecord.count = 0;
    rateRecord.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  rateRecord.count += 1;
  ipRateLimits.set(clientIp, rateRecord);

  if (rateRecord.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before sending another message.',
      retryAfterSeconds: Math.ceil((rateRecord.resetTime - now) / 1000)
    });
  }

  // API Key resolution (prioritize server-only GEMINI_API_KEY, fallback to REACT_APP_GEMINI_KEY)
  const apiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'LearnLoop AI service is temporarily unavailable (API key not configured). Please contact support or configure GEMINI_API_KEY.'
    });
  }

  try {
    const { messages, context } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Request body must include a non-empty "messages" array.' });
    }

    // Sanitize and limit conversation length to recent turns (max 10)
    const boundedMessages = messages.slice(-10);
    const lastUserMessage = boundedMessages[boundedMessages.length - 1];

    if (!lastUserMessage || !lastUserMessage.content || typeof lastUserMessage.content !== 'string') {
      return res.status(400).json({ error: 'Latest message must contain valid text content.' });
    }

    if (lastUserMessage.content.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (lastUserMessage.content.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum allowed length of 2000 characters.' });
    }

    // Build Gemini contents array with system instruction and context
    let contextPrompt = '';
    if (context && typeof context === 'object') {
      const parts = [];
      if (context.topicName) parts.push(`Active Topic: ${context.topicName}`);
      if (context.gateYear) parts.push(`Target GATE Year: ${context.gateYear}`);
      if (context.currentQuestion) {
        parts.push(`Current Test Question: "${context.currentQuestion.q}"`);
        if (Array.isArray(context.currentQuestion.options)) {
          parts.push(`Options: ${context.currentQuestion.options.map((opt, i) => `${['A','B','C','D'][i]}: ${opt}`).join(' | ')}`);
        }
        if (context.currentQuestion.hint) parts.push(`Curated Question Hint: "${context.currentQuestion.hint}"`);
      }
      if (context.recentScore) {
        parts.push(`Recent Test Score: ${context.recentScore.score}/${context.recentScore.total} (${context.recentScore.pct}%) on ${context.recentScore.topic}`);
      }
      if (context.activeNotes) {
        parts.push(`Topic Reference Notes Summary: ${context.activeNotes.slice(0, 300)}...`);
      }
      if (parts.length > 0) {
        contextPrompt = `\n[CURRENT STUDENT APPLICATION CONTEXT]\n${parts.join('\n')}\n[END CONTEXT]\n`;
      }
    }

    // Convert messages to Gemini contents structure
    const contents = [];
    
    // Insert system & context instructions into first turn
    const initialInstruction = `${SYSTEM_INSTRUCTION}${contextPrompt}\n\nPlease acknowledge and assist the student accordingly.`;

    // Map conversation turns
    boundedMessages.forEach((m, idx) => {
      const role = m.role === 'assistant' || m.role === 'tutor' ? 'model' : 'user';
      let text = String(m.content || '').slice(0, 2000);
      if (idx === 0 && role === 'user') {
        text = `${initialInstruction}\n\nStudent Doubt/Question: ${text}`;
      }
      contents.push({
        role,
        parts: [{ text }]
      });
    });

    // If first message in bounded array wasn't user (rare edge case), ensure proper start
    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.unshift({
        role: 'user',
        parts: [{ text: `${initialInstruction}\n\nHello Tutor!` }]
      });
    }

    const geminiPayload = {
      contents,
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.7
      }
    };

    const result = await callGemini(apiKey, geminiPayload);

    return res.status(200).json({
      reply: result.text,
      model: result.model
    });

  } catch (error) {
    // Check for quota or permission issues
    if (error.statusCode === 429 || error.status === 'RESOURCE_EXHAUSTED') {
      return res.status(429).json({
        error: 'AI tutor rate limit reached with Gemini API. Please wait a minute and try again.'
      });
    }

    if (error.statusCode === 403 || error.status === 'PERMISSION_DENIED') {
      return res.status(403).json({
        error: 'Gemini API authentication failed. The server API key may be invalid, restricted, or expired.'
      });
    }

    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while communicating with LearnLoop AI Tutor.'
    });
  }
};
