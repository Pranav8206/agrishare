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

export default function BrowseLoading() {
  return (
    <main className="min-h-screen pb-8">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
        <section className="rounded-3xl border border-emerald-200/50 bg-linear-to-r from-emerald-50/70 via-background to-amber-50/70 p-5 sm:p-6">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-4 w-72 max-w-full mt-3" />
          <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <SkeletonBlock className="h-11 flex-1" />
            <SkeletonBlock className="h-11 w-28" />
            <SkeletonBlock className="h-11 w-32 md:hidden" />
          </div>
        </section>

        <div className="flex items-start gap-5">
          <aside className="hidden w-72 shrink-0 rounded-2xl border border-border-light bg-surface p-5 md:block space-y-4">
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SkeletonBlock className="h-9 w-48" />
              <SkeletonBlock className="h-10 w-40" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-border-light bg-surface"
                >
                  <SkeletonBlock className="h-48 w-full" />
                  <div className="space-y-3 p-4">
                    <SkeletonBlock className="h-5 w-4/5" />
                    <SkeletonBlock className="h-5 w-2/3" />
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
