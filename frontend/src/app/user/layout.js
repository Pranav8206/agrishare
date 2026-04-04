"use client";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart2,
  LayoutGrid,
  Calendar,
  CreditCard,
  Settings,
  SidebarClose,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import ProtectedRoute from "@/Components/ProtectedRoute";

export default function UserLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const [mode, setMode] = useState("hover"); // "hover" or "collapsed"
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Determine if sidebar should show expanded content
  const isExpanded = mode === "hover" && isHovered;

  // Handle hover behavior for "hover" mode
  const handleMouseEnter = () => {
    if (mode === "hover") {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (mode === "hover") {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 200);
    }
  };

  // Toggle between hover and collapsed modes
  const toggleSidebarMode = () => {
    setMode((prevMode) => (prevMode === "hover" ? "collapsed" : "hover"));
    setIsHovered(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const isActiveRoute = (href) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const navItems = [
    { label: t("nav.dashboard"), icon: BarChart2, href: "/user/dashboard" },
    { label: t("nav.myBookings"), icon: CreditCard, href: "/user/my-bookings" },
    {
      label: t("nav.manageEquipment"),
      icon: LayoutGrid,
      href: "/user/manage-equipments",
    },
    {
      label: t("nav.manageBooking"),
      icon: Calendar,
      href: "/user/manage-bookings",
    },
    { label: t("nav.settings"), icon: Settings, href: "/user/settings" },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          className={`hidden md:fixed md:left-0 md:top-0 md:z-40 md:flex md:h-full md:flex-col md:overflow-hidden md:border-r md:border-border-light md:bg-white md:shadow-lg ${
            isExpanded ? "md:w-64" : "md:w-16"
          }`}
          style={{
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex h-full flex-col">
            <nav className="mt-30 flex flex-1 flex-col gap-2 px-2">
              {navItems.map(({ label, icon: Icon, href }) => {
                const active = isActiveRoute(href);
                return (
                  <button
                    key={label}
                    onClick={() => router.push(href)}
                    className={`group relative flex h-12 items-center rounded-xl transition-all duration-200 ${
                      isExpanded ? "px-4" : "justify-center px-0"
                    } ${
                      active
                        ? "bg-primary-accent/20 text-primary-accent"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    style={{
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Icon size={24} className="shrink-0" />
                    <span
                      className={`whitespace-nowrap transition-all duration-300 ${
                        isExpanded
                          ? "ml-3 max-w-xs opacity-100"
                          : "ml-0 max-w-0 opacity-0"
                      }`}
                      style={{
                        transition:
                          "opacity 0.2s ease-in-out, margin 0.2s ease-in-out, max-width 0.2s ease-in-out",
                      }}
                    >
                      {label}
                    </span>
                    {!isExpanded && (
                      <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {label}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-border-light px-2 pb-5 pt-4">
              <button
                onClick={toggleSidebarMode}
                className={`group relative flex h-12 items-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-gray-100 ${
                  isExpanded
                    ? "w-full justify-start px-4"
                    : "w-full justify-center px-0"
                }`}
                style={{
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <SidebarClose size={24} className="shrink-0" />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    isExpanded
                      ? "ml-3 max-w-xs opacity-100"
                      : "ml-0 max-w-0 opacity-0"
                  }`}
                  style={{
                    transition:
                      "opacity 0.2s ease-in-out, margin 0.2s ease-in-out, max-width 0.2s ease-in-out",
                  }}
                >
                  {mode === "hover" ? "Collapse Sidebar" : "Expand on Hover"}
                </span>
                {!isExpanded && (
                  <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {mode === "hover" ? "Collapse Sidebar" : "Expand on Hover"}
                  </div>
                )}
              </button>
            </div>
          </div>
        </aside>

        <main
          className={`min-h-screen flex-1 ml-0 transition-all duration-300 ${
            isExpanded ? "md:ml-64" : "md:ml-16"
          }`}
        >
          {/* Desktop overlay when expanded */}
          {isExpanded && (
            <div
              className="fixed inset-0 z-30 hidden bg-black/20 transition-opacity duration-300 md:block"
              onClick={() => {
                if (mode === "hover") {
                  setIsHovered(false);
                }
              }}
              style={{
                opacity: isExpanded ? 1 : 0,
                pointerEvents: isExpanded ? "auto" : "none",
              }}
            />
          )}

          <div className="p-4 pb-24 sm:p-6 sm:pb-24 md:pb-6">{children}</div>
        </main>

        {/* Mobile bottom navigation */}
        <nav className="fixed inset-x-0 bottom-0 z-45 border-t border-border-light bg-white/95 backdrop-blur md:hidden">
          <div className="grid grid-cols-5">
            {navItems.map(({ label, icon: Icon, href }) => {
              const active = isActiveRoute(href);
              return (
                <button
                  key={`mobile-${href}`}
                  onClick={() => router.push(href)}
                  className={`flex flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold transition-colors ${
                    active
                      ? "text-primary-accent"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={18} />
                  <span className="max-w-full truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
