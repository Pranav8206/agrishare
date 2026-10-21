"use client";

import { Suspense, useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/AppContext";
import { Search, MapPin, Mic, MicOff, Star, Tractor } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=600&fit=crop";

const GENERIC_SEARCH_WORDS = new Set([
  "equipment",
  "equipments",
  "machine",
  "machines",
  "rental",
  "rent",
]);

const emptyFilters = () => ({
  location: "",
  distance: 200,
  minPrice: "",
  maxPrice: "",
  types: new Set(),
  manufacturers: new Set(),
  userCoords: null, // { lat, lng } or null
});

const pageVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.06, staggerChildren: 0.06 },
  },
};
// Haversine formula for distance in km between two lat/lng points
function getDistanceKm(lat1, lng1, lat2, lng2) {
  if (
    typeof lat1 !== "number" ||
    typeof lng1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lng2 !== "number"
  )
    return null;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
// Try to extract coordinates from equipment item (if present)
function getEquipmentCoords(item) {
  // Accepts MongoDB GeoJSON shape: item.geoLocation.coordinates = [lng, lat]
  if (
    item?.geoLocation &&
    Array.isArray(item.geoLocation.coordinates) &&
    item.geoLocation.coordinates.length === 2
  ) {
    return {
      lat: Number(item.geoLocation.coordinates[1]),
      lng: Number(item.geoLocation.coordinates[0]),
    };
  }

  // Backward-compatible fallbacks for older payload shapes
  if (item?.locationCoords && typeof item.locationCoords.lat === "number") {
    return item.locationCoords;
  }
  if (
    item?.location &&
    typeof item.location === "object" &&
    Array.isArray(item.location.coordinates) &&
    item.location.coordinates.length === 2
  ) {
    return {
      lat: item.location.coordinates[1],
      lng: item.location.coordinates[0],
    };
  }
  return null;
}

const cloneFilters = (filters) => ({
  ...filters,
  types: new Set(filters.types),
  manufacturers: new Set(filters.manufacturers),
});

const parseSearchIntent = (rawQuery) => {
  const query = (rawQuery || "").trim();
  if (!query) {
    return { keyword: "", location: "" };
  }

  const locationMatch = query.match(/\bin\s+([a-z0-9][a-z0-9\s-]*)$/i);
  const location = locationMatch?.[1]?.trim() || "";

  const withoutLocation = locationMatch
    ? query.slice(0, locationMatch.index).trim()
    : query;

  const keyword = withoutLocation
    .split(/\s+/)
    .filter((word) => !GENERIC_SEARCH_WORDS.has(word.toLowerCase()))
    .join(" ")
    .trim();

  return { keyword, location };
};

const normalizeEquipment = (item) => {
  const specs =
    item?.specifications && typeof item.specifications === "object"
      ? item.specifications
      : {};

  const city = item?.address?.city || "";
  const state = item?.address?.state || "";
  const locationText = [
    item?.geoLocation?.address,
    item?.location,
    item?.address?.pincode,
  ]
    .filter(Boolean)
    .join(", ")
    .trim();

  const location = locationText || "Location not specified";
  const title = item?.name || item?.title || "Unnamed Equipment";
  const type = item?.type || item?.category || "Other";

  const horsepower =
    Number(specs.horsepower || specs.hp || specs.HP || item?.hp || 0) || 0;

  const manufacturer =
    item?.manufacturer ||
    specs.manufacturer ||
    specs.brand ||
    item?.brand ||
    "Unknown";

  const image =
    item?.coverImage ||
    (Array.isArray(item?.images) && item.images.length > 0
      ? item.images[0]
      : item?.image) ||
    DEFAULT_IMAGE;

  const price = Number(item?.pricePerDay ?? item?.price ?? 0) || 0;
  const distance = Number.isFinite(Number(item?.distance))
    ? Number(item.distance)
    : null;
  const rating = Number(item?.avgRating ?? item?.rating ?? 0) || 0;

  const searchableText =
    `${title} ${type} ${manufacturer} ${item?.description || ""}`.toLowerCase();
  const searchableLocation =
    `${location} ${item?.address?.pincode || ""} ${item?.geoLocation?.address || ""}`.toLowerCase();

  return {
    id: item?._id || item?.id,
    title,
    type,
    category: type,
    manufacturer,
    location,
    city,
    state,
    image,
    rating,
    price,
    distance,
    hp: horsepower,
    featured: rating >= 4.6,
    createdAt: item?.createdAt ? new Date(item.createdAt).getTime() : 0,
    searchableText,
    searchableLocation,
  };
};

function StarIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "#ca8a04" : "none"}
      stroke="#ca8a04"
      strokeWidth="1.5"
      className="h-4 w-4 inline-block"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );
}

function HeartIcon({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-3 top-3 z-10 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
      style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
      aria-label="wishlist"
    >
      <svg
        viewBox="0 0 24 24"
        fill={active ? "#dc2626" : "none"}
        stroke={active ? "#dc2626" : "#6b7280"}
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

function SkeletonBlock({ className = "" }) {
  return (
    <motion.div
      className={`rounded-xl bg-slate-200/70 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function BrowseResultsSkeleton() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      variants={gridVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          variants={sectionVariants}
          className="overflow-hidden rounded-2xl border border-border-light bg-surface"
        >
          <SkeletonBlock className="h-48 w-full" />
          <div className="space-y-3 p-4">
            <SkeletonBlock className="h-5 w-4/5" />
            <SkeletonBlock className="h-5 w-2/3" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function EquipmentCard({ item, onWishlist, wishlisted, onViewDetails }) {
  const { t } = useTranslation();

  return (
    <motion.article
      variants={sectionVariants}
      whileHover={{ y: -4, scale: 1.008 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group flex flex-col overflow-hidden rounded-3xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border-light)",
      }}
    >
      <div className="relative h-52 overflow-hidden ">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Star size={12} className="fill-amber-300 text-amber-300" />
          <span>{item.rating.toFixed(1)}</span>
        </div>
        {/* <HeartIcon active={wishlisted} onClick={() => onWishlist(item.id)} /> */}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-1 text-lg font-extrabold tracking-tight text-text-primary">
          {item.title}
        </h3>

        <div className="flex items-end justify-between gap-3">
          <span className="text-2xl font-black leading-none text-text-primary">
            ₹{item.price}
            <span className="text-sm font-medium text-text-tertiary">
              {" "}
              {t("browse.perHour")}
            </span>
          </span>
          <span className="rounded-full border border-border-light bg-background px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {item.category}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-text-tertiary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3.5 w-3.5 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className=" line-clamp-2">{item.location}</span>
          {typeof item.distance === "number" && Number.isFinite(item.distance) ? (
            <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-text-secondary">
              {item.distance.toFixed(1)} km
            </span>
          ) : null}
        </div>

        <div
          className="flex items-center justify-between border-t pt-3"
          style={{ borderColor: "#eef0ec" }}
        >
          {item.hp > 0 && (
            <div className="rounded-xl bg-background px-3 py-2">
              <div className="text-[11px] leading-none text-text-tertiary">
                HP
              </div>
              <div className="mt-1 text-sm font-bold text-text-secondary">
                {item.hp}
              </div>
            </div>
          )}
        </div>

        <button
          className="mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-all duration-150 active:scale-95"
          style={{
            backgroundColor: "var(--color-primary-accent)",
            boxShadow: "0 10px 18px rgba(77,124,15,0.18)",
          }}
          onClick={() => onViewDetails(item.id)}
        >
          {t("home.viewDetails")}
        </button>
      </div>
    </motion.article>
  );
}

function FilterSidebar({
  filters,
  setFilters,
  onApply,
  onClear,
  equipmentTypes,
  manufacturers,
}) {
  const { t } = useTranslation();

  const toggleSetOption = (group, value) => {
    setFilters((current) => {
      const nextSet = new Set(current[group]);
      if (nextSet.has(value)) {
        nextSet.delete(value);
      } else {
        nextSet.add(value);
      }
      return { ...current, [group]: nextSet };
    });
  };

  return (
    <aside
      className="h-fit rounded-2xl border p-5 shadow-sm md:sticky md:top-4"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border-light)",
      }}
    >
      <h2 className="mb-4 text-lg font-extrabold text-text-primary">
        {t("browse.filterEquipment")}
      </h2>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-bold text-text-secondary">
          {t("browse.location")}
        </label>
        <input
          type="text"
          placeholder={t("browse.enterCityZip")}
          value={filters.location}
          onChange={(e) =>
            setFilters((current) => ({ ...current, location: e.target.value }))
          }
          className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--color-border-light)",
            color: "var(--color-text-primary)",
          }}
        />
      </div>

      <div className="mb-5">
        <label className="mb-3 block text-sm font-bold text-text-secondary">
          {t("browse.distance")}:{" "}
          <span style={{ color: "var(--color-secondary-accent)" }}>
            {filters.distance} km
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="1000"
          value={filters.distance}
          onChange={(e) =>
            setFilters((current) => ({
              ...current,
              distance: Number(e.target.value),
            }))
          }
          className="w-full cursor-pointer"
          style={{ accentColor: "var(--color-primary-accent)" }}
        />
        <div className="mt-1 flex justify-between text-xs text-text-tertiary">
          <span>0 km</span>
          <span>1000 km</span>
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-bold text-text-secondary">
          {t("browse.pricePerDay")}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("browse.min")}
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                minPrice: e.target.value,
              }))
            }
            className="w-full rounded-xl border px-3 py-2 text-center text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--color-border-light)",
              color: "var(--color-text-primary)",
            }}
          />
          <span className="text-text-tertiary">-</span>
          <input
            type="number"
            placeholder={t("browse.max")}
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                maxPrice: e.target.value,
              }))
            }
            className="w-full rounded-xl border px-3 py-2 text-center text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--color-border-light)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-bold text-text-secondary">
          {t("browse.equipmentType")}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {equipmentTypes.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary"
            >
              <input
                type="checkbox"
                checked={filters.types.has(type)}
                onChange={() => toggleSetOption("types", type)}
                style={{ accentColor: "var(--color-primary-accent)" }}
              />
              <span className="truncate">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-text-secondary">
          {t("browse.manufacturer")}
        </label>
        <div className="flex flex-col gap-1.5">
          {manufacturers.map((name) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary"
            >
              <input
                type="checkbox"
                checked={filters.manufacturers.has(name)}
                onChange={() => toggleSetOption("manufacturers", name)}
                style={{ accentColor: "var(--color-primary-accent)" }}
              />
              <span className="truncate">{name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onApply}
        className="w-full rounded-xl py-3 text-sm font-extrabold text-white transition-all duration-150"
        style={{ backgroundColor: "var(--color-primary-accent)" }}
      >
        {t("browse.applyFilters")}
      </button>

      <button
        onClick={onClear}
        className="mt-2 w-full py-1.5 text-xs font-medium text-text-tertiary transition-colors hover:text-text-secondary"
      >
        {t("browse.clearAllFilters")}
      </button>
    </aside>
  );
}

function BrowsePageContent() {
  // ── GEOLOCATION STATE ──
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  // ── GET USER LOCATION ON MOUNT ──
  useEffect(() => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
          setLocationError("");
        },
        (err) => {
          setLocating(false);
          setLocationError("Location unavailable or denied.");
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    } else {
      setLocating(false);
      setLocationError("Geolocation not supported.");
    }
  }, []);
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { equipments, equipmentsLoading, equipmentsError, refreshEquipments } =
    useAppContext();

  const [searchInput, setSearchInput] = useState(query);
  const [activeSearch, setActiveSearch] = useState(query);
  const [sort, setSort] = useState("default");
  const [wishlist, setWishlist] = useState(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Attach userCoords to filters
  const [filters, setFilters] = useState(() => ({ ...emptyFilters(), userCoords: null }));
  const [appliedFilters, setAppliedFilters] = useState(() => ({ ...emptyFilters(), userCoords: null }));

  // Update filters.userCoords when userCoords changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, userCoords }));
    setAppliedFilters((prev) => ({ ...prev, userCoords }));
  }, [userCoords]);

  useEffect(() => {
    setSearchInput(query);
    setActiveSearch(query);
  }, [query]);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    setSpeechSupported(Boolean(SpeechRecognition));
  }, []);

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

  // Add distance calculation if userCoords and equipment coords exist
  const normalizedEquipments = useMemo(() => {
    if (!Array.isArray(equipments)) return [];
    return equipments.map((item) => {
      const norm = normalizeEquipment(item);
      const coords = getEquipmentCoords(item);
      if (userCoords && coords) {
        norm.distance = getDistanceKm(
          userCoords.lat,
          userCoords.lng,
          coords.lat,
          coords.lng,
        );
      }
      return norm;
    });
  }, [equipments, userCoords]);

  const equipmentTypes = useMemo(() => {
    const uniqueTypes = new Set(
      normalizedEquipments.map((item) => item.type).filter(Boolean),
    );
    return Array.from(uniqueTypes).sort((a, b) => a.localeCompare(b));
  }, [normalizedEquipments]);

  const manufacturers = useMemo(() => {
    const uniqueManufacturers = new Set(
      normalizedEquipments.map((item) => item.manufacturer).filter(Boolean),
    );
    return Array.from(uniqueManufacturers).sort((a, b) => a.localeCompare(b));
  }, [normalizedEquipments]);

  const sortOptions = [
    { value: "default", label: t("browse.sortBy") },
    { value: "price_asc", label: t("browse.priceLowToHigh") },
    { value: "price_desc", label: t("browse.priceHighToLow") },
    { value: "newest", label: t("browse.newest") },
    { value: "rating", label: t("browse.highestRated") },
    { value: "distance", label: t("browse.distance") },
  ];

  const stopVoiceSearch = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
  };

  const runSearch = (rawQuery = searchInput) => {
    const nextQuery = String(rawQuery || "").trim();
    router.push(
      nextQuery ? `/browse?q=${encodeURIComponent(nextQuery)}` : "/browse",
    );
  };

  const startVoiceSearch = () => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      return;
    }

    if (isListening) {
      stopVoiceSearch();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript =
          event.results?.[0]?.[0]?.transcript?.trim() || "";

        if (transcript) {
          setSearchInput(transcript);
          setActiveSearch(transcript);
          runSearch(transcript);
        }
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
    } catch (error) {
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const toggleWishlist = (id) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters(cloneFilters(filters));
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    const next = emptyFilters();
    setFilters(next);
    setAppliedFilters(next);
  };

  const results = useMemo(() => {
    const intent = parseSearchIntent(activeSearch);
    const typedLocation = (appliedFilters.location || "").trim().toLowerCase();
    const intentLocation = (intent.location || "").trim().toLowerCase();
    const locationTerms = [typedLocation, intentLocation].filter(Boolean);

    let data = normalizedEquipments.filter((item) => {
      if (intent.keyword) {
        const keyword = intent.keyword.toLowerCase();
        if (!item.searchableText.includes(keyword)) {
          return false;
        }
      }
      if (locationTerms.length > 0) {
        const matchesLocation = locationTerms.every((term) =>
          item.searchableLocation.includes(term),
        );
        if (!matchesLocation) {
          return false;
        }
      }
      // If userCoords and item.distance exist, filter by max distance
      if (
        appliedFilters.userCoords &&
        typeof item.distance === "number" &&
        appliedFilters.distance != null &&
        item.distance > appliedFilters.distance
      ) {
        return false;
      }
      if (
        appliedFilters.minPrice &&
        item.price < Number(appliedFilters.minPrice)
      ) {
        return false;
      }
      if (
        appliedFilters.maxPrice &&
        item.price > Number(appliedFilters.maxPrice)
      ) {
        return false;
      }
      if (
        appliedFilters.types.size > 0 &&
        !appliedFilters.types.has(item.type)
      ) {
        return false;
      }
      if (
        appliedFilters.manufacturers.size > 0 &&
        !appliedFilters.manufacturers.has(item.manufacturer)
      ) {
        return false;
      }
      return true;
    });
    // Sort by distance if userCoords and sort === "distance"
    if (sort === "distance" && userCoords) {
      data = [...data].sort((a, b) => {
        if (typeof a.distance !== "number") return 1;
        if (typeof b.distance !== "number") return -1;
        return a.distance - b.distance;
      });
    } else if (sort === "price_asc") {
      data = [...data].sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      data = [...data].sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      data = [...data].sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === "rating") {
      data = [...data].sort((a, b) => b.rating - a.rating);
    }
    return data;
  }, [activeSearch, appliedFilters, normalizedEquipments, sort, userCoords]);
  const hasActiveFilters =
    Boolean(appliedFilters.location.trim()) ||
    Boolean(appliedFilters.minPrice) ||
    Boolean(appliedFilters.maxPrice) ||
    appliedFilters.distance !== 200 ||
    appliedFilters.types.size > 0 ||
    appliedFilters.manufacturers.size > 0;

  return (
    <motion.div
      className="min-h-screen pb-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mx-auto max-w-7xl px-4 py-6 sm:px-6" variants={sectionVariants}>
        <motion.section
          className="mb-5 rounded-3xl border p-5 sm:p-6"
          style={{
            background:
              "linear-gradient(120deg, rgba(217,249,157,0.28), rgba(255,253,248,0.9) 45%, rgba(161,98,7,0.12))",
            borderColor: "rgba(77,124,15,0.2)",
          }}
          variants={sectionVariants}
        >
          <h1 className="text-2xl font-black text-text-primary">
            {t("browse.title")}
            {activeSearch && (
              <span
                className="ml-1"
                style={{ color: "var(--color-secondary-accent)" }}
              >
                &quot;{activeSearch}&quot;
              </span>
            )}
          </h1>

          <p className="mt-1 text-sm text-text-tertiary">
            {results.length} {t("browse.resultsFound")}
            {hasActiveFilters ? ` ${t("browse.withFilters")}` : ""}
          </p>

          <AnimatePresence>
            {locating && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                Detecting your location...
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {locationError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-2 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
              >
                {locationError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("browse.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                className="w-full rounded-xl border py-2 pl-10 pr-24 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-border-light)",
                  color: "var(--color-text-primary)",
                }}
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <button
                type="button"
                onClick={startVoiceSearch}
                disabled={!speechSupported}
                aria-label={
                  isListening
                    ? t("browse.stopVoiceSearch", {
                        defaultValue: "Stop listening",
                      })
                    : t("browse.voiceSearch", {
                        defaultValue: "Voice search",
                      })
                }
                title={
                  isListening
                    ? t("browse.stopVoiceSearch", {
                        defaultValue: "Stop listening",
                      })
                    : t("browse.voiceSearch", {
                        defaultValue: "Voice search",
                      })
                }
                className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border transition-all duration-200 ${
                  isListening
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                    : "border-transparent text-text-tertiary hover:border-border-light hover:text-secondary-accent"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isListening ? <MicOff size={26} /> : <Mic size={26} />}
              </button>
            </div>

            <button
              onClick={runSearch}
              className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: "var(--color-primary-accent)" }}
            >
              {t("browse.search")}
            </button>

            <button
              onClick={() => setShowMobileFilters((current) => !current)}
              className="rounded-xl border px-4 py-2 text-sm font-semibold md:hidden"
              style={{
                borderColor: "var(--color-border-light)",
                color: "var(--color-text-secondary)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              {showMobileFilters
                ? t("browse.closeFilters", { defaultValue: "Close filters" })
                : t("browse.openFilters", { defaultValue: "Open filters" })}
            </button>
          </div>
        </motion.section>

        {showMobileFilters && (
          <div className="mb-4 md:hidden">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              equipmentTypes={equipmentTypes}
              manufacturers={manufacturers}
            />
          </div>
        )}

        <motion.div className="flex items-start gap-5" variants={sectionVariants}>
          <div className="hidden w-72 shrink-0 md:block">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              equipmentTypes={equipmentTypes}
              manufacturers={manufacturers}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span
                className="rounded-lg border px-3 py-1.5 text-sm"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border-light)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                {t("browse.currentlyShowing")}{" "}
                <strong style={{ color: "var(--color-text-secondary)" }}>
                  {results.length} {t("browse.items")}
                </strong>
              </span>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:border-secondary-accent focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-border-light)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {equipmentsLoading ? (
              <BrowseResultsSkeleton />
            ) : equipmentsError ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border p-10 text-center"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "#fecaca",
                }}
              >
                <h3 className="text-base font-bold text-error">
                  {equipmentsError}
                </h3>
                <button
                  className="mt-3 rounded-xl px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--color-primary-accent)" }}
                  onClick={refreshEquipments}
                >
                  {t("browse.retry", { defaultValue: "Retry" })}
                </button>
              </motion.div>
            ) : results.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                variants={gridVariants}
                initial="hidden"
                animate="visible"
              >
                {results.map((item) => (
                  <EquipmentCard
                    key={item.id}
                    item={item}
                    wishlisted={wishlist.has(item.id)}
                    onWishlist={toggleWishlist}
                    onViewDetails={(equipmentId) =>
                      router.push(`/equipment/${equipmentId}`)
                    }
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border p-14 text-center"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border-light)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mx-auto mb-3 h-10 w-10 text-text-tertiary"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <h3 className="mb-1 text-lg font-bold text-text-secondary">
                  {t("browse.noEquipment")}
                </h3>
                <p className="text-sm text-text-tertiary">
                  {t("browse.adjustSearch")}
                </p>
                <button
                  onClick={() => {
                    setSearchInput("");
                    setActiveSearch("");
                    handleClearFilters();
                    router.push("/browse");
                  }}
                  className="mt-4 rounded-xl px-5 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--color-primary-accent)" }}
                >
                  {t("browse.clearSearch")}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pb-8" />}>
      <BrowsePageContent />
    </Suspense>
  );
}
