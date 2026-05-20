"use client";

import { useEffect, useState } from "react";
import { Car, Plus, Database, ShieldAlert } from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [plate, setPlate] = useState("");
  const [owner, setOwner] = useState("");
  const [designation, setDesignation] = useState("HOD of CSE");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchVehicles = () => {
    setIsLoading(true);
    setError(null);
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/dashboard/vehicles")
      .then(r => {
        if (!r.ok) {
          throw new Error(`API returned status ${r.status}`);
        }
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setVehicles(data);
        } else if (data && data.error) {
          throw new Error(data.error);
        } else {
          throw new Error("Invalid response format");
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message || "Failed to fetch vehicles");
        setVehicles([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/dashboard/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate_number: plate, owner_name: owner, designation })
      });
      const data = await response.json();
      if (!response.ok || (data && data.error)) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      setPlate(""); 
      setOwner(""); 
      fetchVehicles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to register new vehicle");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black flex items-center gap-3"><Database className="w-8 h-8 text-indigo-500" /> Preloaded Data</h1>
        <p className="text-muted-foreground mt-2">Manage authorized vehicles, faculty, and VIPs allowed to enter the premises.</p>
      </div>

      {/* Database sync error state */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-rose-500/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/20 text-rose-500 rounded-2xl">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-rose-400 text-lg">ANPR Registry Connection Offline</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Unable to sync with database: <span className="font-mono text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/10">{error}</span>
              </p>
            </div>
          </div>
          <button onClick={fetchVehicles} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-rose-500/20 text-sm whitespace-nowrap">
            Retry Connection
          </button>
        </div>
      )}

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
          <button type="submit" disabled={isAdding} className="bg-foreground text-background px-8 py-3 rounded-xl font-black hover:opacity-90 disabled:opacity-50 transition-opacity h-[52px] shadow-lg w-full md:w-auto flex items-center justify-center min-w-[100px]">
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : "Add"}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-card/40 border border-border/50 rounded-3xl space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-semibold animate-pulse">Syncing encrypted ANPR registry...</p>
        </div>
      ) : (
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
                    <span className={`px-3 py-1.5 rounded-full font-semibold text-xs border ${v.designation?.includes('Armed') ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-secondary border-border/50'}`}>
                      {v.designation?.includes('Armed') && <ShieldAlert className="w-3 h-3 inline mr-1" />}
                      {v.designation}
                    </span>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-muted-foreground font-medium text-lg">
                    No registered vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
