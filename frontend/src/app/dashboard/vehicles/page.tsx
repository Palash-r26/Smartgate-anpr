"use client";

import { useEffect, useState } from "react";
import { Car, Plus, Database, ShieldAlert } from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [plate, setPlate] = useState("");
  const [owner, setOwner] = useState("");
  const [designation, setDesignation] = useState("HOD of CSE");

  const fetchVehicles = () => {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/dashboard/vehicles")
      .then(r => r.json())
      .then(setVehicles)
      .catch(console.error);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/dashboard/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate_number: plate, owner_name: owner, designation })
    });
    setPlate(""); setOwner(""); fetchVehicles();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black flex items-center gap-3"><Database className="w-8 h-8 text-indigo-500" /> Preloaded Data</h1>
        <p className="text-muted-foreground mt-2">Manage authorized vehicles, faculty, and VIPs allowed to enter the premises.</p>
      </div>

      <div className="bg-card border rounded-3xl shadow-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="w-6 h-6 text-indigo-500" /> Register New Vehicle</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-6 items-end relative z-10">
          <div className="flex-1 w-full">
            <label className="text-sm font-bold mb-2 block text-muted-foreground">Plate Number</label>
            <input required value={plate} onChange={e=>setPlate(e.target.value.toUpperCase())} className="w-full bg-background border-2 border-border/50 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 font-mono font-bold transition-colors" placeholder="e.g. MH12AB1234" />
          </div>
          <div className="flex-1 w-full">
            <label className="text-sm font-bold mb-2 block text-muted-foreground">Owner Name</label>
            <input required value={owner} onChange={e=>setOwner(e.target.value)} className="w-full bg-background border-2 border-border/50 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 font-semibold transition-colors" placeholder="e.g. Dr. John Doe" />
          </div>
          <div className="flex-1 w-full">
            <label className="text-sm font-bold mb-2 block text-muted-foreground">Designation / Role</label>
            <input required value={designation} onChange={e=>setDesignation(e.target.value)} className="w-full bg-background border-2 border-border/50 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 font-semibold transition-colors" placeholder="e.g. HOD of CSE, Armed Forces" />
          </div>
          <button type="submit" className="bg-foreground text-background px-8 py-3 rounded-xl font-black hover:opacity-90 transition-opacity h-[52px] shadow-lg w-full md:w-auto">
            Add
          </button>
        </form>
      </div>

      <div className="bg-card border rounded-3xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="p-5 font-bold text-muted-foreground w-16">ID</th>
              <th className="p-5 font-bold text-muted-foreground">Plate Number</th>
              <th className="p-5 font-bold text-muted-foreground">Owner</th>
              <th className="p-5 font-bold text-muted-foreground">Designation</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v: any) => (
              <tr key={v.id} className="border-b last:border-0 hover:bg-secondary/40 transition-colors">
                <td className="p-5 text-muted-foreground font-medium">#{v.id}</td>
                <td className="p-5 font-mono font-black text-base">{v.plate_number}</td>
                <td className="p-5 font-semibold">{v.owner_name}</td>
                <td className="p-5">
                  <span className={`px-3 py-1.5 rounded-full font-semibold text-xs border ${v.designation.includes('Armed') ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-secondary border-border/50'}`}>
                    {v.designation.includes('Armed') && <ShieldAlert className="w-3 h-3 inline mr-1" />}
                    {v.designation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
