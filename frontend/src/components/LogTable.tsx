"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScanRecord } from "@/types/scan";

interface LogTableProps {
  logs: ScanRecord[];
}

export default function LogTable({ logs }: LogTableProps) {
  const formatLogTime = (ts: string) => {
    try {
      return format(parseISO(ts), "HH:mm:ss");
    } catch {
      return ts;
    }
  };

  const getConfidenceBadgeColor = (conf: number) => {
    const val = conf * 100;
    if (val > 85) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (val >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  };

  return (
    <div className="w-full bg-card border rounded-3xl overflow-hidden flex flex-col h-[420px] shadow-2xl card-glow">
      <div className="bg-secondary/40 px-6 py-4 border-b font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
        Real-time access log — full vehicle details ({logs.length})
      </div>
      <div className="flex-1 overflow-auto min-h-0">
        <Table className="font-mono text-[10px] min-w-[900px]">
          <TableHeader className="bg-secondary/50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Plate type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Conf.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {logs.map((log, index) => {
                const allowed = log.status === "ALLOWED";
                return (
                  <motion.tr
                    key={`${log.timestamp}-${log.plate}-${index}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`border-b hover:bg-secondary/30 ${allowed ? "border-l-2 border-l-emerald-500" : "border-l-2 border-l-rose-500"}`}
                  >
                    <TableCell className="py-2">{formatLogTime(log.timestamp)}</TableCell>
                    <TableCell className="font-black">{log.plate}</TableCell>
                    <TableCell>{allowed ? log.owner || log.owner_name : "Unknown"}</TableCell>
                    <TableCell className="text-indigo-500">{log.designation}</TableCell>
                    <TableCell>{log.vehicle_type}</TableCell>
                    <TableCell>{log.vehicle_color}</TableCell>
                    <TableCell>{log.plate_type}</TableCell>
                    <TableCell>
                      {allowed ? (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> OK
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> NO
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-1.5 py-0.5 rounded border ${getConfidenceBadgeColor(log.confidence)}`}>
                        {(log.confidence * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No scans yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
