"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Star,
  MapPin,
  FileCheck,
  ShoppingBag,
  ArrowRight,
  Truck,
  Leaf,
  FlaskConical,
  Award,
  AlertTriangle,
  X,
  Plus,
  Minus,
  Check,
  QrCode,
  Building2,
  Phone,
  Mail,
  HelpCircle,
  Clock,
  ChevronRight,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

// ══════════════════ MOCK VERIFIED FERTILIZERS DATA ══════════════════
export const VERIFIED_FERTILIZERS = [
  {
    id: "fert-1",
    name: "IFFCO Nano Urea (Liquid)",
    brand: "IFFCO (Indian Farmers Fertiliser Co-op)",
    category: "nano",
    cropTypes: ["Wheat", "Paddy", "Sugarcane", "Cotton", "Vegetables"],
    price: 225,
    mrp: 260,
    unit: "500 ml Bottle (Equiv. to 1 Bag Urea)",
    rating: 4.9,
    reviewsCount: 142,
    image: "/fertilizers/fertilizer1.jpg",
    seller: {
      name: "Baramati Agro Farmer Producer Co.",
      type: "Govt. Registered FPO",
      location: "Baramati, Pune, MH",
      verifiedSince: "2021",
      badge: "Govt. FPO Gold",
      phone: "+91 98220 XXXXX",
    },
    npk: { n: "46%", p: "0%", k: "0%" },
    purityScore: "99.8%",
    labReportNumber: "MH-AGRI-LAB-2026-8812",
    labTestDate: "14 Feb 2026",
    testingLab: "State Agricultural Testing Lab, Pune",
    stockAvailable: 180,
    deliveryDays: "1-2 Days",
    subsidyEligible: true,
    description:
      "Patented nanotechnology-based nitrogen formulation with 80%+ absorption efficiency compared to conventional urea. Minimizes soil toxicity.",
  },
  {
    id: "fert-2",
    name: "KRIBHCO Bio-NPK Granules",
    brand: "KRIBHCO Agri Biotech",
    category: "organic",
    cropTypes: ["Soybean", "Cotton", "Maize", "Pulses", "Fruits"],
    price: 850,
    mrp: 1050,
    unit: "50 kg Bag",
    rating: 4.8,
    reviewsCount: 96,
    image: "/fertilizers/fertilizer2.jpg",
    seller: {
      name: "Sahyadri Farmers Producer Co. Ltd.",
      type: "Certified Organic Producer",
      location: "Dindori, Nashik, MH",
      verifiedSince: "2020",
      badge: "Organic Certified",
      phone: "+91 94231 XXXXX",
    },
    npk: { n: "12%", p: "14%", k: "10%" },
    purityScore: "99.4%",
    labReportNumber: "MH-NPOP-ORG-2026-4401",
    labTestDate: "02 Feb 2026",
    testingLab: "National Centre of Organic Farming (NCOF)",
    stockAvailable: 95,
    deliveryDays: "2 Days",
    subsidyEligible: false,
    description:
      "100% bio-active granules enriched with Nitrogen fixing bacteria (Azotobacter) and Phosphate solubilizing microbes. Boosts soil microbial biomass.",
  },
  {
    id: "fert-3",
    name: "Mahadhan Smarttek 24:24:0 Fertilizer",
    brand: "Deepak Fertilisers & Petrochemicals",
    category: "npk",
    cropTypes: ["Sugarcane", "Cotton", "Banana", "Grapes", "Onion"],
    price: 1450,
    mrp: 1620,
    unit: "50 kg Bag",
    rating: 4.9,
    reviewsCount: 218,
    image: "/fertilizers/fertilizer3.jpg",
    seller: {
      name: "Vidarbha Krishi Seva Kendra",
      type: "Authorized District Distributor",
      location: "Wardha Road, Nagpur, MH",
      verifiedSince: "2019",
      badge: "Govt. FCO Licensed",
      phone: "+91 97654 XXXXX",
    },
    npk: { n: "24%", p: "24%", k: "0%" },
    purityScore: "99.6%",
    labReportNumber: "MH-FCO-VAL-2026-1092",
    labTestDate: "18 Jan 2026",
    testingLab: "Regional Agrochemical Quality Lab, Nagpur",
    stockAvailable: 240,
    deliveryDays: "24 Hours",
    subsidyEligible: true,
    description:
      "Enhanced efficiency dual-nutrient complex with slow-release phosphorus. Perfect for root development and vegetative growth in black cotton soil.",
  },
  {
    id: "fert-4",
    name: "Pure Vermicompost Gold Organic",
    brand: "Krishi Mitra Organic Earth",
    category: "organic",
    cropTypes: ["All Vegetables", "Flowers", "Paddy", "Orchards", "Wheat"],
    price: 480,
    mrp: 650,
    unit: "40 kg Bag",
    rating: 5.0,
    reviewsCount: 74,
    image: "/fertilizers/fertilizer4.jpg",
    seller: {
      name: "Raju Patil Farm Organics",
      type: "Verified Master Farmer & Vermi Specialist",
      location: "Karveer, Kolhapur, MH",
      verifiedSince: "2022",
      badge: "Master Organic Farmer",
      phone: "+91 98812 XXXXX",
    },
    npk: { n: "2.5%", p: "1.8%", k: "2.1%" },
    purityScore: "100% Natural",
    labReportNumber: "MH-KVK-TEST-2026-302",
    labTestDate: "28 Jan 2026",
    testingLab: "KVK Soil & Organic Testing Unit, Kolhapur",
    stockAvailable: 60,
    deliveryDays: "1-2 Days",
    subsidyEligible: false,
    description:
      "Eisenia Fetida earthworm castings enriched with organic carbon (18%+), humic acid, and micro-nutrients. Restores tired soil vitality.",
  },
  {
    id: "fert-5",
    name: "Paradeep Phosphates DAP (18:46:0)",
    brand: "Zuari Paradeep Phosphates",
    category: "dap",
    cropTypes: ["Wheat", "Potato", "Mustard", "Gram / Chana", "Soybean"],
    price: 1350,
    mrp: 1400,
    unit: "50 kg Bag (Govt. Regulated Rate)",
    rating: 4.7,
    reviewsCount: 185,
    image: "/fertilizers/fertilizer5.jpg",
    seller: {
      name: "Kisan Vikas Sahakari Society",
      type: "Primary Agricultural Credit Society (PACS)",
      location: "Paithan, Chhatrapati Sambhajinagar, MH",
      verifiedSince: "2018",
      badge: "Govt. PACS Verified",
      phone: "+91 99224 XXXXX",
    },
    npk: { n: "18%", p: "46%", k: "0%" },
    purityScore: "99.5%",
    labReportNumber: "MH-GOVT-DAP-2026-904",
    labTestDate: "05 Feb 2026",
    testingLab: "Central Fertilizer Quality Control Institute (CFQCTI)",
    stockAvailable: 310,
    deliveryDays: "1 Day",
    subsidyEligible: true,
    description:
      "Genuine high-grade Di-Ammonium Phosphate with 46% water-soluble P2O5. Essential basal application fertilizer for high yield root establishment.",
  },
  {
    id: "fert-6",
    name: "Utkarsh Zinc-EDTA (12% Chelated)",
    brand: "Utkarsh Agrochem Micronutrients",
    category: "micro",
    cropTypes: ["Paddy / Rice", "Citrus", "Maize", "Wheat", "Tomato"],
    price: 390,
    mrp: 480,
    unit: "1 kg Pack (Foliar & Drip Grade)",
    rating: 4.9,
    reviewsCount: 58,
    image: "/fertilizers/fertilizer6.jpg",
    seller: {
      name: "GreenAgri Research Labs",
      type: "KVK Certified Agri Producer",
      location: "Morshi, Amravati, MH",
      verifiedSince: "2023",
      badge: "Govt. Lab Certified",
      phone: "+91 96570 XXXXX",
    },
    npk: { n: "Zn: 12%", p: "Chelated", k: "100% Soluble" },
    purityScore: "99.9%",
    labReportNumber: "MH-CHEM-MICRO-2026-118",
    labTestDate: "10 Feb 2026",
    testingLab: "Dr. PDKV Agricultural University Lab, Akola",
    stockAvailable: 120,
    deliveryDays: "2 Days",
    subsidyEligible: false,
    description:
      "Fully chelated zinc for instant correction of Khaira disease and leaf chlorosis in Rice and Wheat crops. 100% drip & spray compatible.",
  },
  {
    id: "fert-7",
    name: "Neem Coated Urea (Govt. Certified)",
    brand: "Rashtriya Chemicals & Fertilizers (RCF)",
    category: "dap",
    cropTypes: ["Paddy", "Sugarcane", "Maize", "Wheat", "Millets"],
    price: 266.5,
    mrp: 266.5,
    unit: "45 kg Bag (Official Subsidized Rate)",
    rating: 4.8,
    reviewsCount: 340,
    image: "/fertilizers/fertilizer7.jpg",
    seller: {
      name: "Solapur District Agri Cooperative",
      type: "District Marketing Federation",
      location: "Pandharpur, Solapur, MH",
      verifiedSince: "2017",
      badge: "Govt. Authorized",
      phone: "+91 98500 XXXXX",
    },
    npk: { n: "46%", p: "0%", k: "0%" },
    purityScore: "99.7%",
    labReportNumber: "MH-RCF-UREA-2026-662",
    labTestDate: "01 Feb 2026",
    testingLab: "Govt. Quality Control Laboratory, Pune",
    stockAvailable: 450,
    deliveryDays: "1 Day",
    subsidyEligible: true,
    description:
      "Neem oil coating slows down nitrification and nitrogen loss into groundwater, giving 10-15% more grain yield with identical quantity.",
  },
  {
    id: "fert-8",
    name: "Seaweed Extract Bio-Stimulant Liquid",
    brand: "OceanAgro Bio-Vigour",
    category: "nano",
    cropTypes: ["Pomegranate", "Chilli", "Cotton", "Grapes", "Soybean"],
    price: 599,
    mrp: 850,
    unit: "1 Litre Bottle",
    rating: 4.9,
    reviewsCount: 112,
    image: "/fertilizers/fertilizer8.jpg",
    seller: {
      name: "AgroBio Solutions FPO",
      type: "Bio-Tech Farmer Cooperative",
      location: "Karad, Satara, MH",
      verifiedSince: "2021",
      badge: "Eco-Friendly Gold",
      phone: "+91 94220 XXXXX",
    },
    npk: { n: "Cytokinins", p: "Auxins", k: "Trace Minerals" },
    purityScore: "100% Pure Extract",
    labReportNumber: "MH-BIO-STIM-2026-784",
    labTestDate: "12 Feb 2026",
    testingLab: "ICAR - National Research Centre, Pune",
    stockAvailable: 85,
    deliveryDays: "2 Days",
    subsidyEligible: false,
    description:
      "Concentrated Ascophyllum nodosum marine algae extract. Promotes heavy flowering, prevents flower drop, and enhances drought resistance.",
  },
];

const CATEGORIES = [
  { key: "all", label: "All Fertilizers", icon: "🌱" },
  { key: "organic", label: "Bio & Organic Compost", icon: "🌿" },
  { key: "npk", label: "NPK Complexes", icon: "🧪" },
  { key: "nano", label: "Nano Urea & Liquids", icon: "⚡" },
  { key: "dap", label: "Urea & DAP (Govt. Rate)", icon: "🌾" },
  { key: "micro", label: "Micronutrients & Zinc", icon: "💧" },
];

export default function FertilizersSection() {
  const { axiosInstance, authReady, isAuthenticated, user } = useAppContext();
  const [fertilizers, setFertilizers] = useState([]);
  const [isLoadingFertilizers, setIsLoadingFertilizers] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [selectedFertilizerForCert, setSelectedFertilizerForCert] = useState(null);
  const [selectedFertilizerForOrder, setSelectedFertilizerForOrder] = useState(null);
  const [isSellerRegistrationOpen, setIsSellerRegistrationOpen] = useState(false);
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerReason, setSellerReason] = useState("");
  const [sellerExperience, setSellerExperience] = useState("");

  // Order modal state
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [deliveryVillage, setDeliveryVillage] = useState("");
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    let mounted = true;
    axiosInstance
      .get("/fertilizers")
      .then(({ data }) => {
        if (mounted) setFertilizers(data?.fertilizers || []);
      })
      .catch((error) => {
        if (mounted) {
          setFertilizers([]);
          toast.error(
            error?.response?.data?.message || "Unable to load fertilizers.",
          );
        }
      })
      .finally(() => mounted && setIsLoadingFertilizers(false));
    return () => {
      mounted = false;
    };
  }, [axiosInstance]);

  // Filter logic
  const filteredFertilizers = useMemo(() => {
    return fertilizers.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.seller?.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCrop =
        selectedCrop === "all" ||
        item.cropTypes.some((c) =>
          c.toLowerCase().includes(selectedCrop.toLowerCase()),
        );

      return matchesCategory && matchesSearch && matchesCrop;
    });
  }, [fertilizers, selectedCategory, searchQuery, selectedCrop]);

  const handleOpenOrder = (fert) => {
    if (!authReady || !isAuthenticated) {
      toast.error("Please login to order fertilizer.");
      return;
    }
    setSelectedFertilizerForOrder(fert);
    setOrderQuantity(1);
  };

  const handleOpenSellerRegistration = () => {
    setSellerEmail(user?.email || "");
    setSellerReason("");
    setSellerExperience("");
    setIsSellerRegistrationOpen(true);
  };

  const sellerEmailHref = `https://mail.google.com/mail/?view=cm&fs=1&${new URLSearchParams(
    {
      to: "pranavmawle8206@gmail.com",
      su: `Verified Seller Registration - ${sellerEmail || "Applicant"}`,
      body: `Hello AgriShare team,

I would like to register as a verified seller.

Email address: ${sellerEmail || "[Enter your email address]"}
Reason for applying: ${sellerReason || "[Enter your reason]"}
Experience: ${sellerExperience || "[Enter your experience]"}

I have attached my license and photos of my products for verification.

Regards,
${sellerEmail || "[Your email address]"}`,
    },
  ).toString()}`;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!farmerName.trim() || !farmerPhone.trim() || !deliveryVillage.trim()) {
      toast.error("Please fill your Name, Phone Number, and Village address.");
      return;
    }

    setIsSubmittingOrder(true);
    axiosInstance
      .post("/fertilizers/orders", {
        fertilizerId: selectedFertilizerForOrder._id,
        quantity: orderQuantity,
        farmerName,
        farmerPhone,
        deliveryAddress: deliveryVillage,
      })
      .then(({ data }) => {
        const orderDetails = {
          orderId: data.order.orderNumber,
          fertilizer: selectedFertilizerForOrder,
          quantity: orderQuantity,
          totalAmount: data.order.totalAmount,
          farmerName,
          farmerPhone,
          deliveryVillage,
          paymentMethod: "cod",
          date: new Date(data.order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        };
        setFertilizers((current) =>
          current.map((item) =>
            item._id === selectedFertilizerForOrder._id
              ? { ...item, quantity: item.quantity - orderQuantity }
              : item,
          ),
        );
      setSelectedFertilizerForOrder(null);
      setOrderSuccessModal(orderDetails);
        toast.success("COD order placed successfully.");
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Unable to place order.");
      })
      .finally(() => setIsSubmittingOrder(false));
  };

  return (
    <div className="w-full">
      {/* ══════════════════ FERTILIZER HERO & JIOHOTSTAR-LIKE BANNER ══════════════════ */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-6 md:p-12 text-white shadow-2xl border border-emerald-500/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-md">
            <ShieldCheck size={16} className="text-emerald-400" />
            100% Govt. Lab Tested &amp; Verified Sellers
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Buy Verified Fertilizers <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-300 bg-clip-text text-transparent">
              Directly from Certified FPOs &amp; Farmers
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            Zero adulteration. Zero middleman markup. Every bag and bottle comes with a
            verifiable <strong>Govt. Lab Test Certificate &amp; FCO Purity Hash</strong>.
          </p>

          {/* 4 Trust Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-left">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <FlaskConical size={14} />
                Lab Tested
              </div>
              <p className="text-[11px] text-white/70 mt-1">99%+ NPK purity verified</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-left">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Building2 size={14} />
                Govt FPOs
              </div>
              <p className="text-[11px] text-white/70 mt-1">Direct from 100+ co-ops</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-left">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Truck size={14} />
                Doorstep
              </div>
              <p className="text-[11px] text-white/70 mt-1">Direct village delivery</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs text-left">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Award size={14} />
                FCO Seal
              </div>
              <p className="text-[11px] text-white/70 mt-1">Anti-counterfeit QR code</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ SEARCH & CATEGORY BAR ══════════════════ */}
      <div className="mt-8 space-y-5">
        {/* Search Input & Quick Crop Filter */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex-1 flex items-center gap-3 px-3 w-full">
            <Search className="text-slate-400 shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search fertilizer name, brand (IFFCO, Mahadhan), or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden py-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-3">
            <span className="text-xs font-bold text-slate-500 shrink-0">Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Crops</option>
              <option value="wheat">Wheat (गहू)</option>
              <option value="sugarcane">Sugarcane (ऊस)</option>
              <option value="cotton">Cotton (कापूस)</option>
              <option value="soybean">Soybean (सोयाबीन)</option>
              <option value="paddy">Paddy / Rice (भात)</option>
              <option value="onion">Onion (कांदा)</option>
            </select>
          </div>
        </div>

        {/* Category Pills (JioHotstar / Tadka Style Filter Strip) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-black transition-all ${
                  isSelected
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-105"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════ PRODUCT CARDS GRID ══════════════════ */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Verified Stock Available ({filteredFertilizers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Tested under Fertilizer Control Order (FCO) &amp; State Agriculture Dept.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 size={14} />
            Verified FPO Guarantee
          </div>
        </div>

        {isLoadingFertilizers ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
            Loading available fertilizers...
          </div>
        ) : filteredFertilizers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Leaf className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-bold text-slate-800">No verified fertilizers match your filter</h3>
            <p className="text-sm text-slate-500 mt-1">Try resetting the search query or crop filter.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setSelectedCrop("all");
              }}
              className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredFertilizers.map((fert) => (
              <motion.article
                key={fert._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition hover:shadow-xl hover:border-emerald-300"
              >
                <Link
                  href={`/fertilizers/${fert._id}`}
                  className="relative block h-48 w-full overflow-hidden bg-slate-100"
                >
                <img
                  src={fert.image}
                  alt={fert.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </Link>

                <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                    {fert.brand}
                    </p>
                    <Link
                      href={`/fertilizers/${fert._id}`}
                      className="block text-base font-black text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition"
                    >
                      {fert.name}
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-black text-slate-900">
                            ₹{fert.price}
                          </span>
                          {fert.mrp > fert.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{fert.mrp}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {fert.unit}
                        </p>
                      </div>

                    </div>

                    <Link
                      href={`/fertilizers/${fert._id}`}
                      aria-disabled={Number(fert.quantity ?? fert.stockAvailable) < 1}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-2.5 px-4 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-98"
                    >
                      <ShoppingBag size={14} />
                      {Number(fert.quantity ?? fert.stockAvailable) < 1
                        ? "Out of Stock"
                        : "View Product & Order"}
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════ ANTI-ADULTERATION & FPO ASSURANCE BANNER ══════════════════ */}
      <div className="mt-14 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-8 md:p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <span className="rounded-full bg-emerald-200/60 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
              Why Verified Fertilizers Matter?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Stop Crop Loss from Adulterated Chemicals
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Studies show that up to <strong>30% of fertilizers in local unorganized markets</strong> are adulterated with inert clay, lower nitrogen content, or heavy metals. On AgriShare, every seller is an <strong>authenticated Farmer Producer Organisation (FPO) or Govt. PACS</strong> with mandatory lab test verification.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Check className="text-emerald-600" size={16} /> 100% Fertilizer Control Order (FCO) Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="text-emerald-600" size={16} /> QR-Scannable Digital Batch Receipt
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="text-emerald-600" size={16} /> Direct Subsidy &amp; Transparent Rates
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-emerald-200 p-5 shadow-sm text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <Award size={24} />
            </div>
            <h4 className="font-black text-slate-900 text-base">Are you a certified FPO / Seller?</h4>
            <p className="text-xs text-slate-500">
              List your tested fertilizer stocks and reach 10,000+ local farmers.
            </p>
            <button
              onClick={handleOpenSellerRegistration}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Register as Verified Seller
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════ MODAL 3: VERIFIED SELLER REGISTRATION ══════════════════ */}
      <AnimatePresence>
        {isSellerRegistrationOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsSellerRegistrationOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="seller-registration-title"
            >
              <button
                type="button"
                onClick={() => setIsSellerRegistrationOpen(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close seller registration"
              >
                <X size={20} />
              </button>

              <div className="mb-5 pr-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  <ShieldCheck size={13} /> Seller verification
                </span>
                <h3 id="seller-registration-title" className="mt-2 text-xl font-black text-slate-900">
                  Become a Verified Seller
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Share your details and supporting documents with our team. We will review your application and contact you after verification.
                </p>
              </div>

              <div className="mb-5 space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-950">
                <p className="font-bold">How to get verified</p>
                <ol className="list-inside list-decimal space-y-1.5 text-emerald-900/80">
                  <li>Enter your email address, reason for applying, and experience.</li>
                  <li>Click the email button below to open a prefilled email.</li>
                  <li>Attach your valid license and clear photos of your products before sending.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700">
                  Email address
                  <input
                    type="email"
                    value={sellerEmail}
                    onChange={(event) => setSellerEmail(event.target.value)}
                    placeholder="Your email address"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  Reason for applying
                  <textarea
                    value={sellerReason}
                    onChange={(event) => setSellerReason(event.target.value)}
                    placeholder="Why would you like to become a verified seller?"
                    rows={3}
                    className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  Your experience
                  <textarea
                    value={sellerExperience}
                    onChange={(event) => setSellerExperience(event.target.value)}
                    placeholder="Tell us about your farming, manufacturing, or selling experience"
                    rows={3}
                    className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsSellerRegistrationOpen(false)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <a
                  href={sellerEmailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsSellerRegistrationOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  <Mail size={15} /> Email Verification Request
                </a>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                Send to pranavmawle8206@gmail.com and remember to attach your documents.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════ MODAL 1: LAB TEST CERTIFICATE MODAL ══════════════════ */}
      <AnimatePresence>
        {selectedFertilizerForCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedFertilizerForCert(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              {/* Certificate Header */}
              <div className="text-center border-b border-slate-200 pb-4 mb-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-800 mb-2">
                  <ShieldCheck size={14} /> Official Government Quality Report
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Fertilizer Quality &amp; Purity Certificate
                </h3>
                <p className="text-xs text-slate-500">
                  Issued under Fertilizer Control Order (FCO) 1985 &amp; Bureau of Indian Standards
                </p>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Product Name</span>
                    <strong className="text-slate-800">{selectedFertilizerForCert.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Brand / Manufacturer</span>
                    <strong className="text-slate-800">{selectedFertilizerForCert.brand}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lab Report Number</span>
                    <strong className="text-emerald-700 font-mono">{selectedFertilizerForCert.labReportNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Lab Test</span>
                    <strong className="text-slate-800">{selectedFertilizerForCert.labTestDate}</strong>
                  </div>
                </div>

                {/* Chemical Assay Results Table */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Chemical Assay &amp; Purity Verification</h4>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2.5">Parameter</th>
                          <th className="p-2.5">FCO Standard</th>
                          <th className="p-2.5">Lab Result</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2.5 font-medium">Nitrogen (N) Content</td>
                          <td className="p-2.5">Min {selectedFertilizerForCert.npk.n}</td>
                          <td className="p-2.5 font-bold text-slate-900">{selectedFertilizerForCert.npk.n}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">PASS ✅</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium">Phosphorus (P2O5) Content</td>
                          <td className="p-2.5">{selectedFertilizerForCert.npk.p}</td>
                          <td className="p-2.5 font-bold text-slate-900">{selectedFertilizerForCert.npk.p}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">PASS ✅</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium">Moisture Content</td>
                          <td className="p-2.5">Max 1.5%</td>
                          <td className="p-2.5 font-bold text-slate-900">0.82%</td>
                          <td className="p-2.5 text-emerald-600 font-bold">PASS ✅</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium">Overall Purity Index</td>
                          <td className="p-2.5">Min 98.0%</td>
                          <td className="p-2.5 font-bold text-emerald-700">{selectedFertilizerForCert.purityScore}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">CERTIFIED ✅</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Testing Laboratory & Verification Seal */}
                <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Testing Facility</span>
                    <p className="font-bold text-emerald-950">{selectedFertilizerForCert.testingLab}</p>
                    <p className="text-[11px] text-emerald-700">Authorised Quality Inspector: Dr. V. S. Kulkarni (Govt. Analyst)</p>
                  </div>
                  <div className="text-right shrink-0">
                    <QrCode size={36} className="text-emerald-800 ml-auto" />
                    <span className="text-[9px] text-slate-400 font-mono">SCAN TO VERIFY</span>
                  </div>
                </div>
              </div>

              {/* Close Action */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFertilizerForCert(null)}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Close Certificate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════ MODAL 2: BUY / ORDER NOW MODAL ══════════════════ */}
      <AnimatePresence>
        {selectedFertilizerForOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedFertilizerForOrder(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="mb-4">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Verified Order Checkout
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Order {selectedFertilizerForOrder.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Sold by {selectedFertilizerForOrder.seller.name} ({selectedFertilizerForOrder.seller.location})
                </p>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs sm:text-sm">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Quantity</span>
                    <span className="text-[11px] text-slate-500">{selectedFertilizerForOrder.unit}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setOrderQuantity((prev) => Math.max(1, prev - 1))}
                      className="p-1 text-slate-600 hover:text-emerald-700"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-black text-slate-900 min-w-6 text-center text-sm">
                      {orderQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setOrderQuantity((prev) =>
                          Math.min(
                            selectedFertilizerForOrder.quantity ??
                              selectedFertilizerForOrder.quantity ??
                                selectedFertilizerForOrder.stockAvailable,
                            prev + 1,
                          ),
                        )
                      }
                      className="p-1 text-slate-600 hover:text-emerald-700"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Farmer Details */}
                <div className="space-y-2.5">
                  <label className="font-bold text-slate-800 text-xs">Delivery &amp; Farmer Info</label>
                  <input
                    type="text"
                    required
                    placeholder="Farmer Full Name (e.g. Ramesh Patil)"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number"
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Village &amp; PIN Code"
                      value={deliveryVillage}
                      onChange={(e) => setDeliveryVillage(e.target.value)}
                      className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                    />
                  </div>
                </div>

                {/* Payment Option */}
                <div className="space-y-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                    💵 Cash on Delivery only. Payment is collected when the
                    fertilizer is delivered.
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Price ({orderQuantity} unit)</span>
                    <span>₹{(selectedFertilizerForOrder.price * orderQuantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery (Direct Farm Drop)</span>
                    <span>
                      {selectedFertilizerForOrder.price * orderQuantity >= 1000 ? (
                        <span className="text-emerald-700 font-bold">FREE (Orders &gt; ₹1,000)</span>
                      ) : (
                        "₹70"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-200 text-sm">
                    <span>Total Payable</span>
                    <span className="text-emerald-700">
                      ₹
                      {(
                        selectedFertilizerForOrder.price * orderQuantity +
                        (selectedFertilizerForOrder.price * orderQuantity >= 1000 ? 0 : 70)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmittingOrder ? (
                    "Confirming Order..."
                  ) : (
                    <>
                      Confirm Order &amp; Delivery <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════ MODAL 3: ORDER SUCCESS RECEIPT MODAL ══════════════════ */}
      <AnimatePresence>
        {orderSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-emerald-300 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 size={36} />
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Order Confirmed ✅
              </span>

              <h3 className="text-xl font-black text-slate-900 mt-2">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Order ID: <strong className="font-mono text-emerald-700">{orderSuccessModal.orderId}</strong>
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Item:</span>
                  <strong className="text-slate-800">{orderSuccessModal.fertilizer.name} ({orderSuccessModal.quantity} units)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified Seller:</span>
                  <strong className="text-slate-800">{orderSuccessModal.fertilizer.seller.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address:</span>
                  <strong className="text-slate-800">{orderSuccessModal.deliveryVillage}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <strong className="text-emerald-700">{orderSuccessModal.fertilizer.deliveryDays}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span>Total Amount:</span>
                  <span className="text-emerald-700 text-sm font-black">₹{orderSuccessModal.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => setOrderSuccessModal(null)}
                  className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-black uppercase text-white hover:bg-emerald-700"
                >
                  Done / Continue Browsing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
