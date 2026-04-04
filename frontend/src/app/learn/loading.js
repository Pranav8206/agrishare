"use client";

import { motion } from "framer-motion";

function SkeletonBlock({ className = "" }) {
  return (
    <motion.div
      className={`rounded-xl bg-slate-200/70 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function LearnLoading() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto mb-12 rounded-3xl border border-emerald-200/50 bg-linear-to-r from-emerald-50/70 via-background to-amber-50/70 p-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-surface px-4 py-1.5 mb-4">
          <SkeletonBlock className="h-3 w-20" />
        </div>
        <SkeletonBlock className="h-11 w-72 max-w-full mx-auto" />
        <SkeletonBlock className="h-5 w-80 max-w-full mx-auto mt-3" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl overflow-hidden border border-border-light bg-background"
          >
            <SkeletonBlock className="aspect-video w-full" />
            <div className="px-4 py-3 space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
