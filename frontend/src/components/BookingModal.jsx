"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X, Calendar, MapPin, CreditCard } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const ADDONS = [
  { key: "trailers", label: "Trailers", icon: "🚛", price: 200 },
  { key: "operator", label: "Operator", icon: "👷", price: 150 },
  { key: "fuel", label: "Fuel Pack", icon: "⛽", price: 80 },
  { key: "insurance", label: "Insurance", icon: "🛡️", price: 120 },
];

const DELIVERY_FEE = 350;

const PAYMENT_OPTIONS = [
  {
    key: "online",
    label: "Pay Online",
    surchargeRate: 0,
    note: "Razorpay test mode with UPI/card/netbanking",
  },
  {
    key: "cod",
    label: "Cash on Delivery",
    surchargeRate: 0.05,
    note: "5% extra on rent amount",
  },
  {
    key: "pay_later",
    label: "Pay After Rent Ends",
    surchargeRate: 0.1,
    note: "10% extra on rent amount",
  },
];

const formatDateValue = (date) => date.toISOString().split("T")[0];

const getDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(0, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
};

export default function BookingModal({ equipment, isOpen, onClose, onBooked }) {
  const router = useRouter();
  const { authReady, isAuthenticated, axiosInstance } = useAppContext();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [needDelivery, setNeedDelivery] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [activeAddons, setActiveAddons] = useState([]);
  const [paymentMode, setPaymentMode] = useState("online");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    setStartDate(formatDateValue(today));
    setEndDate(formatDateValue(tomorrow));
    setNeedDelivery(false);
    setDeliveryLocation("");
    setActiveAddons([]);
    setPaymentMode("online");
    setIsSubmitting(false);
  }, [isOpen, equipment?._id]);

  const toggleAddon = (key) => {
    setActiveAddons((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const pricing = useMemo(() => {
    const days = getDays(startDate, endDate);
    const rentAmount = days * Number(equipment?.pricePerDay || 0);
    const surchargeRate =
      PAYMENT_OPTIONS.find((option) => option.key === paymentMode)
        ?.surchargeRate || 0;
    const rentSurchargeAmount = Math.ceil(rentAmount * surchargeRate);
    const addonsAmount = ADDONS.filter((addon) =>
      activeAddons.includes(addon.key),
    ).reduce((sum, addon) => sum + addon.price, 0);
    const deliveryFee = needDelivery ? DELIVERY_FEE : 0;
    const totalAmount =
      rentAmount + rentSurchargeAmount + addonsAmount + deliveryFee;

    return {
      days,
      rentAmount,
      rentSurchargeAmount,
      addonsAmount,
      deliveryFee,
      totalAmount,
    };
  }, [
    startDate,
    endDate,
    equipment?.pricePerDay,
    paymentMode,
    activeAddons,
    needDelivery,
  ]);

  const verifyPayment = async (bookingId, paymentResponse) => {
    await axiosInstance.post(`/bookings/${bookingId}/payment/verify`, {
      paymentId: paymentResponse.razorpay_payment_id,
      signature: paymentResponse.razorpay_signature,
    });
  };

  const openRazorpayCheckout = (booking, orderData) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay not loaded. Please refresh and try again."));
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "AgriShare",
        description: `Rental: ${equipment?.name || "Equipment"}`,
        handler: async (response) => {
          try {
            await verifyPayment(booking._id, response);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled"));
          },
        },
        theme: {
          color: "#16a34a",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });

  const handleSubmit = async () => {
    if (!authReady) {
      toast.error("Checking your session. Please try again in a moment.");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to continue booking.");
      router.push("/login");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select rental dates.");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date.");
      return;
    }

    if (needDelivery && !deliveryLocation.trim()) {
      toast.error("Please add delivery location.");
      return;
    }

    if (!equipment?._id) {
      toast.error("Equipment data missing.");
      return;
    }

    try {
      setIsSubmitting(true);

      const bookingPayload = {
        equipment: equipment._id,
        startDate,
        endDate,
        deliveryLocation: needDelivery ? deliveryLocation.trim() : null,
        addons: activeAddons,
        paymentMode,
        paymentMethod: paymentMode,
      };

      const bookingResponse = await axiosInstance.post(
        "/bookings",
        bookingPayload,
      );
      const booking = bookingResponse?.data?.booking;

      if (!booking?._id) {
        throw new Error("Failed to create booking");
      }

      if (paymentMode === "online") {
        const orderResponse = await axiosInstance.post(
          `/bookings/${booking._id}/payment/order`,
          {},
        );

        await openRazorpayCheckout(booking, orderResponse.data);
        toast.success("Payment successful. Booking created.");
      } else if (paymentMode === "cod") {
        toast.success("Booking created. Cash on delivery selected.");
      } else {
        toast.success("Booking created. Pay later selected.");
      }

      onBooked?.(booking);
      onClose?.();
      router.push("/user/my-bookings");
    } catch (error) {
      const rawMessage =
        error?.response?.data?.message || error?.message || "Booking failed";

      const message = /razorpay authentication failed|authentication failed/i.test(
        String(rawMessage),
      )
        ? "Payment gateway is not configured correctly for test mode. Please verify Razorpay test Key ID and Key Secret in backend .env and restart server."
        : rawMessage;

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Book Equipment
            </h3>
            <p className="text-xs text-gray-500">{equipment?.name}</p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-600">
                Start Date
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <Calendar size={16} className="text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full text-sm outline-none"
                  min={formatDateValue(new Date())}
                  disabled={isSubmitting}
                />
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-gray-600">
                End Date
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <Calendar size={16} className="text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full text-sm outline-none"
                  min={startDate || formatDateValue(new Date())}
                  disabled={isSubmitting}
                />
              </div>
            </label>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={needDelivery}
                onChange={(event) => setNeedDelivery(event.target.checked)}
                disabled={isSubmitting}
              />
              Add delivery to my location (+Rs. 350)
            </label>
            {needDelivery && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <MapPin size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter full delivery address"
                  value={deliveryLocation}
                  onChange={(event) => setDeliveryLocation(event.target.value)}
                  className="w-full text-sm outline-none"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Add-ons</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ADDONS.map((addon) => {
                const selected = activeAddons.includes(addon.key);
                return (
                  <button
                    key={addon.key}
                    type="button"
                    onClick={() => toggleAddon(addon.key)}
                    disabled={isSubmitting}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selected
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-green-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {addon.icon} {addon.label}
                      </span>
                      <span className="font-semibold">+Rs. {addon.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">
              Select Payment Mode
            </p>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((option) => {
                const selected = paymentMode === option.key;
                return (
                  <label
                    key={option.key}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 transition ${
                      selected
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={selected}
                      onChange={() => setPaymentMode(option.key)}
                      disabled={isSubmitting}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {option.label}
                        {option.key === "online" ? " (Test Mode)" : ""}
                      </p>
                      <p className="text-xs text-gray-500">{option.note}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <CreditCard size={16} />
              Final Price
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Days</span>
                <span>{pricing.days}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  Rent ({pricing.days} x Rs. {equipment?.pricePerDay || 0})
                </span>
                <span>Rs. {pricing.rentAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment mode surcharge</span>
                <span>Rs. {pricing.rentSurchargeAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Add-ons</span>
                <span>Rs. {pricing.addonsAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>Rs. {pricing.deliveryFee}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>Rs. {pricing.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white px-5 py-4">
          <button
            type="button"
            className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSubmitting || pricing.days <= 0 || !authReady}
          >
            {isSubmitting
              ? "Processing..."
              : !authReady
                ? "Checking session..."
              : `Confirm Booking - Rs. ${pricing.totalAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
}
