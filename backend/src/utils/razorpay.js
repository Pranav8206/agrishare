import Razorpay from "razorpay";
import crypto from "crypto";
import { createError } from "./CreateError.js";

// Lazy initialization of Razorpay instance to ensure env vars are loaded
let razorpayInstance = null;

const sanitizeEnvValue = (value) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const getRazorpayCredentials = () => {
  const keyId = sanitizeEnvValue(process.env.RAZORPAY_KEY_ID);
  const keySecret = sanitizeEnvValue(process.env.RAZORPAY_KEY_SECRET);

  if (!keyId || !keySecret) {
    throw createError(
      "Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
      500
    );
  }

  const isTestMode = keyId.startsWith("rzp_test_");
  const isLiveMode = keyId.startsWith("rzp_live_");

  if (!isTestMode && !isLiveMode) {
    throw createError(
      "Invalid RAZORPAY_KEY_ID format. Expected rzp_test_* or rzp_live_*",
      500
    );
  }

  return {
    keyId,
    keySecret,
    mode: isTestMode ? "test" : "live",
  };
};

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const { keyId, keySecret } = getRazorpayCredentials();
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

/**
 * Create a Razorpay order for payment
 * @param {Object} params - Order creation params
 * @param {number} params.amount - Amount in smallest currency unit (paise for INR)
 * @param {string} params.bookingId - Reference booking ID
 * @param {string} params.userEmail - Customer email
 * @param {string} params.userName - Customer name (optional)
 * @param {string} params.userPhone - Customer phone (optional)
 * @returns {Promise<Object>} Razorpay order object
 */
export const createRazorpayOrder = async (params) => {
  try {
    const { amount, bookingId, userEmail, userName, userPhone } = params;

    if (!amount || !bookingId || !userEmail) {
      throw createError("amount, bookingId, and userEmail are required", 400);
    }

    // Validate in rupees first, then convert to paise for Razorpay API.
    const amountInRupees = Number(amount);
    const maxAmountInRupees = Number(process.env.RAZORPAY_MAX_AMOUNT || 999999);

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      throw createError("Invalid payment amount", 400);
    }

    if (!Number.isFinite(maxAmountInRupees) || maxAmountInRupees <= 0) {
      throw createError("Invalid RAZORPAY_MAX_AMOUNT configuration", 500);
    }

    if (amountInRupees > maxAmountInRupees) {
      throw createError("Amount exceeds maximum limit", 400);
    }

    // Razorpay expects amount in the smallest currency unit (paise for INR).
    const amountInPaise = Math.round(amountInRupees * 100);

    // Razorpay receipt has a strict max length; keep this compact and unique.
    const compactReceipt = `bk_${String(bookingId).slice(-10)}_${Date.now().toString().slice(-8)}`;

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: compactReceipt,
      notes: {
        bookingId,
        email: userEmail,
        userName: userName || "Guest",
        userPhone: userPhone || "N/A",
        createdAt: new Date().toISOString(),
      },
    };

    const order = await getRazorpayInstance().orders.create(orderOptions);

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      createdAt: new Date(order.created_at * 1000).toISOString(),
    };
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);

    const providerMessage =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      "Failed to create Razorpay order";

    const isAuthFailure =
      error?.statusCode === 401 &&
      /authentication failed/i.test(String(providerMessage));

    if (isAuthFailure) {
      const { mode, keyId } = getRazorpayCredentials();
      const maskedKey = `${keyId.slice(0, 10)}...${keyId.slice(-4)}`;
      throw createError(
        `Razorpay authentication failed for ${mode} mode (key: ${maskedKey}). Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET belong to the same account/mode and do not include quotes or extra spaces. Restart backend after updating .env.`,
        401
      );
    }

    throw createError(providerMessage, error.statusCode || 500);
  }
};

/**
 * Verify payment signature from webhook/frontend
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Payment signature to verify
 * @returns {boolean} Signature validation result
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    if (!orderId || !paymentId || !signature) {
      throw createError("Missing payment verification parameters", 400);
    }

    const { keySecret } = getRazorpayCredentials();

    // Create HMAC-SHA256 hash
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generated_signature),
      Buffer.from(signature)
    );

    return isValid;
  } catch (error) {
    console.error("Signature Verification Error:", error.message);
    // Return false on any error (invalid signature or exception)
    return false;
  }
};

/**
 * Verify webhook signature from Razorpay
 * @param {Object} webhookBody - Raw webhook payload
 * @param {string} webhookSignature - X-Razorpay-Signature header value
 * @returns {boolean} Webhook signature validation result
 */
export const verifyWebhookSignature = (webhookBody, webhookSignature) => {
  try {
    if (!webhookBody || !webhookSignature) {
      throw createError("Missing webhook verification parameters", 400);
    }

    const webhookSecret = sanitizeEnvValue(process.env.RAZORPAY_WEBHOOK_SECRET);
    if (!webhookSecret) {
      throw createError("RAZORPAY_WEBHOOK_SECRET is not configured", 500);
    }

    // Webhook body should be JSON stringified as received
    const bodyString =
      typeof webhookBody === "string"
        ? webhookBody
        : JSON.stringify(webhookBody);

    const generated_signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyString)
      .digest("hex");

    // Constant-time comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generated_signature),
      Buffer.from(webhookSignature)
    );

    return isValid;
  } catch (error) {
    console.error("Webhook Signature Verification Error:", error.message);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    if (!paymentId) {
      throw createError("Payment ID is required", 400);
    }

    const payment = await getRazorpayInstance().payments.fetch(paymentId);

    return {
      success: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      fee: payment.fee,
      tax: payment.tax,
      acquirerData: payment.acquirer_data,
      createdAt: new Date(payment.created_at * 1000).toISOString(),
    };
  } catch (error) {
    console.error("Fetch Payment Error:", error);
    throw createError(
      error.message || "Failed to fetch payment details",
      error.statusCode || 500
    );
  }
};

/**
 * Refund a payment
 * @param {string} paymentId - Razorpay payment ID to refund
 * @param {number} amount - Amount to refund in rupees (optional, full refund if not provided)
 * @param {string} reason - Refund reason (optional)
 * @returns {Promise<Object>} Refund details
 */
export const refundPayment = async (paymentId, amount, reason) => {
  try {
    if (!paymentId) {
      throw createError("Payment ID is required", 400);
    }

    const refundOptions = {};

    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    if (reason) {
      refundOptions.notes = { reason };
    }

    const refund = await getRazorpayInstance().payments.refund(
      paymentId,
      refundOptions
    );

    return {
      success: true,
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      createdAt: new Date(refund.created_at * 1000).toISOString(),
    };
  } catch (error) {
    console.error("Refund Error:", error);
    throw createError(
      error.message || "Failed to refund payment",
      error.statusCode || 500
    );
  }
};

export default {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getPaymentDetails,
  refundPayment,
};
