"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAppContext } from "@/context/AppContext";
import { AlertCircle, Calendar, DollarSign, MapPin } from "lucide-react";
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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.05, staggerChildren: 0.06 },
  },
};

const statusColors = {
  pending: "bg-yellow-50 border-yellow-200 text-yellow-700",
  confirmed: "bg-blue-50 border-blue-200 text-blue-700",
  completed: "bg-green-50 border-green-200 text-green-700",
  cancelled: "bg-red-50 border-red-200 text-red-700",
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

function MyBookingsLoadingState({ loadingText }) {
  return (
    <motion.div
      key="loading"
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex gap-4">
        <SkeletonPulse className="h-10 w-48 rounded-lg" />
        <SkeletonPulse className="h-10 w-44 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <motion.div
            key={item}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + item * 0.05 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <SkeletonPulse className="h-4 w-36" />
                <SkeletonPulse className="h-6 w-48" />
              </div>
              <SkeletonPulse className="h-6 w-24 rounded-full" />
            </div>

            <SkeletonPulse className="h-40 w-full rounded-lg mt-4" />

            <div className="space-y-2 mt-4">
              <SkeletonPulse className="h-4 w-52" />
              <SkeletonPulse className="h-4 w-44" />
              <SkeletonPulse className="h-4 w-36" />
            </div>

            <div className="flex gap-2 pt-4">
              <SkeletonPulse className="h-10 w-full rounded-lg" />
              <SkeletonPulse className="h-10 w-full rounded-lg" />
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

function BookingCard({ booking, onCancel }) {
  const router = useRouter();
  const { t } = useTranslation();

  const startDate = new Date(booking.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endDate = new Date(booking.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const days = Math.ceil(
    (new Date(booking.endDate) - new Date(booking.startDate)) /
      (1000 * 60 * 60 * 24),
  );

  const canCancel = ["pending", "confirmed"].includes(booking.status);

  return (
    <motion.div
      variants={sectionVariants}
      whileHover={{ y: -4, boxShadow: "0 16px 30px rgba(15, 23, 42, 0.1)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-semibold text-gray-600">
            {t("manageBookings.bookingId")}: {booking._id.slice(-8)}
          </div>
          <div className="text-lg font-bold text-gray-900 mt-1">
            {booking.equipment?.name || t("manageBookings.equipmentFallback")}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[booking.status] || "bg-gray-50"}`}
        >
          {booking.status.toUpperCase()}
        </span>
      </div>

      {booking.equipment?.coverImage && (
        <img
          src={booking.equipment.coverImage}
          alt={booking.equipment.name}
          className="w-full h-40 object-cover rounded-lg"
        />
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={16} className="text-yellow-500" />
          <span>
            {startDate} {"->"} {endDate} ({days}{" "}
            {days === 1 ? t("manageBookings.day") : t("manageBookings.days")})
          </span>
        </div>

        {booking.deliveryLocation && (
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={16} className="text-yellow-500" />
            <span>{booking.deliveryLocation}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign size={16} className="text-yellow-500" />
          <span>
            {t("manageBookings.currency")}{" "}
            {booking.totalPrice?.toLocaleString()}
          </span>
        </div>

        {booking.transactionHash && (
          <div className="text-xs text-gray-600 break-all">
            Tx:{" "}
            <a
              href={`https://amoy.polygonscan.com/tx/${booking.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-green-700 hover:underline"
            >
              {booking.transactionHash.slice(0, 10)}...
              {booking.transactionHash.slice(-8)}
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <motion.button
          onClick={() => router.push(`/book/${booking._id}`)}
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
          whileTap={{ scale: 0.97 }}
        >
          {t("manageBookings.viewDetails")}
        </motion.button>
        {canCancel && (
          <motion.button
            onClick={() => onCancel(booking._id)}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            {t("manageBookings.cancel")}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function MyBookingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, authReady, axiosInstance } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get("/bookings/my");
        setBookings(response.data.bookings || []);
      } catch (err) {
        const message =
          err.response?.data?.message || t("manageBookings.loadFail");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, authReady, axiosInstance, t]);

  const activeCount = useMemo(
    () =>
      bookings.filter(
        (b) => new Date(b.endDate) > new Date() && b.status !== "cancelled",
      ).length,
    [bookings],
  );

  const pastCount = useMemo(
    () =>
      bookings.filter(
        (b) => new Date(b.endDate) <= new Date() || b.status === "cancelled",
      ).length,
    [bookings],
  );

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const now = new Date();
        const endDate = new Date(booking.endDate);
        if (filter === "active") {
          return endDate > now && booking.status !== "cancelled";
        }
        return endDate <= now || booking.status === "cancelled";
      }),
    [bookings, filter],
  );

  const handleCancel = async (bookingId) => {
    if (!window.confirm(t("manageBookings.cancelConfirm"))) return;

    try {
      toast.loading(t("manageBookings.cancelling"));
      await axiosInstance.delete(`/bookings/${bookingId}`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
      toast.dismiss();
      toast.success(t("manageBookings.cancelSuccess"));
    } catch (err) {
      toast.dismiss();
      const message =
        err.response?.data?.message || t("manageBookings.cancelFail");
      toast.error(message);
    }
  };

  if (!authReady) {
    return (
      <ProtectedRoute>
        <motion.div
          className="bg-[#F8FAFC] min-h-screen p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              className="h-8 w-8 border-4 border-yellow-400 border-t-gray-300 rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
            />
            <p className="text-gray-600 mt-4">{t("common.loading")}</p>
          </div>
        </motion.div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <motion.div
        className="bg-[#F8FAFC] min-h-screen p-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="max-w-6xl mx-auto"
          variants={listContainerVariants}
        >
          <motion.div
            className="flex justify-between items-center mb-6"
            variants={sectionVariants}
          >
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                {t("manageBookings.title")}
              </h1>
              <p className="text-slate-500">{t("manageBookings.subtitle")}</p>
            </div>
            <motion.button
              onClick={() => router.push("/browse")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              + {t("manageBookings.newBooking")}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2"
              >
                <AlertCircle className="text-red-600" size={20} />
                <span className="text-red-700">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="flex gap-4 mb-6" variants={sectionVariants}>
            <motion.button
              onClick={() => setFilter("active")}
              className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                filter === "active"
                  ? "bg-yellow-400 text-black"
                  : "bg-white text-slate-800 border border-slate-300 hover:bg-gray-50"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {t("manageBookings.activeUpcoming")} ({activeCount})
            </motion.button>
            <motion.button
              onClick={() => setFilter("past")}
              className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                filter === "past"
                  ? "bg-yellow-400 text-black"
                  : "bg-white text-slate-800 border border-slate-300 hover:bg-gray-50"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {t("manageBookings.pastBookings")} ({pastCount})
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <MyBookingsLoadingState loadingText={t("common.loading")} />
            ) : filteredBookings.length === 0 ? (
              <motion.div
                key="empty"
                className="bg-white rounded-lg border border-gray-200 p-12 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-gray-600 mb-4">
                  {filter === "active"
                    ? t("manageBookings.noActive")
                    : t("manageBookings.noPast")}
                </p>
                {filter === "active" && (
                  <motion.button
                    onClick={() => router.push("/browse")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t("manageBookings.browseEquipment")}
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${filter}`}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onCancel={handleCancel}
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
