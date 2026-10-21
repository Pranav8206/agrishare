const toNonNegativeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const getPricingConfig = () => ({
  maxEquipmentDistanceKm: toNonNegativeNumber(
    process.env.MAX_EQUIPMENT_DISTANCE_KM,
    200,
  ),
  transportBaseCharge: toNonNegativeNumber(
    process.env.TRANSPORT_BASE_CHARGE,
    500,
  ),
  transportRatePerKm: toNonNegativeNumber(
    process.env.TRANSPORT_RATE_PER_KM,
    10,
  ),
});

export const calculateTransportCharge = (distanceKm) => {
  const { transportBaseCharge, transportRatePerKm } = getPricingConfig();
  if (!Number.isFinite(distanceKm)) return transportBaseCharge;
  return Math.max(
    transportBaseCharge,
    Math.ceil(distanceKm * transportRatePerKm),
  );
};
