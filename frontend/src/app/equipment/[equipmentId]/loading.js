"use client";

import { motion } from "framer-motion";

function SkeletonBar({ className = "" }) {
  return (
    <motion.div
      className={`rounded-xl bg-slate-200/80 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function EquipmentDetailsLoading() {
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
