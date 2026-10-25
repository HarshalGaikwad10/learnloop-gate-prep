// api/chat.js — Vercel Serverless Function for LearnLoop AI Tutor & Understanding Evaluator
// Communicates securely with Google Gemini API from server-side only

try {
  require('dotenv').config({ path: '.env.local' });
  require('dotenv').config({ path: '.env' });
} catch (e) {
  // Ignore in environments where dotenv is not required
}

const https = require('https');

// Rate limiting in-memory map: IP -> { count, resetTime }
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP
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

// Base System Instruction for LearnLoop AI Tutor
const BASE_TUTOR_INSTRUCTION = `You are LearnLoop AI Tutor, a patient, technically rigorous, and encouraging Civil & Environmental Engineering teacher built by StructaMind for students of LearnLoop AI Academy (aligned with Core Civil Engineering Curriculum, with contextual highlights for GATE Civil Engineering (CE) and GATE Environmental Science & Engineering (ES)).

YOUR TEACHING MODES:
1. Learn Mode: Teach new concepts step-by-step starting from physical principles, then formal engineering definitions, then practical field application.
2. Ask Mode: Answer specific student questions, clarify ambiguities, and explain the physical mechanisms.
3. Practise Mode: Provide progressive hints without immediately giving away final answers; guide calculations step-by-step.
4. Revise Mode: Summarize key formulas, IS Code specifications (IS 10500, IS 456, IS 1172, CPHEEO), and core exam traps.

MULTILINGUAL TEACHING RULES (CRITICAL):
- When requested in Hindi, Marathi, or Manipuri:
  1. Explain the civil engineering concept naturally in the requested language using relatable everyday analogies.
  2. Always keep important technical engineering terms in English inside parentheses, e.g. "गाळ खाली बसणे (Sedimentation)", "विद्युतभार निष्प्रभ करणे (Charge Neutralization)", "पाण्याचे शुद्धीकरण (Water Purification)".
  3. Strictly preserve all standard engineering formulas, units (e.g. mg/L, m³/day, NTU), numbers, and symbols in English.
  4. Conclude with one short conceptual check question.
  5. Never merely do a mechanical literal translation; explain the concept conceptually.

COMPETITIVE EXAMINATION ANNOTATION RULES (GATE CE & GATE ES):
- Explain the relevance of a "🎯 Important for GATE CE" annotation concisely when asked, focusing on official GATE CE Section 6 (Environmental Engineering) syllabus topics (e.g., water quality standards, treatment unit design, sewer hydraulics, BOD kinetics, oxygen sag, ASP kinetics, and sludge digestion).
- Preserve all existing GATE ES concepts, notes, and mappings. Do not treat GATE CE and GATE ES as interchangeable, and never fabricate official syllabus claims or exam history.
- Ground all numerical recommendations in standard Indian codes (IS 10500, IS 1172, CPHEEO manual).

NUMERICAL SOLUTION STRUCTURE:
- Given Data (with units)
- To Find
- Formula(s)
- Standard Assumptions
- Step-by-Step Substitution & Calculation
- Final Answer with Units
- Practical Engineering Significance

MATHEMATICAL & MARKDOWN FORMATTING RULES:
- Use standard Markdown with clear headings (###), bold (**term**), and bullet points.
- Format all standalone block equations using double dollar signs: $$...$$ (e.g. $$G = \\sqrt{\\frac{P}{\\mu \\cdot V}}$$, $$v_s = \\frac{g(\\rho_s - \\rho)d^2}{18\\mu}$$).
- Format inline math, Greek symbols, and variables using single dollar signs: $...$ (e.g. $G$, $t$, $\\mu$, $d_{10}$, $C_u$, $\\theta$).
- Use Markdown tables with pipes (| Column 1 | Column 2 |) for comparative summaries.
- Never output raw unescaped HTML.

AI TEACHER INSTRUCTIONS FOR UPLOADED QUESTIONS & DIAGRAMS (CRITICAL):
When a student uploads an image (textbook question photo, handwritten problem, exam screenshot, formula, table, or engineering diagram):
1. Carefully inspect the image and identify the exact Civil Engineering question and topic visible in the uploaded image.
2. Extract all given data and units under a distinct "### Given Data" section.
3. Clearly state what must be calculated or designed under a "### To Determine / Design Goal" section.
4. Select appropriate formulas, cite standard Indian codes (IS 10500, IS 456, IS 1172, CPHEEO Manual) where applicable, and explain their engineering applicability under "### Governing Formula(s)".
5. Substitute the actual given values directly into the formulas.
6. Complete all calculations with rigorous intermediate steps under "### Step-by-Step Calculation". Show all arithmetic without skipping stages.
7. Include engineering units throughout every calculation step and provide a clearly labelled final answer with units under "### Final Answer".
8. Address all parts of the question, including required diagrams, plan arrangements, layouts, or dimensions (e.g. for filter beds, state the number of beds, length, breadth, and their spatial layout in plan).
9. If essential information or numbers in the image are illegible or ambiguous, ask the student for clarification rather than guessing or fabricating missing values.
10. Strictly avoid switching to an unrelated example or previous chat topic when the submitted question in the image is readable.
For long or complex design problems, use clear structured sections: Given Data, Governing Formula(s), Calculation, Design Dimensions, Plan Arrangement / Layout, and Final Answer.`;

const ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/webp'];
const MAX_IMAGE_BASE64_BYTES = 3.5 * 1024 * 1024; // 3.5 MB max base64 size (under Vercel's 4.5MB request limit)

// Candidate Gemini models verified for v1beta availability
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',  // Primary: fast, highly accurate multimodal without reasoning token exhaustion
  'gemini-3.8-flash',       // Advanced multimodal fallback
  'gemini-flash-latest',    // Reliable alias fallback
  'gemini-3.5-flash'        // Secondary fallback
];

// Call Gemini API via HTTPS with bounded model fallback and retry backoff
function callGemini(apiKey, payload) {
  return new Promise((resolve, reject) => {
    function tryModel(index) {
      if (index >= CANDIDATE_MODELS.length) {
        const exhaustedErr = new Error('LearnLoop AI Tutor is temporarily unable to reach upstream language models. Please try again shortly.');
        exhaustedErr.statusCode = 503;
        exhaustedErr.status = 'UNAVAILABLE';
        return reject(exhaustedErr);
      }

      const model = CANDIDATE_MODELS[index];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = JSON.stringify(payload);

      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 35000 // 35s per candidate to support detailed engineering calculations
      }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              const candidate = parsed.candidates?.[0];
              const finishReason = candidate?.finishReason || 'STOP';
              const parts = candidate?.content?.parts || [];
              const replyText = parts.filter(p => p.text).map(p => p.text).join('');

              if (replyText) {
                return resolve({
                  text: replyText,
                  model,
                  finishReason,
                  isTruncated: finishReason === 'MAX_TOKENS'
                });
              }
            }

            const errorCode = parsed.error?.code || res.statusCode;
            const errorStatus = parsed.error?.status || '';
            const errorMsg = parsed.error?.message || `Gemini API returned status ${res.statusCode}`;

            // 1. Non-retryable: Invalid credentials or permission denied -> fail fast
            if (res.statusCode === 401 || res.statusCode === 403 || errorStatus === 'PERMISSION_DENIED') {
              const authErr = new Error('Gemini API authentication failed. Please check the configured API key.');
              authErr.statusCode = 403;
              authErr.status = 'PERMISSION_DENIED';
              return reject(authErr);
            }

            // 2. Non-retryable: Invalid request format / bad argument
            if (res.statusCode === 400 && errorStatus === 'INVALID_ARGUMENT') {
              const badReqErr = new Error(errorMsg);
              badReqErr.statusCode = 400;
              return reject(badReqErr);
            }

            // 3. Retryable: Model not found (404 / NOT_FOUND) -> hop to next model immediately
            if (errorCode === 404 || errorStatus === 'NOT_FOUND') {
              return tryModel(index + 1);
            }

            // 4. Retryable: Upstream unavailable / high demand / transient gateway error (503 / 502 / 504 / 500)
            if (res.statusCode === 503 || res.statusCode === 502 || res.statusCode === 504 || res.statusCode === 500 || errorStatus === 'UNAVAILABLE') {
              // Bounded backoff: wait 400ms before trying next candidate
              setTimeout(() => {
                tryModel(index + 1);
              }, 400);
              return;
            }

            // 5. Rate limit (429 / RESOURCE_EXHAUSTED): Try alternative candidate model once
            if (res.statusCode === 429 || errorStatus === 'RESOURCE_EXHAUSTED') {
              if (index < CANDIDATE_MODELS.length - 1) {
                setTimeout(() => {
                  tryModel(index + 1);
                }, 500);
                return;
              }
              const rateErr = new Error('LearnLoop AI rate limit reached. Please wait a moment before sending another question.');
              rateErr.statusCode = 429;
              rateErr.status = 'RESOURCE_EXHAUSTED';
              return reject(rateErr);
            }

            // General failure: try next candidate if available
            if (index < CANDIDATE_MODELS.length - 1) {
              return tryModel(index + 1);
            }

            const err = new Error(errorMsg);
            err.statusCode = res.statusCode;
            err.status = errorStatus;
            return reject(err);

          } catch (e) {
            // JSON parse failure on response: try next candidate
            if (index < CANDIDATE_MODELS.length - 1) {
              return tryModel(index + 1);
            }
            return reject(new Error('Failed to parse response from Gemini API'));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        // Transient timeout: attempt next model
        if (index < CANDIDATE_MODELS.length - 1) {
          tryModel(index + 1);
        } else {
          const timeoutErr = new Error('AI request timed out while communicating with upstream services.');
          timeoutErr.statusCode = 504;
          reject(timeoutErr);
        }
      });

      req.on('error', (err) => {
        // Socket/network error: attempt next model
        if (index < CANDIDATE_MODELS.length - 1) {
          tryModel(index + 1);
        } else {
          reject(err);
        }
      });

      req.write(body);
      req.end();
    }

    tryModel(0);
  });
}

// Fallback rule-based rubric evaluation if external API is unreachable or rate limited
function evaluateFallback(studentAnswer, rubric) {
  const ans = (studentAnswer || '').toLowerCase();
  const essential = rubric?.essentialPoints || [];
  const misconceptions = rubric?.misconceptions || [];

  const matchedStrengths = [];
  const missing = [];

  essential.forEach(pt => {
    // Check significant keywords from the rubric point
    const words = pt.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 4);
    const hitCount = words.filter(w => ans.includes(w)).length;
    if (hitCount >= Math.min(2, words.length)) {
      matchedStrengths.push(pt);
    } else {
      missing.push(pt);
    }
  });

  const foundMisconceptions = [];
  misconceptions.forEach(m => {
    const mWords = m.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 5);
    const mHits = mWords.filter(w => ans.includes(w)).length;
    if (mHits >= 2) {
      foundMisconceptions.push(m);
    }
  });

  let status = 'partial';
  if (matchedStrengths.length >= Math.ceil(essential.length * 0.7) && foundMisconceptions.length === 0) {
    status = 'understood';
  } else if (matchedStrengths.length === 0 || foundMisconceptions.length > 0) {
    status = 'needs_reteaching';
  }

  return {
    status,
    strengths: matchedStrengths.length > 0 ? matchedStrengths : ['Demonstrated initial effort to conceptualize the engineering mechanism.'],
    missingPoints: missing,
    misconceptions: foundMisconceptions,
    explanation: rubric?.modelAnswer || 'Review the core physical principles and hydraulic relationships in the lesson notes.',
    example: 'For example, in a municipal water plant, each unit process acts as a specific physical or chemical barrier.',
    followUpQuestion: 'How would you explain the fundamental difference in operational mechanism to a junior site engineer?',
    recommendedAction: status === 'understood' ? 'continue' : 'review_notes'
  };
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

  // Safe body parsing for both pre-parsed and raw JSON string payloads
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON request body.' });
    }
  }
  if (!body || typeof body !== 'object') {
    body = {};
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

  // Strict server-side API key check
  const apiKey = process.env.GEMINI_API_KEY;

  // ── ROUTE 1: CONCEPTUAL UNDERSTANDING EVALUATION (Signature Feature) ──
  if (body.mode === 'evaluate') {
    const { studentAnswer, questionPrompt, rubric, lessonTitle, preferredLanguage = 'English' } = body;

    if (!studentAnswer || typeof studentAnswer !== 'string' || !studentAnswer.trim()) {
      return res.status(400).json({ error: 'Please submit your explanation before requesting feedback.' });
    }

    if (!apiKey) {
      // Return safe offline rubric evaluation
      const fallback = evaluateFallback(studentAnswer, rubric);
      return res.status(200).json(fallback);
    }

    const evalPrompt = `You are an expert Civil & Environmental Engineering professor evaluating a student's open-ended conceptual explanation.

LESSON: "${lessonTitle || 'Water and Wastewater Engineering'}"
UNDERSTANDING QUESTION PROMPT: "${questionPrompt || ''}"

OFFICIAL LESSON RUBRIC:
- Essential Points to Cover: ${JSON.stringify(rubric?.essentialPoints || [])}
- Common Misconceptions: ${JSON.stringify(rubric?.misconceptions || [])}
- Benchmark Model Explanation: "${rubric?.modelAnswer || ''}"

STUDENT'S SUBMITTED EXPLANATION:
"${studentAnswer.trim()}"

EVALUATION INSTRUCTIONS:
1. Objectively evaluate the student's answer against the rubric.
2. Do NOT require exact textbook wording; recognize genuine conceptual understanding.
3. Assign one of three status levels:
   - "understood": The essential points are captured and no critical misconceptions exist.
   - "partial": Some essential points are present, but key principles are missing.
   - "needs_reteaching": Crucial misconceptions are present or understanding is inadequate.
4. If preferred language is ${preferredLanguage} (and not English), formulate the explanation, example, and follow-up question in ${preferredLanguage} (keeping technical terms in English parentheses).
5. Respond ONLY with a valid JSON object matching this exact schema:
{
  "status": "understood" | "partial" | "needs_reteaching",
  "strengths": ["list of concepts the student correctly grasped"],
  "missingPoints": ["list of important points missing from student's explanation"],
  "misconceptions": ["list of erroneous or confused ideas in student's answer"],
  "explanation": "clear, constructive explanation addressing gaps",
  "example": "relatable practical engineering analogy",
  "followUpQuestion": "one targeted follow-up question to test deeper comprehension",
  "recommendedAction": "continue" | "retry" | "review_notes"
}`;

    try {
      const payload = {
        contents: [{ role: 'user', parts: [{ text: evalPrompt }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.2 }
      };

      const result = await callGemini(apiKey, payload);
      const cleanJson = result.text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      // Validate schema
      if (['understood', 'partial', 'needs_reteaching'].includes(parsed.status)) {
        return res.status(200).json(parsed);
      }
      return res.status(200).json(evaluateFallback(studentAnswer, rubric));
    } catch (err) {
      // Fallback gracefully
      return res.status(200).json(evaluateFallback(studentAnswer, rubric));
    }
  }

  // ── ROUTE 2: AI CONCEPT ILLUSTRATION (Visual Learning Mode) ──
  if (body.action === 'generate_concept_illustration') {
    const { lessonTitle, topic } = body;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'GEMINI_API_KEY is not configured on the server. Utilizing high-fidelity SVG schematic fallback.',
        disclaimer: 'Illustrative concept visualization only — not a verified civil engineering design.'
      });
    }

    try {
      const visualPrompt = `You are a Senior Civil Engineering Process Specialist. Provide a concise technical summary and component breakdown for an engineering schematic of: "${topic || lessonTitle}".
List 3 key physical stages, primary hydraulic parameters, and critical design checks.`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: visualPrompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.3 }
      };

      const result = await callGemini(apiKey, payload);

      return res.status(200).json({
        success: true,
        fallback: true,
        textDescription: result.text,
        message: `AI Visual Concept generated via ${result.model}. Displaying synchronized engineering schematic.`,
        disclaimer: 'Illustrative concept visualization only — not a verified civil engineering design.'
      });
    } catch (err) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'AI generation service is temporarily busy. Displaying verified interactive SVG schematic fallback.',
        disclaimer: 'Illustrative concept visualization only — not a verified civil engineering design.'
      });
    }
  }

  // ── ROUTE 3: CONVERSATIONAL TUTOR & MULTILINGUAL TEACHING ──
  const { messages, context } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty "messages" array.' });
  }

  if (!apiKey) {
    return res.status(503).json({
      error: 'LearnLoop AI service is temporarily unavailable: GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your Vercel project environment variables or local .env file.'
    });
  }

  try {
    const boundedMessages = messages.slice(-10);
    const lastUserMessage = boundedMessages[boundedMessages.length - 1];

    if (!lastUserMessage || typeof lastUserMessage !== 'object') {
      return res.status(400).json({ error: 'Latest message is invalid.' });
    }

    // Check for image attachment either on the message object or in the request body
    const attachedImage = lastUserMessage.image || body.image || null;
    let validatedImage = null;

    if (attachedImage) {
      if (typeof attachedImage !== 'object' || !attachedImage.mimeType || !attachedImage.data) {
        return res.status(400).json({ error: 'Malformed image attachment: "mimeType" and "data" fields are required.' });
      }

      let mimeType = String(attachedImage.mimeType).toLowerCase().trim();
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
        return res.status(400).json({
          error: `Unsupported image format (${mimeType}). Please upload a PNG, JPEG/JPG, or WebP image.`
        });
      }

      // Normalize MIME type for upstream Gemini API compatibility
      if (mimeType === 'image/jpg' || mimeType === 'image/pjpeg') {
        mimeType = 'image/jpeg';
      }

      const base64Data = String(attachedImage.data).replace(/^data:image\/[a-z0-9+.-]+;base64,/, '').trim();
      if (!base64Data) {
        return res.status(400).json({ error: 'The uploaded image data is empty or invalid.' });
      }

      // Check decoded size (base64 length * 3/4)
      const approximateBytes = Math.round((base64Data.length * 3) / 4);
      if (approximateBytes > MAX_IMAGE_BASE64_BYTES) {
        return res.status(413).json({
          error: 'Image payload exceeds the safe 3.5 MB transfer limit. Please upload a smaller or compressed image.'
        });
      }

      validatedImage = {
        mimeType,
        data: base64Data
      };
    }

    // Safe diagnostic logging (only logs metadata, never raw base64 or API keys)
    console.log(`[LearnLoop AI] Request received - image: ${!!validatedImage}, mime: ${validatedImage?.mimeType || 'none'}, approxBytes: ${validatedImage ? Math.round((validatedImage.data.length * 3) / 4) : 0}, messages: ${boundedMessages.length}`);

    const textContent = typeof lastUserMessage.content === 'string' ? lastUserMessage.content.trim() : '';
    if (!validatedImage && !textContent) {
      return res.status(400).json({ error: 'Please enter a message or upload an image question.' });
    }

    // Build context prompt
    let contextPrompt = '';
    if (context && typeof context === 'object') {
      const parts = [];
      if (context.courseTitle) parts.push(`Course: ${context.courseTitle}`);
      if (context.moduleTitle) parts.push(`Module: ${context.moduleTitle}`);
      if (context.lessonTitle) parts.push(`Active Lesson: ${context.lessonTitle}`);
      if (context.preferredLanguage && context.preferredLanguage !== 'English') {
        parts.push(`Preferred Explanation Language: ${context.preferredLanguage}`);
      }
      if (context.explanationStyle) parts.push(`Preferred Explanation Style: ${context.explanationStyle}`);
      if (context.essentialPoints && Array.isArray(context.essentialPoints)) {
        parts.push(`Lesson Core Points: ${context.essentialPoints.join('; ')}`);
      }
      if (context.currentQuestion) {
        parts.push(`Current Test Question: "${context.currentQuestion.q}"`);
        if (Array.isArray(context.currentQuestion.options)) {
          parts.push(`Options: ${context.currentQuestion.options.map((opt, i) => `${['A','B','C','D'][i]}: ${opt}`).join(' | ')}`);
        }
      }
      if (parts.length > 0) {
        contextPrompt = `\n[ACTIVE LEARNING & LESSON CONTEXT]\n${parts.join('\n')}\n[END CONTEXT]\n`;
      }
    }

    const contents = [];

    boundedMessages.forEach((m, idx) => {
      const isLast = idx === boundedMessages.length - 1;
      const role = m.role === 'assistant' || m.role === 'tutor' ? 'model' : 'user';
      let text = String(m.content || '').slice(0, 3000);

      const parts = [];

      // Attach image to the current user prompt if present
      if (isLast && role === 'user' && validatedImage) {
        parts.push({
          inlineData: {
            mimeType: validatedImage.mimeType,
            data: validatedImage.data
          }
        });

        text = `[ATTACHED QUESTION IMAGE]\n` +
          `CRITICAL DIRECTIVE: The student has uploaded an image containing a Civil Engineering question.\n` +
          `You MUST inspect the attached image, identify the exact question and given parameters shown in the image, and solve that exact problem step by step.\n` +
          `DO NOT answer previous unrelated conversation topics (such as one-way/two-way slabs or earlier questions) unless the student explicitly asks to compare them in their note.\n` +
          `If the image is blurry, corrupted, or missing essential values, ask the student for clarification instead of inventing numbers.\n` +
          (text.trim() ? `Student's accompanying instruction: "${text}"` : `Please provide the complete step-by-step engineering design and calculation based strictly on the image.`);
      }

      if (text.trim() || parts.length === 0) {
        parts.push({ text: text || 'Hello Tutor!' });
      }

      contents.push({ role, parts });
    });

    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.unshift({ role: 'user', parts: [{ text: 'Hello Tutor!' }] });
    }

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: `${BASE_TUTOR_INSTRUCTION}${contextPrompt}` }]
      },
      contents,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.2
      }
    };

    const result = await callGemini(apiKey, geminiPayload);

    let reply = result.text;
    if (result.isTruncated) {
      reply += '\n\n*(Note: This response reached the output length limit. Click "Continue Solution" below to see the remaining calculations and plan arrangement.)*';
    }

    return res.status(200).json({
      reply,
      model: result.model,
      finishReason: result.finishReason,
      isTruncated: !!result.isTruncated
    });

  } catch (error) {
    if (error.statusCode === 429 || error.status === 'RESOURCE_EXHAUSTED') {
      return res.status(429).json({
        error: 'LearnLoop AI rate limit reached. Please wait a moment before sending another question.'
      });
    }

    if (error.statusCode === 401 || error.statusCode === 403 || error.status === 'PERMISSION_DENIED') {
      return res.status(403).json({
        error: 'Gemini API authentication failed. Please verify that a valid GEMINI_API_KEY is configured in Vercel settings.'
      });
    }

    if (error.statusCode === 503 || error.status === 'UNAVAILABLE') {
      return res.status(503).json({
        error: 'LearnLoop AI Tutor is temporarily unable to reach upstream language models. Please try again shortly.'
      });
    }

    if (error.statusCode === 504) {
      return res.status(504).json({
        error: 'AI request timed out while communicating with upstream services. Please retry.'
      });
    }

    if (error.statusCode === 400) {
      return res.status(400).json({
        error: error.message || 'Invalid request format.'
      });
    }

    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while communicating with LearnLoop AI Tutor.'
    });
  }
};
