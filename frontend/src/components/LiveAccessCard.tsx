"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Eye, User, Shield, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

type LogEntry = {
  plate: string;
  status: "ALLOWED" | "DENIED";
  confidence: number;
  owner?: string;
  designation?: string;
  timestamp: string;
};

interface LiveAccessCardProps {
  latestScan: LogEntry | null;
}

export default function LiveAccessCard({ latestScan }: LiveAccessCardProps) {
  // Determine border and shadow style classes based on access state
  let cardClass = "bg-card border-border/80 card-glow";
  if (latestScan) {
    if (latestScan.status === "ALLOWED") {
      cardClass = "bg-card card-glow-allowed animate-pulse-green";
    } else {
      cardClass = "bg-card card-glow-denied animate-pulse-red";
    }
  }

  // Safely parse and format timestamps
  const formatTime = (tsStr: string) => {
    try {
      const date = parseISO(tsStr);
      return format(date, "yyyy-MM-dd HH:mm:ss");
    } catch (e) {
      return tsStr;
    }
  };

  // Dynamically assign bar colors based on AI detection confidence thresholds
  const getConfidenceColor = (conf: number) => {
    const val = conf * 100;
    if (val > 85) return "bg-emerald-500";
    if (val >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getConfidenceTextClass = (conf: number) => {
    const val = conf * 100;
    if (val > 85) return "text-emerald-500";
    if (val >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div className="w-full flex justify-center py-2">
      <AnimatePresence mode="wait">
        {!latestScan ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`w-full bg-card rounded-3xl p-10 flex flex-col items-center justify-center border shadow-xl relative min-h-[340px] ${cardClass}`}
          >
            {/* Ambient military overlay grid line effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
            
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-secondary border border-border/50 mb-6 text-muted-foreground/60">
              <Eye className="w-10 h-10 animate-pulse text-indigo-500" />
            </div>

            <h3 className="font-mono text-base font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Monitoring Gates
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground/45 uppercase tracking-widest mt-2">
              Awaiting License Plate Approach...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={latestScan.timestamp}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className={`w-full bg-card rounded-3xl border overflow-hidden shadow-2xl relative min-h-[340px] flex flex-col ${cardClass}`}
          >
            {/* Access Header Indicator Banners */}
            {latestScan.status === "ALLOWED" ? (
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-center gap-2 text-base font-mono font-bold text-emerald-500 tracking-widest uppercase shadow-[0_4px_12px_rgba(16,185,129,0.05)]">
                <ShieldCheck className="w-5 h-5 animate-bounce" />
                ACCESS GRANTED
              </div>
            ) : (
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-4 flex items-center justify-center gap-2 text-base font-mono font-bold text-rose-500 tracking-widest uppercase shadow-[0_4px_12px_rgba(244,63,94,0.05)]">
                <ShieldAlert className="w-5 h-5 animate-bounce" />
                ACCESS DENIED
              </div>
            )}

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              {/* License Plate Graphic Display */}
              <div className="flex flex-col items-center justify-center mb-6">
                <p className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">
                  DETECTED PERIMETER LICENSE PLATE
                </p>
                <div className="bg-secondary border border-border/85 rounded-2xl px-8 py-3.5 font-mono font-black text-3xl md:text-5xl tracking-widest text-center shadow-inner relative overflow-hidden select-all w-full max-w-md">
                  {/* Bolt Details for Military/Industrial look */}
                  <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-700 rounded-full border border-zinc-300 dark:border-zinc-800" />
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-700 rounded-full border border-zinc-300 dark:border-zinc-800" />
                  <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-700 rounded-full border border-zinc-300 dark:border-zinc-800" />
                  <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-700 rounded-full border border-zinc-300 dark:border-zinc-800" />
                  
                  <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {latestScan.plate}
                  </span>
                </div>
              </div>

              {/* Grid detail metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mt-1 bg-secondary/35 p-5 rounded-2xl border border-border/40">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground/50 uppercase text-[9px] block tracking-wider">Owner Name</span>
                    <span className="font-bold text-foreground text-sm uppercase">
                      {latestScan.status === "ALLOWED" ? latestScan.owner || "Authorized Personnel" : "Unknown Vehicle"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground/50 uppercase text-[9px] block tracking-wider">Designation</span>
                    <span className={`font-bold text-sm uppercase ${latestScan.status === "ALLOWED" ? "text-indigo-500" : "text-zinc-500"}`}>
                      {latestScan.status === "ALLOWED" ? latestScan.designation || "Visitor/Contractor" : "UNAUTHORIZED"}
                    </span>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-border/30 pt-4 mt-1 flex flex-col">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold text-muted-foreground/75">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-indigo-500" />
                      OCR CONFIDENCE SCORE
                    </span>
                    <span className={`font-mono font-black text-xs ${getConfidenceTextClass(latestScan.confidence)}`}>
                      {(latestScan.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Dynamic Progress indicator */}
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-2 border border-border/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${latestScan.confidence * 100}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`h-full rounded-full ${getConfidenceColor(latestScan.confidence)}`}
                    />
                  </div>
                </div>
              </div>

              {/* Scan Time detail */}
              <div className="mt-5 flex justify-center items-center text-[9px] font-mono text-muted-foreground/45 uppercase tracking-widest">
                <span>SYSTEM SCAN TIMELINE: {formatTime(latestScan.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
