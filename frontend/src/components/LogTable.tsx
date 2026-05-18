"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LogEntry = {
  plate: string;
  status: "ALLOWED" | "DENIED";
  confidence: number;
  owner?: string;
  designation?: string;
  timestamp: string;
};

interface LogTableProps {
  logs: LogEntry[];
}

export default function LogTable({ logs }: LogTableProps) {
  
  const formatLogTime = (ts: string) => {
    try {
      const date = parseISO(ts);
      return format(date, "HH:mm:ss");
    } catch (e) {
      return ts;
    }
  };

  // Color code confidence values
  const getConfidenceBadgeColor = (conf: number) => {
    const val = conf * 100;
    if (val > 85) return "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20";
    if (val >= 60) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-[#ff3355]/10 text-[#ff3355] border-[#ff3355]/20";
  };

  return (
    <div className="w-full bg-[#12121a] border border-white/5 rounded-lg overflow-hidden flex flex-col h-[400px] shadow-2xl card-glow">
      {/* Table Header Details */}
      <div className="bg-[#161622]/60 px-6 py-4 border-b border-border flex justify-between items-center text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">
        <span className="flex items-center gap-2 text-foreground">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          REAL-TIME ACCESS AUDIT LOG (LAST 50 SCANS)
        </span>
        <span>AUDITED: {logs.length}</span>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto min-h-0 relative scrollbar-thin scrollbar-thumb-indigo-500/10">
        <Table className="font-mono text-xs select-text">
          <TableHeader className="bg-black/30 sticky top-0 z-10 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center text-[10px] font-bold text-muted-foreground/60">#</TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground/60">PLATE NUMBER</TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground/60">OWNER NAME</TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground/60">DESIGNATION</TableHead>
              <TableHead className="text-center text-[10px] font-bold text-muted-foreground/60">STATUS</TableHead>
              <TableHead className="text-center text-[10px] font-bold text-muted-foreground/60">CONFIDENCE</TableHead>
              <TableHead className="text-right text-[10px] font-bold text-muted-foreground/60">TIME</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {logs.map((log, index) => {
                const isAllowed = log.status === "ALLOWED";
                return (
                  <motion.tr
                    key={log.timestamp + log.plate + index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors relative group ${
                      isAllowed 
                        ? "border-l-2 border-l-[#00ff88]" 
                        : "border-l-2 border-l-[#ff3355]"
                    }`}
                  >
                    <TableCell className="text-center text-muted-foreground/40 font-bold py-3">
                      {logs.length - index}
                    </TableCell>
                    <TableCell className="font-black text-sm text-foreground tracking-wider py-3">
                      {log.plate}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground/80 py-3">
                      {isAllowed ? log.owner || "Authorized Personnel" : "Unknown Vehicle"}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className={isAllowed ? "text-indigo-400 font-semibold" : "text-zinc-500 font-semibold"}>
                        {isAllowed ? log.designation || "Staff" : "UNAUTHORIZED"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <div className="flex justify-center">
                        {isAllowed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#00ff88]/20 bg-[#00ff88]/5 text-[#00ff88] text-[9px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            GRANTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#ff3355]/20 bg-[#ff3355]/5 text-[#ff3355] text-[9px] font-bold uppercase tracking-wider">
                            <XCircle className="w-3 h-3" />
                            DENIED
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <div className="flex justify-center items-center">
                        <span className={`inline-flex px-2 py-0.5 rounded border text-[9px] font-bold ${getConfidenceBadgeColor(log.confidence)}`}>
                          {(log.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-semibold py-3">
                      {formatLogTime(log.timestamp)}
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>

            {logs.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-64 text-center text-muted-foreground/50 font-mono py-12">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 animate-ping" />
                    <span className="uppercase text-[9px] tracking-widest mt-2 block font-semibold">NO AUDIT LOG DATA DETECTED</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
