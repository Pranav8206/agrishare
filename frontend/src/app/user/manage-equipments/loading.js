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

export default function ManageEquipmentsLoading() {
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
            <SkeletonPulse className="h-9 w-64" />
            <SkeletonPulse className="h-4 w-80" />
          </div>
          <SkeletonPulse className="h-10 w-44 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <motion.div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: item * 0.05 }}
            >
              <SkeletonPulse className="h-3 w-28" />
              <SkeletonPulse className="mt-3 h-8 w-16" />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <motion.div
              key={item}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 + item * 0.05 }}
            >
              <SkeletonPulse className="h-40 w-full rounded-lg" />

              <div className="space-y-2">
                <SkeletonPulse className="h-5 w-44" />
                <SkeletonPulse className="h-4 w-32" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-50 p-2">
                  <SkeletonPulse className="h-3 w-20" />
                  <SkeletonPulse className="mt-2 h-6 w-10" />
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <SkeletonPulse className="h-3 w-20" />
                  <SkeletonPulse className="mt-2 h-6 w-14" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((chip) => (
                  <SkeletonPulse key={chip} className="h-10 w-full rounded-md" />
                ))}
              </div>

              <div className="flex gap-2">
                <SkeletonPulse className="h-9 w-full rounded-lg" />
                <SkeletonPulse className="h-9 w-10 rounded-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
