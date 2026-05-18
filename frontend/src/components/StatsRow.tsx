"use client";

import { motion } from "framer-motion";
import { Car, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface StatsRowProps {
  stats: {
    total: number;
    allowed: number;
    denied: number;
    lastActivity: string | null;
  };
}

export default function StatsRow({ stats }: StatsRowProps) {
  // Safe formatting of the last activity time
  const formatActivityTime = (ts: string | null) => {
    if (!ts) return "N/A";
    try {
      const date = parseISO(ts);
      return format(date, "HH:mm:ss");
    } catch (e) {
      return ts;
    }
  };

  const statItems = [
    {
      label: "TOTAL VEHICLES TODAY",
      value: stats.total,
      icon: Car,
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5 shadow-indigo-500/5",
      glowColor: "hover:border-indigo-500/30",
    },
    {
      label: "AUTHORIZED ENTRIES",
      value: stats.allowed,
      icon: ShieldCheck,
      color: "text-[#00ff88] border-[#00ff88]/20 bg-[#00ff88]/5 shadow-[#00ff88]/5",
      glowColor: "hover:border-[#00ff88]/30",
    },
    {
      label: "DENIED ENTRIES",
      value: stats.denied,
      icon: ShieldAlert,
      color: "text-[#ff3355] border-[#ff3355]/20 bg-[#ff3355]/5 shadow-[#ff3355]/5",
      glowColor: "hover:border-[#ff3355]/30",
    },
    {
      label: "LAST SCAN SESSION",
      value: formatActivityTime(stats.lastActivity),
      icon: Clock,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-amber-500/5",
      glowColor: "hover:border-amber-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`bg-[#12121a] border border-white/5 rounded-lg p-4 flex items-center justify-between shadow-lg relative group transition-all duration-300 ${item.glowColor}`}
        >
          {/* Subtle tech border indicators on the left side of cards */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-[1px] bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors" />
          
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold tracking-widest text-muted-foreground/60 block leading-tight">
              {item.label}
            </span>
            <span className="text-xl md:text-2xl font-mono font-black text-foreground tracking-tight">
              {item.value}
            </span>
          </div>

          <div className={`p-2 rounded border ${item.color} flex items-center justify-center`}>
            <item.icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
