"use client";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import "@/i18n";
import { useEffect } from "react";
import i18n from "i18next";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

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

  useEffect(() => {
    const exactTitles = {
      "/": "AgriShare | Empowering Farmers",
      "/add": "List Equipment | AgriShare",
      "/browse": "Browse Equipment | AgriShare",
      "/fertilizers": "Fertilizers | AgriShare",
      "/learn": "Learn | AgriShare",
      "/login": "Login | AgriShare",
      "/signup": "Create Account | AgriShare",
      "/privacy-policy": "Privacy Policy | AgriShare",
      "/terms-conditions": "Terms & Conditions | AgriShare",
      "/user/dashboard": "Dashboard | AgriShare",
      "/user/manage-bookings": "Manage Bookings | AgriShare",
      "/user/manage-equipments": "Manage Equipment | AgriShare",
      "/user/my-bookings": "My Bookings | AgriShare",
      "/user/settings": "Settings | AgriShare",
    };

    const title =
      exactTitles[pathname] ||
      (pathname.startsWith("/equipment/")
        ? "Equipment Details | AgriShare"
        : pathname.startsWith("/book/")
          ? "Booking Details | AgriShare"
          : pathname.startsWith("/id/") || pathname.startsWith("/user/")
            ? "User Profile | AgriShare"
            : "AgriShare");

    document.title = title;
  }, [pathname]);

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
