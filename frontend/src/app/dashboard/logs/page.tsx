"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Download, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

const CSV_HEADERS = [
  "timestamp", "plate_number", "owner_name", "designation", "department",
  "vehicle_type", "vehicle_color", "plate_type", "make", "model",
  "phone", "email", "status", "confidence", "verification", "match_type",
];

export default function LogsPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    apiFetch("/api/dashboard/logs", {}, token)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportCsv = () => {
    const rows = logs.map((log) =>
      CSV_HEADERS.map((h) => `"${String(log[h] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const blob = new Blob([[CSV_HEADERS.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `smartgate-full-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-500" /> Audit logs
          </h1>
          <p className="text-muted-foreground mt-2">Full scan history: plate, owner, designation, vehicle type, color, and more.</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!logs.length}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export full CSV
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border rounded-xl p-4 flex justify-between">
          <span className="text-rose-500">{error}</span>
          <button onClick={fetchLogs} className="font-bold text-rose-400">Retry</button>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-20 text-muted-foreground">Loading...</p>
      ) : (
        <div className="bg-card border rounded-3xl overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1100px]">
            <thead className="bg-secondary/50 border-b">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Plate</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Dept</th>
                <th className="p-3">Type</th>
                <th className="p-3">Color</th>
                <th className="p-3">Plate type</th>
                <th className="p-3">Make</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={String(log.log_id)} className="border-b hover:bg-secondary/30">
                  <td className="p-3">{new Date(String(log.timestamp)).toLocaleString()}</td>
                  <td className="p-3 font-mono font-black">{String(log.plate_number)}</td>
                  <td className="p-3">{String(log.owner_name)}</td>
                  <td className="p-3">{String(log.designation)}</td>
                  <td className="p-3">{String(log.department || "—")}</td>
                  <td className="p-3">{String(log.vehicle_type)}</td>
                  <td className="p-3">{String(log.vehicle_color)}</td>
                  <td className="p-3">{String(log.plate_type)}</td>
                  <td className="p-3">{String(log.make || "—")}</td>
                  <td className="p-3">
                    <span className={log.status === "ALLOWED" ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                      {String(log.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
