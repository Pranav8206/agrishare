"use client";

import { motion } from "framer-motion";

function SkeletonBlock({ className = "" }) {
  return (
    <motion.div
      className={`rounded-xl bg-slate-200/75 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function HomeLoading() {
  return (
    <motion.div
      className="min-h-screen bg-background px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2.5rem] border border-slate-200 p-6 md:p-8">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="mt-4 h-12 w-3/4" />
          <SkeletonBlock className="mt-3 h-5 w-2/3" />
          <SkeletonBlock className="mt-8 h-14 w-full rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <motion.div
              key={item}
              className="rounded-2xl border border-slate-200 p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: item * 0.05 }}
            >
              <SkeletonBlock className="h-10 w-10" />
              <SkeletonBlock className="mt-4 h-4 w-24" />
              <SkeletonBlock className="mt-2 h-6 w-40" />
              <SkeletonBlock className="mt-2 h-4 w-full" />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <motion.div
              key={item}
              className="rounded-3xl border border-slate-200 bg-white p-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + item * 0.05 }}
            >
              <SkeletonBlock className="h-44 w-full rounded-2xl" />
              <SkeletonBlock className="mt-4 h-5 w-2/3" />
              <SkeletonBlock className="mt-2 h-4 w-1/2" />
              <SkeletonBlock className="mt-3 h-10 w-full rounded-xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
