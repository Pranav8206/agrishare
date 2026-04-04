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

export default function SettingsLoading() {
  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <SkeletonPulse className="h-9 w-44" />
          <SkeletonPulse className="h-4 w-72" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <SkeletonPulse className="h-5 w-36" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <SkeletonPulse className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <SkeletonPulse className="h-10 w-40 rounded-lg" />
              <div className="flex gap-2">
                <SkeletonPulse className="h-10 w-36 rounded-lg" />
                <SkeletonPulse className="h-10 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((item) => (
            <motion.div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: item * 0.06 }}
            >
              <SkeletonPulse className="h-5 w-32" />
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-10 w-full" />
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-10 w-full" />
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-10 w-full" />
              <SkeletonPulse className="h-10 w-36 rounded-lg" />
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 flex flex-wrap gap-3">
          <SkeletonPulse className="h-10 w-28 rounded-lg" />
          <SkeletonPulse className="h-10 w-40 rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}
