"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/Components/ProtectedRoute";
import { useAppContext } from "@/context/AppContext";
import { AlertCircle, Calendar, IndianRupee, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.05, staggerChildren: 0.06 },
  },
};

const STATUS_OPTIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const statusChip = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function SkeletonPulse({ className = "" }) {
  return (
    <motion.div
      className={`rounded-lg bg-slate-200 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function ManageBookingsLoadingState({ loadingText }) {
  return (
    <motion.div
      key="loading"
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <motion.div
            key={item}
            className="bg-white border border-slate-200 rounded-xl p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: item * 0.05 }}
          >
            <SkeletonPulse className="h-3 w-20" />
            <SkeletonPulse className="h-8 w-14 mt-3" />
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4].map((item) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 + item * 0.04 }}
          >
            <SkeletonPulse className="h-9 w-24 rounded-lg" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <motion.div
            key={item}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + item * 0.05 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <SkeletonPulse className="h-3 w-28" />
                <SkeletonPulse className="h-5 w-44" />
              </div>
              <SkeletonPulse className="h-6 w-20 rounded-full" />
            </div>

            <div className="mt-4 space-y-2">
              <SkeletonPulse className="h-4 w-40" />
              <SkeletonPulse className="h-4 w-52" />
              <SkeletonPulse className="h-4 w-36" />
            </div>

            <div className="mt-4 flex gap-2">
              <SkeletonPulse className="h-8 w-24 rounded-lg" />
              <SkeletonPulse className="h-8 w-24 rounded-lg" />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm font-semibold text-slate-500">
        {loadingText}
      </p>
    </motion.div>
  );
}

function OwnerBookingCard({ booking, onUpdateStatus, disabled }) {
  const { t } = useTranslation();
  const nextActions = STATUS_OPTIONS[booking.status] || [];

  return (
    <motion.div
      variants={sectionVariants}
      whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 font-semibold">
            {t("manageBookings.bookingLabel")} #{booking._id?.slice(-8)}
          </p>
          <h3 className="text-lg font-bold text-slate-900">
            {booking.equipment?.name || t("manageBookings.equipmentFallback")}
          </h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusChip[booking.status] || "bg-gray-100"}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <User size={15} className="text-slate-400" />
          <span>
            {booking.renter?.fullName ||
              booking.renter?.email ||
              t("manageBookings.renterFallback")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-slate-400" />
          <span>
            {new Date(booking.startDate).toLocaleDateString()} {"->"}{" "}
            {new Date(booking.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee size={15} className="text-slate-400" />
          <span className="font-semibold">
            {Number(booking.totalPrice || 0).toLocaleString()}{" "}
            {t("manageBookings.inr")}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {nextActions.length === 0 ? (
          <span className="text-xs font-semibold text-slate-500">
            {t("manageBookings.noFurtherActions")}
          </span>
        ) : (
          nextActions.map((status) => (
            <motion.button
              key={status}
              disabled={disabled}
              onClick={() => onUpdateStatus(booking._id, status)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              whileTap={{ scale: 0.97 }}
            >
              {t("manageBookings.markAs")} {status}
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function ManageBookingsPage() {
  const { t } = useTranslation();
  const { axiosInstance, authReady, isAuthenticated } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const counts = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
    );
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;

    const loadOwnerBookings = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get("/bookings/owner");
        setBookings(response.data.bookings || []);
      } catch (err) {
        const message =
          err.response?.data?.message || t("manageBookings.loadOwnerFail");
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadOwnerBookings();
  }, [axiosInstance, authReady, isAuthenticated, t]);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      await axiosInstance.patch(`/bookings/${bookingId}/status`, { status });
      setBookings((prev) =>
        prev.map((item) =>
          item._id === bookingId ? { ...item, status } : item,
        ),
      );
      toast.success(`${t("manageBookings.statusMoved")} ${status}`);
    } catch (err) {
      const message =
        err.response?.data?.message || t("manageBookings.updateStatusFail");
      toast.error(message);
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <ProtectedRoute>
      <motion.div
        className="min-h-screen bg-slate-50 p-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="max-w-7xl mx-auto space-y-6" variants={listContainerVariants}>
          <motion.div variants={sectionVariants}>
            <h1 className="text-3xl font-black text-slate-900">
              {t("manageBookings.ownerTitle")}
            </h1>
            <p className="text-slate-500">
              {t("manageBookings.ownerSubtitle")}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-3"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              ["total", counts.total],
              ["pending", counts.pending],
              ["confirmed", counts.confirmed],
              ["completed", counts.completed],
              ["cancelled", counts.cancelled],
            ].map(([label, value]) => (
              <motion.div
                key={label}
                className="bg-white border border-slate-200 rounded-xl p-4"
                variants={sectionVariants}
                whileHover={{ y: -3 }}
              >
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  {label}
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="flex flex-wrap gap-2" variants={sectionVariants}>
            {["all", "pending", "confirmed", "completed", "cancelled"].map(
              (item) => (
                <motion.button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${
                    filter === item
                      ? "bg-yellow-400 border-yellow-400 text-black"
                      : "bg-white border-slate-300 text-slate-700"
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {item}
                </motion.button>
              ),
            )}
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
              >
                <AlertCircle size={18} className="text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {loading ? (
              <ManageBookingsLoadingState
                loadingText={t("manageBookings.loadingOwner")}
              />
            ) : filteredBookings.length === 0 ? (
              <motion.div
                key="empty"
                className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {t("manageBookings.noSelectedFilter")}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${filter}`}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {filteredBookings.map((booking) => (
                  <OwnerBookingCard
                    key={booking._id}
                    booking={booking}
                    disabled={updatingId === booking._id}
                    onUpdateStatus={handleStatusUpdate}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}
