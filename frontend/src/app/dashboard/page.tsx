"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import LiveAccessCard from "@/components/LiveAccessCard";
import StatsRow from "@/components/StatsRow";
import LogTable from "@/components/LogTable";
import { useSocket } from "@/components/SocketProvider";
import { format } from "date-fns";

type LogEntry = {
  plate: string;
  status: "ALLOWED" | "DENIED";
  confidence: number;
  owner?: string;
  designation?: string;
  timestamp: string;
};

// Programmatic Web Audio Synthesizer to play short security beep warning on access denied
const playWarningBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, ctx.currentTime); // Low A4
    osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15); // Drop octave
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn("Browser prevented warning sound from playing due to user interaction policies:", e);
  }
};

export default function DashboardPage() {
  const { socket } = useSocket();
  const [latestScan, setLatestScan] = useState<LogEntry | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    allowed: 0,
    denied: 0,
    lastActivity: null as string | null,
  });

  // Helper function to calculate stats for today based on loaded scans
  const calculateTodayStats = useCallback((allLogs: LogEntry[]) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    
    const todayLogs = allLogs.filter(log => {
      try {
        return log.timestamp.startsWith(todayStr);
      } catch {
        return false;
      }
    });

    const total = todayLogs.length;
    const allowed = todayLogs.filter(l => l.status === "ALLOWED").length;
    const denied = todayLogs.filter(l => l.status === "DENIED").length;
    const lastActivity = allLogs.length > 0 ? allLogs[0].timestamp : null;

    return { total, allowed, denied, lastActivity };
  }, []);

  // Fetch initial access history logs from database
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    
    fetch(`${backendUrl}/api/dashboard/logs`)
      .then(res => {
        if (!res.ok) throw new Error("API logs fetch returned status " + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Map MySQL response to strict local camelCase keys
          const mappedLogs: LogEntry[] = data.map((l: any) => ({
            plate: l.plate_number || l.plate || "Unknown",
            status: l.status,
            confidence: Number(l.confidence),
            owner: l.owner_name || l.owner,
            designation: l.designation,
            timestamp: l.timestamp,
          }));

          setLogs(mappedLogs.slice(0, 50)); // Cap initial logs to 50
          
          if (mappedLogs.length > 0) {
            setLatestScan(mappedLogs[0]);
          }

          const calculated = calculateTodayStats(mappedLogs);
          setStats(calculated);
        }
      })
      .catch(err => {
        console.error("Unable to load initial dashboard history logs:", err);
      });
  }, [calculateTodayStats]);

  // Handle Real-time Socket.io events
  useEffect(() => {
    if (!socket) return;

    const handleGateEvent = (data: any) => {
      console.log("Real-time gate event packet received:", data);
      
      const newScan: LogEntry = {
        plate: data.plate || data.plate_number || "MH12AB1234",
        status: data.status || "ALLOWED",
        confidence: Number(data.confidence ?? 0.90),
        owner: data.owner || data.owner_name,
        designation: data.designation,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      // 1. Update the top main center live access card
      setLatestScan(newScan);
      
      // 2. Add scan to the top of the logs state table and cap logs to 50
      setLogs(prev => {
        const updated = [newScan, ...prev];
        return updated.slice(0, 50);
      });

      // 3. Update the four statistics row counts
      setStats(prev => {
        const isAllowed = newScan.status === "ALLOWED";
        return {
          total: prev.total + 1,
          allowed: isAllowed ? prev.allowed + 1 : prev.allowed,
          denied: !isAllowed ? prev.denied + 1 : prev.denied,
          lastActivity: newScan.timestamp,
        };
      });

      // 4. Play alert alarm sound if entry is DENIED
      if (newScan.status === "DENIED") {
        playWarningBeep();
      }
    };

    socket.on("gate_event", handleGateEvent);

    return () => {
      socket.off("gate_event", handleGateEvent);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground flex flex-col select-none">
      {/* Top Navigation Control Navbar */}
      <Navbar />

      {/* Main Monitoring Sections */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 flex flex-col justify-start">
        
        {/* Section 1 — Live Access Card */}
        <div className="w-full flex justify-center">
          <LiveAccessCard latestScan={latestScan} />
        </div>

        {/* Section 2 — Statistics Row */}
        <div className="w-full">
          <StatsRow stats={stats} />
        </div>

        {/* Section 3 — Real-Time Access Log Table */}
        <div className="w-full flex-1 min-h-0">
          <LogTable logs={logs} />
        </div>

      </main>

      {/* Security Terminal Footer */}
      <footer className="py-4 border-t border-border bg-black/20 text-center font-mono text-[9px] text-muted-foreground/35 uppercase tracking-widest">
        <span>SMARTGATE AI PERIMETER NETWORKS • SECURE CHANNEL LINKED • ACCURACY &gt;98%</span>
      </footer>
    </div>
  );
}
