import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fffbeb_35%,#f8fafc_100%)]" />

      <div className="relative mx-auto max-w-3xl rounded-4xl border border-border-light bg-surface/95 p-8 text-center shadow-lg backdrop-blur-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-text-primary sm:text-5xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
          The page you are looking for does not exist, may have been moved, or the
          URL may be incorrect.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-36 items-center justify-center rounded-xl bg-primary-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-accent-dark"
          >
            Go Home
          </Link>
          <Link
            href="/browse"
            className="inline-flex min-h-11 min-w-36 items-center justify-center rounded-xl border border-border-light bg-background px-5 py-2.5 text-sm font-bold text-text-secondary transition hover:bg-background-hover"
          >
            Browse Equipment
          </Link>
        </div>
      </div>
    </section>
  );
}
