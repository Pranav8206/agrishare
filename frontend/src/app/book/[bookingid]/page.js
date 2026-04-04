"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/Components/ProtectedRoute";
import { useAppContext } from "@/context/AppContext";
import {
  ArrowLeft,
  Calendar,
  CircleDollarSign,
  Clock3,
  CreditCard,
  ExternalLink,
  Hash,
  Mail,
  MapPin,
  Package,
  Phone,
  Route,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";

const statusTone = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const paymentTone = {
  pending: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

function formatLocation(value) {
  if (!value) return "Location not provided";
  if (typeof value === "string") return value;
  return String(value);
}

function getEquipmentOrigin(equipment) {
  const candidates = [
    equipment?.geoLocation?.address,
    equipment?.location,
    [equipment?.address?.city, equipment?.address?.state, equipment?.address?.pincode]
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);

  return candidates[0] || "Pickup location not provided";
}

function getInitials(name) {
  return (
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="rounded-xl bg-slate-50 p-2 text-slate-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function DetailCard({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfileCard({ title, person, fallbackLabel }) {
  const initials = getInitials(person?.fullName || fallbackLabel);
  const profileHref = person?._id ? `/id/${person._id}` : "";

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-4">
        {profileHref ? (
          <Link
            href={profileHref}
            aria-label={`View ${person?.fullName || fallbackLabel} profile`}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-amber-100 to-sky-100 text-lg font-black text-slate-700"
          >
            {person?.profilePic ? (
              <img
                src={person.profilePic}
                alt={person?.fullName || fallbackLabel}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </Link>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-amber-100 to-sky-100 text-lg font-black text-slate-700">
            {person?.profilePic ? (
              <img
                src={person.profilePic}
                alt={person?.fullName || fallbackLabel}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              {title}
            </p>
            {person?.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                <ShieldCheck size={12} />
                Verified
              </span>
            )}
            {person?.isAvailableAsLabour && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
                Labour
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-lg font-black text-slate-900">
            {person?.fullName || fallbackLabel}
          </p>
          <p className="text-sm text-slate-600">
            {person?.email || "Email not available"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoRow icon={Mail} label="Email" value={person?.email || "-"} />
        <InfoRow icon={Phone} label="Phone" value={person?.phone || "-"} />
        <InfoRow
          icon={ShieldCheck}
          label="Verified"
          value={person?.isVerified ? "Yes" : "No"}
        />
        <InfoRow
          icon={Calendar}
          label="Joined"
          value={formatDate(person?.createdAt)}
        />
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const { bookingid } = useParams();
  const router = useRouter();
  const { axiosInstance, authReady, isAuthenticated } = useAppContext();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authReady || !isAuthenticated || !bookingid) return;

    let isMounted = true;

    const loadBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(`/bookings/${bookingid}`);
        if (isMounted) {
          setBooking(response.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load booking details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      isMounted = false;
    };
  }, [authReady, axiosInstance, bookingid, isAuthenticated]);

  const days = useMemo(() => {
    if (!booking?.startDate || !booking?.endDate) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [booking]);

  const pricingRows = useMemo(() => {
    const breakdown = booking?.pricingBreakdown || {};
    return [
      { label: "Days", value: breakdown.days ?? days },
      {
        label: "Price per day",
        value: breakdown.pricePerDay ?? booking?.equipment?.pricePerDay ?? 0,
      },
      { label: "Base amount", value: breakdown.baseAmount ?? 0 },
      { label: "Surcharge", value: breakdown.rentSurchargeAmount ?? 0 },
      { label: "Add-ons", value: breakdown.addonsAmount ?? 0 },
      { label: "Delivery fee", value: breakdown.deliveryFee ?? 0 },
      {
        label: "Total",
        value: breakdown.totalAmount ?? booking?.totalPrice ?? 0,
      },
    ];
  }, [booking, days]);

  const equipmentOrigin = useMemo(
    () => getEquipmentOrigin(booking?.equipment),
    [booking],
  );

  const blockchainHash = booking?.transactionHash || booking?.blockchainHash || "";
  const blockchainUrl = blockchainHash
    ? `https://amoy.polygonscan.com/tx/${blockchainHash}`
    : "";

  const firstName =
    booking?.renter?.fullName?.split(/\s+/)?.[0] ||
    booking?.owner?.fullName?.split(/\s+/)?.[0] ||
    "Booking";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7e6,#f8fafc_45%,#eef2ff_100%)] p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="border-b border-slate-200 bg-linear-to-r from-amber-50 via-white to-sky-50 p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Booking details
                  </p>
                  <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                    {booking?.equipment?.name || "Booking"}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Booking ID: {booking?._id || bookingid}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusTone[booking?.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                  >
                    {booking?.status || "loading"}
                  </span>
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${paymentTone[booking?.paymentStatus] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                  >
                    Payment: {booking?.paymentStatus || "loading"}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                </div>
              </div>
            ) : error ? (
              <div className="p-6 sm:p-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              </div>
            ) : booking ? (
              <div className="space-y-6 p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoRow
                    icon={Package}
                    label="Equipment"
                    value={booking?.equipment?.name || "-"}
                  />
                  <InfoRow
                    icon={UserRound}
                    label="Renter"
                    value={booking?.renter?.fullName || "-"}
                  />
                  <InfoRow
                    icon={Wrench}
                    label="Owner"
                    value={booking?.owner?.fullName || "-"}
                  />
                  <InfoRow
                    icon={CircleDollarSign}
                    label="Total price"
                    value={formatMoney(booking?.totalPrice)}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <DetailCard title="Journey Timeline">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                            <Route size={14} />
                            Start of journey
                          </div>
                          <p className="mt-3 text-lg font-black text-slate-900">
                            {formatLocation(equipmentOrigin)}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Pickup date: {formatDate(booking?.startDate)}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-5">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                            <MapPin size={14} />
                            End of journey
                          </div>
                          <p className="mt-3 text-lg font-black text-slate-900">
                            {formatLocation(booking?.deliveryLocation)}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Delivery date: {formatDate(booking?.endDate)}
                          </p>
                        </div>
                      </div>
                    </DetailCard>

                    <DetailCard title="Booking Schedule">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoRow
                          icon={Calendar}
                          label="Start date"
                          value={formatDate(booking?.startDate)}
                        />
                        <InfoRow
                          icon={Calendar}
                          label="End date"
                          value={formatDate(booking?.endDate)}
                        />
                        <InfoRow
                          icon={Clock3}
                          label="Duration"
                          value={`${days} ${days === 1 ? "day" : "days"}`}
                        />
                        <InfoRow
                          icon={MapPin}
                          label="Delivery location"
                          value={formatLocation(booking?.deliveryLocation)}
                        />
                      </div>
                    </DetailCard>

                    <DetailCard title="Equipment Details">
                      <div className="flex flex-col gap-5 lg:flex-row">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 lg:w-72">
                          {booking?.equipment?.coverImage ? (
                            <img
                              src={booking.equipment.coverImage}
                              alt={booking?.equipment?.name || "Equipment"}
                              className="h-56 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-56 items-center justify-center text-sm font-semibold text-slate-500">
                              No equipment image available
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                Equipment
                              </p>
                              <h3 className="mt-1 text-2xl font-black text-slate-900">
                                {booking?.equipment?.name || "-"}
                              </h3>
                            </div>
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                              {booking?.equipment?.type || "Equipment"}
                            </span>
                          </div>

                          <p className="text-sm leading-6 text-slate-600">
                            {booking?.equipment?.description ||
                              "No equipment description available."}
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <InfoRow
                              icon={MapPin}
                              label="Home location"
                              value={equipmentOrigin}
                            />
                            <InfoRow
                              icon={CircleDollarSign}
                              label="Price per day"
                              value={formatMoney(booking?.equipment?.pricePerDay)}
                            />
                            <InfoRow
                              icon={Calendar}
                              label="Condition"
                              value={booking?.equipment?.condition || "-"}
                            />
                            <InfoRow
                              icon={Package}
                              label="Availability"
                              value={booking?.equipment?.isAvailable ? "Available" : "Unavailable"}
                            />
                          </div>
                        </div>
                      </div>
                    </DetailCard>

                    <DetailCard title="Payment & Status">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoRow
                          icon={CreditCard}
                          label="Payment mode"
                          value={booking?.paymentMethod || "-"}
                        />
                        <InfoRow
                          icon={CircleDollarSign}
                          label="Payment status"
                          value={booking?.paymentStatus || "-"}
                        />
                        <InfoRow
                          icon={Hash}
                          label="Blockchain hash"
                          value={
                            blockchainHash
                              ? `${blockchainHash.slice(0, 12)}...${blockchainHash.slice(-10)}`
                              : "Not recorded yet"
                          }
                        />
                        <InfoRow
                          icon={Calendar}
                          label="Created at"
                          value={formatDate(booking?.createdAt)}
                        />
                        <InfoRow
                          icon={Calendar}
                          label="Updated at"
                          value={formatDate(booking?.updatedAt)}
                        />
                      </div>
                    </DetailCard>

                    <DetailCard title="Notes">
                      <div className="space-y-4 text-sm text-slate-700">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            Special requirements
                          </p>
                          <p className="mt-2 rounded-2xl bg-slate-50 p-4">
                            {booking?.specialRequirements ||
                              "No special requirements provided."}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            Selected add-ons
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {booking?.selectedAddons?.length ? (
                              booking.selectedAddons.map((addon) => (
                                <span
                                  key={addon.key || addon.label}
                                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                                >
                                  {addon.label}{" "}
                                  {addon.price ? `- Rs. ${Number(addon.price).toLocaleString()}` : ""}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500">
                                No add-ons selected.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </DetailCard>
                  </div>

                  <div className="space-y-6">
                    <DetailCard title="Blockchain Proof">
                      <div className="rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 via-white to-sky-50 p-5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                          <Hash size={14} />
                          On-chain booking record
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          The booking was written to blockchain as an immutable proof
                          of rental. This is the transaction hash tied to the record.
                        </p>

                        <div className="mt-4 break-all rounded-2xl bg-slate-950 p-4 font-mono text-[11px] leading-5 text-emerald-300">
                          {blockchainHash || "Blockchain hash not available yet."}
                        </div>

                        {blockchainUrl && (
                          <a
                            href={blockchainUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline"
                          >
                            View on Polygonscan
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </DetailCard>

                    <DetailCard title="Pricing Breakdown">
                      <div className="space-y-3">
                        {pricingRows.map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                          >
                            <span className="text-sm font-medium text-slate-600">
                              {row.label}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {row.label === "Days" ? row.value : formatMoney(row.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </DetailCard>

                    <DetailCard title="People & Profiles">
                      <div className="space-y-4">
                        <ProfileCard
                          title="Renter profile"
                          person={booking?.renter}
                          fallbackLabel="Renter"
                        />
                        <ProfileCard
                          title="Equipment owner profile"
                          person={booking?.owner}
                          fallbackLabel="Owner"
                        />
                      </div>
                    </DetailCard>

                    <DetailCard title="Quick Summary">
                      <div className="rounded-3xl bg-linear-to-br from-amber-50 to-sky-50 p-5">
                        <p className="text-sm font-semibold text-slate-700">
                          {firstName} booked {booking?.equipment?.name || "an item"}.
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          This booking is currently{" "}
                          <span className="font-semibold text-slate-900">
                            {booking?.status || "unknown"}
                          </span>{" "}
                          and the payment is{" "}
                          <span className="font-semibold text-slate-900">
                            {booking?.paymentStatus || "unknown"}
                          </span>
                          .
                        </p>
                      </div>
                    </DetailCard>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}