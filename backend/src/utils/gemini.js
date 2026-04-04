const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const MODEL_FALLBACKS = [
  DEFAULT_MODEL,
  "llama-3.1-8b-instant",
  "llama3-8b-8192",
  "llama3-70b-8192",
].filter((value, index, arr) => value && arr.indexOf(value) === index);

const allowedPriceLabels = ["good_deal", "fair", "overpriced", "unknown"];
const allowedConditionLabels = [
  "excellent",
  "good",
  "average",
  "poor",
  "unknown",
];
const SUPPORTED_LANGUAGES = ["en", "hi", "mr"];

const normalizeLabel = (value, allowed, fallback = "unknown") => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  return allowed.includes(normalized) ? normalized : fallback;
};

const clampConfidence = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric < 0) return 0;
  if (numeric > 100) return 100;
  return Math.round(numeric);
};

const compactText = (value, maxLength = 1400) => {
  if (!value) return "";
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

const compactSpecifications = (specifications) => {
  if (!specifications || typeof specifications !== "object") return {};

  const entries =
    specifications instanceof Map
      ? Array.from(specifications.entries())
      : Object.entries(specifications);

  return entries.slice(0, 20).reduce((acc, [key, value]) => {
    const cleanKey = compactText(key, 80);
    const cleanValue = compactText(value, 180);
    if (!cleanKey || !cleanValue) return acc;
    acc[cleanKey] = cleanValue;
    return acc;
  }, {});
};

const safeJsonParse = (rawText) => {
  if (!rawText) return null;

  try {
    return JSON.parse(rawText);
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
};

const normalizeLocalizedReason = (value, fallback = "") => {
  if (typeof value === "string") {
    const text = compactText(value, 280);
    return {
      en: text || fallback,
      hi: text || fallback,
      mr: text || fallback,
    };
  }

  if (!value || typeof value !== "object") {
    return {
      en: fallback,
      hi: fallback,
      mr: fallback,
    };
  }

  const normalized = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    normalized[lang] = compactText(value?.[lang], 280);
  }

  const fallbackText =
    normalized.en ||
    normalized.hi ||
    normalized.mr ||
    compactText(fallback, 280);

  return {
    en: normalized.en || fallbackText,
    hi: normalized.hi || fallbackText,
    mr: normalized.mr || fallbackText,
  };
};

const isModelNotFoundError = (error) => {
  const status = Number(error?.status || error?.statusCode || 0);
  const message = String(error?.message || "").toLowerCase();

  return (
    status === 404 ||
    (message.includes("model") &&
      (message.includes("not found") ||
        message.includes("does not exist") ||
        message.includes("decommission")))
  );
};

const normalizeAnalysis = (analysis = {}) => ({
  priceLabel: normalizeLabel(analysis.priceLabel, allowedPriceLabels),
  priceReason: normalizeLocalizedReason(
    analysis.priceReason,
    "Price seems aligned with available market context."
  ),
  conditionLabel: normalizeLabel(
    analysis.conditionLabel,
    allowedConditionLabels
  ),
  conditionReason: normalizeLocalizedReason(
    analysis.conditionReason,
    "Condition estimate is based on equipment details provided."
  ),
  confidence: clampConfidence(analysis.confidence),
  model: compactText(analysis.model || DEFAULT_MODEL, 100),
});

const fallbackAnalysisFromText = (rawText) => {
  const text = compactText(rawText, 500).toLowerCase();

  let priceLabel = "fair";
  if (/overprice|too high|expensive/.test(text)) priceLabel = "overpriced";
  if (/good deal|cheap|undervalued/.test(text)) priceLabel = "good_deal";

  let conditionLabel = "good";
  if (/excellent|very good|like new/.test(text)) conditionLabel = "excellent";
  if (/average|moderate/.test(text)) conditionLabel = "average";
  if (/poor|bad|worn/.test(text)) conditionLabel = "poor";

  return {
    priceLabel,
    priceReason:
      compactText(rawText, 260) ||
      "Price appears fair for current market context.",
    conditionLabel,
    conditionReason:
      "Condition estimate derived from provided equipment details and usage information.",
    confidence: 60,
    model: DEFAULT_MODEL,
  };
};

const requestGroqCompletion = async ({
  apiKey,
  modelName,
  systemInstruction,
  prompt,
}) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      temperature: 0.1,
      top_p: 0.95,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("[Groq Analysis] HTTP request failed", {
      modelName,
      status: response.status,
      statusText: response.statusText,
      responseData: data,
    });

    const error = new Error(
      data?.error?.message ||
        `Groq request failed with status ${response.status}`
    );
    error.status = response.status;
    error.responseData = data;
    throw error;
  }

  return data?.choices?.[0]?.message?.content || "";
};

export const generateEquipmentAnalysis = async (equipment = {}) => {
  const apiKey = String(process.env.GROQ_API_KEY || "")
    .replace(/^GROQ_API_KEY=/, "")
    .trim();
  if (!apiKey) {
    console.error("[Groq Analysis] GROQ_API_KEY is not configured");
    throw new Error("GROQ_API_KEY is not configured");
  }

  if (!apiKey.startsWith("gsk_")) {
    console.error("[Groq Analysis] GROQ_API_KEY looks malformed");
    throw new Error("GROQ_API_KEY is invalid or malformed");
  }

  const payload = {
    name: compactText(equipment.name, 120),
    type: compactText(equipment.type, 80),
    description: compactText(equipment.description, 1200),
    condition: compactText(equipment.condition, 80),
    manufacturingYear: equipment.manufacturingYear || null,
    pricePerDay: Number(equipment.pricePerDay || 0),
    location: compactText(equipment.location, 120),
    specifications: compactSpecifications(equipment.specifications),
  };

  const systemInstruction =
    "You are a farm equipment valuation assistant specializing in Indian agricultural machinery. " +
    "Analyze equipment data and provide concise, factual price fairness assessments and condition estimates. " +
    "Your analysis should be practical and grounded in real market conditions. " +
    "Always respond with valid JSON only. Do not include markdown, explanations, or extra fields.";

  const prompt = [
    "Analyze this equipment and provide price fairness and condition estimate in English only.",
    "",
    "JSON Response Schema (REQUIRED):",
    JSON.stringify(
      {
        priceLabel: "good_deal|fair|overpriced|unknown",
        priceReason: "max 2 sentences in English",
        conditionLabel: "excellent|good|average|poor|unknown",
        conditionReason: "max 2 sentences in English",
        confidence: "0-100 (integer)",
      },
      null,
      2
    ),
    "Keep each reason concise (max 2 short sentences).",
    "Input equipment data:",
    JSON.stringify(payload),
  ].join("\n");

  let rawText = "";
  let usedModel = DEFAULT_MODEL;
  let lastError = null;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      console.log("[Groq Analysis] Attempting model", {
        modelName,
        equipmentName: payload.name,
      });

      rawText = await requestGroqCompletion({
        apiKey,
        modelName,
        systemInstruction,
        prompt,
      });
      usedModel = modelName;
      lastError = null;
      break;
    } catch (error) {
      lastError = error;

      console.error("[Groq Analysis] Model request failed", {
        modelName,
        message: error?.message,
        status: error?.status || error?.statusCode,
        responseData: error?.responseData,
        stack: error?.stack,
      });

      if (!isModelNotFoundError(error)) {
        throw error;
      }
    }
  }

  if (lastError) {
    console.error("[Groq Analysis] All model attempts failed", {
      message: lastError?.message,
      status: lastError?.status || lastError?.statusCode,
    });
    throw lastError;
  }

  const parsed = safeJsonParse(rawText);
  if (!parsed) {
    console.warn(
      "[Groq Analysis] Failed to parse JSON response. Using fallback analysis.",
      { rawTextSample: rawText?.slice(0, 100) }
    );
    return normalizeAnalysis({
      ...fallbackAnalysisFromText(rawText),
      model: usedModel,
    });
  }

  return normalizeAnalysis({
    ...parsed,
    model: usedModel,
  });
};
