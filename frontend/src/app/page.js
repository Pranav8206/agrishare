"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Handshake,
  LayoutDashboard,
  MapPin,
  Mic,
  MicOff,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tractor,
  Users,
  Leaf,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { staggerChildren: 0.08 },
};

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

function HeroStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
        <Icon size={14} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

function CategoryPill({ label, icon, href }) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
        {icon}
      </span>
      <span className="truncate text-sm font-bold text-slate-800">{label}</span>
      <ChevronRight
        size={16}
        className="ml-auto text-slate-400 transition group-hover:text-emerald-700"
      />
    </Link>
  );
}

function HowCard({ step, title, description, accent }) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm ${accent}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          Step {step}
        </p>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
          {step}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-black text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </motion.div>
  );
}

function TrustCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon size={22} />
      </div>
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </motion.div>
  );
}

function FeaturedEquipmentCard({ equipmentId, title, price, location, img, rating }) {
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -4, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group overflow-hidden rounded-[1.85rem] border border-slate-200 bg-white shadow-sm"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
          Available now
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-slate-900">{title}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
              {location}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-800">
            <Star size={14} className="fill-amber-500 text-amber-500" />
            {Number(rating || 0).toFixed(1)}
          </div>
        </div>

        <div className="flex items-end justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              Starting at
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {formatMoney(price)}
            </p>
          </div>
          <Link
            href={`/equipment/${equipmentId}`}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            View
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function FeaturedFertilizerCard({ fertilizer }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-40 overflow-hidden bg-slate-100">
        <img
          src={fertilizer.image}
          alt={fertilizer.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
          {fertilizer.brand}
        </p>
        <h3 className="line-clamp-2 min-h-10 text-base font-black text-slate-900">
          {fertilizer.name}
        </h3>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-black text-slate-900">
              ₹{fertilizer.price}
            </p>
            <p className="text-[10px] text-slate-500">{fertilizer.unit}</p>
          </div>
          <Link
            href="/fertilizers"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
          >
            View
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.85rem] border border-slate-200 bg-white shadow-sm">
      <div className="h-56 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, name, role }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 flex gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={15} className="fill-amber-500" />
        ))}
      </div>
      <p className="text-sm leading-7 text-slate-700">“{quote}”</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-black text-emerald-700">
          {String(name || "?").charAt(0)}
        </div>
        <div>
          <p className="font-black text-slate-900">{name}</p>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const PROJECT_TEAM = [
  ["Atharva Milind Sawalakhe", "Roll No. 23007010", "Team Leader"],
  ["Pranav Surendra Mavle", "Roll No. 23007026", "Team Member"],
  ["Rahul Suresh Yawle", "Roll No. 23007041", "Team Member"],
  ["Mihir Dhirendra Jain", "Roll No. 23007028", "Team Member"],
];

function ProjectIntroduction({ onContinue }) {
  return (
    <motion.div
      className="fixed inset-0 z-100 flex h-screen overflow-y-auto bg-gradient-to-br from-emerald-50 via-white to-lime-50 text-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(132,204,22,0.12),transparent_34%)]" />
      <div className="relative mx-auto flex min-h-full w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/college-logo.webp"
              alt="Government College of Engineering, Amravati"
              className="h-14 w-14 rounded-2xl bg-white/95 object-contain p-1.5"
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                Academic Major Project
              </p>
              <p className="mt-1 text-sm font-bold text-slate-600">2026–2027</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-emerald-200 bg-white/80 px-5 py-3 text-md font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm sm:inline-flex">
            Information Technology
          </span>
        </div>

        <div className="my-auto grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <p className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-emerald-700">
              Government College of Engineering, Amravati
            </p>
            <h1 className="max-w-4xl text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              AgriShare
              <span className="mt-3 block text-emerald-700">
                Farm Equipment Sharing Platform
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              A Smart and Transparent Agricultural Equipment Rental Platform
            </p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl border-2 border-emerald-600 bg-emerald-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-2xl"
            >
              Explore Project
              <ArrowRight size={17} />
            </button>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <div className="rounded-3xl border border-emerald-100 bg-white/85 p-5 shadow-lg shadow-emerald-900/5 backdrop-blur-md">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                Institution
              </p>
              <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                Government College of Engineering, Amravati
              </h2>
              <p className="mt-3 text-base font-semibold text-slate-600 sm:text-lg">
                Department of Information Technology
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white/85 p-5 shadow-lg shadow-emerald-900/5 backdrop-blur-md">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                Faculty
              </p>
              <div className="mt-3 grid gap-3 text-sm">
                <p><span className="font-bold text-slate-500">Project Guide:</span> Dr. K. N. Tayade</p>
                <p><span className="font-bold text-slate-500">HOD IT Department:</span> Dr. B. V. Wakode</p>
                <p><span className="font-bold text-slate-500">Major Project Head:</span> Dr. P. B. Ambhore</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-emerald-200 pt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              Project Team
            </p>
            <p className="text-xs text-slate-500">
              Information Technology Department · Team No. 15
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {PROJECT_TEAM.map(([name, rollNumber, role]) => (
              <div
                key={rollNumber}
                className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 shadow-sm"
              >
                <p className="text-sm font-bold text-slate-900">{name}</p>
                <p className="mt-1 text-xs text-slate-500">{rollNumber}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                  {role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AgriShareHome() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { equipments, equipmentsLoading, axiosInstance } = useAppContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [featuredFertilizers, setFeaturedFertilizers] = useState([]);
  const [speechSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const recognitionRef = useRef(null);
  const [showProjectIntroduction, setShowProjectIntroduction] = useState(true);
  const projectInfoRequested = searchParams.get("projectInfo") === "1";
  const isProjectIntroductionVisible =
    showProjectIntroduction || projectInfoRequested;

  const continueToProject = () => {
    setShowProjectIntroduction(false);
    router.replace("/", { scroll: false });
  };

  useEffect(() => {
    let mounted = true;
    axiosInstance
      .get("/fertilizers")
      .then(({ data }) => {
        if (mounted) setFeaturedFertilizers(data?.fertilizers?.slice(0, 4) || []);
      })
      .catch(() => {
        if (mounted) setFeaturedFertilizers([]);
      });
    return () => {
      mounted = false;
    };
  }, [axiosInstance]);

  const featuredEquipment = useMemo(() => {
    const list = Array.isArray(equipments) ? equipments : [];
    const availableFirst = list.filter((item) => item?.isAvailable !== false);
    return (availableFirst.length ? availableFirst : list).slice(0, 4);
  }, [equipments]);

  const loadingFeatured = equipmentsLoading;

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.abort?.();
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSearch = () => {
    const q = searchQuery.trim();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  const stopVoiceSearch = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) return;

    if (isListening) {
      stopVoiceSearch();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const activeLanguage = (i18n.resolvedLanguage || i18n.language || "en")
        .split("-")[0]
        .toLowerCase();
      recognition.lang = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" }[activeLanguage] || "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
        if (transcript) setSearchQuery(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const categoryItems = [
    { label: t("home.categories.tractors", { defaultValue: "Tractors" }), query: "tractor", icon: <Tractor size={28} /> },
    { label: t("home.categories.harvesters", { defaultValue: "Plough" }), query: "plough", icon: "🚜" },
    { label: t("home.categories.tillage", { defaultValue: "Tillage" }), query: "tillage", icon: "⛏️" },
    { label: t("home.categories.seeding", { defaultValue: "Thresher" }), query: "thresher", icon: "🌱" },
    { label: t("home.categories.hayForage", { defaultValue: "Loader" }), query: "loader", icon: "🌾" },
    { label: t("home.categories.trailers", { defaultValue: "Cultivator" }), query: "cultivator", icon: "🚛" },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      title: t("home.howItWorks.step1Title", { defaultValue: "Search equipment" }),
      description: t("home.howItWorks.step1Description", { defaultValue: "Find the right machinery by category, location, or price." }),
    },
    {
      step: "02",
      title: t("home.howItWorks.step2Title", { defaultValue: "Book in minutes" }),
      description: t("home.howItWorks.step2Description", { defaultValue: "Pick dates, add delivery, and confirm the booking flow quickly." }),
    },
    {
      step: "03",
      title: t("home.howItWorks.step3Title", { defaultValue: "Track and complete" }),
      description: t("home.howItWorks.step3Description", { defaultValue: "Stay updated on payment status, booking status, and delivery timing." }),
    },
  ];

  const whyChooseItems = [
    {
      title: t("home.whyChoose.verifiedTitle", { defaultValue: "Verified owners" }),
      description: t("home.whyChoose.verifiedDescription", { defaultValue: "See trusted profiles, ratings, and active equipment before you book." }),
      icon: ShieldCheck,
    },
    {
      title: t("home.whyChoose.trustTitle", { defaultValue: "Transparent flow" }),
      description: t("home.whyChoose.trustDescription", { defaultValue: "Pricing, schedule, and booking status are visible in one place." }),
      icon: Handshake,
    },
    {
      title: t("home.whyChoose.saveTitle", { defaultValue: "Faster rentals" }),
      description: t("home.whyChoose.saveDescription", { defaultValue: "Find nearby equipment without wasting a full day making calls." }),
      icon: Clock3,
    },
  ];

  const testimonials = [
    {
      quote: t("home.testimonials.item1Quote", { defaultValue: "The search and booking flow is simple and direct. I found equipment near my village fast." }),
      name: t("home.testimonials.item1Name", { defaultValue: "Amit Patil" }),
      role: t("home.testimonials.item1Role", { defaultValue: "Farmer" }),
    },
    {
      quote: t("home.testimonials.item2Quote", { defaultValue: "I listed my machine and started getting bookings without extra effort." }),
      name: t("home.testimonials.item2Name", { defaultValue: "Suman Deshmukh" }),
      role: t("home.testimonials.item2Role", { defaultValue: "Equipment owner" }),
    },
    {
      quote: t("home.testimonials.item3Quote", { defaultValue: "The interface feels much cleaner now, and the booking details are easy to follow." }),
      name: t("home.testimonials.item3Name", { defaultValue: "Ravi Jadhav" }),
      role: t("home.testimonials.item3Role", { defaultValue: "Renter" }),
    },
  ];

  const featuredCta = useMemo(
    () => (
      <Link
        href="/browse"
        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
      >
        Explore all equipment
        <ArrowUpRight size={16} />
      </Link>
    ),
    [],
  );

  return (
    <div className="min-h-screen bg-background text-slate-900">
      {isProjectIntroductionVisible ? (
        <ProjectIntroduction onContinue={continueToProject} />
      ) : null}
      {/* --- HERO SECTION --- */}
          <section className="px-4 py-4">
            <div className="relative max-w-7xl mx-auto h-125 rounded-[2.5rem] overflow-hidden group">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000"
            alt="Farm background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-linear-to-t from-emerald-950/45 via-transparent to-transparent" />

          {/* Hero Content */}
          <motion.div
            className="relative h-full flex flex-col items-center justify-center text-center px-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
              <img src="/college-logo.webp" alt="" className="h-6 w-6 object-contain" />
              Academic project · 2026–2027
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              {t("home.heroTitle")}{" "}
              <span className="text-primary-accent-light">
                {t("home.heroHighlight")}
              </span>
            </h1>
            <motion.p
              className="mb-5 rounded-full border border-white/35 bg-white/15 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              {t("home.heroBadge", { defaultValue: "Trusted by Local Farmers" })}
            </motion.p>
            <p className="max-w-2xl text-lg md:text-xl text-white font-medium mb-10 leading-relaxed">
              {t("home.heroDescription")}
            </p>

            {/* Search Bar Container */}
            <motion.div
              className="bg-white rounded-2xl flex flex-col md:flex-row items-center w-full max-w-3xl shadow-2xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
            >
              <div className="flex-1 flex items-center px-4 max-md:pt-4 gap-3 w-full border-b md:border-b-0 md:border-r border-slate-100">
                <Search className="text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder={t("home.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full outline-none text-slate-700 text-sm font-medium"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-2 shrink-0">
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  disabled={!speechSupported}
                  aria-label={
                    isListening
                      ? t("home.stopVoiceSearch", {
                          defaultValue: "Stop listening",
                        })
                      : t("home.voiceSearch", {
                          defaultValue: "Voice search",
                        })
                  }
                  title={
                    isListening
                      ? t("home.stopVoiceSearch", {
                          defaultValue: "Stop listening",
                        })
                      : t("home.voiceSearch", {
                          defaultValue: "Voice search",
                        })
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                    isListening
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md"
                      : "border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-600"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                </button>
                <Tractor
                  className="text-slate-400 cursor-pointer hover:text-green-600 transition-colors"
                  size={20}
                />
                <MapPin
                  className="text-slate-400 cursor-pointer hover:text-green-600 transition-colors"
                  size={20}
                />
                <button
                  onClick={handleSearch}
                  className="bg-primary-accent hover:bg-primary-accent-dark text-white font-black px-6 py-3 rounded-xl transition-all active:scale-95 shadow-md"
                >
                  {t("home.searchEquipment")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.section
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        {...fadeInUp}
      >
        <SectionTitle
          eyebrow="Quick access"
          title={t("home.browseCategories", { defaultValue: "Browse by category" })}
          description="Jump directly into the equipment types farmers search for most often."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categoryItems.map((item) => (
            <CategoryPill
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={`/browse?q=${encodeURIComponent(item.query)}`}
            />
          ))}
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        <SectionTitle
          eyebrow="Featured now"
          title={t("home.featuredEquipment", { defaultValue: "Fresh equipment near you" })}
          description="A tighter grid with stronger cards so the homepage feels curated instead of crowded."
          action={featuredCta}
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {loadingFeatured ? (
            Array.from({ length: 4 }).map((_, index) => <FeaturedSkeleton key={index} />)
          ) : featuredEquipment.length ? (
            featuredEquipment.map((item) => (
              <FeaturedEquipmentCard
                key={item?._id}
                equipmentId={item?._id}
                title={
                  item?.name ||
                  t("home.unnamedEquipment", { defaultValue: "Untitled Equipment" })
                }
                price={item?.pricePerDay ?? 0}
                location={
                  item?.location ||
                  item?.address?.city ||
                  t("home.locationUnavailable", { defaultValue: "Location unavailable" })
                }
                img={item?.coverImage || item?.images?.[0] || "https://images.unsplash.com/photo-1530267981375-f08b4170a9a1?auto=format&fit=crop&q=80&w=1200"}
                rating={Number(item?.avgRating ?? 0)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
              {t("home.noFeaturedEquipment", {
                defaultValue: "No featured equipment available yet.",
              })}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        <SectionTitle
          eyebrow="Verified fertilizers"
          title="Featured fertilizers"
          description="Shop tested products from our verified fertilizer catalog."
          action={
            <Link
              href="/fertilizers"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              View all fertilizers
              <ArrowUpRight size={16} />
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredFertilizers.map((fertilizer) => (
            <FeaturedFertilizerCard key={fertilizer._id} fertilizer={fertilizer} />
          ))}
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        <SectionTitle
          eyebrow="How it works"
          title={t("home.howItWorks.title", { defaultValue: "A cleaner booking flow" })}
          description="The homepage should explain the process quickly, then get out of the way."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {howItWorksSteps.map((item, index) => (
            <HowCard
              key={item.step}
              step={item.step}
              title={item.title}
              description={item.description}
              accent={
                index === 1
                  ? "bg-linear-to-br from-emerald-50 to-white"
                  : index === 2
                    ? "bg-linear-to-br from-amber-50 to-white"
                    : "bg-linear-to-br from-sky-50 to-white"
              }
            />
          ))}
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        <SectionTitle
          eyebrow="Why AgriShare"
          title={t("home.whyChoose.title", { defaultValue: "Reasons people actually stay" })}
          description="Short, confident benefits with enough visual weight to feel like a product, not a brochure."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {whyChooseItems.map((item) => (
            <TrustCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        <SectionTitle
          eyebrow="What people say"
          title={t("home.testimonials.title", { defaultValue: "Real feedback from the field" })}
          description="A more grounded testimonial block helps the landing page feel less generic."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-4 py-10 pb-20 sm:px-6 lg:px-8"
        {...fadeInUp}
      >
        <div className="overflow-hidden rounded-[2.25rem] border border-emerald-200 bg-linear-to-r from-emerald-700 via-emerald-600 to-lime-600 px-6 py-8 text-white shadow-[0_30px_80px_rgba(4,120,87,0.28)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100">
                {t("home.cta.badge", { defaultValue: "Ready when you are" })}
              </p>
              <h3 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                {t("home.cta.title", { defaultValue: "Start with a better first impression." })}
              </h3>
              <p className="mt-3 text-sm leading-7 text-emerald-100 sm:text-base">
                {t("home.cta.description", { defaultValue: "Let the homepage do a better job of explaining the product and moving people toward browse or add equipment." })}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
              >
                {t("home.cta.findEquipment", { defaultValue: "Find equipment" })}
              </Link>
              <Link
                href="/add"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                {t("home.cta.listEquipment", { defaultValue: "List your equipment" })}
                <CheckCircle2 size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}