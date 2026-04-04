import { Equipment } from "./../models/equipment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/CreateError.js";
import { generateEquipmentAnalysis } from "../utils/gemini.js";
import mongoose from "mongoose";

const currentYear = new Date().getFullYear();
const allowedCondition = ["new", "like_new", "good", "fair", "old"];

const isValidYear = (year) => {
  if (year === undefined || year === null || year === "") return true;
  const num = Number(year);
  return Number.isInteger(num) && num >= 1900 && num <= currentYear + 1;
};

/**
 * Validates latitude coordinate
 * Valid range: -90 to 90 degrees
 */
const isValidLatitude = (lat) => {
  const num = Number(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Validates longitude coordinate
 * Valid range: -180 to 180 degrees
 */
const isValidLongitude = (lng) => {
  const num = Number(lng);
  return !isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Sanitizes geolocation data
 * Returns geoLocation object for MongoDB geospatial queries
 */
const sanitizeGeoLocation = (latitude, longitude, address) => {
  if (latitude === undefined || longitude === undefined) {
    return undefined;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    return undefined;
  }

  return {
    type: "Point",
    coordinates: [lng, lat], // Must be [longitude, latitude] for GeoJSON standard
    address: address && typeof address === "string" ? address.trim() : "",
  };
};

const sanitizeSpecifications = (specifications) => {
  if (!specifications || typeof specifications !== "object") return {};

  return Object.entries(specifications).reduce((acc, [key, value]) => {
    if (typeof key !== "string") return acc;
    const cleanKey = key.trim();
    if (!cleanKey) return acc;

    if (value === undefined || value === null) return acc;
    const cleanValue = String(value).trim();
    if (!cleanValue) return acc;

    acc[cleanKey] = cleanValue;
    return acc;
  }, {});
};

const sanitizeAddress = (address) => {
  if (!address || typeof address !== "object") return undefined;

  const cleanAddress = {
    city: typeof address.city === "string" ? address.city.trim() : "",
    state: typeof address.state === "string" ? address.state.trim() : "",
    pincode: typeof address.pincode === "string" ? address.pincode.trim() : "",
  };

  if (!cleanAddress.city && !cleanAddress.state && !cleanAddress.pincode) {
    return undefined;
  }

  return cleanAddress;
};

const ANALYSIS_STALE_MS = 7 * 24 * 60 * 60 * 1000;

const isAnalysisFresh = (analyzedAt) => {
  if (!analyzedAt) return false;
  const time = new Date(analyzedAt).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time <= ANALYSIS_STALE_MS;
};

const getNumericScoreFromPriceLabel = (priceLabel) => {
  if (priceLabel === "good_deal") return 1;
  if (priceLabel === "overpriced") return -1;
  return 0;
};

const isGeminiQuotaError = (error) => {
  const status = Number(error?.status || error?.statusCode || 0);
  const message = String(error?.message || "").toLowerCase();

  return (
    status === 429 ||
    message.includes("quota") ||
    message.includes("too many requests")
  );
};

const getFriendlyAiErrorMessage = (error, action = "generate") => {
  if (isGeminiQuotaError(error)) {
    return "AI analysis quota is currently exhausted. Please retry in a short while.";
  }

  return action === "refresh"
    ? "Unable to refresh equipment analysis right now"
    : "Unable to generate equipment analysis right now";
};

const normalizeLocalizedReason = (value, fallback = "") => {
  if (typeof value === "string") {
    return {
      en: value,
      hi: value,
      mr: value,
    };
  }

  if (!value || typeof value !== "object") {
    return {
      en: fallback,
      hi: fallback,
      mr: fallback,
    };
  }

  const fallbackText = value.en || value.hi || value.mr || fallback;

  return {
    en: value.en || fallbackText,
    hi: value.hi || fallbackText,
    mr: value.mr || fallbackText,
  };
};

const normalizeAnalysisResponse = (analysis = {}) => ({
  priceLabel: analysis.priceLabel || "unknown",
  priceReason: normalizeLocalizedReason(
    analysis.priceReason,
    "Price analysis is unavailable."
  ),
  conditionLabel: analysis.conditionLabel || "unknown",
  conditionReason: normalizeLocalizedReason(
    analysis.conditionReason,
    "Condition estimate is unavailable."
  ),
  confidence: Number(analysis.confidence || 0),
  model:
    analysis.model ||
    process.env.GROQ_MODEL ||
    process.env.GEMINI_MODEL ||
    "llama-3.1-8b-instant",
  analyzedAt: analysis.analyzedAt || null,
});

const getReasonText = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return String(value.en || value.hi || value.mr || "").trim();
};

const hasUsableCachedAnalysis = (analysis) => {
  if (!analysis || typeof analysis !== "object") {
    return false;
  }

  return Boolean(
    getReasonText(analysis.priceReason) &&
      getReasonText(analysis.conditionReason)
  );
};

const getOrGenerateAnalysis = async (equipment, forceRefresh = false) => {
  const existingAnalysis = equipment?.aiAnalysis;

  console.log("[AI Analysis] Evaluating source", {
    equipmentId: equipment?._id,
    forceRefresh,
    hasExistingAnalysis: Boolean(existingAnalysis),
    analyzedAt: existingAnalysis?.analyzedAt,
  });

  if (
    !forceRefresh &&
    hasUsableCachedAnalysis(existingAnalysis) &&
    isAnalysisFresh(existingAnalysis?.analyzedAt)
  ) {
    console.log("[AI Analysis] Using cached analysis", {
      equipmentId: equipment?._id,
      source: "cache",
    });
    return {
      analysis: normalizeAnalysisResponse(existingAnalysis),
      source: "cache",
    };
  }

  console.log("[AI Analysis] Generating new analysis", {
    equipmentId: equipment?._id,
    forceRefresh,
    equipmentName: equipment?.name,
  });

  const generatedAnalysis = await generateEquipmentAnalysis({
    name: equipment.name,
    type: equipment.type,
    description: equipment.description,
    condition: equipment.condition,
    manufacturingYear: equipment.manufacturingYear,
    pricePerDay: equipment.pricePerDay,
    location: equipment.location,
    avgRating: equipment.avgRating,
    numReviews: equipment.numReviews,
    specifications: equipment.specifications,
  });

  const persistedAnalysis = {
    ...generatedAnalysis,
    analyzedAt: new Date(),
  };

  equipment.aiAnalysis = persistedAnalysis;
  const priceReasonEn =
    typeof persistedAnalysis?.priceReason === "string"
      ? persistedAnalysis.priceReason
      : persistedAnalysis?.priceReason?.en || "";
  const conditionReasonEn =
    typeof persistedAnalysis?.conditionReason === "string"
      ? persistedAnalysis.conditionReason
      : persistedAnalysis?.conditionReason?.en || "";

  equipment.aiReview = `${priceReasonEn} ${conditionReasonEn}`.trim();
  equipment.aiScore = getNumericScoreFromPriceLabel(
    persistedAnalysis.priceLabel
  );
  await equipment.save();

  return {
    analysis: normalizeAnalysisResponse(persistedAnalysis),
    source: forceRefresh ? "refresh" : "generated",
  };
};

//  CREATE 
const addEquipment = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    type,
    pricePerDay,
    location,
    manufacturingYear,
    images,
    coverImage,
    isAvailable,
    condition,
    specifications,
    address,
    aiReview,
    aiScore,
    latitude,
    longitude,
  } = req.body;

  if (!req.user?._id) {
    throw createError("Not authorized", 401);
  }

  if (
    !name ||
    !description ||
    pricePerDay === undefined ||
    pricePerDay === null
  ) {
    throw createError("name, description and pricePerDay are required", 400);
  }

  if (Number(pricePerDay) <= 0) {
    throw createError("pricePerDay must be greater than 0", 400);
  }

  if (!isValidYear(manufacturingYear)) {
    throw createError("Invalid manufacturingYear", 400);
  }

  if (condition && !allowedCondition.includes(condition)) {
    throw createError("Invalid condition value", 400);
  }

  // Validate geolocation data if provided
  if (
    (latitude !== undefined && latitude !== null) ||
    (longitude !== undefined && longitude !== null)
  ) {
    if (latitude === undefined || longitude === undefined) {
      throw createError(
        "Both latitude and longitude are required for geolocation",
        400
      );
    }
    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      throw createError(
        "Invalid latitude or longitude. Latitude must be between -90 and 90, longitude between -180 and 180",
        400
      );
    }
  }

  const duplicate = await Equipment.findOne({
    owner: req.user._id,
    name: String(name).trim(),
    type: type ? String(type).trim() : { $in: [null, ""] },
    location: location ? String(location).trim() : { $in: [null, ""] },
  });

  if (duplicate) {
    throw createError("Similar equipment already exists for this owner", 409);
  }

  const cleanImages = Array.isArray(images)
    ? images.filter((img) => typeof img === "string" && img.trim().length > 0)
    : [];

  const cleanSpecifications = sanitizeSpecifications(specifications);
  const cleanAddress = sanitizeAddress(address);
  const geoLocationData = sanitizeGeoLocation(latitude, longitude, address?.area || address?.city);

  const equipment = await Equipment.create({
    name: String(name).trim(),
    description: String(description).trim(),
    type: type ? String(type).trim() : undefined,
    pricePerDay: Number(pricePerDay),
    location: location ? String(location).trim() : undefined,
    manufacturingYear: manufacturingYear
      ? Number(manufacturingYear)
      : undefined,
    images: cleanImages,
    coverImage:
      coverImage && typeof coverImage === "string"
        ? coverImage.trim()
        : cleanImages[0],
    isAvailable:
      isAvailable === undefined || isAvailable === null
        ? true
        : Boolean(isAvailable),
    condition: condition || undefined,
    specifications: cleanSpecifications,
    address: cleanAddress,
    geoLocation: geoLocationData,
    aiReview,
    aiScore,
    owner: req.user._id,
  });

  res.status(201).json({
    message: "Equipment added successfully",
    equipment,
  });
});

//  VIEW ALL 
const viewAllEquipments = asyncHandler(async (req, res) => {
  const equipments = await Equipment.find()
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    total: equipments.length,
    equipments,
  });
});

//  VIEW SINGLE 
const viewSingleEquipment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw createError("Equipment ID is required", 400);
  }

  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid equipment ID", 400);
  }

  const equipment = await Equipment.findById(id).populate(
    "owner",
    "name email phone"
  );

  if (!equipment) {
    throw createError("Equipment not found", 404);
  }

  res.status(200).json({
    equipment,
  });
});

//  VIEW MY 
const viewMyEquipments = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw createError("Not authorized", 401);
  }

  const equipments = await Equipment.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    data: equipments,
    total: equipments.length,
  });
});

//  VIEW BY USER 
const viewEquipmentsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw createError("User ID is required", 400);
  }

  const equipments = await Equipment.find({ owner: userId })
    .populate("owner", "fullName email phone profilePic isVerified")
    .sort({ createdAt: -1 });

  res.status(200).json({
    total: equipments.length,
    equipments,
  });
});

//  UPDATE 
const updateEquipment = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw createError("Not authorized", 401);
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw createError("No fields provided for update", 400);
  }

  if (req.body.pricePerDay !== undefined && Number(req.body.pricePerDay) <= 0) {
    throw createError("pricePerDay must be greater than 0", 400);
  }

  if (!isValidYear(req.body.manufacturingYear)) {
    throw createError("Invalid manufacturingYear", 400);
  }

  if (
    req.body.condition !== undefined &&
    req.body.condition !== null &&
    !allowedCondition.includes(req.body.condition)
  ) {
    throw createError("Invalid condition value", 400);
  }

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    throw createError("Equipment not found", 404);
  }

  if (equipment.owner.toString() !== req.user._id.toString()) {
    throw createError("Not authorized", 403);
  }

  const payload = {
    ...req.body,
    ...(req.body.name !== undefined
      ? { name: String(req.body.name).trim() }
      : {}),
    ...(req.body.description !== undefined
      ? { description: String(req.body.description).trim() }
      : {}),
    ...(req.body.type !== undefined
      ? { type: String(req.body.type).trim() }
      : {}),
    ...(req.body.location !== undefined
      ? { location: String(req.body.location).trim() }
      : {}),
    ...(req.body.pricePerDay !== undefined
      ? { pricePerDay: Number(req.body.pricePerDay) }
      : {}),
    ...(req.body.manufacturingYear !== undefined
      ? { manufacturingYear: Number(req.body.manufacturingYear) }
      : {}),
    ...(req.body.images !== undefined
      ? {
        images: Array.isArray(req.body.images)
          ? req.body.images.filter(
            (img) => typeof img === "string" && img.trim().length > 0
          )
          : [],
      }
      : {}),
    ...(req.body.coverImage !== undefined
      ? {
        coverImage:
          typeof req.body.coverImage === "string"
            ? req.body.coverImage.trim()
            : undefined,
      }
      : {}),
    ...(req.body.isAvailable !== undefined
      ? { isAvailable: Boolean(req.body.isAvailable) }
      : {}),
    ...(req.body.condition !== undefined
      ? { condition: req.body.condition }
      : {}),
    ...(req.body.specifications !== undefined
      ? { specifications: sanitizeSpecifications(req.body.specifications) }
      : {}),
    ...(req.body.address !== undefined
      ? { address: sanitizeAddress(req.body.address) }
      : {}),
  };

  const updatedEquipment = await Equipment.findByIdAndUpdate(
    req.params.id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    data: updatedEquipment,
    message: "Equipment updated",
  });
});

//  DELETE 
const deleteEquipment = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw createError("Not authorized", 401);
  }

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    throw createError("Equipment not found", 404);
  }

  if (equipment.owner.toString() !== req.user._id.toString()) {
    throw createError("Not authorized for this equipment", 403);
  }

  await equipment.deleteOne();

  res.status(200).json({
    message: "Equipment deleted successfully",
  });
});

const getEquipmentAiAnalysis = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw createError("Not authorized", 401);
  }

  console.log("[AI Analysis] GET request received", {
    equipmentId: req.params.id,
    userId: req.user?._id,
  });

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    throw createError("Equipment not found", 404);
  }

  try {
    const { analysis, source } = await getOrGenerateAnalysis(equipment, false);

    console.log("[AI Analysis] GET request succeeded", {
      equipmentId: req.params.id,
      source,
    });

    res.status(200).json({
      analysis,
      source,
    });
  } catch (error) {
    console.error("[AI Analysis] GET request failed", {
      equipmentId: req.params.id,
      userId: req.user?._id,
      message: error?.message,
      status: error?.status || error?.statusCode,
      responseData: error?.responseData,
      stack: error?.stack,
    });

    const existingAnalysis = equipment?.aiAnalysis;

    if (
      isGeminiQuotaError(error) &&
      hasUsableCachedAnalysis(existingAnalysis)
    ) {
      return res.status(200).json({
        analysis: normalizeAnalysisResponse(existingAnalysis),
        source: "stale_cache_quota",
        warning:
          "Showing last saved analysis because AI quota is temporarily exhausted.",
        debugError: {
          message: error?.message || "Unknown Gemini error",
          status: Number(error?.status || error?.statusCode || 0) || null,
        },
      });
    }

    console.error("[AI Analysis] GET request throwing API error", {
      equipmentId: req.params.id,
      action: "generate",
      status: isGeminiQuotaError(error) ? 429 : 502,
      friendlyMessage: getFriendlyAiErrorMessage(error, "generate"),
      rootCause: error?.message,
      providerResponse: error?.responseData,
    });

    throw createError(
      getFriendlyAiErrorMessage(error, "generate"),
      isGeminiQuotaError(error) ? 429 : 502
    );
  }
});

const refreshEquipmentAiAnalysis = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw createError("Not authorized", 401);
  }

  console.log("[AI Analysis] Refresh request received", {
    equipmentId: req.params.id,
    userId: req.user?._id,
  });

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    throw createError("Equipment not found", 404);
  }

  try {
    const { analysis, source } = await getOrGenerateAnalysis(equipment, true);

    console.log("[AI Analysis] Refresh request succeeded", {
      equipmentId: req.params.id,
      source,
    });

    res.status(200).json({
      analysis,
      source,
    });
  } catch (error) {
    console.error("[AI Analysis] Refresh request failed", {
      equipmentId: req.params.id,
      userId: req.user?._id,
      message: error?.message,
      status: error?.status || error?.statusCode,
      responseData: error?.responseData,
      stack: error?.stack,
    });

    const existingAnalysis = equipment?.aiAnalysis;

    if (
      isGeminiQuotaError(error) &&
      hasUsableCachedAnalysis(existingAnalysis)
    ) {
      return res.status(200).json({
        analysis: normalizeAnalysisResponse(existingAnalysis),
        source: "stale_cache_quota",
        warning:
          "Showing last saved analysis because AI quota is temporarily exhausted.",
        debugError: {
          message: error?.message || "Unknown Gemini error",
          status: Number(error?.status || error?.statusCode || 0) || null,
        },
      });
    }

    console.error("[AI Analysis] Refresh request throwing API error", {
      equipmentId: req.params.id,
      action: "refresh",
      status: isGeminiQuotaError(error) ? 429 : 502,
      friendlyMessage: getFriendlyAiErrorMessage(error, "refresh"),
      rootCause: error?.message,
      providerResponse: error?.responseData,
    });

    throw createError(
      getFriendlyAiErrorMessage(error, "refresh"),
      isGeminiQuotaError(error) ? 429 : 502
    );
  }
});

//  EXPORT 
export {
  addEquipment,
  viewAllEquipments,
  viewSingleEquipment,
  viewMyEquipments,
  viewEquipmentsByUser,
  updateEquipment,
  deleteEquipment,
  getEquipmentAiAnalysis,
  refreshEquipmentAiAnalysis,
};
