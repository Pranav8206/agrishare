"use client";
import "./globals.css";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import "@/i18n";
import { useEffect } from "react";
import i18n from "i18next";

export default function RootLayout({ children }) {
  useEffect(() => {
    const supportedLanguages = new Set(["en", "hi", "mr"]);

    const storedLanguage =
      typeof window !== "undefined"
        ? window.localStorage.getItem("i18nextLng")
        : null;

    const normalizedStoredLanguage = String(storedLanguage || "")
      .split("-")[0]
      .trim();

    if (
      supportedLanguages.has(normalizedStoredLanguage) &&
      normalizedStoredLanguage !== (i18n.resolvedLanguage || i18n.language)
    ) {
      i18n.changeLanguage(normalizedStoredLanguage);
    }

    const applyLang = (lng) => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = lng || "en";
      }
    };

    applyLang(i18n.resolvedLanguage || i18n.language);
    i18n.on("languageChanged", applyLang);

    return () => {
      i18n.off("languageChanged", applyLang);
    };
  }, []);

  return (
    <html lang="en">
      <body
        className="min-h-screen bg-background text-text-primary flex flex-col"
        suppressHydrationWarning
      >
        <AppProvider>
          <Navbar />
          <main className="pt-15 bg-background md:pt-15">{children}</main>
          <Footer />
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
