"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ShieldCheck, ShieldAlert, Car, Clock, User, AlertTriangle, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LogEntry = { plate: string; status: "ALLOWED" | "DENIED"; confidence: number; owner: string; designation: string; timestamp: string; };

export default function DashboardPage() {
  const [latestScan, setLatestScan] = useState<LogEntry | null>(null);
  const [stats, setStats] = useState({ total: 0, today: 0, registered: 0, special: 0 });

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/dashboard/stats")
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(console.error);

    const socket: Socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");
    socket.on("newScan", (data: LogEntry) => {
      setLatestScan(data);
      setStats(s => ({ ...s, total: s.total + 1, today: s.today + 1 }));
    });
    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Today's Scans", value: stats.today, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Scans", value: stats.total, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Registered Vehicles", value: stats.registered, icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Special / Armed", value: stats.special, icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/10" }
        ].map((s, i) => (
          <div key={i} className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">{s.label}</p>
                <p className="text-3xl font-black">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-3xl shadow-xl overflow-hidden relative min-h-[500px]">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2"><Car className="w-6 h-6 text-indigo-500" /> Live ANPR Monitor</h3>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Camera Feed Active
          </div>
        </div>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {latestScan ? (
              <motion.div key={latestScan.timestamp} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={`w-full max-w-2xl p-10 rounded-3xl border shadow-2xl ${latestScan.status === "ALLOWED" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-sm font-bold opacity-70 uppercase tracking-widest mb-3">System Status</p>
                    <div className={`flex items-center gap-3 text-4xl font-black ${latestScan.status === "ALLOWED" ? "text-emerald-500" : "text-rose-500"}`}>
                      {latestScan.status === "ALLOWED" ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                      {latestScan.status === "ALLOWED" ? "ACCESS GRANTED" : "ACCESS DENIED"}
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-2xl p-8 mb-8 shadow-inner border relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest text-center font-bold mb-3">Detected License Plate</p>
                  <p className="text-6xl font-mono text-center tracking-widest font-black text-foreground drop-shadow-md">
                    {latestScan.plate}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-lg bg-card p-6 rounded-2xl border shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Owner</p>
                    <p className="font-bold">{latestScan.owner}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Designation</p>
                    <p className="font-bold text-indigo-500">{latestScan.designation}</p>
                  </div>
                  <div className="col-span-2 border-t pt-4 mt-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                      AI Confidence Level
                      <span className="font-mono font-bold text-foreground">{(latestScan.confidence * 100).toFixed(1)}%</span>
                    </p>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-2">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${latestScan.confidence * 100}%` }} className="h-full bg-indigo-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground opacity-60">
                <Car className="w-24 h-24 mb-6 opacity-50" />
                <p className="text-2xl font-bold mb-2">System Ready</p>
                <p className="text-lg">Waiting for vehicle approach...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
