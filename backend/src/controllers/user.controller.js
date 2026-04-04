import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/CreateError.js";
import {
  normalizeEmail,
  sanitizeAuthUser,
  verifyCaptchaToken,
} from "../utils/auth.helpers.js";

const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// REGISTER
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, captchaToken } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    throw createError("Email and password are required", 400);
  }

  if (password.length < 8) {
    throw createError("Password must be at least 8 characters long", 400);
  }

  await verifyCaptchaToken(captchaToken);

  const userExist = await User.findOne({ email: normalizedEmail });
  if (userExist?.isVerified === true) {
    throw createError("User already exists", 400);
  }

  if (userExist?.isVerified === false) {
    await User.findByIdAndDelete(userExist._id);
  }

  const user = await User.create({
    fullName: String(fullName || "").trim(),
    email: normalizedEmail,
    password,
    isVerified: true,
  });

  const token = generateToken(user._id);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      token,
      user: sanitizeAuthUser(user),
    },
  });
});

// LOGIN
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, captchaToken } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    throw createError("Email and password are required", 400);
  }

  await verifyCaptchaToken(captchaToken);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw createError("User not found", 400);
  }

  if (user.isVerified === false) {
    throw createError("Please verify your email first", 403);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw createError("Invalid credentials", 400);
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: sanitizeAuthUser(user),
    },
  });
});

// GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: sanitizeAuthUser(req.user),
  });
});

// GET USER BY ID
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw createError("User ID is required", 400);
  }

  const user = await User.findById(userId).select("-password -otp -otpExpiry");

  if (!user) {
    throw createError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: sanitizeAuthUser(user),
  });
});

// UPDATE CURRENT USER PROFILE
const updateCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createError("Not authorized", 401);
  }

  const { fullName, email, phone, profilePic } = req.body;
  const updates = {};

  if (typeof fullName === "string") {
    updates.fullName = fullName.trim();
  }

  if (typeof profilePic === "string") {
    updates.profilePic = profilePic.trim();
  }

  if (typeof phone === "string") {
    updates.phone = phone.trim();
  }

  if (typeof email === "string") {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      throw createError("Email cannot be empty", 400);
    }

    const existing = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (existing) {
      throw createError("Email already in use", 400);
    }

    updates.email = normalizedEmail;
  }

  if (!Object.keys(updates).length) {
    throw createError("No valid fields provided for update", 400);
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

// CHANGE PASSWORD
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createError("Not authorized", 401);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError("currentPassword and newPassword are required", 400);
  }

  if (newPassword.length < 8) {
    throw createError("Password must be at least 8 characters long", 400);
  }

  if (currentPassword === newPassword) {
    throw createError(
      "New password must be different from current password",
      400
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw createError("Current password is incorrect", 400);
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// DELETE ACCOUNT
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndDelete(userId);

  return res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});

// LOGOUT
const logoutUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserById,
  updateCurrentUser,
  changePassword,
  deleteAccount,
  logoutUser,
};
