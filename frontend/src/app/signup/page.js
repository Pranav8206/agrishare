"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

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

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const captchaRef = useRef(null);

  const captchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const isCaptchaConfigured = Boolean(captchaSiteKey);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const {
    loading,
    error,
    setLoading,
    setError,
    setAuth,
    apiBaseUrl,
    isAuthenticated,
    authReady,
  } = useAppContext();

  useEffect(() => {
    if (authReady && isAuthenticated) {
      router.replace("/");
    }
  }, [authReady, isAuthenticated, router]);

  if (authReady && isAuthenticated) {
    return null;
  }

  const resetCaptcha = () => {
    setCaptchaToken("");
    captchaRef.current?.reset?.();
    setCaptchaKey((value) => value + 1);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      toast.error(t("auth.fullNameRequired"));
      return;
    }

    if (!email.trim()) {
      toast.error(t("auth.emailRequired"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("auth.passwordMin"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    if (!acceptTerms) {
      toast.error(t("auth.acceptTerms"));
      return;
    }

    if (!isCaptchaConfigured) {
      toast.error(t("auth.captchaUnavailable"));
      return;
    }

    if (!captchaToken) {
      toast.error(t("auth.captchaRequired"));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/users/register`, {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        captchaToken,
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || t("auth.signupFailed"));
      }

      const payload = response?.data?.data;
      if (!payload?.token) {
        throw new Error(response?.data?.message || t("auth.signupFailed"));
      }

      setAuth({ token: payload.token, user: payload.user });
      resetCaptcha();
      toast.success(response?.data?.message || t("auth.createAccount"));
      router.push("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || t("auth.signupFailed");
      setError(message);
      toast.error(message);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-10"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mx-auto grid min-h-[90vh] w-full max-w-7xl overflow-hidden rounded-4xl border border-border-light bg-background shadow-sm md:grid-cols-2"
        variants={sectionVariants}
      >
        <motion.aside
          className="relative hidden flex-col justify-between px-10 py-12 md:flex"
          variants={sectionVariants}
        >
          <img
            src="/AuthPages/signupSidebar.jpeg"
            alt={t("auth.signupSidebarAlt")}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-br from-black/60 via-black/40 to-black/50" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
              {t("auth.brandName")}
            </p>
            <h1 className="font-editorial mt-3 text-5xl leading-tight text-white">
              {t("auth.signupHeroTitle")}
            </h1>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="mt-1 shrink-0 text-secondary-accent"
                size={20}
              />
              <div className="text-sm text-white/90">
                <p className="font-semibold">{t("auth.benefitRentTitle")}</p>
                <p className="text-white/70">{t("auth.benefitRentText")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-1 shrink-0 text-secondary-accent"
                size={20}
              />
              <div className="text-sm text-white/90">
                <p className="font-semibold">{t("auth.benefitSecureTitle")}</p>
                <p className="text-white/70">{t("auth.benefitSecureText")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="mt-1 shrink-0 text-secondary-accent"
                size={20}
              />
              <div className="text-sm text-white/90">
                <p className="font-semibold">{t("auth.benefitListTitle")}</p>
                <p className="text-white/70">{t("auth.benefitListText")}</p>
              </div>
            </div>
          </div>
        </motion.aside>

        <motion.section
          className="flex items-center bg-surface px-5 py-10 sm:px-10 md:px-12"
          variants={sectionVariants}
        >
          <div className="mx-auto w-full max-w-md">
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary"
              variants={sectionVariants}
            >
              {t("auth.createAccount")}
            </motion.p>
            <motion.h2
              className="font-editorial mt-2 text-4xl text-text-primary"
              variants={sectionVariants}
            >
              {t("auth.signup")}
            </motion.h2>
            <motion.p className="mt-2 text-sm text-text-secondary" variants={sectionVariants}>
              {t("auth.signupSubtitle")}
            </motion.p>

            <motion.form
              className="mt-8 space-y-5 rounded-2xl border border-border-light bg-background/60 p-5"
              onSubmit={handleRegister}
              variants={sectionVariants}
            >
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    {t("auth.fullName")}
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-text-tertiary"
                      size={18}
                    />
                    <input
                      type="text"
                      value={fullName}
                      placeholder={t("auth.fullNamePlaceholder")}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border-0 border-b border-border-light bg-transparent py-3 pl-7 pr-2 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary/80 focus:border-secondary-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-text-tertiary"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      placeholder={t("auth.emailPlaceholder")}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-0 border-b border-border-light bg-transparent py-3 pl-7 pr-2 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary/80 focus:border-secondary-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-text-tertiary"
                        size={18}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder={t("auth.passwordHint")}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-0 border-b border-border-light bg-transparent py-3 pl-7 pr-9 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary/80 focus:border-secondary-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                        aria-label={t("auth.togglePassword")}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                      {t("auth.confirmPassword")}
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-text-tertiary"
                        size={18}
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        placeholder={t("auth.confirmPasswordPlaceholder")}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border-0 border-b border-border-light bg-transparent py-3 pl-7 pr-9 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary/80 focus:border-secondary-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                        aria-label={t("auth.toggleConfirmPassword")}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl">
                  {isCaptchaConfigured ? (
                    <ReCAPTCHA
                      key={captchaKey}
                      ref={captchaRef}
                      sitekey={captchaSiteKey}
                      onChange={(value) => setCaptchaToken(value || "")}
                      onExpired={() => setCaptchaToken("")}
                    />
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-amber-700">
                        {t("auth.captchaUnavailable")}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {t("auth.captchaSetupHint")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    id="terms"
                    className="mt-1 rounded border-2 border-border-light accent-secondary-accent"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-text-secondary"
                  >
                    {t("auth.iAgreeTo")}{" "}
                    <span className="font-semibold text-text-primary">
                      {t("footer.termsOfService")}
                    </span>{" "}
                    {t("auth.and")}{" "}
                    <span className="font-semibold text-text-primary">
                      {t("footer.privacyPolicy")}
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isCaptchaConfigured}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && <Loader size={16} className="animate-spin" />}
                  {loading
                    ? t("auth.creatingAccount")
                    : t("auth.createAccount")}
                </button>
            </motion.form>

            <motion.p className="mt-7 text-sm text-text-secondary" variants={sectionVariants}>
              {t("auth.alreadyAccount")}
              <Link
                href="/login"
                className="ml-1 font-semibold text-secondary-accent hover:text-text-primary"
              >
                {t("auth.loginLink")}
              </Link>
            </motion.p>
          </div>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}
