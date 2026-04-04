"use client";

import { useRouter } from "next/navigation";
import {
  MapPin,
  User,
  Calendar,
  CheckCircle,
  Shield,
  MessageCircle,
  PhoneCall,
  X,
  Languages,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "mr", label: "Marathi" },
  { value: "hi", label: "Hindi" },
];

const buildMessageTemplates = ({ equipmentName, ownerName, locationLabel }) => ({
  en: `Hello ${ownerName}, I am interested in renting "${equipmentName}" located at ${locationLabel}. Is it available?\n\nMy name:\nMy location:\nMy question:`,
  mr: `नमस्कार ${ownerName}, मला "${equipmentName}" ${locationLabel} येथे भाड्याने घ्यायचे आहे. हे उपलब्ध आहे का?\n\nमाझे नाव:\nमाझे ठिकाण:\nमाझा प्रश्न:`,
  hi: `नमस्ते ${ownerName}, मैं "${equipmentName}" ${locationLabel} पर किराये पर लेना चाहता/चाहती हूं। क्या यह उपलब्ध है?\n\nमेरा नाम:\nमेरा स्थान:\nमेरा सवाल:`,
});

const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";

  return digits.length === 10 ? `91${digits}` : digits;
};

export default function EquipmentInfoCard({
  equipment,
  ownerName,
  ownerPhone,
  ownerEquipmentCount,
  availabilityText,
  availabilityClassName,
  onBookNow,
  ownerId,
}) {
  const router = useRouter();
  const locationLabel = equipment?.location || "Location unavailable";
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [draftsByLanguage, setDraftsByLanguage] = useState({
    en: "",
    mr: "",
    hi: "",
  });

  const normalizedPhone = useMemo(
    () => normalizePhone(ownerPhone || equipment?.owner?.phone),
    [equipment?.owner?.phone, ownerPhone],
  );

  const templates = useMemo(
    () =>
      buildMessageTemplates({
        equipmentName: equipment?.name || "this equipment",
        ownerName: ownerName || "owner",
        locationLabel,
      }),
    [equipment?.name, locationLabel, ownerName],
  );

  useEffect(() => {
    setDraftsByLanguage(templates);
    setActiveLanguage("en");
  }, [templates]);

  const currentDraft = draftsByLanguage[activeLanguage] || "";
  const currentLanguageLabel =
    LANGUAGE_OPTIONS.find((option) => option.value === activeLanguage)?.label ||
    "English";

  const whatsappUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(currentDraft)}`
    : "";
  const telUrl = normalizedPhone ? `tel:+${normalizedPhone}` : "";

  const handleSendWhatsApp = () => {
    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleDraftChange = (value) => {
    setDraftsByLanguage((current) => ({
      ...current,
      [activeLanguage]: value,
    }));
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24 h-fit">
      <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{equipment.name}</h2>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={18} className="text-gray-400" />
          <span className="text-sm">Location: {locationLabel}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <User size={18} className="text-gray-400" />
          <button
            onClick={() => ownerId && router.push(`/id/${ownerId}`)}
            className={`text-sm ${
              ownerId
                ? "cursor-pointer font-semibold text-green-600 hover:text-green-700 underline"
                : ""
            }`}
          >
            Owner: {ownerName}
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={18} className="text-gray-400" />
          <span className="text-sm">
            Manufactured: {equipment.manufacturingYear || "2018"}
          </span>
        </div>

        <div className="my-2 border-t border-gray-100" />

        <div className="text-center">
          <p className="text-4xl font-bold text-green-600">
            ₹{Math.floor(equipment.pricePerDay || 750)}
          </p>
          <p className="text-sm text-gray-500">/ day</p>
        </div>

        <div
          className={`flex items-center justify-center gap-2 rounded-lg py-2 ${availabilityClassName}`}
        >
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{availabilityText}</span>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
          onClick={onBookNow}
        >
          Book Now
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Owner Details
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle size={12} />
                {ownerEquipmentCount == null
                  ? "Loading equipment count..."
                  : `${ownerEquipmentCount} equipment${ownerEquipmentCount === 1 ? "" : "s"} uploaded`}
              </span>
              <span className="text-xs font-medium text-gray-500">
                {normalizedPhone ? `+${normalizedPhone}` : "Phone unavailable"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            {telUrl ? (
              <a
                href={telUrl}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50"
                aria-label="Call owner"
                title="Call owner"
              >
                <PhoneCall size={16} />
              </a>
            ) : (
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-300"
                aria-hidden="true"
              >
                <PhoneCall size={16} />
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
            >
              <MessageCircle size={12} />
              Message
            </button>
          </div>
        </div>
      </div>

      {isContactOpen &&
        typeof document !== "undefined" &&
        createPortal(
        <div className="fixed inset-0 z-1200 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Contact Owner
                </p>
                <h3 className="mt-1 text-2xl font-black text-gray-900">
                  {ownerName}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {ownerEquipmentCount == null
                    ? "Loading equipment count..."
                    : `${ownerEquipmentCount} equipment${ownerEquipmentCount === 1 ? "" : "s"} listed`}
                  {locationLabel ? ` · ${locationLabel}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {telUrl ? (
                  <a
                    href={telUrl}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-50"
                    aria-label="Call owner"
                    title="Call owner"
                  >
                    <PhoneCall size={16} />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsContactOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-50"
                  aria-label="Close contact modal"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-100 p-1">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveLanguage(option.value)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      activeLanguage === option.value
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Languages size={16} />
                  {currentLanguageLabel} template
                </div>
                <textarea
                  value={currentDraft}
                  onChange={(event) => handleDraftChange(event.target.value)}
                  className="min-h-40 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Type your message here"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <span>Write in {currentLanguageLabel}</span>
                  <span>
                    {normalizedPhone
                      ? `WhatsApp: +${normalizedPhone}`
                      : "Phone unavailable"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={!whatsappUrl}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageCircle size={16} />
                  Send on WhatsApp
                </button>
                <a
                  href={telUrl || "#"}
                  onClick={(event) => {
                    if (!telUrl) {
                      event.preventDefault();
                    }
                  }}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${
                    telUrl
                      ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                      : "cursor-not-allowed border-gray-100 text-gray-300"
                  }`}
                >
                  <PhoneCall size={16} />
                  Call now
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
