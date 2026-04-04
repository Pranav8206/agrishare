"use client";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BarChart2,
  LayoutGrid,
  Calendar,
  CreditCard,
  Settings,
  Menu,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { label: t("nav.home"), icon: Home, href: "/" },
    { label: t("nav.dashboard"), icon: BarChart2, href: "/user/dashboard" },
    {
      label: t("nav.manageEquipment"),
      icon: LayoutGrid,
      href: "/user/manage-equipments",
    },
    {
      label: t("manageBookings.title"),
      icon: Calendar,
      href: "/user/manage-bookings",
    },
    { label: t("user.payments"), icon: CreditCard, href: "/user/payments" },
    { label: t("nav.settings"), icon: Settings, href: "/user/settings" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full z-40 flex flex-col items-center bg-white border-r border-border-light shadow w-16">
      <button
        className="mt-4 mb-8 p-2 rounded hover:bg-gray-100"
        aria-label={t("nav.openMenu")}
        tabIndex={-1}
        style={{ pointerEvents: "none" }}
      >
        <Menu size={28} />
      </button>
      <nav className="flex flex-col gap-4 flex-1 w-full items-center">
        {navItems.map(({ label, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`flex items-center w-12 h-12 justify-center rounded-xl transition-all duration-150 ${active ? "bg-primary-accent/20 text-primary-accent" : "text-gray-500 hover:bg-gray-100"}`}
              title={label}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </nav>
      <div className="flex-1" />
    </aside>
  );
}
