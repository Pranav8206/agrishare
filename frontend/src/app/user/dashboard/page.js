"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/Components/ProtectedRoute";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
    transition: { delayChildren: 0.05, staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

function SkeletonPulse({ className = "" }) {
  return (
    <motion.div
      className={`rounded-lg bg-slate-200 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function DashboardLoadingState({ loadingText }) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((item) => (
          <motion.div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: item * 0.05 }}
          >
            <SkeletonPulse className="h-3 w-28" />
            <SkeletonPulse className="h-8 w-20 mt-3" />
            <SkeletonPulse className="h-3 w-16 mt-3" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div
          className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <SkeletonPulse className="h-4 w-56 mb-4" />
          <SkeletonPulse className="h-72 w-full rounded-xl" />
        </motion.div>

        <motion.div
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <SkeletonPulse className="h-4 w-44 mb-4" />
          <SkeletonPulse className="h-72 w-full rounded-xl" />
        </motion.div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <SkeletonPulse className="h-4 w-52 mb-4" />
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              className="grid grid-cols-5 gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.22 + item * 0.05 }}
            >
              <SkeletonPulse className="h-8 w-full" />
              <SkeletonPulse className="h-8 w-full" />
              <SkeletonPulse className="h-8 w-full" />
              <SkeletonPulse className="h-8 w-full" />
              <SkeletonPulse className="h-8 w-full" />
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm font-semibold text-slate-500">
        {loadingText}
      </p>
    </motion.div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <motion.div
      variants={sectionVariants}
      whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
        {label}
      </p>
      <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </motion.div>
  );
}

function FlowNode({ title, value, tone }) {
  const tones = {
    slate: "bg-slate-100 text-slate-800 border-slate-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <motion.div
      variants={sectionVariants}
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`min-w-30 rounded-lg border px-3 py-2 text-center ${tones[tone] || tones.slate}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider">{title}</p>
      <p className="text-xl font-black mt-1">{value}</p>
    </motion.div>
  );
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { axiosInstance, authReady, isAuthenticated, user } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [ownerBookings, setOwnerBookings] = useState([]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [analyticsResponse, ownerBookingsResponse] = await Promise.all([
          axiosInstance.get("/bookings/owner/analytics"),
          axiosInstance.get("/bookings/owner"),
        ]);

        setAnalytics(analyticsResponse.data?.data || null);
        setOwnerBookings(ownerBookingsResponse.data?.bookings || []);
      } catch (err) {
        setError(err.response?.data?.message || t("dashboard.loadFail"));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [axiosInstance, authReady, isAuthenticated, t]);

  const monthlySeries = useMemo(() => analytics?.monthly || [], [analytics]);

  const pieData = useMemo(() => {
    const status = analytics?.statusCounts || {};
    return [
      {
        name: t("dashboard.statusPending"),
        value: status.pending || 0,
        fill: "#f59e0b",
      },
      {
        name: t("dashboard.statusConfirmed"),
        value: status.confirmed || 0,
        fill: "#3b82f6",
      },
      {
        name: t("dashboard.statusCompleted"),
        value: status.completed || 0,
        fill: "#10b981",
      },
      {
        name: t("dashboard.statusCancelled"),
        value: status.cancelled || 0,
        fill: "#ef4444",
      },
    ];
  }, [analytics, t]);

  const processFlow = useMemo(() => {
    const status = analytics?.statusCounts || {};
    return {
      requested:
        (status.pending || 0) +
        (status.confirmed || 0) +
        (status.completed || 0) +
        (status.cancelled || 0),
      payment: ownerBookings.filter(
        (item) => item.paymentStatus === "completed",
      ).length,
      approved: status.confirmed || 0,
      returned: status.completed || 0,
      cancelled: status.cancelled || 0,
    };
  }, [analytics, ownerBookings]);

  const recentBookings = useMemo(
    () => ownerBookings.slice(0, 5),
    [ownerBookings],
  );

  const firstName = useMemo(() => {
    const name = user?.fullName?.trim();
    if (!name) return t("dashboard.title");

    return name.split(/\s+/)[0];
  }, [t, user]);

  return (
    <ProtectedRoute>
      <motion.div
        className="min-h-screen bg-slate-50 p-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="max-w-7xl mx-auto space-y-6" variants={listContainerVariants}>
          <motion.div
            className="flex flex-wrap items-end justify-between gap-3"
            variants={sectionVariants}
          >
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                {firstName}
              </h1>
              <p className="text-slate-500">{t("dashboard.ownerSubtitle")}</p>
            </div>
            <motion.button
              onClick={() => router.push("/user/manage-bookings")}
              className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 font-bold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {t("dashboard.manageBookings")}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <DashboardLoadingState loadingText={t("dashboard.loading")} />
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-3"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <StatCard
                  label={t("dashboard.totalBookings")}
                  value={analytics?.summary?.totalBookings || 0}
                />
                <StatCard
                  label={t("dashboard.totalRevenue")}
                  value={`${t("dashboard.currency")} ${Number(analytics?.summary?.totalRevenue || 0).toLocaleString()}`}
                />
                <StatCard
                  label={t("dashboard.activeBookings")}
                  value={analytics?.summary?.activeBookings || 0}
                />
                <StatCard
                  label={t("dashboard.completionRate")}
                  value={`${analytics?.summary?.completionRate || 0}%`}
                />
              </motion.div>

              <motion.div className="grid grid-cols-1 xl:grid-cols-3 gap-4" variants={sectionVariants}>
                <motion.div
                  className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  variants={sectionVariants}
                >
                  <h2 className="font-black text-slate-900 mb-3">
                    {t("dashboard.monthlyBookingsRevenue")}
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlySeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="bookings"
                          stroke="#f59e0b"
                          strokeWidth={3}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#0ea5e9"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  variants={sectionVariants}
                >
                  <h2 className="font-black text-slate-900 mb-3">
                    {t("dashboard.bookingStatusSplit")}
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={90}
                        />
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div className="grid grid-cols-1 xl:grid-cols-2 gap-4" variants={sectionVariants}>
                <motion.div
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  variants={sectionVariants}
                >
                  <h2 className="font-black text-slate-900 mb-3">
                    {t("dashboard.lifecycleFlowchart")}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <FlowNode
                      title={t("dashboard.statusPending")}
                      value={analytics?.statusCounts?.pending || 0}
                      tone="yellow"
                    />
                    <span className="font-black text-slate-400">{"->"}</span>
                    <FlowNode
                      title={t("dashboard.statusConfirmed")}
                      value={analytics?.statusCounts?.confirmed || 0}
                      tone="blue"
                    />
                    <span className="font-black text-slate-400">{"->"}</span>
                    <FlowNode
                      title={t("dashboard.statusCompleted")}
                      value={analytics?.statusCounts?.completed || 0}
                      tone="green"
                    />
                    <span className="font-black text-slate-400">|</span>
                    <FlowNode
                      title={t("dashboard.statusCancelled")}
                      value={analytics?.statusCounts?.cancelled || 0}
                      tone="red"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  variants={sectionVariants}
                >
                  <h2 className="font-black text-slate-900 mb-3">
                    {t("dashboard.systemFlowchart")}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <FlowNode
                      title={t("dashboard.request")}
                      value={processFlow.requested}
                      tone="slate"
                    />
                    <span className="font-black text-slate-400">{"->"}</span>
                    <FlowNode
                      title={t("dashboard.payment")}
                      value={processFlow.payment}
                      tone="yellow"
                    />
                    <span className="font-black text-slate-400">{"->"}</span>
                    <FlowNode
                      title={t("dashboard.approval")}
                      value={processFlow.approved}
                      tone="blue"
                    />
                    <span className="font-black text-slate-400">{"->"}</span>
                    <FlowNode
                      title={t("dashboard.return")}
                      value={processFlow.returned}
                      tone="green"
                    />
                    <span className="font-black text-slate-400">|</span>
                    <FlowNode
                      title={t("dashboard.statusCancelled")}
                      value={processFlow.cancelled}
                      tone="red"
                    />
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                variants={sectionVariants}
              >
                <h2 className="font-black text-slate-900 mb-3">
                  {t("dashboard.recentIncomingBookings")}
                </h2>
                {recentBookings.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    {t("dashboard.noOwnerBookings")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-3 py-2">
                            {t("dashboard.booking")}
                          </th>
                          <th className="text-left px-3 py-2">
                            {t("dashboard.equipment")}
                          </th>
                          <th className="text-left px-3 py-2">
                            {t("dashboard.renter")}
                          </th>
                          <th className="text-left px-3 py-2">
                            {t("dashboard.status")}
                          </th>
                          <th className="text-left px-3 py-2">
                            {t("dashboard.amount")}
                          </th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={listContainerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {recentBookings.map((booking) => (
                          <motion.tr
                            key={booking._id}
                            className="border-t border-slate-100"
                            variants={rowVariants}
                          >
                            <td className="px-3 py-2 text-slate-600">
                              {booking._id.slice(-8)}
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-900">
                              {booking.equipment?.name || t("dashboard.na")}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {booking.renter?.fullName ||
                                booking.renter?.email ||
                                t("dashboard.na")}
                            </td>
                            <td className="px-3 py-2 capitalize">
                              {booking.status}
                            </td>
                            <td className="px-3 py-2 font-semibold">
                              {t("dashboard.currency")}{" "}
                              {Number(booking.totalPrice || 0).toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}
