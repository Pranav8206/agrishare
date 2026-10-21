import { createError } from "../utils/CreateError.js";

export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(createError("Admin access required", 403));
  }
  return next();
};
