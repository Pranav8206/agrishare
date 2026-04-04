"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/Components/ProtectedRoute";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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

function SkeletonPulse({ className = "" }) {
  return (
    <motion.div
      className={`rounded-lg bg-slate-200 ${className}`}
      animate={{ opacity: [0.45, 0.95, 0.45] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function SettingsLoadingState({ title }) {
  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <SkeletonPulse className="h-9 w-44" />
          <SkeletonPulse className="h-4 w-72" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <SkeletonPulse className="h-5 w-36" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <SkeletonPulse className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <SkeletonPulse className="h-10 w-40 rounded-lg" />
              <div className="flex gap-2">
                <SkeletonPulse className="h-10 w-36 rounded-lg" />
                <SkeletonPulse className="h-10 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((item) => (
            <motion.div
              key={item}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: item * 0.06 }}
            >
              <SkeletonPulse className="h-5 w-32" />
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-10 w-full" />
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-10 w-full" />
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-10 w-full" />
              <SkeletonPulse className="h-10 w-36 rounded-lg" />
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 flex flex-wrap gap-3">
          <SkeletonPulse className="h-10 w-28 rounded-lg" />
          <SkeletonPulse className="h-10 w-40 rounded-lg" />
        </div>

        <p className="text-center text-sm font-semibold text-slate-500">{title}</p>
      </div>
    </motion.div>
  );
}

export default function UserSettingsPage() {
  const { t } = useTranslation();
  const { user, setUser, axiosInstance, logout, deleteAccount } =
    useAppContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setProfilePicPreview(user?.profilePic || "");
  }, [user]);

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      const response = await axiosInstance.patch("/users/profile", {
        fullName,
        email,
        phone,
      });
      setUser(response.data?.data || user);
      toast.success(t("settings.profileUpdated"));
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("settings.profileUpdateFail"),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword) {
      toast.error(t("settings.enterPasswords"));
      return;
    }

    try {
      setSavingPassword(true);
      await axiosInstance.patch("/users/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t("settings.passwordChanged"));
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("settings.passwordChangeFail"),
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(
        t("settings.invalidImageFormat") || "Please upload an image file",
      );
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.imageTooLarge") || "Image must be less than 5MB");
      return;
    }

    setProfilePicFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) {
      toast.error(t("settings.selectImage") || "Please select an image first");
      return;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error(t("add.cloudinaryMissing"));
      return;
    }

    try {
      setUploadingProfilePic(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", profilePicFile);
      uploadFormData.append("upload_preset", UPLOAD_PRESET);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        },
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok || !cloudinaryData?.secure_url) {
        throw new Error(
          cloudinaryData?.error?.message || "Image upload failed",
        );
      }

      const response = await axiosInstance.patch("/users/profile", {
        profilePic: cloudinaryData.secure_url,
      });

      const updatedUser = response.data?.data || {
        ...user,
        profilePic: cloudinaryData.secure_url,
      };
      setUser(updatedUser);
      setProfilePicFile(null);
      setProfilePicPreview(updatedUser?.profilePic || "");
      toast.success(
        t("settings.profilePicUpdated") ||
          "Profile picture updated successfully",
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          t("settings.profilePicUploadFail") ||
          "Failed to upload profile picture",
      );
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleRemoveProfilePic = () => {
    setProfilePicFile(null);
    setProfilePicPreview(user?.profilePic || "");
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <SettingsLoadingState title={t("common.loading")} />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <motion.div
        className="min-h-screen bg-slate-50 p-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div variants={sectionVariants}>
            <h1 className="text-3xl font-black text-slate-900">
              {t("nav.settings")}
            </h1>
            <p className="text-slate-500">{t("settings.updateSubtitle")}</p>
          </motion.div>

          <motion.section
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
            variants={sectionVariants}
            whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)" }}
          >
            <h2 className="font-bold text-slate-900">
              {t("settings.profilePicture") || "Profile Picture"}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {profilePicPreview ? (
                  <img
                    src={profilePicPreview}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-slate-500">
                    {(fullName || user?.fullName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <motion.label
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold cursor-pointer hover:bg-slate-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload size={16} />
                  <span>{t("settings.chooseImage") || "Choose Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </motion.label>

                <div className="flex flex-wrap gap-2">
                  <motion.button
                    onClick={handleProfilePicUpload}
                    disabled={!profilePicFile || uploadingProfilePic}
                    className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 font-bold disabled:opacity-60"
                    whileTap={{ scale: 0.97 }}
                  >
                    {uploadingProfilePic
                      ? t("settings.uploading") || "Uploading..."
                      : t("settings.uploadProfilePic") || "Upload Picture"}
                  </motion.button>

                  <AnimatePresence>
                    {profilePicFile && (
                      <motion.button
                        onClick={handleRemoveProfilePic}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold hover:bg-slate-50"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <X size={14} />
                        <span>{t("common.cancel") || "Cancel"}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={sectionVariants}>
            <motion.section
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              variants={sectionVariants}
              whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)" }}
            >
              <h2 className="font-bold text-slate-900">
                {t("settings.myProfile")}
              </h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {t("auth.fullName")}
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {t("auth.email")}
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {t("settings.phoneNumber")}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <motion.button
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 font-bold disabled:opacity-60"
                whileTap={{ scale: 0.97 }}
              >
                {savingProfile
                  ? t("settings.saving")
                  : t("settings.saveProfile")}
              </motion.button>
            </motion.section>

            <motion.section
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              variants={sectionVariants}
              whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)" }}
            >
              <h2 className="font-bold text-slate-900">{t("auth.password")}</h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {t("settings.currentPassword")}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {t("settings.newPassword")}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <motion.button
                onClick={handlePasswordSave}
                disabled={savingPassword}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black font-bold disabled:opacity-60"
                whileTap={{ scale: 0.97 }}
              >
                {savingPassword
                  ? t("settings.updating")
                  : t("settings.changePassword")}
              </motion.button>
            </motion.section>
          </motion.div>

          <motion.section
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex flex-wrap gap-3"
            variants={sectionVariants}
          >
            <motion.button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {t("nav.logout")}
            </motion.button>
            <motion.button
              onClick={() => {
                if (window.confirm(t("settings.deleteAccountConfirm"))) {
                  deleteAccount().catch(() =>
                    toast.error(t("settings.deleteAccountFail")),
                  );
                }
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {t("nav.deleteAccount")}
            </motion.button>
          </motion.section>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
