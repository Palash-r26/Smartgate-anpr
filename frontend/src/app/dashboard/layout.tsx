"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, Car, FileText, LogOut, Sun, Moon, Shield } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const r = localStorage.getItem("smartgate_role");
    if (!r) router.push("/login");
    setRole(r || "");
  }, [router]);

  if (!mounted) return null;

  const links = [
    { name: "Live Monitor", href: "/dashboard", icon: LayoutDashboard },
    { name: "Audit Logs", href: "/dashboard/logs", icon: FileText },
    ...(role === "Admin" ? [{ name: "Preloaded Vehicles", href: "/dashboard/vehicles", icon: Car }] : []),
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b flex items-center gap-2 text-xl font-black text-indigo-500">
          <Shield className="w-8 h-8" /> SmartGate
        </div>
        <div className="p-4 flex-1 space-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === l.href ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}>
              <l.icon className="w-5 h-5" />
              {l.name}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t space-y-2">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors font-medium">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={() => { localStorage.removeItem("smartgate_role"); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto bg-background/50">
        <header className="h-20 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold">{links.find(l => l.href === pathname)?.name || "Dashboard"}</h2>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-bold text-indigo-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              {role} Portal
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
