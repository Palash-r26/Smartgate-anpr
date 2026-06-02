"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, Eye, User, Shield, AlertTriangle,
  Car, Palette, Tag, Building2, Phone, Mail, Wrench,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ScanRecord } from "@/types/scan";

interface LiveAccessCardProps {
  latestScan: ScanRecord | null;
}

function DetailRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="text-muted-foreground/50 uppercase text-[9px] block tracking-wider">{label}</span>
        <span className={`font-bold text-sm uppercase truncate block ${highlight ? "text-indigo-500" : "text-foreground"}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

export default function LiveAccessCard({ latestScan }: LiveAccessCardProps) {
  let cardClass = "bg-card border-border/80 card-glow";
  if (latestScan) {
    cardClass =
      latestScan.status === "ALLOWED"
        ? "bg-card card-glow-allowed animate-pulse-green"
        : "bg-card card-glow-denied animate-pulse-red";
  }

  const formatTime = (tsStr: string) => {
    try {
      return format(parseISO(tsStr), "yyyy-MM-dd HH:mm:ss");
    } catch {
      return tsStr;
    }
  };

  const getConfidenceColor = (conf: number) => {
    const val = conf * 100;
    if (val > 85) return "bg-emerald-500";
    if (val >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const owner = latestScan?.owner || latestScan?.owner_name || "Unknown";
  const allowed = latestScan?.status === "ALLOWED";

  return (
    <div className="w-full flex justify-center py-2">
      <AnimatePresence mode="wait">
        {!latestScan ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full bg-card rounded-3xl p-10 flex flex-col items-center justify-center border shadow-xl min-h-[400px] ${cardClass}`}
          >
            <Eye className="w-10 h-10 animate-pulse text-indigo-500 mb-4" />
            <h3 className="font-mono text-base font-bold tracking-wider text-muted-foreground uppercase">
              Monitoring Gates
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground/45 uppercase mt-2">
              Awaiting vehicle — plate, type, owner...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={latestScan.timestamp}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full bg-card rounded-3xl border overflow-hidden shadow-2xl min-h-[400px] flex flex-col ${cardClass}`}
          >
            {allowed ? (
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-center gap-2 text-emerald-500 font-mono font-bold tracking-widest uppercase text-sm">
                <ShieldCheck className="w-5 h-5" /> Access granted
              </div>
            ) : (
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 flex items-center justify-center gap-2 text-rose-500 font-mono font-bold tracking-widest uppercase text-sm">
                <ShieldAlert className="w-5 h-5" /> Access denied
              </div>
            )}

            <div className="p-6 md:p-8 flex-1 space-y-6">
              <div className="text-center">
                <p className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">
                  Plate number
                </p>
                <div className="bg-secondary border rounded-2xl px-6 py-3 font-mono font-black text-3xl md:text-4xl tracking-widest">
                  {latestScan.plate}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-secondary/35 p-5 rounded-2xl border border-border/40">
                <DetailRow icon={User} label="Owner name" value={allowed ? owner : "Unknown"} />
                <DetailRow icon={Shield} label="Designation" value={latestScan.designation || "—"} highlight={allowed} />
                <DetailRow icon={Building2} label="Department" value={latestScan.department || "—"} />
                <DetailRow icon={Car} label="Vehicle type" value={latestScan.vehicle_type || "Unknown"} />
                <DetailRow icon={Palette} label="Vehicle color" value={latestScan.vehicle_color || "Unknown"} />
                <DetailRow icon={Tag} label="Plate type" value={latestScan.plate_type || "Unknown"} />
                <DetailRow icon={Wrench} label="Make / model" value={`${latestScan.make || "—"} / ${latestScan.model || "—"}`} />
                <DetailRow icon={Phone} label="Phone" value={latestScan.phone || "—"} />
                <DetailRow icon={Mail} label="Email" value={latestScan.email || "—"} />
              </div>

              <div className="border-t border-border/30 pt-4">
                <div className="flex justify-between text-[9px] uppercase font-bold text-muted-foreground/75 mb-2">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-indigo-500" />
                    OCR confidence
                  </span>
                  <span>{(latestScan.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${latestScan.confidence * 100}%` }}
                    className={`h-full rounded-full ${getConfidenceColor(latestScan.confidence)}`}
                  />
                </div>
                <p className="text-[9px] font-mono text-muted-foreground/45 mt-3 text-center uppercase">
                  {latestScan.verification} • match: {latestScan.match_type} • {formatTime(latestScan.timestamp)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
