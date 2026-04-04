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

export default function MyBookingsLoading() {
  return (
    <motion.div
      className="min-h-screen bg-[#F8FAFC] p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <SkeletonPulse className="h-9 w-60" />
            <SkeletonPulse className="h-4 w-72" />
          </div>
          <SkeletonPulse className="h-10 w-44 rounded-lg" />
        </div>

        <div className="flex gap-4">
          <SkeletonPulse className="h-10 w-48 rounded-lg" />
          <SkeletonPulse className="h-10 w-44 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

              <SkeletonPulse className="mt-4 h-40 w-full rounded-lg" />

              <div className="mt-4 space-y-2">
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
      </div>
    </motion.div>
  );
}
