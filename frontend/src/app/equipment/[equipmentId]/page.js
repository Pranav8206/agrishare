"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Star,
  CheckCircle,
  Info,
  Award,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/AppContext";
import BookingModal from "@/Components/BookingModal";
import BreadcrumbNav from "@/Components/equipmentdetail/BreadcrumbNav";
import ImageGallery from "@/Components/equipmentdetail/ImageGallery";
import AiAnalysisPanel from "@/Components/equipmentdetail/AiAnalysisPanel";
import ReviewsSection from "@/Components/equipmentdetail/ReviewsSection";
import EquipmentInfoCard from "@/Components/equipmentdetail/EquipmentInfoCard";
import SimilarEquipmentSection from "@/Components/equipmentdetail/SimilarEquipmentSection";

const renderRatingStars = (ratingValue = 0) => {
  const rounded = Math.round(Number(ratingValue) || 0);
  return new Array(5)
    .fill(null)
    .map((_, index) => (
      <Star
        key={index}
        size={16}
        className={
          index < rounded ? "fill-green-600 text-green-600" : "text-gray-300"
        }
      />
    ));
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (dateValue, fallback) => {
  if (!dateValue) return fallback;
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return fallback;
  return parsedDate.toLocaleString();
};

const pageVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

function SkeletonBar({ className = "" }) {
  return (
    <motion.div
      className={`rounded-xl bg-slate-200/80 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function EquipmentDetailsSkeleton() {
  return (
    <motion.section
      className="mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="rounded-3xl border border-emerald-200/50 bg-linear-to-r from-emerald-50 via-lime-50 to-amber-50 p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SkeletonBar className="h-7 w-64" />
        <SkeletonBar className="mt-3 h-4 w-80 max-w-full" />
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <SkeletonBar className="h-72 w-full" />
            <div className="grid grid-cols-4 gap-2">
              <SkeletonBar className="h-16" />
              <SkeletonBar className="h-16" />
              <SkeletonBar className="h-16" />
              <SkeletonBar className="h-16" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <SkeletonBar className="h-5 w-40" />
            <SkeletonBar className="h-4 w-full" />
            <SkeletonBar className="h-4 w-4/5" />
            <SkeletonBar className="h-20 w-full" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <SkeletonBar className="h-5 w-48" />
            <SkeletonBar className="h-16 w-full" />
            <SkeletonBar className="h-16 w-full" />
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 h-fit shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
        >
          <SkeletonBar className="h-6 w-56" />
          <SkeletonBar className="h-4 w-36" />
          <SkeletonBar className="h-28 w-full" />
          <SkeletonBar className="h-11 w-full" />
          <SkeletonBar className="h-11 w-full" />
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function EquipmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params?.equipmentId;
  const { t } = useTranslation();
  const { apiBaseUrl, user, isAuthenticated, authReady } = useAppContext();

  const [equipment, setEquipment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingMyReviews, setLoadingMyReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [refreshingAiAnalysis, setRefreshingAiAnalysis] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState("");
  const [similarEquipments, setSimilarEquipments] = useState([]);
  const [loadingSimilarEquipments, setLoadingSimilarEquipments] =
    useState(false);
  const [similarFallbackUsed, setSimilarFallbackUsed] = useState(false);
  const [ownerEquipmentCount, setOwnerEquipmentCount] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [error, setError] = useState("");

  const specificationEntries = useMemo(() => {
    const specs = equipment?.specifications;

    if (!specs) return [];

    if (specs instanceof Map) {
      return Array.from(specs.entries());
    }

    if (typeof specs === "object") {
      return Object.entries(specs);
    }

    return [];
  }, [equipment?.specifications]);

  const imageList = useMemo(() => {
    const images = Array.isArray(equipment?.images) ? equipment.images : [];
    const combined = [equipment?.coverImage, ...images].filter(Boolean);
    return [...new Set(combined)];
  }, [equipment?.coverImage, equipment?.images]);

  const conditionLabel = useMemo(() => {
    if (!equipment?.condition) {
      return t("equipment.conditionUnknown", { defaultValue: "Unknown" });
    }

    return String(equipment.condition)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [equipment?.condition, t]);

  const fullAddress = useMemo(() => {
    const city = equipment?.address?.city;
    const state = equipment?.address?.state;
    const pincode = equipment?.address?.pincode;
    return [city, state, pincode].filter(Boolean).join(", ");
  }, [
    equipment?.address?.city,
    equipment?.address?.state,
    equipment?.address?.pincode,
  ]);

  const normalizedDescription = useMemo(() => {
    const value = String(equipment?.description || "").trim();
    return (
      value ||
      t("equipment.noDescription", {
        defaultValue: "No description available for this equipment.",
      })
    );
  }, [equipment?.description, t]);

  const mapData = useMemo(() => {
    const coords = equipment?.geoLocation?.coordinates;

    if (
      Array.isArray(coords) &&
      coords.length === 2 &&
      Number.isFinite(Number(coords[0])) &&
      Number.isFinite(Number(coords[1]))
    ) {
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);

      return {
        hasValidCoords: true,
        lat,
        lng,
        label:
          equipment?.geoLocation?.address ||
          equipment?.location ||
          "Location unavailable",
        embedUrl: `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`,
        openUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      };
    }

    return {
      hasValidCoords: false,
      lat: null,
      lng: null,
      label: equipment?.location || "Location unavailable",
      embedUrl: "",
      openUrl: "",
    };
  }, [
    equipment?.geoLocation?.coordinates,
    equipment?.geoLocation?.address,
    equipment?.location,
  ]);

  const descriptionLimit = 240;
  const hasLongDescription = normalizedDescription.length > descriptionLimit;
  const previewDescription = hasLongDescription
    ? `${normalizedDescription.slice(0, descriptionLimit).trim()}...`
    : normalizedDescription;

  const currentUserId = user?._id ? String(user._id) : "";

  const myReviewForThisEquipment = useMemo(() => {
    if (!equipment?._id || !currentUserId || !myReviews.length) return null;

    return (
      myReviews.find((review) => {
        const reviewEquipmentId = review?.equipment?._id || review?.equipment;
        return String(reviewEquipmentId) === String(equipment._id);
      }) || null
    );
  }, [equipment?._id, currentUserId, myReviews]);

  const orderedReviews = useMemo(() => {
    if (!reviews.length) return [];

    if (!myReviewForThisEquipment?._id) return reviews;

    const myReviewId = String(myReviewForThisEquipment._id);
    const otherReviews = reviews.filter(
      (review) => String(review?._id) !== myReviewId,
    );

    return [myReviewForThisEquipment, ...otherReviews];
  }, [reviews, myReviewForThisEquipment]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (sum, review) => sum + Number(review?.rating || 0),
      0,
    );
    return total / reviews.length;
  }, [reviews]);

  const getPriceLabelMeta = useCallback((value) => {
    const label = String(value || "unknown").toLowerCase();

    if (label === "good_deal") {
      return {
        title: "Fair Price. Matches average market rate",
        shortTitle: "Fair Price",
        className: "text-green-700",
        bgClass: "bg-green-50",
        icon: TrendingUp,
      };
    }

    if (label === "overpriced") {
      return {
        title: "Above Market Rate",
        shortTitle: "Overpriced",
        className: "text-red-700",
        bgClass: "bg-red-50",
        icon: AlertCircle,
      };
    }

    if (label === "fair") {
      return {
        title: "Fair Price. Matches average market rate",
        shortTitle: "Fair Price",
        className: "text-emerald-700",
        bgClass: "bg-emerald-50",
        icon: CheckCircle,
      };
    }

    return {
      title: "Market Unclear",
      shortTitle: "Market Unclear",
      className: "text-gray-700",
      bgClass: "bg-gray-50",
      icon: Info,
    };
  }, []);

  const getConditionLabelMeta = useCallback((value) => {
    const label = String(value || "unknown").toLowerCase();

    if (label === "excellent") {
      return {
        title: "Excellent Condition",
        shortTitle: "Excellent",
        className: "text-green-700",
        bgClass: "bg-green-50",
        icon: Award,
      };
    }

    if (label === "good") {
      return {
        title: "Good Condition. Estimated usage: 1200 hours",
        shortTitle: "Good Condition",
        className: "text-emerald-700",
        bgClass: "bg-emerald-50",
        icon: CheckCircle,
      };
    }

    if (label === "average") {
      return {
        title: "Average Condition",
        shortTitle: "Average",
        className: "text-amber-700",
        bgClass: "bg-amber-50",
        icon: AlertCircle,
      };
    }

    if (label === "poor") {
      return {
        title: "Poor Condition",
        shortTitle: "Poor",
        className: "text-red-700",
        bgClass: "bg-red-50",
        icon: AlertCircle,
      };
    }

    return {
      title: "Condition Unknown",
      shortTitle: "Unknown",
      className: "text-gray-700",
      bgClass: "bg-gray-50",
      icon: Info,
    };
  }, []);

  const getLocalizedReasonText = useCallback((reasonValue) => {
    if (!reasonValue) return "";

    if (typeof reasonValue === "string") return reasonValue;

    if (typeof reasonValue !== "object") return "";

    return reasonValue.en || reasonValue.hi || reasonValue.mr || "";
  }, []);

  const fetchEquipmentReviews = useCallback(async () => {
    if (!equipmentId) return;

    setLoadingReviews(true);

    try {
      const response = await axios.get(
        `${apiBaseUrl}/reviews/equipment/${equipmentId}`,
      );
      setReviews(response?.data?.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [equipmentId, apiBaseUrl]);

  const fetchMyReviews = useCallback(async () => {
    if (!authReady || !isAuthenticated) {
      setMyReviews([]);
      return;
    }

    setLoadingMyReviews(true);

    try {
      const response = await axios.get(`${apiBaseUrl}/reviews/my`);
      setMyReviews(response?.data?.reviews || []);
    } catch {
      setMyReviews([]);
    } finally {
      setLoadingMyReviews(false);
    }
  }, [authReady, isAuthenticated, apiBaseUrl]);

  const fetchAiAnalysis = useCallback(
    async (forceRefresh = false) => {
      if (!equipment?._id || !authReady || !isAuthenticated) {
        setAiAnalysis(null);
        setAiAnalysisError("");
        return;
      }

      const endpoint = `${apiBaseUrl}/equipments/${equipment._id}/ai-analysis${forceRefresh ? "/refresh" : ""}`;
      console.log("[AI Analysis] Starting request", {
        equipmentId: equipment._id,
        forceRefresh,
        endpoint,
        authReady,
        isAuthenticated,
        apiBaseUrl,
      });

      if (forceRefresh) {
        setRefreshingAiAnalysis(true);
      } else {
        setLoadingAiAnalysis(true);
      }

      setAiAnalysisError("");

      try {
        const response = forceRefresh
          ? await axios.post(endpoint, {}, { timeout: 20000 })
          : await axios.get(endpoint, { timeout: 20000 });

        console.log("[AI Analysis] Response received", {
          endpoint,
          status: response?.status,
          source: response?.data?.source,
          hasAnalysis: Boolean(response?.data?.analysis),
        });

        if (response?.data?.source === "stale_cache_quota") {
          console.warn(
            "[AI Analysis] Serving cached analysis due to AI provider issue",
            {
              warning: response?.data?.warning,
              debugError: response?.data?.debugError,
            },
          );
        }

        const analysis = response?.data?.analysis || null;

        if (!analysis) {
          console.warn("[AI Analysis] Response did not include analysis", {
            endpoint,
            responseData: response?.data,
          });
          setAiAnalysis(null);
          setAiAnalysisError("AI analysis data is unavailable.");
          return;
        }

        setAiAnalysis(analysis);
      } catch (fetchError) {
        console.error("[AI Analysis] Request failed", {
          endpoint,
          equipmentId: equipment?._id,
          forceRefresh,
          status: fetchError?.response?.status,
          responseData: fetchError?.response?.data,
          message: fetchError?.message,
        });
        const message =
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          "Unable to load AI analysis right now.";
        setAiAnalysis(null);
        setAiAnalysisError(message);
      } finally {
        if (forceRefresh) {
          setRefreshingAiAnalysis(false);
        } else {
          setLoadingAiAnalysis(false);
        }
      }
    },
    [apiBaseUrl, authReady, equipment?._id, isAuthenticated],
  );

  const fetchSimilarEquipments = useCallback(async () => {
    if (!equipment?._id) {
      setSimilarEquipments([]);
      setSimilarFallbackUsed(false);
      return;
    }

    setLoadingSimilarEquipments(true);

    try {
      const response = await axios.get(`${apiBaseUrl}/equipments`);
      const allEquipments = Array.isArray(response?.data?.equipments)
        ? response.data.equipments
        : [];

      const candidates = allEquipments.filter(
        (item) => String(item?._id || "") !== String(equipment._id),
      );

      const normalizeType = (value) =>
        String(value || "")
          .trim()
          .toLowerCase();
      const currentType = normalizeType(equipment?.type);

      const sameType = currentType
        ? candidates.filter((item) => normalizeType(item?.type) === currentType)
        : [];

      if (sameType.length > 0) {
        setSimilarEquipments(sameType.slice(0, 3));
        setSimilarFallbackUsed(false);
        return;
      }

      const currentNameWords = new Set(
        String(equipment?.name || "")
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean),
      );

      const scored = candidates
        .map((item) => {
          let score = 0;

          const currentLocation = String(
            equipment?.location || "",
          ).toLowerCase();
          const itemLocation = String(item?.location || "").toLowerCase();
          if (
            currentLocation &&
            itemLocation &&
            currentLocation === itemLocation
          ) {
            score += 3;
          }

          const currentPrice = Number(equipment?.pricePerDay || 0);
          const itemPrice = Number(item?.pricePerDay || 0);
          if (currentPrice > 0 && itemPrice > 0) {
            const diffRatio = Math.abs(itemPrice - currentPrice) / currentPrice;
            if (diffRatio <= 0.15) {
              score += 3;
            } else if (diffRatio <= 0.3) {
              score += 2;
            } else if (diffRatio <= 0.5) {
              score += 1;
            }
          }

          if (item?.isAvailable) {
            score += 2;
          }

          const itemNameWords = String(item?.name || "")
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
          const overlapCount = itemNameWords.reduce(
            (count, word) => (currentNameWords.has(word) ? count + 1 : count),
            0,
          );
          score += Math.min(overlapCount, 3);

          return { item, score };
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const aTime = new Date(a.item?.createdAt || 0).getTime();
          const bTime = new Date(b.item?.createdAt || 0).getTime();
          return bTime - aTime;
        })
        .slice(0, 3)
        .map((entry) => entry.item);

      setSimilarEquipments(scored);
      setSimilarFallbackUsed(scored.length > 0);
    } catch {
      setSimilarEquipments([]);
      setSimilarFallbackUsed(false);
    } finally {
      setLoadingSimilarEquipments(false);
    }
  }, [
    apiBaseUrl,
    equipment?._id,
    equipment?.location,
    equipment?.name,
    equipment?.pricePerDay,
    equipment?.type,
  ]);

  useEffect(() => {
    if (!equipmentId) return;

    const fetchEquipment = async () => {
      setLoadingEquipment(true);
      setError("");

      try {
        const response = await axios.get(
          `${apiBaseUrl}/equipments/${equipmentId}`,
        );
        const selectedEquipment = response?.data?.equipment || null;

        if (!selectedEquipment) {
          setError(t("equipment.notFound"));
          setEquipment(null);
          return;
        }

        setEquipment(selectedEquipment);
      } catch (fetchError) {
        const message =
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          t("equipment.loadError");
        setError(message);
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchEquipment();
  }, [apiBaseUrl, equipmentId, t]);

  useEffect(() => {
    fetchEquipmentReviews();
  }, [fetchEquipmentReviews]);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  useEffect(() => {
    if (!equipment?._id) return;
    fetchAiAnalysis(false);
  }, [equipment?._id, fetchAiAnalysis]);

  useEffect(() => {
    fetchSimilarEquipments();
  }, [fetchSimilarEquipments]);

  useEffect(() => {
    setShowFullDescription(false);
  }, [equipment?._id]);

  const ownerId = equipment?.owner?._id || equipment?.owner;
  const ownerIdString = ownerId ? String(ownerId) : "";

  useEffect(() => {
    if (!ownerIdString) {
      setOwnerEquipmentCount(null);
      return;
    }

    let isActive = true;

    const fetchOwnerEquipmentCount = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/equipments/user/${ownerIdString}`,
        );

        if (!isActive) return;

        const total = Number(response?.data?.total ?? 0);
        setOwnerEquipmentCount(Number.isFinite(total) ? total : 0);
      } catch {
        if (isActive) {
          setOwnerEquipmentCount(null);
        }
      }
    };

    fetchOwnerEquipmentCount();

    return () => {
      isActive = false;
    };
  }, [apiBaseUrl, ownerIdString]);

  const handleRefreshAiAnalysis = async () => {
    await fetchAiAnalysis(true);
  };

  const handleOpenBookingModal = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue booking.");
      router.push("/login");
      return;
    }

    if (isEquipmentOwner) {
      toast.error("You cannot book your own equipment.");
      return;
    }

    if (!equipment?.isAvailable) {
      toast.error("This equipment is currently unavailable.");
      return;
    }

    setIsBookingModalOpen(true);
  };

  const handleBooked = () => {
    setIsBookingModalOpen(false);
    router.push("/user/manage-bookings");
  };

  const handleCreateReview = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to post a review.");
      router.push("/login");
      return;
    }

    if (!equipment?._id) {
      toast.error("Equipment not found.");
      return;
    }

    if (isEquipmentOwner) {
      toast.error("Owner cannot review own equipment.");
      return;
    }

    if (myReviewForThisEquipment) {
      toast.error("You already reviewed this equipment.");
      return;
    }

    const cleanedComment = reviewComment.trim();

    if (!cleanedComment) {
      toast.error("Please write a review comment.");
      return;
    }

    setSubmittingReview(true);

    try {
      await axios.post(`${apiBaseUrl}/reviews`, {
        equipment: equipment._id,
        rating: Number(reviewRating),
        comment: cleanedComment,
      });

      toast.success("Review posted successfully.");
      setReviewComment("");
      setReviewRating(5);
      await Promise.all([fetchEquipmentReviews(), fetchMyReviews()]);
    } catch (postError) {
      const message =
        postError?.response?.data?.message || "Unable to post review.";
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId, isAuthor) => {
    if (!isAuthenticated) {
      toast.error("Please log in to manage your review.");
      router.push("/login");
      return;
    }

    if (!isAuthor) {
      toast.error("You can only delete your own review.");
      return;
    }

    setDeletingReviewId(String(reviewId));

    try {
      await axios.delete(`${apiBaseUrl}/reviews/${reviewId}`);
      toast.success("Review deleted.");
      await Promise.all([fetchEquipmentReviews(), fetchMyReviews()]);
    } catch (deleteError) {
      const message =
        deleteError?.response?.data?.message || "Unable to delete review.";
      toast.error(message);
    } finally {
      setDeletingReviewId("");
    }
  };

  const ownerPhone = equipment?.owner?.phone || "";
  const isEquipmentOwner =
    Boolean(currentUserId) &&
    Boolean(ownerIdString) &&
    currentUserId === ownerIdString;

  const ownerName =
    equipment?.owner?.fullName ||
    equipment?.owner?.name ||
    equipment?.owner?.email ||
    equipment?.owner ||
    t("equipment.unknownOwner");

  const availabilityText = equipment?.isAvailable
    ? t("equipment.available", { defaultValue: "Available Now" })
    : t("equipment.unavailableStatus", {
        defaultValue: "Currently Unavailable",
      });
  const availabilityClassName = equipment?.isAvailable
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-gray-100 text-gray-600 border-gray-200";

  const priceMeta = getPriceLabelMeta(aiAnalysis?.priceLabel);
  const conditionMeta = getConditionLabelMeta(aiAnalysis?.conditionLabel);
  const localizedPriceReason = getLocalizedReasonText(aiAnalysis?.priceReason);
  const localizedConditionReason = getLocalizedReasonText(
    aiAnalysis?.conditionReason,
  );

  if (loadingEquipment) {
    return <EquipmentDetailsSkeleton />;
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-100 bg-red-50 p-8"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">
                {t("equipment.loadError")}
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  if (!equipment) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-100 bg-white p-8 text-sm text-gray-500 shadow-sm"
        >
          {t("equipment.unavailable")}
        </motion.div>
      </section>
    );
  }

  return (
    <motion.section
      className="relative mx-auto max-w-6xl px-4 py-8 md:py-12"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={sectionVariants}>
        <BreadcrumbNav equipmentName={equipment.name} />
      </motion.div>

      <motion.div
        className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
        variants={sectionVariants}
      >
        <motion.div className="space-y-6" variants={sectionVariants}>
          <ImageGallery
            imageList={imageList}
            equipmentName={equipment.name}
            isEquipmentOwner={isEquipmentOwner}
            equipmentType={equipment.type}
            power={equipment?.specifications?.power}
            usageHours={equipment?.usageHours}
          />

          <motion.section
            variants={sectionVariants}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-black text-slate-900">
              {t("equipment.description", { defaultValue: "Description" })}
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {showFullDescription ? normalizedDescription : previewDescription}
            </p>

            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setShowFullDescription((current) => !current)}
                className="mt-3 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                {showFullDescription
                  ? t("equipment.showLess", { defaultValue: "Show less" })
                  : t("equipment.showMore", { defaultValue: "Show more" })}
              </button>
            )}
          </motion.section>

          <AiAnalysisPanel
            isAuthenticated={isAuthenticated}
            authReady={authReady}
            loadingAiAnalysis={loadingAiAnalysis}
            refreshingAiAnalysis={refreshingAiAnalysis}
            onRefresh={handleRefreshAiAnalysis}
            aiAnalysisError={aiAnalysisError}
            aiAnalysis={aiAnalysis}
            priceMeta={priceMeta}
            conditionMeta={conditionMeta}
            localizedPriceReason={localizedPriceReason}
            localizedConditionReason={localizedConditionReason}
            formatDateTime={formatDateTime}
          />

          {mapData.hasValidCoords && (
            <motion.section
              variants={sectionVariants}
              className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Equipment Location
                  </h2>
                  <p className="text-sm text-slate-600">{mapData.label}</p>
                </div>
                <a
                  href={mapData.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Open in Maps
                </a>
              </div>

              <div className="overflow-hidden rounded-xl border border-emerald-200">
                <iframe
                  title="Equipment location map"
                  src={mapData.embedUrl}
                  width="100%"
                  height="260"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block"
                />
              </div>
            </motion.section>
          )}

          <ReviewsSection
            orderedReviews={orderedReviews}
            averageRating={averageRating}
            renderRatingStars={renderRatingStars}
            authReady={authReady}
            loadingMyReviews={loadingMyReviews}
            isAuthenticated={isAuthenticated}
            isEquipmentOwner={isEquipmentOwner}
            myReviewForThisEquipment={myReviewForThisEquipment}
            onLogin={() => router.push("/login")}
            reviewRating={reviewRating}
            setReviewRating={setReviewRating}
            reviewComment={reviewComment}
            setReviewComment={setReviewComment}
            submittingReview={submittingReview}
            onCreateReview={handleCreateReview}
            loadingReviews={loadingReviews}
            currentUserId={currentUserId}
            formatDateTime={formatDateTime}
            deletingReviewId={deletingReviewId}
            onDeleteReview={handleDeleteReview}
          />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <EquipmentInfoCard
            equipment={equipment}
            ownerName={ownerName}
            ownerPhone={ownerPhone}
            ownerId={ownerIdString}
            ownerEquipmentCount={ownerEquipmentCount}
            availabilityText={availabilityText}
            availabilityClassName={availabilityClassName}
            onBookNow={handleOpenBookingModal}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={sectionVariants}>
        <SimilarEquipmentSection
          loadingSimilarEquipments={loadingSimilarEquipments}
          similarEquipments={similarEquipments}
          similarFallbackUsed={similarFallbackUsed}
          formatCurrency={formatCurrency}
          onViewDetails={(id) => router.push(`/equipment/${id}`)}
        />
      </motion.div>

      <BookingModal
        equipment={equipment}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBooked={handleBooked}
      />
    </motion.section>
  );
}
