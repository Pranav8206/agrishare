"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Edit3,
  Leaf,
  Loader2,
  PackagePlus,
  Power,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";

const EMPTY_FORM = {
  name: "",
  brand: "",
  category: "organic",
  unit: "",
  price: "",
  mrp: "",
  quantity: "",
  image: "",
  description: "",
};

const toForm = (fertilizer) => ({
  ...EMPTY_FORM,
  ...fertilizer,
  price: fertilizer.price ?? "",
  mrp: fertilizer.mrp ?? "",
  quantity: fertilizer.quantity ?? "",
});

export default function AdminFertilizersPage() {
  const { axiosInstance, user, authReady } = useAppContext();
  const [fertilizers, setFertilizers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadFertilizers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/fertilizers/admin");
      setFertilizers(data?.fertilizers || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load fertilizers.");
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/fertilizers/admin/orders");
      setOrders(data?.orders || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load fertilizer orders.");
    }
  }, [axiosInstance]);

  useEffect(() => {
    if (authReady && user?.role === "admin") {
      loadFertilizers();
      loadOrders();
    }
  }, [authReady, user?.role, loadFertilizers, loadOrders]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return fertilizers.filter(
      (item) =>
        !query ||
        [item.name, item.brand, item.category].some((value) =>
          String(value || "").toLowerCase().includes(query),
        ),
    );
  }, [fertilizers, search]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp || form.price),
        quantity: Number(form.quantity),
      };
      const endpoint = editingId
        ? `/fertilizers/admin/${editingId}`
        : "/fertilizers/admin";
      await axiosInstance[editingId ? "put" : "post"](endpoint, payload);
      toast.success(editingId ? "Fertilizer updated." : "Fertilizer added.");
      resetForm();
      await loadFertilizers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save fertilizer.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (fertilizer) => {
    try {
      await axiosInstance.put(`/fertilizers/admin/${fertilizer._id}`, {
        isActive: !fertilizer.isActive,
      });
      toast.success(fertilizer.isActive ? "Fertilizer deactivated." : "Fertilizer activated.");
      await loadFertilizers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to change status.");
    }
  };

  const remove = async (fertilizer) => {
    if (!window.confirm(`Delete ${fertilizer.name}? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/fertilizers/admin/${fertilizer._id}`);
      toast.success("Fertilizer deleted.");
      await loadFertilizers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete fertilizer.");
    }
  };

  const updateOrderStatus = async (order, status) => {
    try {
      await axiosInstance.patch(`/fertilizers/admin/orders/${order._id}/status`, {
        status,
      });
      toast.success(status === "confirmed" ? "Order accepted." : "Order rejected and stock restored.");
      await Promise.all([loadOrders(), loadFertilizers()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update order.");
    }
  };

  if (!authReady) {
    return <main className="grid min-h-screen place-items-center bg-slate-50"><Loader2 className="animate-spin text-emerald-600" /></main>;
  }
  if (user?.role !== "admin") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-2xl font-black text-slate-900">Admin access required</h1>
        <p className="mt-2 text-slate-600">Your account does not have permission to manage fertilizers.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Return home</Link>
      </main>
    );
  }

  const activeCount = fertilizers.filter((item) => item.isActive).length;
  const totalStock = fertilizers.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const pendingOrders = orders.filter((order) => order.status === "pending").length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl md:flex-row md:items-end md:p-10">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Leaf size={25} /></div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-200">Admin workspace</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">Fertilizer inventory</h1>
            <p className="mt-2 max-w-xl text-sm text-emerald-100">Manage your catalog, stock quantity, and product visibility from one place.</p>
          </div>
          <Link href="/fertilizers" className="rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-emerald-800 hover:bg-emerald-50">View storefront</Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total products", fertilizers.length, PackagePlus],
            ["Active products", activeCount, CheckCircle2],
            ["Units in stock", totalStock, Leaf],
          ].map(([label, value, Icon]) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Icon size={21} /></div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:p-7">
            <div>
              <h2 className="text-xl font-black text-slate-900">Fertilizer orders</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review COD requests and accept or reject pending orders.
              </p>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-700">
              {pendingOrders} pending approval
            </span>
          </div>
          {orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No fertilizer orders received yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div key={order._id} className="space-y-4 p-5 md:p-6">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="font-black text-slate-900">{order.orderNumber}</p>
                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        {order.fertilizer?.name || "Deleted fertilizer"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString()} · COD
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-slate-900">₹{order.totalAmount}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                        order.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-3">
                    <p><strong className="text-slate-800">Customer:</strong> {order.farmerName}<br />{order.farmerPhone}</p>
                    <p><strong className="text-slate-800">Quantity:</strong> {order.quantity} {order.fertilizer?.unit || "units"}<br />₹{order.unitPrice} per unit</p>
                    <p><strong className="text-slate-800">Delivery address:</strong><br />{order.deliveryAddress}</p>
                  </div>
                  {order.status === "pending" ? (
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => updateOrderStatus(order, "confirmed")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700">Accept order</button>
                      <button type="button" onClick={() => updateOrderStatus(order, "cancelled")} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-700 hover:bg-red-50">Reject order</button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h2 className="text-xl font-black text-slate-900">{editingId ? "Edit fertilizer" : "Add fertilizer"}</h2><p className="mt-1 text-sm text-slate-500">Keep pricing and stock information accurate for farmers.</p></div>
            {editingId ? <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800"><X size={16} /> Cancel</button> : null}
          </div>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["name", "Product name", true],
              ["brand", "Brand", true],
              ["unit", "Unit (e.g. 50 kg Bag)", true],
              ["price", "Selling price (₹)", true],
              ["mrp", "MRP (₹)", false],
              ["quantity", "Available quantity", true],
              ["image", "Image URL", false],
            ].map(([key, label, required]) => (
              <label key={key} className={key === "image" ? "lg:col-span-2" : ""}>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
                <input required={required} min={["price", "mrp", "quantity"].includes(key) ? "0" : undefined} type={["price", "mrp", "quantity"].includes(key) ? "number" : "text"} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
              </label>
            ))}
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="organic">Organic</option><option value="npk">NPK</option><option value="nano">Nano</option><option value="dap">DAP</option><option value="micro">Micronutrients</option></select></label>
            <label className="md:col-span-2 lg:col-span-3"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" /></label>
            <button disabled={saving} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : <PackagePlus size={16} />}{editingId ? "Save changes" : "Add fertilizer"}</button>
          </form>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:p-7">
            <div><h2 className="text-xl font-black text-slate-900">Catalog products</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} products shown</p></div>
            <div className="relative w-full md:w-72"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></div>
          </div>
          {loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-600" /></div> : filtered.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No fertilizers found.</div> : (
            <div className="divide-y divide-slate-100">
              {filtered.map((fertilizer) => (
                <div key={fertilizer._id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between md:p-6">
                  <div className="flex min-w-0 items-center gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-emerald-700">{fertilizer.image ? <img src={fertilizer.image} alt="" className="h-full w-full object-cover" /> : <Leaf size={22} />}</div><div className="min-w-0"><h3 className="truncate font-black text-slate-900">{fertilizer.name}</h3><p className="mt-1 text-xs text-slate-500">{fertilizer.brand} · {fertilizer.category} · {fertilizer.unit}</p></div></div>
                  <div className="flex flex-wrap items-center gap-3 text-sm"><span className="font-black text-slate-900">₹{fertilizer.price}</span><span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600">{fertilizer.quantity} units</span><span className={`rounded-full px-3 py-1 text-xs font-black ${fertilizer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{fertilizer.isActive ? "Active" : "Inactive"}</span><button title="Edit" onClick={() => { setEditingId(fertilizer._id); setForm(toForm(fertilizer)); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900"><Edit3 size={16} /></button><button title={fertilizer.isActive ? "Deactivate" : "Activate"} onClick={() => toggleActive(fertilizer)} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"><Power size={16} /></button><button title="Delete" onClick={() => remove(fertilizer)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
