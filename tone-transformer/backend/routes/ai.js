const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─────────────────────────────────────────
// MANDATORY JS CONCEPT 1: map() — Tone config
// ─────────────────────────────────────────
const VALID_TONES = ["professional", "friendly", "apologetic", "confident"];
const toneDescriptions = VALID_TONES.map((t) => ({
  tone: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

// ─────────────────────────────────────────
// MANDATORY JS CONCEPT 2: reduce() — Prompt builder
// ─────────────────────────────────────────
function buildPrompt(message, tone) {
  const parts = [
    `Rewrite the following message in a ${tone} tone.`,
    `Keep the core meaning intact.`,
    `Make it suitable for professional communication.`,
    `Original message: "${message}"`,
    `Rewritten message:`,
  ];

  const prompt = parts.reduce((acc, curr) => {
    return acc + "\n" + curr;
  }, "");

  return prompt.trim();
}

// ─────────────────────────────────────────
// MANDATORY JS CONCEPT 3: Loop — Validation
// ─────────────────────────────────────────
function validateAndPreprocess(message, tone) {
  const errors = [];

  const checks = [
    {
      condition: !message || message.trim() === "",
      error: "Message cannot be empty.",
    },
    {
      condition: message && message.trim().length > 2000,
      error: "Message is too long. Please keep it under 2000 characters.",
    },
    {
      condition: !tone || tone.trim() === "",
      error: "Tone is required.",
    },
    {
      condition: tone && !VALID_TONES.includes(tone.toLowerCase()),
      error: `Invalid tone. Valid options: ${VALID_TONES.join(", ")}`,
    },
  ];

  for (let i = 0; i < checks.length; i++) {
    if (checks[i].condition) {
      errors.push(checks[i].error);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const cleanMessage = message.trim().replace(/\s+/g, " ");
  const cleanTone = tone.trim().toLowerCase();

  return { valid: true, message: cleanMessage, tone: cleanTone };
}

// ─────────────────────────────────────────
// Core AI function (required by assessment)
// ─────────────────────────────────────────
async function rewriteMessage(message, tone) {
  const prompt = buildPrompt(message, tone);

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a professional communication assistant. Rewrite messages clearly and appropriately based on the requested tone. Only return the rewritten message, nothing else.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  const content = completion?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new Error("OpenAI returned an empty rewritten message.");
  }

  return content.trim();
}

// Normalize OpenAI/SDK errors to an HTTP status + client-friendly message.
function getErrorStatusCode(error) {
  return (
    error?.statusCode ??
    error?.status ??
    error?.response?.status ??
    error?.response?.statusCode
  );
}

function getClientErrorMessage(error) {
  const statusCode = getErrorStatusCode(error);

  if (statusCode === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (statusCode === 401) {
    return "Invalid API key. Please check your OpenAI configuration.";
  }

  if (statusCode === 400) {
    return "Bad request to AI service. Please verify input and try again.";
  }

  return "AI service failed. Please try again later.";
}

// ─────────────────────────────────────────
// POST /ai/rewrite
// ─────────────────────────────────────────
router.post("/rewrite", async (req, res) => {
  const { message, tone } = req.body;

  const validation = validateAndPreprocess(message, tone);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  try {
    const rewritten = await rewriteMessage(validation.message, validation.tone);

    return res.status(200).json({
      success: true,
      original: validation.message,
      rewritten,
      tone: validation.tone,
      tones: toneDescriptions,
    });
  } catch (error) {
    const statusCode = getErrorStatusCode(error);
    console.error("OpenAI Error:", {
      message: error?.message,
      statusCode,
      name: error?.name,
    });

    const clientMessage = getClientErrorMessage(error);

    // Prefer OpenAI-provided status code if present; otherwise fall back to 500.
    const httpStatus = typeof statusCode === "number" ? statusCode : 500;

    return res.status(httpStatus).json({
      success: false,
      error: clientMessage,
    });
  }
});

module.exports = router;
