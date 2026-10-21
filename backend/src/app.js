import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const defaultCorsOrigin = "http://localhost:3000";
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [defaultCorsOrigin];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(express.static("public")); // Serve static files Example: /public/image.png (accessible via URL)

// Webhooks need raw body for HMAC signature verification
import webhookRouter from "./routes/webhook.route.js";
app.use("/api/v1/webhooks", express.raw({ type: "application/json" }), webhookRouter);

// Parse JSON for all other routes
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the Booking System API");
});

// routes import
import userRouter from "./routes/user.route.js";
app.use("/api/v1/users", userRouter);

import equipmentRouter from "./routes/equipment.route.js";
app.use("/api/v1/equipments", equipmentRouter);

//booking routes
import bookingRoutes from "./routes/booking.route.js";
app.use("/api/v1/bookings", bookingRoutes);

import reviewRoutes from "./routes/review.route.js";
app.use("/api/v1/reviews", reviewRoutes);

import fertilizerRoutes from "./routes/fertilizer.route.js";
app.use("/api/v1/fertilizers", fertilizerRoutes);

app.use((req, res, next) => {
  console.log("app.js 1");

  const err = new Error("Route not found");
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log("app.js 2");

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
export { app };
