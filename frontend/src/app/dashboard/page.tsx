"use client";

import { useEffect, useState, useCallback } from "react";
import LiveAccessCard from "@/components/LiveAccessCard";
import StatsRow from "@/components/StatsRow";
import LogTable from "@/components/LogTable";
import { useSocket } from "@/components/SocketProvider";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { mapApiScan, type ScanRecord } from "@/types/scan";
import { format } from "date-fns";

const playWarningBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    /* ignore */
  }
};

export default function DashboardPage() {
  const { socket, isConnected } = useSocket();
  const { token } = useAuth();
  const [latestScan, setLatestScan] = useState<ScanRecord | null>(null);
  const [logs, setLogs] = useState<ScanRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    allowed: 0,
    denied: 0,
    lastActivity: null as string | null,
  });

  const applyScan = useCallback((scan: ScanRecord) => {
    setLatestScan(scan);
    setLogs((prev) => [scan, ...prev].slice(0, 50));
    setStats((prev) => ({
      total: prev.total + 1,
      allowed: scan.status === "ALLOWED" ? prev.allowed + 1 : prev.allowed,
      denied: scan.status === "DENIED" ? prev.denied + 1 : prev.denied,
      lastActivity: scan.timestamp,
    }));
    if (scan.status === "DENIED") playWarningBeep();
  }, []);

  useEffect(() => {
    if (!token) return;

    apiFetch("/api/dashboard/logs", {}, token)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((row: Record<string, unknown>) => mapApiScan(row));
        setLogs(mapped.slice(0, 50));
        if (mapped[0]) setLatestScan(mapped[0]);
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const today = mapped.filter((l) => l.timestamp.startsWith(todayStr));
        setStats({
          total: today.length,
          allowed: today.filter((l) => l.status === "ALLOWED").length,
          denied: today.filter((l) => l.status === "DENIED").length,
          lastActivity: mapped[0]?.timestamp ?? null,
        });
      })
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    const onScan = (data: Record<string, unknown>) => applyScan(mapApiScan(data));
    socket.on("newScan", onScan);
    return () => {
      socket.off("newScan", onScan);
    };
  }, [socket, applyScan]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {!isConnected && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 text-sm text-amber-500 font-mono">
          Socket offline — live updates need backend running.
        </div>
      )}
      <LiveAccessCard latestScan={latestScan} />
      <StatsRow stats={stats} />
      <LogTable logs={logs} />
    </div>
  );
}
