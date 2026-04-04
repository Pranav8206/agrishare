"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import {
  ArrowLeft,
  Calendar,
  CircleDollarSign,
  MapPin,
  Package,
  Star,
  UserRound,
} from "lucide-react";

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating-high", label: "Stars: High to Low" },
  { value: "rating-low", label: "Stars: Low to High" },
];

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function CardStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function EquipmentCard({ equipment, onOpen }) {
  return (
    <button
      onClick={() => onOpen(equipment._id)}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-52 overflow-hidden bg-slate-100">
        {equipment.coverImage ? (
          <img
            src={equipment.coverImage}
            alt={equipment.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
            No image available
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-slate-950/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
          {equipment.condition || "good"}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-black text-slate-900">{equipment.name}</h3>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
              {formatMoney(equipment.pricePerDay)} / day
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {equipment.description || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <Star size={14} />
              Stars
            </div>
            <p className="mt-2 text-lg font-black text-slate-900">
              {(Number(equipment.avgRating || 0)).toFixed(1)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <Package size={14} />
              Availability
            </div>
            <p className={`mt-2 text-lg font-black ${equipment.isAvailable ? "text-emerald-600" : "text-red-600"}`}>
              {equipment.isAvailable ? "Open" : "Closed"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <MapPin size={14} />
            {equipment.location || equipment.geoLocation?.address || "Location not set"}
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-slate-900">
            <Calendar size={14} />
            {formatDate(equipment.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function UserPublicProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const { axiosInstance, authReady, isAuthenticated } = useAppContext();

  const [profile, setProfile] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    if (!authReady || !isAuthenticated || !userId) return;

    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [userResponse, equipmentResponse] = await Promise.all([
          axiosInstance.get(`/users/${userId}`),
          axiosInstance.get(`/equipments/user/${userId}`),
        ]);

        if (!isMounted) return;

        setProfile(userResponse.data?.data || null);
        setEquipments(equipmentResponse.data?.equipments || []);
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load user profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [authReady, axiosInstance, isAuthenticated, userId]);

  const sortedEquipments = useMemo(() => {
    const list = [...equipments];

    switch (sortBy) {
      case "price-low":
        return list.sort((a, b) => Number(a.pricePerDay || 0) - Number(b.pricePerDay || 0));
      case "price-high":
        return list.sort((a, b) => Number(b.pricePerDay || 0) - Number(a.pricePerDay || 0));
      case "rating-high":
        return list.sort((a, b) => Number(b.avgRating || 0) - Number(a.avgRating || 0));
      case "rating-low":
        return list.sort((a, b) => Number(a.avgRating || 0) - Number(b.avgRating || 0));
      case "latest":
      default:
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [equipments, sortBy]);

  const stats = useMemo(() => {
    const total = equipments.length;
    const averagePrice =
      total > 0
        ? Math.round(
            equipments.reduce((sum, item) => sum + Number(item.pricePerDay || 0), 0) /
              total,
          )
        : 0;
    const averageStars =
      total > 0
        ? (
            equipments.reduce((sum, item) => sum + Number(item.avgRating || 0), 0) /
            total
          ).toFixed(1)
        : "0.0";

    return { total, averagePrice, averageStars };
  }, [equipments]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8e8,#f8fafc_40%,#ecfeff_100%)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="border-b border-slate-200 bg-linear-to-r from-amber-50 via-white to-sky-50 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-linear-to-br from-amber-100 to-sky-100 text-2xl font-black text-slate-700 shadow-sm">
                  {getInitials(profile?.fullName || "User")}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    User profile
                  </p>
                  <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                    {profile?.fullName || "Loading user"}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    {profile?.email || "Email not available"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-lg">
                <CardStat label="Equipments" value={stats.total} icon={Package} />
                <CardStat label="Avg. price" value={formatMoney(stats.averagePrice)} icon={CircleDollarSign} />
                <CardStat label="Avg. stars" value={stats.averageStars} icon={Star} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 sm:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
                <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
                <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-[300px_1fr]">
                <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
                <div className="space-y-4">
                  <div className="h-14 animate-pulse rounded-3xl bg-slate-100" />
                  <div className="h-14 animate-pulse rounded-3xl bg-slate-100" />
                  <div className="h-14 animate-pulse rounded-3xl bg-slate-100" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 sm:p-8">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-700 text-lg font-black text-white">
                      {profile?.profilePic ? (
                        <img
                          src={profile.profilePic}
                          alt={profile?.fullName || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(profile?.fullName || "User")
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                        Account
                      </p>
                      <p className="text-xl font-black text-slate-900">
                        {profile?.fullName || "User"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Email
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {profile?.email || "-"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Phone
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {profile?.phone || "-"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Verified
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {profile?.isVerified ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Joined
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(profile?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                        Equipment catalog
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Showing {sortedEquipments.length} equipment item{sortedEquipments.length === 1 ? "" : "s"} from this user.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${sortBy === option.value ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {sortedEquipments.length ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {sortedEquipments.map((equipment) => (
                        <EquipmentCard
                          key={equipment._id}
                          equipment={equipment}
                          onOpen={(equipmentId) => router.push(`/equipment/${equipmentId}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                      <Package size={42} className="mx-auto text-slate-300" />
                      <h2 className="mt-4 text-xl font-black text-slate-900">
                        No equipment found
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        This user has not listed any equipment yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
