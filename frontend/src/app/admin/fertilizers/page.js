"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function AdminFertilizersPage() {
  const { axiosInstance, user, authReady } = useAppContext();
  const [fertilizers, setFertilizers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const loadFertilizers = useCallback(async () => {
    const { data } = await axiosInstance.get("/fertilizers/admin");
    setFertilizers(data?.fertilizers || []);
  }, [axiosInstance]);

  useEffect(() => {
    if (authReady && user?.role === "admin") {
      Promise.resolve()
        .then(() => loadFertilizers())
        .catch((error) =>
          setMessage(
            error?.response?.data?.message || "Unable to load products.",
          ),
        );
    }
  }, [authReady, user?.role, loadFertilizers]);

  if (!authReady) return <main className="mx-auto max-w-5xl p-8">Loading...</main>;
  if (user?.role !== "admin") {
    return <main className="mx-auto max-w-5xl p-8 text-red-700">Admin access required.</main>;
  }

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const endpoint = editingId
        ? `/fertilizers/admin/${editingId}`
        : "/fertilizers/admin";
      const method = editingId ? "put" : "post";
      await axiosInstance[method](endpoint, {
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp || form.price),
        quantity: Number(form.quantity),
      });
      setForm(EMPTY_FORM);
      setEditingId("");
      await loadFertilizers();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to save fertilizer.");
    }
  };

  const toggleActive = async (fertilizer) => {
    await axiosInstance.put(`/fertilizers/admin/${fertilizer._id}`, {
      isActive: !fertilizer.isActive,
    });
    await loadFertilizers();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this fertilizer?")) return;
    await axiosInstance.delete(`/fertilizers/admin/${id}`);
    await loadFertilizers();
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 pt-24">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">
          Fertilizer management
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Add, update, deactivate, delete products, and manage available quantity.
        </p>
      </div>

      {message ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["name", "Name"],
          ["brand", "Brand"],
          ["unit", "Unit"],
          ["price", "Price"],
          ["mrp", "MRP"],
          ["quantity", "Quantity"],
          ["image", "Image URL"],
        ].map(([key, label]) => (
          <input
            key={key}
            required={["name", "brand", "unit", "price", "quantity"].includes(key)}
            type={["price", "mrp", "quantity"].includes(key) ? "number" : "text"}
            placeholder={label}
            value={form[key]}
            onChange={(event) => setForm({ ...form, [key]: event.target.value })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        ))}
        <select
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="organic">Organic</option>
          <option value="npk">NPK</option>
          <option value="nano">Nano</option>
          <option value="dap">DAP</option>
          <option value="micro">Micronutrients</option>
        </select>
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2 lg:col-span-3"
        />
        <div className="flex gap-2">
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
            {editingId ? "Update" : "Add fertilizer"}
          </button>
          {editingId ? (
            <button type="button" onClick={() => { setEditingId(""); setForm(EMPTY_FORM); }} className="rounded-xl border px-4 py-2 text-sm">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Quantity</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {fertilizers.map((fertilizer) => (
              <tr key={fertilizer._id}>
                <td className="p-3 font-bold">{fertilizer.name}</td>
                <td className="p-3">₹{fertilizer.price}</td>
                <td className="p-3">{fertilizer.quantity}</td>
                <td className="p-3">{fertilizer.isActive ? "Active" : "Inactive"}</td>
                <td className="flex gap-2 p-3">
                  <button onClick={() => { setEditingId(fertilizer._id); setForm({ ...EMPTY_FORM, ...fertilizer }); }} className="text-emerald-700">Edit</button>
                  <button onClick={() => toggleActive(fertilizer)} className="text-amber-700">{fertilizer.isActive ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => remove(fertilizer._id)} className="text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
