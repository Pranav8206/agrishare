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

export default function AddLoading() {
  return (
    <main className="min-h-screen bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <section className="rounded-2xl border border-emerald-200/60 bg-linear-to-r from-emerald-50 via-lime-50 to-amber-50 px-5 py-5 sm:px-6">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
          <div className="mt-4 flex flex-wrap gap-2">
            <SkeletonBlock className="h-7 w-24" />
            <SkeletonBlock className="h-7 w-24" />
            <SkeletonBlock className="h-7 w-24" />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <SkeletonBlock className="h-6 w-48" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonBlock className="h-11 sm:col-span-2" />
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-24 sm:col-span-2" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <SkeletonBlock className="h-6 w-52" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <SkeletonBlock className="h-6 w-40" />
              <div className="grid grid-cols-1 gap-4">
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
                <SkeletonBlock className="h-11" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
              <SkeletonBlock className="h-6 w-44" />
              <div className="grid grid-cols-2 gap-3">
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
