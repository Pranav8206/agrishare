"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAppContext } from "@/context/AppContext";
import { AlertTriangle, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.05, staggerChildren: 0.06 },
  },
};

function SkeletonPulse({ className = "" }) {
  return (
    <motion.div
      className={`rounded-lg bg-slate-200 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function ManageEquipmentsLoadingState({ loadingText }) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[0, 1, 2].map((item) => (
          <motion.div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: item * 0.05 }}
          >
            <SkeletonPulse className="h-3 w-28" />
            <SkeletonPulse className="h-8 w-16 mt-3" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <motion.div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 + item * 0.05 }}
          >
            <SkeletonPulse className="h-40 w-full rounded-lg" />

            <div className="mt-4 space-y-2">
              <SkeletonPulse className="h-5 w-44" />
              <SkeletonPulse className="h-4 w-32" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-6 w-10 mt-2" />
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-6 w-14 mt-2" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((chip) => (
                <SkeletonPulse key={chip} className="h-10 w-full rounded-md" />
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <SkeletonPulse className="h-9 w-full rounded-lg" />
              <SkeletonPulse className="h-9 w-10 rounded-lg" />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm font-semibold text-slate-500">
        {loadingText}
      </p>
    </motion.div>
  );
}

function EquipmentCard({
  item,
  stats,
  onDelete,
  onEdit,
  onView,
  onToggleAvailability,
  deleting,
}) {
  const { t } = useTranslation();
  const totalBookings = stats?.totalBookings || 0;
  const statusCounts = stats?.statusCounts || {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  return (
    <motion.div
      variants={sectionVariants}
      whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {item.coverImage ? (
        <img
          src={item.coverImage}
          alt={item.name}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="h-44 w-full bg-slate-100" />
      )}

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-black text-slate-900">{item.name}</h3>
          <p className="text-sm text-slate-500">
            {t("manageEquipment.currency")}{" "}
            {Number(item.pricePerDay || 0).toLocaleString()} /{" "}
            {t("manageEquipment.perDay")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <p className="text-slate-500">{t("manageEquipment.totalBookings")}</p>
            <p className="text-lg font-black text-slate-900">{totalBookings}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <p className="text-slate-500">{t("manageEquipment.availability")}</p>
            <p
              className={`text-lg font-black ${item.isAvailable ? "text-green-600" : "text-red-600"}`}
            >
              {item.isAvailable
                ? t("manageEquipment.active")
                : t("manageEquipment.inactive")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-[11px]">
          {[
            ["pending", statusCounts.pending],
            ["confirmed", statusCounts.confirmed],
            ["completed", statusCounts.completed],
            ["cancelled", statusCounts.cancelled],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-md border border-slate-200 px-2 py-1 text-center"
            >
              <p className="capitalize text-slate-500">{label}</p>
              <p className="font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={() => onView(item)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
            whileTap={{ scale: 0.96 }}
            title="View equipment"
          >
            <Eye size={15} />
          </motion.button>
          <motion.button
            onClick={() => onEdit(item)}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100"
            whileTap={{ scale: 0.96 }}
            title="Edit equipment"
          >
            <Pencil size={15} />
          </motion.button>
          <motion.button
            onClick={() => onToggleAvailability(item)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50"
            whileTap={{ scale: 0.98 }}
          >
            {item.isAvailable
              ? t("manageEquipment.deactivate")
              : t("manageEquipment.activate")}
          </motion.button>
          <motion.button
            onClick={() => onDelete(item._id)}
            disabled={deleting}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
            whileTap={{ scale: 0.96 }}
            title="Delete equipment"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ManageEquipmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { axiosInstance, authReady, isAuthenticated } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [equipments, setEquipments] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [deletingId, setDeletingId] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [activeEditTab, setActiveEditTab] = useState("basic");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "",
    location: "",
    pricePerDay: "",
    condition: "good",
    manufacturingYear: "",
    coverImage: "",
    images: [],
    city: "",
    state: "",
    pincode: "",
  });

  const summary = useMemo(() => {
    const active = equipments.filter((item) => item?.isAvailable).length;
    const inactive = equipments.length - active;
    const totalBookings = Object.values(statsMap).reduce(
      (sum, entry) => sum + Number(entry?.totalBookings || 0),
      0,
    );

    return { active, inactive, totalBookings };
  }, [equipments, statsMap]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [equipmentsResponse, statsResponse] = await Promise.all([
          axiosInstance.get("/equipments/my"),
          axiosInstance.get("/bookings/owner/equipment-stats"),
        ]);

        const list =
          equipmentsResponse.data?.data ||
          equipmentsResponse.data?.equipments ||
          [];
        setEquipments(list);

        const map = {};
        (statsResponse.data?.data || []).forEach((entry) => {
          map[String(entry.equipmentId)] = entry;
        });
        setStatsMap(map);
      } catch (err) {
        setError(err.response?.data?.message || t("manageEquipment.loadFail"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [axiosInstance, authReady, isAuthenticated, t]);

  const handleDelete = async (equipmentId) => {
    if (!window.confirm(t("manageEquipment.deleteConfirm"))) return;

    try {
      setDeletingId(equipmentId);
      await axiosInstance.delete(`/equipments/${equipmentId}`);
      setEquipments((prev) => prev.filter((item) => item._id !== equipmentId));
      toast.success(t("manageEquipment.deleteSuccess"));
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("manageEquipment.deleteFail"),
      );
    } finally {
      setDeletingId("");
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const response = await axiosInstance.put(`/equipments/${item._id}`, {
        isAvailable: !item.isAvailable,
      });
      const updated = response.data?.data || response.data?.updatedEquipment;
      setEquipments((prev) =>
        prev.map((e) => (e._id === item._id ? { ...e, ...updated } : e)),
      );
      toast.success(
        item.isAvailable
          ? t("manageEquipment.deactivateSuccess")
          : t("manageEquipment.activateSuccess"),
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("manageEquipment.toggleFail"),
      );
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setActiveEditTab("basic");
    setEditForm({
      name: item?.name || "",
      description: item?.description || "",
      type: item?.type || "",
      location: item?.location || "",
      pricePerDay: String(item?.pricePerDay ?? ""),
      condition: item?.condition || "good",
      manufacturingYear: item?.manufacturingYear ? String(item.manufacturingYear) : "",
      coverImage: item?.coverImage || "",
      images: Array.isArray(item?.images) ? item.images.filter(Boolean) : [],
      city: item?.address?.city || "",
      state: item?.address?.state || "",
      pincode: item?.address?.pincode || "",
    });
  };

  const closeEditModal = () => {
    if (isSavingEdit) return;
    setEditingItem(null);
  };

  const handleEditFieldChange = (field) => (event) => {
    const value = event?.target?.value ?? "";
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const askImageUrl = (message, defaultValue = "") => {
    const response = window.prompt(message, defaultValue);
    if (response === null) return null;
    const cleanUrl = String(response).trim();
    if (!cleanUrl) return "";
    return cleanUrl;
  };

  const handleChangeCoverImage = () => {
    const nextUrl = askImageUrl("Enter cover image URL", editForm.coverImage || "");
    if (nextUrl === null) return;
    setEditForm((prev) => ({ ...prev, coverImage: nextUrl }));
  };

  const handleRemoveCoverImage = () => {
    setEditForm((prev) => ({ ...prev, coverImage: "" }));
  };

  const handleAddImage = () => {
    const nextUrl = askImageUrl("Enter additional image URL");
    if (!nextUrl) return;
    setEditForm((prev) => ({ ...prev, images: [...prev.images, nextUrl] }));
  };

  const handleReplaceImage = (index) => {
    const current = editForm.images[index] || "";
    const nextUrl = askImageUrl("Replace image URL", current);
    if (nextUrl === null) return;

    setEditForm((prev) => {
      const nextImages = [...prev.images];
      if (nextUrl) {
        nextImages[index] = nextUrl;
      } else {
        nextImages.splice(index, 1);
      }
      return { ...prev, images: nextImages };
    });
  };

  const handleDeleteImage = (index) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleSetAsCover = (index) => {
    setEditForm((prev) => ({
      ...prev,
      coverImage: prev.images[index] || prev.coverImage,
    }));
  };

  const handleView = (item) => {
    if (!item?._id) return;
    router.push(`/equipment/${item._id}`);
  };

  const handleSaveEdit = async () => {
    if (!editingItem?._id) return;

    const name = editForm.name.trim();
    const description = editForm.description.trim();
    const pricePerDay = Number(editForm.pricePerDay);

    if (!name || !description) {
      toast.error("Name and description are required.");
      return;
    }

    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      toast.error("Price per day must be greater than 0.");
      return;
    }

    const images = Array.isArray(editForm.images)
      ? editForm.images.map((url) => String(url).trim()).filter(Boolean)
      : [];

    const payload = {
      name,
      description,
      type: editForm.type.trim() || undefined,
      location: editForm.location.trim() || undefined,
      pricePerDay,
      condition: editForm.condition.trim() || "good",
      manufacturingYear: editForm.manufacturingYear ? Number(editForm.manufacturingYear) : undefined,
      coverImage: editForm.coverImage.trim() || undefined,
      images,
      address: {
        city: editForm.city.trim() || undefined,
        state: editForm.state.trim() || undefined,
        pincode: editForm.pincode.trim() || undefined,
      },
    };

    try {
      setIsSavingEdit(true);
      const response = await axiosInstance.put(
        `/equipments/${editingItem._id}`,
        payload,
      );
      const updated = response.data?.data || response.data?.updatedEquipment;

      setEquipments((prev) =>
        prev.map((item) =>
          item._id === editingItem._id ? { ...item, ...updated } : item,
        ),
      );

      toast.success("Equipment updated successfully.");
      setEditingItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update equipment.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <ProtectedRoute>
      <motion.div
        className="min-h-screen bg-slate-50 p-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="max-w-7xl mx-auto space-y-6" variants={listContainerVariants}>
          <motion.div
            className="flex flex-wrap items-end justify-between gap-3"
            variants={sectionVariants}
          >
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                {t("manageEquipment.title")}
              </h1>
              <p className="text-slate-500">
                {t("manageEquipment.trackSubtitle")}
              </p>
            </div>
            <motion.button
              onClick={() => router.push("/add")}
              className="px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 font-bold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {t("manageEquipment.addEquipment")}
            </motion.button>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-white rounded-xl border border-slate-200 p-4"
              variants={sectionVariants}
              whileHover={{ y: -3 }}
            >
              <p className="text-xs uppercase text-slate-500 font-bold">
                {t("manageEquipment.activeEquipment")}
              </p>
              <p className="text-3xl font-black text-green-600 mt-1">
                {summary.active}
              </p>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl border border-slate-200 p-4"
              variants={sectionVariants}
              whileHover={{ y: -3 }}
            >
              <p className="text-xs uppercase text-slate-500 font-bold">
                {t("manageEquipment.inactiveEquipment")}
              </p>
              <p className="text-3xl font-black text-red-600 mt-1">
                {summary.inactive}
              </p>
            </motion.div>
            <motion.div
              className="bg-white rounded-xl border border-slate-200 p-4"
              variants={sectionVariants}
              whileHover={{ y: -3 }}
            >
              <p className="text-xs uppercase text-slate-500 font-bold">
                {t("manageEquipment.totalBookings")}
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {summary.totalBookings}
              </p>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
              >
                <AlertTriangle size={18} className="text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <ManageEquipmentsLoadingState
              loadingText={t("manageEquipment.loading")}
            />
          ) : equipments.length === 0 ? (
            <motion.div
              className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {t("manageEquipment.noneListed")}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {equipments.map((item) => (
                <EquipmentCard
                  key={item._id}
                  item={item}
                  stats={statsMap[String(item._id)]}
                  deleting={deletingId === item._id}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onView={handleView}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {editingItem && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
            >
              <motion.div
                className="w-full max-w-3xl max-h-[90vh] rounded-xl bg-white shadow-xl overflow-hidden flex flex-col"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="border-b border-slate-200 bg-linear-to-r from-slate-50 to-white p-6">
                  <h2 className="text-2xl font-black text-slate-900">
                    Edit Equipment: {editingItem?.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update all details for this equipment listing
                  </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 border-b border-slate-200 px-6 pt-4">
                  {[
                    { id: "basic", label: "Basic Details" },
                    { id: "images", label: "Images" },
                    { id: "location", label: "Location & Address" },
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveEditTab(tab.id)}
                      className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                        activeEditTab === tab.id
                          ? "text-blue-600 border-blue-600"
                          : "text-slate-500 border-transparent hover:text-slate-700"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {tab.label}
                    </motion.button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <AnimatePresence mode="wait">
                    {/* Basic Details Tab */}
                    {activeEditTab === "basic" && (
                      <motion.div
                        key="basic"
                        className="space-y-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Equipment Name *
                          </label>
                          <input
                            value={editForm.name}
                            onChange={handleEditFieldChange("name")}
                            placeholder="e.g., Excavator CAT 320"
                            type="text"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            disabled={isSavingEdit}
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Description *
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={handleEditFieldChange("description")}
                            placeholder="Detailed description of the equipment..."
                            rows={4}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
                            disabled={isSavingEdit}
                          />
                        </div>

                        {/* Type */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Equipment Type
                          </label>
                          <input
                            value={editForm.type}
                            onChange={handleEditFieldChange("type")}
                            placeholder="e.g., Heavy Machinery, Hand Tools, etc."
                            type="text"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            disabled={isSavingEdit}
                          />
                        </div>

                        {/* Price Per Day */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Price Per Day (₹) *
                          </label>
                          <input
                            value={editForm.pricePerDay}
                            onChange={handleEditFieldChange("pricePerDay")}
                            placeholder="e.g., 500"
                            type="number"
                            min="1"
                            step="1"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            disabled={isSavingEdit}
                          />
                        </div>

                        {/* Condition */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Condition
                          </label>
                          <select
                            value={editForm.condition}
                            onChange={handleEditFieldChange("condition")}
                            className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium outline-none shadow-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            disabled={isSavingEdit}
                          >
                            <option value="new">New</option>
                            <option value="like_new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="old">Old</option>
                          </select>
                        </div>

                        {/* Manufacturing Year */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Manufacturing Year
                          </label>
                          <input
                            value={editForm.manufacturingYear}
                            onChange={handleEditFieldChange("manufacturingYear")}
                            placeholder="e.g., 2020"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            disabled={isSavingEdit}
                          />
                        </div>

                        {/* General Location */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            General Location
                          </label>
                          <input
                            value={editForm.location}
                            onChange={handleEditFieldChange("location")}
                            placeholder="e.g., Mumbai, Residential Area"
                            type="text"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            disabled={isSavingEdit}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Images Tab */}
                    {activeEditTab === "images" && (
                      <motion.div
                        key="images"
                        className="space-y-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-slate-900">
                              Cover Image
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleChangeCoverImage}
                                disabled={isSavingEdit}
                                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                              >
                                {editForm.coverImage ? "Replace Cover" : "Add Cover"}
                              </button>
                              {editForm.coverImage && (
                                <button
                                  type="button"
                                  onClick={handleRemoveCoverImage}
                                  disabled={isSavingEdit}
                                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                >
                                  Delete Cover
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {editForm.coverImage ? (
                              <img
                                src={editForm.coverImage}
                                alt="Cover preview"
                                className="h-52 w-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23475569' font-size='16'%3EImage Not Loaded%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            ) : (
                              <div className="flex h-52 items-center justify-center text-sm font-medium text-slate-500">
                                No cover image selected
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-slate-900">
                              Additional Images
                            </label>
                            <button
                              type="button"
                              onClick={handleAddImage}
                              disabled={isSavingEdit}
                              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                            >
                              Add Image
                            </button>
                          </div>

                          {editForm.images.length === 0 ? (
                            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                              No additional images. Click Add Image to include more photos.
                            </div>
                          ) : (
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {editForm.images.map((url, index) => (
                                <div
                                  key={`${url}-${index}`}
                                  className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                                >
                                  <img
                                    src={url}
                                    alt={`Additional image ${index + 1}`}
                                    className="h-32 w-full object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='128'%3E%3Crect fill='%23e2e8f0' width='240' height='128'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23475569' font-size='14'%3EImage Not Loaded%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                  <div className="flex flex-wrap gap-2 p-3">
                                    <button
                                      type="button"
                                      onClick={() => handleReplaceImage(index)}
                                      disabled={isSavingEdit}
                                      className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                                    >
                                      Replace
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetAsCover(index)}
                                      disabled={isSavingEdit}
                                      className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                    >
                                      Set as Cover
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteImage(index)}
                                      disabled={isSavingEdit}
                                      className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Location & Address Tab */}
                    {activeEditTab === "location" && (
                      <motion.div
                        key="location"
                        className="space-y-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {/* City */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            City
                          </label>
                          <input
                            value={editForm.city}
                            onChange={handleEditFieldChange("city")}
                            placeholder="e.g., Mumbai"
                            type="text"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            disabled={isSavingEdit}
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            State
                          </label>
                          <input
                            value={editForm.state}
                            onChange={handleEditFieldChange("state")}
                            placeholder="e.g., Maharashtra"
                            type="text"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            disabled={isSavingEdit}
                          />
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Pincode
                          </label>
                          <input
                            value={editForm.pincode}
                            onChange={handleEditFieldChange("pincode")}
                            placeholder="e.g., 400001"
                            type="text"
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            disabled={isSavingEdit}
                          />
                        </div>

                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mt-6">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Fill in city, state, and pincode for better location accuracy in search results.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={isSavingEdit}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ProtectedRoute>
  );
}
