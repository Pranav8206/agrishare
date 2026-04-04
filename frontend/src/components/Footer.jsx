"use client";

import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Tractor,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full max-md:mb-5 bg-background">
      {" "}
      <div className="max-w-7xl mx-auto border-t border-border-light p-10 md:py-8 md:pl-12 md:pr-10 ">
        {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tractor className="text-success" size={28} />
              <span className="text-2xl font-bold text-text-primary">
                Agri<span className="text-success">Share</span>
              </span>
            </div>
            <p className="text-text-tertiary leading-relaxed">
              {t("footer.tagline")}
            </p>

            <div className="flex gap-4">
              <div className="p-2 bg-surface rounded-lg hover:bg-background-hover cursor-pointer">
                <Facebook size={20} className="text-text-secondary" />
              </div>
              <div className="p-2 bg-surface rounded-lg hover:bg-background-hover cursor-pointer">
                <Instagram size={20} className="text-text-secondary" />
              </div>
              <div className="p-2 bg-surface rounded-lg hover:bg-background-hover cursor-pointer">
                <Twitter size={20} className="text-text-secondary" />
              </div>
            </div>
          </div>
          {/* Explore */}
          <div>
            <h4 className="font-bold text-text-primary mb-6">Explore</h4>
            <ul className="space-y-4 text-text-tertiary">
              <li>
                <Link href="/browse" className="hover:text-primary-accent-dark">
                  Browse Equipment
                </Link>
              </li>
              <li>
                <Link href="/add" className="hover:text-primary-accent-dark">
                  Add Equipment
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-primary-accent-dark">
                  Rent Equipment
                </Link>
              </li>
            </ul>
          </div>
          {/* Account + Dashboard */}
          <div>
            <h4 className="font-bold text-text-primary mb-6">Account</h4>
            <ul className="space-y-4 text-text-tertiary">
              <li>
                <Link
                  href="/user/dashboard"
                  className="hover:text-primary-accent-dark"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/user/manage-equipment"
                  className="hover:text-primary-accent-dark"
                >
                  Manage Equipment
                </Link>
              </li>
              <li>
                <Link
                  href="/user/manage-bookings"
                  className="hover:text-primary-accent-dark"
                >
                  Manage Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/user/my-bookings"
                  className="hover:text-primary-accent-dark"
                >
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/user/settings"
                  className="hover:text-primary-accent-dark"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          {/* Legal + Contact */}
          <div>
            <h4 className="font-bold text-text-primary mb-6">Support</h4>
            <ul className="space-y-4 text-text-tertiary mb-6">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-primary-accent-dark"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-conditions"
                  className="hover:text-primary-accent-dark"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>

            <div className="space-y-4 text-text-tertiary">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary-accent-dark" />
                <span>{t("footer.location")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-primary-accent-dark" />
                <span>+91 1223456789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-primary-accent-dark" />
                <span>support@agrishare.com</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border-light flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-tertiary text-sm">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
