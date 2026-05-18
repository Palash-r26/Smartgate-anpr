"use client";

import { useEffect, useState } from "react";
import { Shield, Clock } from "lucide-react";
import { useSocket } from "@/components/SocketProvider";
import { format } from "date-fns";

export default function Navbar() {
  const { isConnected } = useSocket();
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set time initially on client side to avoid hydration mismatch
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      {/* Left: Logo & Icon */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded flex items-center justify-center shadow-lg shadow-indigo-500/5">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="font-mono font-bold tracking-widest text-foreground text-sm md:text-base flex items-center gap-1.5">
            SMARTGATE <span className="text-indigo-400">ANPR</span>
          </span>
          <p className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground/60 leading-none mt-0.5">
            Perimeter Control Console
          </p>
        </div>
      </div>

      {/* Right: Live Clock & Status */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-black/40 border border-border/40 font-mono text-xs text-muted-foreground/80">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{time ? format(time, "yyyy-MM-dd HH:mm:ss") : "INITIALIZING..."}</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-mono text-[10px] md:text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SYSTEM ONLINE
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/30 font-mono text-[10px] md:text-xs font-semibold text-rose-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              SYSTEM OFFLINE
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
