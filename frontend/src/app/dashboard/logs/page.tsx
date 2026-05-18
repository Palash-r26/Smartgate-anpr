"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/dashboard/logs")
      .then(r => r.json())
      .then(setLogs)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3"><FileText className="w-8 h-8 text-indigo-500" /> Audit Logs</h1>
          <p className="text-muted-foreground mt-2">Detailed history of all vehicles detected by the ANPR system.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-card border rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b">
              <tr>
                <th className="p-5 font-bold text-muted-foreground">Timestamp</th>
                <th className="p-5 font-bold text-muted-foreground">Plate Number</th>
                <th className="p-5 font-bold text-muted-foreground">Owner</th>
                <th className="p-5 font-bold text-muted-foreground">Designation</th>
                <th className="p-5 font-bold text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.log_id} className="border-b last:border-0 hover:bg-secondary/40 transition-colors">
                  <td className="p-5 text-muted-foreground font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-5 font-mono font-black text-base">{log.plate_number}</td>
                  <td className="p-5 font-semibold">{log.owner_name}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-secondary rounded-full font-semibold text-xs border border-border/50">
                      {log.designation}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${log.status === "ALLOWED" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground font-medium text-lg">No logs found in the database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
