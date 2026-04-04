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

export default function ManageBookingsLoading() {
  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <SkeletonPulse className="h-9 w-72" />
          <SkeletonPulse className="h-4 w-80" />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[0, 1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: item * 0.05 }}
            >
              <SkeletonPulse className="h-3 w-20" />
              <SkeletonPulse className="mt-3 h-8 w-14" />
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <motion.div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
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
      </div>
    </motion.div>
  );
}
