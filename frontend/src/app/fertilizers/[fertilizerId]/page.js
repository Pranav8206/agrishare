"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function FertilizerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { axiosInstance, authReady, isAuthenticated } = useAppContext();
  const [fertilizer, setFertilizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    axiosInstance
      .get(`/fertilizers/${params?.fertilizerId}`)
      .then(({ data }) => mounted && setFertilizer(data?.fertilizer || null))
      .catch((error) =>
        mounted &&
        toast.error(error?.response?.data?.message || "Unable to load fertilizer."),
      )
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [axiosInstance, params?.fertilizerId]);

  const deliveryCharge = useMemo(
    () =>
      fertilizer && fertilizer.price * quantity >= 1000
        ? 0
        : fertilizer
          ? 70
          : 0,
    [fertilizer, quantity],
  );
  const total = fertilizer
    ? fertilizer.price * quantity + deliveryCharge
    : 0;

  const openOrderForm = () => {
    if (!authReady || !isAuthenticated) {
      toast.error("Please login to order fertilizer.");
      router.push("/login");
      return;
    }
    setShowOrderForm(true);
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post("/fertilizers/orders", {
        fertilizerId: fertilizer._id,
        quantity,
        farmerName,
        farmerPhone,
        deliveryAddress,
      });
      toast.success(`Order ${data.order.orderNumber} placed successfully.`);
      router.push("/fertilizers");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-32">Loading fertilizer...</main>;
  if (!fertilizer) return <main className="mx-auto max-w-6xl px-4 py-32">Fertilizer not found.</main>;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 pt-24">
      <Link href="/fertilizers" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
        <ArrowLeft size={16} /> Back to fertilizers
      </Link>
      <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
        <img src={fertilizer.image} alt={fertilizer.name} className="h-80 w-full rounded-2xl object-cover" />
        <div className="space-y-5">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{fertilizer.brand}</p>
          <h1 className="text-3xl font-black text-slate-900">{fertilizer.name}</h1>
          <p className="text-slate-600">{fertilizer.description}</p>
          <p className="text-3xl font-black text-emerald-700">₹{fertilizer.price}</p>
          <p className="text-sm text-slate-500">{fertilizer.unit} · {fertilizer.quantity} units available</p>
          <div className="grid gap-2 text-sm text-slate-600">
            <p><strong>Seller:</strong> {fertilizer.seller?.name || "Verified seller"}</p>
            <p><strong>Location:</strong> {fertilizer.seller?.location || "Available for delivery"}</p>
            <p><strong>Delivery:</strong> {fertilizer.deliveryDays || "As scheduled"}</p>
          </div>
          <button
            type="button"
            onClick={openOrderForm}
            disabled={fertilizer.quantity < 1}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShoppingBag size={17} /> {fertilizer.quantity < 1 ? "Out of stock" : "Order fertilizer"}
          </button>
        </div>
      </div>

      {showOrderForm ? (
        <form onSubmit={placeOrder} className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Place your order</h2>
            <p className="mt-1 text-sm text-slate-600">Cash on Delivery is the only available payment method.</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white p-4">
            <span className="font-bold text-slate-800">Quantity</span>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={16} /></button>
              <span className="font-black">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(fertilizer.quantity, value + 1))}><Plus size={16} /></button>
            </div>
          </div>
          <input required value={farmerName} onChange={(event) => setFarmerName(event.target.value)} placeholder="Farmer full name" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
          <input required type="tel" value={farmerPhone} onChange={(event) => setFarmerPhone(event.target.value)} placeholder="Mobile number" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
          <textarea required value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Village, address and PIN code" className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3" />
          <div className="rounded-xl bg-white p-4 text-sm">
            <div className="flex justify-between"><span>Product total</span><span>₹{(fertilizer.price * quantity).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{deliveryCharge ? `₹${deliveryCharge}` : "Free"}</span></div>
            <div className="mt-2 flex justify-between border-t pt-2 font-black"><span>Total payable on delivery</span><span>₹{total.toLocaleString()}</span></div>
          </div>
          <button disabled={submitting} className="w-full rounded-2xl bg-emerald-600 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-50">
            {submitting ? "Placing order..." : "Confirm Cash on Delivery order"}
          </button>
        </form>
      ) : null}
    </main>
  );
}
