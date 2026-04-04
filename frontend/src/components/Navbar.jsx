//navbar

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  MapPin,
  Info,
  LocateFixed,
  LayoutDashboard,
  Wrench,
  CalendarCheck2,
  Settings,
  LogOut,
  Trash2,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [menuActionLoading, setMenuActionLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [locationDetails, setLocationDetails] = useState(null);
  const [isLocationDetailsOpen, setIsLocationDetailsOpen] = useState(false);
  const [isLocationPermissionHelpOpen, setIsLocationPermissionHelpOpen] =
    useState(false);
  const [locationPermission, setLocationPermission] = useState("unknown");
  const [isLocating, setIsLocating] = useState(false);
  const locationRequestedRef = useRef(false);
  const dropdownRef = useRef(null);
  const locationDetailsRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, authReady, logout, deleteAccount } =
    useAppContext();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncTokenState = () => {
      const token = window.localStorage.getItem("authToken");
      setHasAuthToken(Boolean(token));
      setTokenChecked(true);
    };

    syncTokenState();
    window.addEventListener("storage", syncTokenState);
    return () => window.removeEventListener("storage", syncTokenState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsLocationDetailsOpen(false);
        setIsLocationPermissionHelpOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tr = (key, fallback) => (isHydrated ? t(key) : fallback);
  const ctaLabel = isAuthenticated
    ? tr("nav.addEquipment", "Add Equipment")
    : tr("nav.getStarted", "Get Started");
  const shouldShowCtaLabel = (tokenChecked && !hasAuthToken) || authReady;
  const activeLanguage = isHydrated
    ? (i18n.resolvedLanguage || i18n.language || "en").split("-")[0]
    : "en";
  const firstName = useMemo(() => {
    const fullName = String(user?.fullName || "").trim();
    if (!fullName) return "User";
    return fullName.split(/\s+/)[0];
  }, [user?.fullName]);

  const navLinks = useMemo(
    () => [
      { href: "/", label: tr("nav.home", "Home") },
      { href: "/browse", label: tr("nav.browse", "Browse") },
      { href: "/learn", label: tr("nav.book", "Book") },
    ],
    [isHydrated, t],
  );

  const accountLinks = useMemo(
    () => [
      {
        href: "/user/dashboard",
        icon: LayoutDashboard,
        label: tr("nav.dashboard", "Dashboard"),
      },
      {
        href: "/user/manage-equipments",
        icon: Wrench,
        label: tr("nav.manageEquipment", "Manage Equipment"),
      },
      {
        href: "/user/manage-bookings",
        icon: CalendarCheck2,
        label: tr("nav.manageBooking", "Manage Booking"),
      },
      {
        href: "/user/settings",
        icon: Settings,
        label: tr("nav.settings", "Settings"),
      },
    ],
    [isHydrated, t],
  );

  useEffect(() => {
    setIsOpen(false);
    setIsMenuOpen(false);
    setIsLocationDetailsOpen(false);
    setIsLocationPermissionHelpOpen(false);
  }, [pathname]);

  const requestCurrentLocation = useMemo(
    () => async () => {
      if (typeof window === "undefined" || !navigator?.geolocation) {
        setLocationPermission("unsupported");
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = Number(position?.coords?.latitude || 0);
          const longitude = Number(position?.coords?.longitude || 0);
          const roundedLatitude = Number(latitude.toFixed(6));
          const roundedLongitude = Number(longitude.toFixed(6));

          setLocationPermission("granted");
          setLocationDetails((prev) => ({
            city: prev?.city || "",
            region: prev?.region || "",
            country: prev?.country || "",
            latitude: roundedLatitude,
            longitude: roundedLongitude,
          }));

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${roundedLatitude}&lon=${roundedLongitude}&zoom=14&addressdetails=1`,
              {
                headers: {
                  Accept: "application/json",
                },
              },
            );

            if (!response.ok) {
              throw new Error("Reverse geocoding failed");
            }

            const payload = await response.json();
            const address = payload?.address || {};
            const city =
              address.city ||
              address.town ||
              address.village ||
              address.hamlet ||
              address.suburb ||
              "";
            const region = address.state_district || address.state || "";
            const country = address.country || "";

            const friendlyLabel = [city, region].filter(Boolean).join(", ");
            const fallbackLabel = [region, country].filter(Boolean).join(", ");

            setLocationLabel(
              friendlyLabel ||
                fallbackLabel ||
                `${roundedLatitude.toFixed(2)}, ${roundedLongitude.toFixed(2)}`,
            );
            setLocationDetails({
              city,
              region,
              country,
              latitude: roundedLatitude,
              longitude: roundedLongitude,
            });
          } catch {
            setLocationLabel(
              `${roundedLatitude.toFixed(2)}, ${roundedLongitude.toFixed(2)}`,
            );
            setLocationDetails((prev) => ({
              city: prev?.city || "",
              region: prev?.region || "",
              country: prev?.country || "",
              latitude: roundedLatitude,
              longitude: roundedLongitude,
            }));
          }

          setIsLocating(false);
        },
        (error) => {
          if (error?.code === error.PERMISSION_DENIED) {
            setLocationPermission("denied");
          }
          setIsLocating(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        },
      );
    },
    [],
  );

  useEffect(() => {
    if (!isHydrated || !authReady || !isAuthenticated) return;
    if (locationRequestedRef.current) return;

    const initLocation = async () => {
      if (!navigator?.geolocation) {
        setLocationPermission("unsupported");
        return;
      }

      locationRequestedRef.current = true;

      if (!navigator?.permissions?.query) {
        requestCurrentLocation();
        return;
      }

      try {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });

        setLocationPermission(permissionStatus.state);

        if (permissionStatus.state === "granted") {
          requestCurrentLocation();
        }

        permissionStatus.onchange = () => {
          setLocationPermission(permissionStatus.state);
          if (permissionStatus.state === "granted") {
            requestCurrentLocation();
          }
        };
      } catch {
        requestCurrentLocation();
      }
    };

    initLocation();
  }, [isHydrated, authReady, isAuthenticated, requestCurrentLocation]);

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const avatarContent = useMemo(() => {
    if (user?.profilePic) {
      return (
        <img
          src={user.profilePic}
          alt={user?.fullName || "Profile"}
          className="h-10 w-10 rounded-full object-cover"
        />
      );
    }

    const firstLetter = user?.fullName?.charAt(0)?.toUpperCase() || "U";
    return (
      <span className="text-sm font-bold text-text-secondary">
        {firstLetter}
      </span>
    );
  }, [user]);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      router.push("/add");
      return;
    }
    router.push("/signup");
  };

  const handleLogout = async () => {
    setMenuActionLoading(true);
    try {
      await logout();
      setIsMenuOpen(false);
      toast.success(t("nav.logout"));
      router.push("/login");
    } catch (error) {
      toast.error(t("nav.logoutError"));
    } finally {
      setMenuActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("nav.deleteConfirm"));
    if (!confirmed) return;

    setMenuActionLoading(true);
    try {
      await deleteAccount();
      setIsMenuOpen(false);
      toast.success(t("nav.deleteAccount"));
      router.push("/signup");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("nav.deleteError");
      toast.error(message);
    } finally {
      setMenuActionLoading(false);
    }
  };

  return (
    <nav
      className={`fixed left-0 right-0 z-50 px-4 transition-all duration-300 border-border-light  ${
        isScrolled
          ? "top-3"
          : "top-0 border-b bg-background pb-0.5 max-md:border"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 lg:px-6 py-3 transition-all duration-300 backdrop-blur-xl ${
          isScrolled
            ? "rounded-2xl border border-border-light/10 bg-surface/80 shadow-lg "
            : "rounded-none border border-transparent bg-background"
        }`}
      >
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            {/* <span className="hidden sm:block h-5 w-px bg-border-light" /> */}
            <span className="font-editorial text-3xl font-bold text-text-primary tracking-tight">
              Agri<span className="text-primary-accent">Share</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-1 py-2 text-sm font-semibold uppercase tracking-widest transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-primary-accent after:transition-transform after:duration-200 ${
                    isActive
                      ? "text-text-primary after:scale-x-100"
                      : "text-text-secondary after:scale-x-0 hover:text-text-primary hover:after:scale-x-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA + Profile */}
          <div
            className="relative hidden items-center gap-3 md:flex"
            ref={dropdownRef}
          >
            {authReady && isAuthenticated && (
              <div ref={locationDetailsRef} className="relative">
                <div className="hidden xl:flex items-center gap-2 rounded-lg border border-border-light bg-background px-2.5 py-2 text-xs text-text-secondary">
                  <MapPin size={14} className="text-primary-accent" />
                  <span>
                    {locationLabel
                      ? locationLabel
                      : locationPermission === "denied"
                        ? "Location blocked"
                        : locationPermission === "unsupported"
                          ? "Location unavailable"
                          : isLocating
                            ? "Locating..."
                            : "Location off"}
                  </span>
                  {locationDetails?.latitude && locationDetails?.longitude && (
                    <button
                      type="button"
                      onClick={() =>
                        setIsLocationDetailsOpen((previous) => !previous)
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-light text-text-secondary hover:border-secondary-accent hover:text-text-primary"
                      aria-label="Location info"
                      title="Location info"
                    >
                      <Info size={12} />
                    </button>
                  )}
                  {!locationDetails?.latitude && !locationDetails?.longitude && (
                    <button
                      type="button"
                      onClick={() =>
                        setIsLocationPermissionHelpOpen((previous) => !previous)
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-light text-text-secondary hover:border-secondary-accent hover:text-text-primary"
                      aria-label="Enable location"
                      title="Enable location"
                    >
                      <LocateFixed size={12} />
                    </button>
                  )}
                </div>

                {isLocationDetailsOpen && (
                  <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border border-border-light bg-background p-3 shadow-xl">
                    <div className="flex items-start justify-between gap-3 px-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                        Location Details
                      </p>
                      <button
                        type="button"
                        onClick={requestCurrentLocation}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-light text-text-secondary hover:border-secondary-accent hover:text-text-primary"
                        disabled={isLocating}
                        aria-label={
                          isLocating ? "Updating location" : "Refresh location"
                        }
                        title={
                          isLocating ? "Updating location" : "Refresh location"
                        }
                      >
                        <RotateCcw
                          size={18}
                          className={isLocating ? "animate-spin" : ""}
                        />
                      </button>
                    </div>
                    <div className="mt-2 space-y-2 rounded-xl bg-background-hover p-2 text-xs text-text-secondary">
                      <p>
                        <span className="font-semibold text-text-primary">
                          City:
                        </span>{" "}
                        {locationDetails?.city || "Not available"}
                      </p>
                      <p>
                        <span className="font-semibold text-text-primary">
                          Region:
                        </span>{" "}
                        {locationDetails?.region || "Not available"}
                      </p>
                      <p>
                        <span className="font-semibold text-text-primary">
                          Country:
                        </span>{" "}
                        {locationDetails?.country || "Not available"}
                      </p>
                      <p>
                        <span className="font-semibold text-text-primary">
                          Latitude:
                        </span>{" "}
                        {locationDetails?.latitude ?? "Not available"}
                      </p>
                      <p>
                        <span className="font-semibold text-text-primary">
                          Longitude:
                        </span>{" "}
                        {locationDetails?.longitude ?? "Not available"}
                      </p>
                    </div>
                  </div>
                )}

                {isLocationPermissionHelpOpen && (
                  <div className="absolute left-0 top-12 z-50 w-72 rounded-2xl border border-border-light bg-background p-3 shadow-xl">
                    <div className="px-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                        Enable Location
                      </p>
                      <p className="mt-2 text-xs text-text-secondary">
                        Click enable location, then allow permission in the
                        browser popup. After allowing, reload this page.
                      </p>
                      {locationPermission === "denied" && (
                        <p className="mt-2 text-xs text-error">
                          Location is blocked. Please allow it from your browser
                          site settings.
                        </p>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={requestCurrentLocation}
                        className="rounded-lg border border-border-light bg-surface px-3 py-2 text-xs font-semibold text-text-secondary hover:border-secondary-accent hover:text-text-primary"
                        disabled={isLocating}
                      >
                        {isLocating ? "Locating..." : "Enable location"}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-primary-accent px-3 py-2 text-xs font-semibold text-white hover:bg-primary-accent-dark"
                      >
                        Reload page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <label className="sr-only" htmlFor="navbar-language-desktop">
              {tr("nav.language", "Language")}
            </label>
            <select
              id="navbar-language-desktop"
              value={activeLanguage}
              onChange={handleLanguageChange}
              className="cursor-pointer rounded-xl border border-border-light bg-surface px-3 py-2.5 text-sm font-semibold text-text-secondary shadow-sm transition-all duration-200 hover:border-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/30"
              aria-label={tr("nav.language", "Language")}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
            {authReady && isAuthenticated && (
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="grid h-11 w-11 place-items-center rounded-full border border-border-light bg-background/95 shadow-sm transition hover:border-secondary-accent"
                aria-label={tr("nav.openUserMenu", "Open user menu")}
              >
                {avatarContent}
              </button>
            )}
            <button
              onClick={handleCtaClick}
              className="inline-flex min-w-36 xl:min-w-44 min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-accent px-4 xl:px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-primary-accent-dark active:scale-95"
            >
              {shouldShowCtaLabel ? (
                <>
                  <span>{ctaLabel}</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <span className="inline-block h-4 w-24 animate-pulse rounded bg-primary-accent-light/70" />
              )}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-14 w-56 rounded-2xl border border-border-light bg-surface p-2 shadow-xl backdrop-blur-sm">
                <div className="rounded-xl bg-background-hover px-3 py-2">
                  <span className="text-xs font-medium text-text-tertiary">
                    Hello,
                  <span className="text-sm pl-1 font-semibold text-text-primary">
                    {firstName}
                  </span>
                  </span>
                </div>
                <div className="my-1 border-t border-border-light" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/user/dashboard");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-background-hover"
                >
                  <LayoutDashboard size={16} />
                  <span>{tr("nav.dashboard", "Dashboard")}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/user/manage-equipments");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-background-hover"
                >
                  <Wrench size={16} />
                  <span>{tr("nav.manageEquipment", "Manage Equipment")}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/user/manage-bookings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-background-hover"
                >
                  <CalendarCheck2 size={16} />
                  <span>{tr("nav.manageBooking", "Manage Booking")}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/user/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-background-hover"
                >
                  <Settings size={16} />
                  <span>{tr("nav.settings", "Settings")}</span>
                </button>
                <div className="my-1 border-t border-border-light" />
                <button
                  onClick={handleLogout}
                  disabled={menuActionLoading}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-background-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut size={16} />
                  <span>{tr("nav.logout", "Logout")}</span>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={menuActionLoading}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-error hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  <span>{tr("nav.deleteAccount", "Delete Account")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {authReady && isAuthenticated && (
              <button
                onClick={() => {
                  setIsOpen(true);
                }}
                className="grid h-10 w-10 place-items-center rounded-full border border-border-light bg-background/95"
                aria-label={tr("nav.openUserMenu", "Open user menu")}
              >
                {avatarContent}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border-light bg-background text-text-secondary"
              aria-label={tr("nav.openMenu", "Open Menu")}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 rounded-2xl border border-border-light bg-surface p-4 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-xl px-3 py-2.5 text-sm font-semibold after:absolute after:bottom-1 after:left-3 after:h-0.5 after:w-8 after:rounded-full after:bg-primary-accent after:transition-transform after:duration-200 ${
                      isActive
                        ? "bg-background-hover text-text-primary after:scale-x-100"
                        : "text-text-secondary after:scale-x-0"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {authReady && isAuthenticated && (
              <div className="rounded-xl border border-border-light bg-background-hover p-3">
                <p className="text-xs text-text-tertiary">Hello,</p>
                <p className="text-sm font-semibold text-text-primary">{firstName}</p>
              </div>
            )}

            <div>
              <label
                className="mb-2 block text-sm font-medium text-text-secondary"
                htmlFor="navbar-language-mobile"
              >
                {tr("nav.language", "Language")}
              </label>
              <select
                id="navbar-language-mobile"
                value={activeLanguage}
                onChange={handleLanguageChange}
                className="w-full cursor-pointer rounded-xl border border-border-light bg-surface px-3 py-2.5 text-sm font-semibold text-text-secondary shadow-sm transition-all duration-200 hover:border-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/30"
                aria-label={tr("nav.language", "Language")}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            {authReady && isAuthenticated && (
              <div className="grid grid-cols-1 gap-2">
                {accountLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(item.href);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text-secondary hover:bg-background-hover"
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <hr className="border-border-light" />
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleCtaClick();
                }}
                className="w-full rounded-xl bg-primary-accent py-3 font-semibold text-white"
              >
                {shouldShowCtaLabel
                  ? ctaLabel
                  : tr("nav.pleaseWait", "Please wait...")}
              </button>
              {authReady && isAuthenticated && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full rounded-xl border border-border-light py-3 font-medium text-text-secondary"
                  disabled={menuActionLoading}
                >
                  {tr("nav.logout", "Logout")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
