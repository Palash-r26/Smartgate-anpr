"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Database, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

const VEHICLE_TYPES = ["Car", "SUV", "Motorcycle", "Truck", "Bus", "Auto", "Unknown"];
const PLATE_TYPES = ["Standard", "Commercial", "Electric", "Embassy", "Rental"];
const COLORS = ["White", "Black", "Silver", "Red", "Blue", "Green", "Yellow", "Gray", "Unknown"];

const emptyForm = {
  plate: "",
  owner: "",
  designation: "Faculty",
  department: "",
  vehicle_type: "Car",
  vehicle_color: "White",
  plate_type: "Standard",
  phone: "",
  email: "",
  make: "",
  model: "",
  notes: "",
};

export default function VehiclesPage() {
  const { token, user } = useAuth();
  const [vehicles, setVehicles] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchVehicles = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    apiFetch("/api/dashboard/vehicles", {}, token)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchVehicles();
  }, [fetchVehicles, user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsAdding(true);
    setError(null);
    try {
      const res = await apiFetch(
        "/api/dashboard/vehicles",
        {
          method: "POST",
          body: JSON.stringify({
            plate_number: form.plate,
            owner_name: form.owner,
            designation: form.designation,
            department: form.department,
            vehicle_type: form.vehicle_type,
            vehicle_color: form.vehicle_color,
            plate_type: form.plate_type,
            phone: form.phone,
            email: form.email,
            make: form.make,
            model: form.model,
            notes: form.notes,
          }),
        },
        token
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm(emptyForm);
      fetchVehicles();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setIsAdding(false);
    }
  };

  if (user?.role !== "ADMIN") {
    return <p className="text-muted-foreground">Admin access required.</p>;
  }

  const field = (label: string, key: keyof typeof form, opts?: { select?: string[] }) => (
    <div key={key}>
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      {opts?.select ? (
        <select
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full mt-1 bg-background border-2 border-border/50 rounded-xl px-3 py-2.5 text-sm"
        >
          {opts.select.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: key === "plate" ? e.target.value.toUpperCase() : e.target.value })}
          className="w-full mt-1 bg-background border-2 border-border/50 rounded-xl px-3 py-2.5 text-sm"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Database className="w-8 h-8 text-indigo-500" /> Vehicle registry
        </h1>
        <p className="text-muted-foreground mt-2">
          Register plate, owner name, designation, vehicle type, and all details shown on live scan.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-500 text-sm flex justify-between">
          <span>{error}</span>
          <button type="button" onClick={fetchVehicles} className="font-bold underline">Retry</button>
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-card border rounded-3xl p-6 space-y-4">
        <h2 className="font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-500" /> Add vehicle</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {field("Plate number *", "plate")}
          {field("Owner name *", "owner")}
          {field("Designation *", "designation")}
          {field("Department", "department")}
          {field("Vehicle type", "vehicle_type", { select: VEHICLE_TYPES })}
          {field("Color", "vehicle_color", { select: COLORS })}
          {field("Plate type", "plate_type", { select: PLATE_TYPES })}
          {field("Make", "make")}
          {field("Model", "model")}
          {field("Phone", "phone")}
          {field("Email", "email")}
          {field("Notes", "notes")}
        </div>
        <button type="submit" disabled={isAdding} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50">
          {isAdding ? "Saving..." : "Register vehicle"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Loading...</p>
      ) : (
        <div className="bg-card border rounded-3xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 border-b">
              <tr>
                <th className="p-3">Plate</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Dept</th>
                <th className="p-3">Type</th>
                <th className="p-3">Color</th>
                <th className="p-3">Plate type</th>
                <th className="p-3">Make/Model</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={String(v.id)} className="border-b hover:bg-secondary/30">
                  <td className="p-3 font-mono font-black">{String(v.plate_number)}</td>
                  <td className="p-3">{String(v.owner_name)}</td>
                  <td className="p-3">{String(v.designation)}</td>
                  <td className="p-3">{String(v.department || "—")}</td>
                  <td className="p-3">{String(v.vehicle_type)}</td>
                  <td className="p-3">{String(v.vehicle_color)}</td>
                  <td className="p-3">{String(v.plate_type)}</td>
                  <td className="p-3">{String(v.make || "")} {String(v.model || "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
