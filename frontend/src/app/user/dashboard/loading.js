"use client";

import { motion } from "framer-motion";

function SkeletonPulse({ className = "" }) {
  return (
    <motion.div
      className={`rounded-lg bg-slate-200 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function DashboardLoading() {
  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <SkeletonPulse className="h-9 w-44" />
            <SkeletonPulse className="h-4 w-64" />
          </div>
          <SkeletonPulse className="h-10 w-48" />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <motion.div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: item * 0.05 }}
            >
              <SkeletonPulse className="h-3 w-24" />
              <SkeletonPulse className="mt-3 h-8 w-20" />
              <SkeletonPulse className="mt-3 h-3 w-16" />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <motion.div
            className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
          >
            <SkeletonPulse className="mb-4 h-4 w-60" />
            <SkeletonPulse className="h-72 w-full rounded-xl" />
          </motion.div>

          <motion.div
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.17 }}
          >
            <SkeletonPulse className="mb-4 h-4 w-52" />
            <SkeletonPulse className="h-72 w-full rounded-xl" />
          </motion.div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <SkeletonPulse className="mb-4 h-4 w-56" />
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
      </div>
    </motion.div>
  );
}
