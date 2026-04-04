//learn

"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { BookOpen, PlayCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const VIDEO_DATA = {
    hi: [
        { id: "WULp1m5YNO4", title: "कृषि में आधुनिक मशीनरी और उपकरणों की जानकारी 2023" },
        { id: "XsYxKV0XuIc", title: "क्या बिहार का सिंचाई संकट खत्म हो गया? | ‘आशा मॉडल’ और सौर ऊर्जा से किसानों की आय में वृद्धि" },
        { id: "wnkK4Jnjftg", title: "महाराष्ट्र में किसान आत्महत्या क्यों करते हैं? | मुकुल के साथ जांच (Jist)" },
        { id: "H-UIseLi35k", title: "भारतीय किसान गरीब क्यों हैं? | हिंदी में समझाया गया | रिया" },
        { id: "7X2wOl7wvSU", title: "फसल कटाई के बाद होने वाले नुकसान पर जागरूकता वीडियो (हिंदी उपशीर्षक के साथ)" },
        { id: "IHycirTpiys", title: "कोल्ड स्टोरेज बिजनेस का मुनाफा समझाया गया | व्यापारी बनाम किसान | कौन ज्यादा कमाता है ?" },
        { id: "Pm3ytbILLso", title: "ऑर्गेनिक खेती का सच! | Organic Farming vs Chemical Farming | Organic Farming Reality in India" },
    ],
    en: [
        { id: "CQ4DtJz28yU", title: "When the rains cease to fall - Indian farmers left alone | DW Documentary" },
        { id: "CrmQ_5DKuGI", title: "Unseasonal Rains Wreak Havoc Crops: Climate Change Impacting Farmers? | India Tonight" },
        { id: "iCueQ5plzew", title: "₹45 Lakh Crore Loss! Why Indian Farmers Stay Poor?" },
        { id: "mPCfrlx9A-w", title: "Organic vs. Chemical Farming | Pros & Cons Explained | Which is Better?" },
        { id: "YFfxd3eUUP4", title: "Land Degradation | Causes, Effects, and Solutions | The Planet Voice" },
        {
            id: "JeU_EYFH1Jk", title: "Artificial intelligence comes to farming in India | BBC News" },
        { id: "oN5I3sEFkHY", title: "Why Are Indian Farmers Poor? | Reasons Why Farmers Are Poor | Farmers Problems in India 2022" },
    ],
    mr: [
        { id: "SaFfS3Py_aY", title: "Sambhajinagar Farmer News | गारपीट-वादळात कांदा पिक जमीनदोस्त, शेतकरी संकटात" },
        { id: "TweUkmROfQc", title: "सेंद्रिय शेती की रासायनिक शेती? | Organic vs Chemical Farming | फायदे आणि तोटे | AgroStar" },
        { id: "aOkhzELCz68", title: "महाराष्ट्रात शेतकरी आत्महत्या का करतात? | मुकुलसोबत तपास (Jist)" },
        { id: "YPTCO6pOHuE", title: "Farmer Protest : Farm Bills बद्दल 3 महत्त्वाचे प्रश्न आणि Experts ची उत्तरं (BBC News Marathi)" },
        { id: "BahCMh83HgA", title: "Farmer's Protest Delhi: MSP साठी कायदा करण्याची शेतक-यांची मागणी, पण त्याचा खरंच फायदा होणार का?" },
        { id: "3_1qcYVeGS4", title: "Best Tractors In India : John Deer vs Mahindra शेतकऱ्यांसाठी बेस्ट ट्रॅक्टर कुठला ? | Vishaych Bhari" },
        { id: "hr6dq0gzcys", title: "रेनगन ची संपूर्ण माहिती | Benefits of Raingun | Raingun Irrigation System | Raingun in Paddy |" },
    ],
};

const LANG_LABELS = {
    en: { label: "English", flag: "🇬🇧" },
    hi: { label: "हिंदी", flag: "🇮🇳" },
    mr: { label: "मराठी", flag: "🇮🇳" },
};

const SECTION_TITLES = {
    en: { heading: "Learn AgriShare", sub: "Watch tutorials in your language" },
    hi: { heading: "AgriShare सीखें", sub: "अपनी भाषा में ट्यूटोरियल देखें" },
    mr: { heading: "AgriShare शिका", sub: "तुमच्या भाषेत ट्यूटोरियल पहा" },
};

const pageVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 },
    },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

const cardGridVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { delayChildren: 0.08, staggerChildren: 0.06 },
    },
};

export default function LearnPage() {
    const { i18n } = useTranslation();
    const [activeVideo, setActiveVideo] = useState(null);
    const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

    const activeLang = VIDEO_DATA[lang] ? lang : "en";
    const videos = VIDEO_DATA[activeLang];
    const labels = SECTION_TITLES[activeLang] || SECTION_TITLES.en;

    const closeModal = useCallback(() => setActiveVideo(null), []);

    // Close on Escape key
    useEffect(() => {
        if (!activeVideo) return;
        const handler = (e) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [activeVideo, closeModal]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (activeVideo) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [activeVideo]);

    return (
        <motion.main
            className="min-h-screen bg-background pt-28 pb-20 px-4"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                className="max-w-7xl mx-auto mb-12 text-center rounded-3xl border border-emerald-200/50 bg-linear-to-r from-emerald-50/70 via-background to-amber-50/70 p-6"
                variants={sectionVariants}
            >
                <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-surface px-4 py-1.5 text-sm font-medium text-text-secondary mb-4 shadow-sm">
                    <BookOpen size={14} />
                    <span>
                        {LANG_LABELS[activeLang]?.flag} {LANG_LABELS[activeLang]?.label}
                    </span>
                </div>
                <h1 className="font-editorial text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-3">
                    {labels.heading}
                </h1>
                <p className="text-text-secondary text-lg">{labels.sub}</p>
            </motion.div>

            {/* Video Grid */}
            <motion.div
                className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                variants={cardGridVariants}
                initial="hidden"
                animate="visible"
            >
                {videos.map((video, idx) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        index={idx + 1}
                        onClick={() => setActiveVideo(video)}
                    />
                ))}
            </motion.div>

            {/* Video Modal */}
            <AnimatePresence>
                {activeVideo && <VideoModal video={activeVideo} onClose={closeModal} />}
            </AnimatePresence>
        </motion.main>
    );
}

function VideoCard({ video, index, onClick }) {
    const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

    return (
        <motion.article
            onClick={onClick}
            variants={sectionVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-border-light hover:border-primary-accent/60 hover:shadow-lg transition-all duration-200"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-surface overflow-hidden">
                <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <PlayCircle size={52} className="text-white drop-shadow-lg" />
                </div>
                {/* Episode badge */}
                <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
                    #{index}
                </span>
            </div>

            {/* Info */}
            <div className="bg-background px-4 py-3">
                <p className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
                    {video.title}
                </p>
            </div>
        </motion.article>
    );
}

function VideoModal({ video, onClose }) {
    return (
        <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={video.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Backdrop — click outside to close */}
            <motion.div
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            />

            {/* Modal box */}
            <motion.div
                className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden border border-border-light shadow-2xl bg-background"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border-light">
                    <p className="font-semibold text-text-primary truncate pr-4">
                        {video.title}
                    </p>
                    <button
                        onClick={onClose}
                        className="shrink-0 grid place-items-center h-8 w-8 rounded-full border border-border-light text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors"
                        aria-label="Close video"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* iframe */}
                <div className="aspect-video w-full bg-black">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="block w-full h-full"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}