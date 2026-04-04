"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import Icon from "@/components/AddPage/Icon";
import { icons } from "@/components/AddPage/icons";
import {
  FieldLabel,
  InputField,
  SelectField,
} from "@/components/AddPage/FormFields";
import SectionCard from "@/components/AddPage/SectionCard";
import AvailabilityToggle from "@/components/AddPage/AvailabilityToggle";
import ImageUploader from "@/components/AddPage/ImageUploader";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const MAX_IMAGES = 4;
const MAX_ORIGINAL_FILE_SIZE_MB = 10;
const MAX_COMPRESSED_FILE_SIZE_MB = 2;
const MAX_ORIGINAL_FILE_SIZE_BYTES = MAX_ORIGINAL_FILE_SIZE_MB * 1024 * 1024;
const MAX_COMPRESSED_FILE_SIZE_BYTES =
  MAX_COMPRESSED_FILE_SIZE_MB * 1024 * 1024;
const UPLOAD_CONCURRENCY = 3;

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
};

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const blockVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

function SkeletonBlock({ className = "" }) {
  return (
    <motion.div
      className={`rounded-xl bg-slate-200/70 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function AddEquipmentSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="mt-3 h-4 w-96 max-w-full" />
          <div className="mt-4 flex flex-wrap gap-2">
            <SkeletonBlock className="h-8 w-28" />
            <SkeletonBlock className="h-8 w-28" />
            <SkeletonBlock className="h-8 w-28" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <SkeletonBlock className="h-6 w-44" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonBlock className="h-11 sm:col-span-2" />
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-24 sm:col-span-2" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <SkeletonBlock className="h-6 w-52" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <SkeletonBlock className="h-6 w-36" />
              <div className="grid grid-cols-1 gap-4">
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <SkeletonBlock className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-3">
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Cloudinary error:", data);
    throw new Error(data.error?.message || "Upload failed");
  }

  return data;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "Tractor", labelKey: "add.categoryTractor" },
  { value: "Harvester", labelKey: "add.categoryHarvester" },
  { value: "Baler", labelKey: "add.categoryBaler" },
  { value: "Seeder", labelKey: "add.categorySeeder" },
  { value: "Tillage Equipment", labelKey: "add.categoryTillageEquipment" },
  { value: "Trailer", labelKey: "add.categoryTrailer" },
  { value: "Sprayer", labelKey: "add.categorySprayer" },
  { value: "Other", labelKey: "add.categoryOther" },
];
const FUEL_TYPES = [
  { value: "Diesel", labelKey: "add.fuelDiesel" },
  { value: "Petrol", labelKey: "add.fuelPetrol" },
  { value: "Electric", labelKey: "add.fuelElectric" },
  { value: "Hybrid", labelKey: "add.fuelHybrid" },
  { value: "CNG", labelKey: "add.fuelCng" },
];
const CONDITIONS = ["new", "like_new", "good", "fair", "old"];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AddEquipmentPage() {
  const { t } = useTranslation();
  const { apiBaseUrl, setLoading, setError } = useAppContext();
  const [isPageBootLoading, setIsPageBootLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    pricePerDay: "",
    isAvailable: true,
    condition: "good",
    city: "",
    state: "",
    pincode: "",
    area: "",
    latitude: "",
    longitude: "",
    horsepower: "",
    fuel: "",
    weight: "",
    manufacturingYear: "",
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const activeUploadIdsRef = useRef(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setIsPageBootLoading(false), 550);
    return () => clearTimeout(timer);
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  /**
   * Fetches user's current geolocation using browser's Geolocation API
   * Populates latitude, longitude, and area fields
   */
  const handleGetCurrentLocation = () => {
    setLocationError("");
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      setLocationError(t("add.geolocationNotSupported"));
      setIsGettingLocation(false);
      toast.error(t("add.geolocationNotSupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Update form with coordinates
          setForm((f) => ({
            ...f,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));

          toast.success(t("add.locationFetched"));
          setIsGettingLocation(false);
        } catch (error) {
          console.error("Error processing location:", error);
          setLocationError(t("add.errorProcessingLocation"));
          setIsGettingLocation(false);
          toast.error(t("add.errorProcessingLocation"));
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = t("add.unableToFetchLocation");

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t("add.locationPermissionDenied");
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t("add.locationUnavailable");
            break;
          case error.TIMEOUT:
            errorMessage = t("add.locationTimeout");
            break;
        }

        setLocationError(errorMessage);
        setIsGettingLocation(false);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: false, // Set to false for faster results (less battery drain)
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t("add.nameRequired");
    if (!form.description.trim()) e.description = t("add.descriptionRequired");
    if (!form.category) e.category = t("add.categoryRequired");
    if (!form.pricePerDay) {
      e.pricePerDay = t("add.priceRequired");
    }
    if (!form.city.trim()) e.city = t("add.cityRequired");
    if (!form.state.trim()) e.state = t("add.stateRequired");

    // Validate coordinates if provided
    if (form.latitude || form.longitude) {
      if (!form.latitude || !form.longitude) {
        e.location = t("add.latLngRequired");
      } else {
        const lat = parseFloat(form.latitude);
        const lng = parseFloat(form.longitude);
        if (isNaN(lat) || isNaN(lng)) {
          e.location = t("add.invalidLatLng");
        } else if (lat < -90 || lat > 90) {
          e.location = t("add.invalidLatitude");
        } else if (lng < -180 || lng > 180) {
          e.location = t("add.invalidLongitude");
        }
      }
    }

    return e;
  };

  const compressImage = async (file) => {
    try {
      return await imageCompression(file, COMPRESSION_OPTIONS);
    } catch {
      return file;
    }
  };

  const uploadSingleImage = async (imageId, file) => {
    try {
      const compressedFile = await compressImage(file);

      if (compressedFile.size > MAX_COMPRESSED_FILE_SIZE_BYTES) {
        throw new Error(
          t("add.fileTooLargeAfterCompression", {
            maxMb: MAX_COMPRESSED_FILE_SIZE_MB,
          }),
        );
      }

      const uploaded = await uploadImage(compressedFile);
      const secureUrl = uploaded?.secure_url;

      if (!secureUrl) {
        throw new Error(t("add.uploadFailed"));
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: "uploaded", uploadedUrl: secureUrl, error: "" }
            : img,
        ),
      );
    } catch (error) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                status: "failed",
                uploadedUrl: "",
                error: error?.message || t("add.uploadFailed"),
              }
            : img,
        ),
      );
    }
  };

  const processUploadQueue = () => {
    setImages((prev) => {
      const pending = prev.filter(
        (img) =>
          img.status === "uploading" &&
          !img.uploadedUrl &&
          !activeUploadIdsRef.current.has(img.id),
      );

      if (!pending.length) return prev;

      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        toast.error(t("add.cloudinaryMissing"));
        return prev.map((img) =>
          img.status === "uploading" && !img.uploadedUrl
            ? { ...img, status: "failed", error: t("add.cloudinaryMissing") }
            : img,
        );
      }

      const availableSlots = Math.max(
        0,
        UPLOAD_CONCURRENCY - activeUploadIdsRef.current.size,
      );

      if (availableSlots === 0) return prev;

      pending.slice(0, availableSlots).forEach((img) => {
        activeUploadIdsRef.current.add(img.id);

        uploadSingleImage(img.id, img.file).finally(() => {
          activeUploadIdsRef.current.delete(img.id);
          processUploadQueue();
        });
      });

      return prev;
    });
  };

  const handleRetryUpload = async (imageId) => {
    const image = images.find((img) => img.id === imageId);
    if (!image?.file) return;

    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, status: "uploading", error: "" } : img,
      ),
    );
    processUploadQueue();
  };

  const handleImagesChange = (updater) => {
    setImages((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });

    processUploadQueue();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const uploadingCount = images.filter(
      (img) => img.status === "uploading",
    ).length;
    const uploadedImages = images.filter(
      (img) => img.status === "uploaded" && img.uploadedUrl,
    );

    if (uploadingCount > 0) {
      toast.error(t("add.waitForUploads"));
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error(t("add.minOneImage"));
      return;
    }

    setShowPreviewModal(true);
  };

  const handleFinishSubmit = async () => {
    const uploadedImages = images
      .filter((img) => img.status === "uploaded" && img.uploadedUrl)
      .map((img) => img.uploadedUrl);

    if (uploadedImages.length === 0) {
      toast.error(t("add.minOneImage"));
      return;
    }

    try {
      setIsFinalizing(true);
      setLoading(true);
      setError(null);

      const specifications = {
        ...(form.horsepower.trim()
          ? { horsepower: form.horsepower.trim() }
          : {}),
        ...(form.fuel ? { fuel: form.fuel } : {}),
        ...(form.weight.trim() ? { weight: form.weight.trim() } : {}),
      };

      const address = {
        city: form.city.trim(),
        state: form.state.trim(),
        ...(form.pincode.trim() ? { pincode: form.pincode.trim() } : {}),
        ...(form.area.trim() ? { area: form.area.trim() } : {}),
      };

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.category,
        pricePerDay: Number(form.pricePerDay),
        location: `${address.city}, ${address.state}`,
        manufacturingYear: form.manufacturingYear
          ? Number(form.manufacturingYear)
          : undefined,
        isAvailable: form.isAvailable,
        condition: form.condition,
        specifications,
        address,
        images: uploadedImages.slice(1),
        coverImage: uploadedImages[0],
        // Add geolocation data if provided
        ...(form.latitude && form.longitude
          ? {
              latitude: parseFloat(form.latitude),
              longitude: parseFloat(form.longitude),
            }
          : {}),
      };

      const authToken =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      const res = await axios.post(`${apiBaseUrl}/equipments/add`, payload, {
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : undefined,
      });

      if (!res?.data?.equipment) {
        throw new Error(res?.data?.message || t("add.failedToAddEquipment"));
      }

      toast.success(t("add.equipmentAddedSuccessfully"));
      setShowPreviewModal(false);
      setSubmitted(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("add.somethingWentWrong");
      setError(message);
      toast.error(message);
    } finally {
      setIsFinalizing(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t("add.discardConfirm"))) {
      setForm({
        name: "",
        category: "",
        description: "",
        pricePerDay: "",
        isAvailable: true,
        condition: "good",
        city: "",
        state: "",
        pincode: "",
        area: "",
        latitude: "",
        longitude: "",
        horsepower: "",
        fuel: "",
        weight: "",
        manufacturingYear: "",
      });
      setImages([]);
      setErrors({});
      setLocationError("");
      setSubmitted(false);
      setShowPreviewModal(false);
    }
  };

  const uploadedImages = images.filter(
    (img) => img.status === "uploaded" && img.uploadedUrl,
  );
  const uploadingCount = images.filter(
    (img) => img.status === "uploading",
  ).length;
  const failedCount = images.filter((img) => img.status === "failed").length;
  const totalImages = images.length;

  if (isPageBootLoading) {
    return <AddEquipmentSkeleton />;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon path={icons.check} className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {t("add.listedTitle")}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            <strong className="text-gray-800">{form.name}</strong>{" "}
            {t("add.submittedForReview")}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-primary-accent hover:bg-primary-accent-dark text-white font-black px-6 py-3 rounded-xl
                       transition-all active:scale-95 text-sm"
          >
            {t("add.addAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50/60"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Page Title */}
          <motion.div
            variants={blockVariants}
            className="rounded-2xl border border-emerald-200/60 bg-linear-to-r from-emerald-50 via-lime-50 to-amber-50 px-5 py-5 sm:px-6"
          >
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {t("add.title")}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{t("add.subtitle")}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/80 px-3 py-1 text-emerald-700 border border-emerald-200">
                Uploaded: {uploadedImages.length}
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-blue-700 border border-blue-200">
                Uploading: {uploadingCount}
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-amber-700 border border-amber-200">
                Failed: {failedCount}
              </span>
            </div>
          </motion.div>

          {uploadingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-blue-700">
                {t("add.uploadingProgress", {
                  done: totalImages - uploadingCount,
                  total: totalImages,
                })}
              </p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <motion.div
              className="lg:col-span-7 space-y-6"
              variants={blockVariants}
            >
              {/* 1. Basic Details */}
              <SectionCard
                icon={icons.tractor}
                title={t("add.basicDetails")}
                subtitle={t("add.basicDetailsSubtitle")}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <InputField
                      label={t("add.equipmentName")}
                      icon={icons.tractor}
                      placeholder={t("add.equipmentNamePlaceholder")}
                      value={form.name}
                      onChange={set("name")}
                      error={errors.name}
                      required
                    />
                  </div>
                  <SelectField
                    label={t("add.category")}
                    icon={icons.tag}
                    value={form.category}
                    onChange={set("category")}
                    error={errors.category}
                    required
                  >
                    <option value="">{t("add.selectCategory")}</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {t(c.labelKey)}
                      </option>
                    ))}
                  </SelectField>
                  <div className="sm:col-span-2">
                    <FieldLabel>{t("add.description")}</FieldLabel>
                    <div className="relative">
                      <Icon
                        path={icons.image}
                        className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                      />
                      <textarea
                        placeholder={t("add.descriptionPlaceholder")}
                        value={form.description}
                        onChange={set("description")}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-gray-800
                          focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent
                          transition-all placeholder:text-gray-400 resize-none hover:border-gray-300"
                      />
                    </div>
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* 2. Pricing & Availability */}
              <SectionCard
                icon={icons.rupee}
                title={t("add.pricingAvailability")}
                subtitle={t("add.pricingAvailabilitySubtitle")}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField
                    label={t("add.pricePerDay")}
                    icon={icons.rupee}
                    type="number"
                    min="0"
                    placeholder={t("add.pricePerDayPlaceholder")}
                    value={form.pricePerDay}
                    onChange={set("pricePerDay")}
                    error={errors.pricePerDay}
                    required
                  />
                  <SelectField
                    label={t("add.condition")}
                    value={form.condition}
                    onChange={set("condition")}
                  >
                    {CONDITIONS.map((condition) => (
                      <option key={condition} value={condition}>
                        {t(`add.condition_${condition}`)}
                      </option>
                    ))}
                  </SelectField>
                  <AvailabilityToggle
                    value={form.isAvailable}
                    onChange={(v) => setForm((f) => ({ ...f, isAvailable: v }))}
                  />
                </div>
              </SectionCard>

              {/* 3. Specifications */}
              <SectionCard
                icon={icons.settings}
                title={t("add.specifications")}
                subtitle={t("add.specificationsSubtitle")}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField
                    label={t("add.horsepower")}
                    icon={icons.zap}
                    placeholder={t("add.horsepowerPlaceholder")}
                    value={form.horsepower}
                    onChange={set("horsepower")}
                    optional
                  />
                  <SelectField
                    label={t("add.fuelType")}
                    icon={icons.fuel}
                    value={form.fuel}
                    onChange={set("fuel")}
                    optional
                  >
                    <option value="">{t("add.selectFuelType")}</option>
                    {FUEL_TYPES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {t(f.labelKey)}
                      </option>
                    ))}
                  </SelectField>
                  <InputField
                    label={t("add.weight")}
                    icon={icons.settings}
                    placeholder={t("add.weightPlaceholder")}
                    value={form.weight}
                    onChange={set("weight")}
                    optional
                  />
                  <InputField
                    label={t("add.manufacturingYear")}
                    icon={icons.calendar}
                    type="number"
                    min="1980"
                    max={new Date().getFullYear()}
                    placeholder={t("add.manufacturingYearPlaceholder")}
                    value={form.manufacturingYear}
                    onChange={set("manufacturingYear")}
                    optional
                  />
                </div>
              </SectionCard>
            </motion.div>

            <motion.div
              className="lg:col-span-5 space-y-6 lg:sticky lg:top-24"
              variants={blockVariants}
            >
              {/* 4. Address & Location */}
              <SectionCard
                icon={icons.location}
                title={t("add.address")}
                subtitle={t("add.addressSubtitle")}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <InputField
                    label={t("add.city")}
                    icon={icons.location}
                    placeholder={t("add.cityPlaceholder")}
                    value={form.city}
                    onChange={set("city")}
                    error={errors.city}
                    required
                  />
                  <InputField
                    label={t("add.state")}
                    icon={icons.location}
                    placeholder={t("add.statePlaceholder")}
                    value={form.state}
                    onChange={set("state")}
                    error={errors.state}
                    required
                  />
                  <InputField
                    label={t("add.pincode")}
                    icon={icons.location}
                    placeholder={t("add.pincodePlaceholder")}
                    value={form.pincode}
                    onChange={set("pincode")}
                    optional
                  />
                  <InputField
                    label={t("add.areaLocality")}
                    icon={icons.location}
                    placeholder={t("add.areaLocalityPlaceholder")}
                    value={form.area}
                    onChange={set("area")}
                    optional
                  />
                  {/* Manual Latitude/Longitude Input Fields */}
                  <InputField
                    label={t("add.latitude")}
                    icon={icons.location}
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    placeholder={t("add.latitudePlaceholder")}
                    value={form.latitude}
                    onChange={set("latitude")}
                    optional
                  />
                  <InputField
                    label={t("add.longitude")}
                    icon={icons.location}
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    placeholder={t("add.longitudePlaceholder")}
                    value={form.longitude}
                    onChange={set("longitude")}
                    optional
                  />
                </div>

                {/* Geolocation Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full bg-linear-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 
                               border border-blue-200 text-blue-600 font-bold px-4 py-2.5 rounded-xl
                               transition-all disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span>{t("add.fetchingLocation")}</span>
                      </>
                    ) : (
                      <>
                        <Icon path={icons.location} className="w-4 h-4" />
                        <span>{t("add.useCurrentLocation")}</span>
                      </>
                    )}
                  </button>

                  {locationError && (
                    <p className="text-xs text-red-500 mt-2">{locationError}</p>
                  )}
                </div>

                {/* Coordinates Display (Optional) */}
                {(form.latitude || form.longitude) && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-2">
                      {t("add.coordinatesCaptured")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-blue-500 font-semibold">
                          Latitude
                        </p>
                        <p className="text-xs text-blue-700">
                          {form.latitude
                            ? parseFloat(form.latitude).toFixed(6)
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-500 font-semibold">
                          Longitude
                        </p>
                        <p className="text-xs text-blue-700">
                          {form.longitude
                            ? parseFloat(form.longitude).toFixed(6)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Validation Error Display */}
                {errors.location && (
                  <p className="text-xs text-red-500 mt-2">{errors.location}</p>
                )}
              </SectionCard>

              {/* 5. Image Upload */}
              <SectionCard
                icon={icons.image}
                title={t("add.equipmentImages")}
                subtitle={t("add.equipmentImagesSubtitle")}
              >
                <ImageUploader
                  images={images}
                  setImages={handleImagesChange}
                  onRetryUpload={handleRetryUpload}
                  disabled={isFinalizing}
                  maxImages={MAX_IMAGES}
                  maxOriginalFileSizeBytes={MAX_ORIGINAL_FILE_SIZE_BYTES}
                  maxOriginalFileSizeMb={MAX_ORIGINAL_FILE_SIZE_MB}
                />
                {failedCount > 0 && (
                  <div className="mt-3 text-xs text-primary-accent bg-primary-accent-light/50 border border-primary-accent/30 rounded-lg px-3 py-2">
                    {t("add.failedUploadsNote", { count: failedCount })}
                  </div>
                )}
              </SectionCard>
            </motion.div>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <Icon
                path={icons.info}
                className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-600 font-medium">
                {t("add.validationSummary")}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isFinalizing}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm
                         hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t("add.cancel")}
            </button>
            <button
              type="submit"
              disabled={isFinalizing || uploadingCount > 0}
              className="bg-primary-accent hover:bg-primary-accent-dark text-white font-black px-8 py-2.5 rounded-xl
                         text-sm shadow-sm hover:shadow-lg active:scale-95
                         transition-all duration-150 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isFinalizing ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("add.addingEquipment")}
                </>
              ) : (
                <>
                  <Icon path={icons.check} className="w-4 h-4" />
                  {t("add.previewSubmit")}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {t("add.previewTitle")}
                </h3>
                <p className="text-xs text-gray-500">
                  {t("add.previewSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isFinalizing && setShowPreviewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                disabled={isFinalizing}
              >
                <Icon path={icons.x} className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold text-gray-700">
                      {t("add.equipmentName")}:{" "}
                    </span>
                    {form.name}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">
                      {t("add.category")}:{" "}
                    </span>
                    {form.category}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">
                      {t("add.pricePerDay")}:{" "}
                    </span>
                    {form.pricePerDay}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">
                      {t("add.condition")}:{" "}
                    </span>
                    {t(`add.condition_${form.condition}`)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold text-gray-700">
                      {t("add.city")}:{" "}
                    </span>
                    {form.city}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">
                      {t("add.state")}:{" "}
                    </span>
                    {form.state}
                  </p>
                  {form.pincode && (
                    <p>
                      <span className="font-semibold text-gray-700">
                        {t("add.pincode")}:{" "}
                      </span>
                      {form.pincode}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-gray-700">
                      {t("add.availabilityStatus")}:{" "}
                    </span>
                    {form.isAvailable
                      ? t("add.available")
                      : t("add.notAvailable")}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 text-sm mb-1">
                  {t("add.description")}
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {form.description}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-700 text-sm mb-2">
                  {t("add.equipmentImages")}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {uploadedImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative rounded-lg overflow-hidden border border-gray-100"
                    >
                      <img
                        src={img.uploadedUrl || img.url}
                        alt={img.name}
                        className="h-24 w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {t("add.cover")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {failedCount > 0 && (
                  <p className="text-xs text-primary-accent mt-2">
                    {t("add.failedUploadsNote", { count: failedCount })}
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                disabled={isFinalizing}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {t("add.back")}
              </button>
              <button
                type="button"
                onClick={handleFinishSubmit}
                disabled={
                  isFinalizing ||
                  uploadedImages.length === 0 ||
                  uploadingCount > 0
                }
                className="px-5 py-2 rounded-xl bg-primary-accent hover:bg-primary-accent-dark text-white text-sm font-black disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {t("add.finish")}
              </button>
            </div>

            {isFinalizing && (
              <div className="absolute inset-0 bg-white/85 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <span className="h-10 w-10 border-4 border-primary-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-gray-700">
                    {t("add.finalizing")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
