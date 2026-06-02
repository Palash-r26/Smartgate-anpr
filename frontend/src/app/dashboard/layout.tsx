"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, Car, FileText, LogOut, Sun, Moon, Shield, 
  ChevronLeft, ChevronRight 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/components/SocketProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isLoading, logout } = useAuth();
  const { isConnected } = useSocket();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) router.push("/");
  }, [isLoading, user, router]);

  if (!mounted || isLoading || !user) return null;

  const role = user.role;
  const links = [
    { name: "Live Monitor", href: "/dashboard", icon: LayoutDashboard },
    { name: "Audit Logs", href: "/dashboard/logs", icon: FileText },
    ...(role === "ADMIN" ? [{ name: "Preloaded Vehicles", href: "/dashboard/vehicles", icon: Car }] : []),
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      
      {/* Sidebar with smooth width transition */}
      <aside 
        className={`bg-card border-r flex flex-col transition-all duration-300 ease-in-out relative flex-shrink-0 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header / Brand Area */}
        <div className={`p-6 border-b flex items-center justify-between text-indigo-500 relative ${
          isCollapsed ? "p-4 justify-center" : ""
        }`}>
          <div className="flex items-center gap-3 text-xl font-black">
            <Shield className="w-8 h-8 flex-shrink-0" />
            {!isCollapsed && (
              <span className="transition-opacity duration-300 font-mono tracking-wider">SmartGate</span>
            )}
          </div>
        </div>

        {/* Floating Sidebar Toggle Chevron Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-90 z-20"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Navigation Links */}
        <div className="p-4 flex-1 space-y-2 overflow-y-auto">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link 
                key={l.href} 
                href={l.href} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                } ${isCollapsed ? "justify-center px-0 w-12 mx-auto" : ""}`}
                title={isCollapsed ? l.name : undefined}
              >
                <l.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="transition-opacity duration-300">{l.name}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t space-y-2">
          {/* Light Theme Toggle Button */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all font-bold ${
              isCollapsed ? "justify-center px-0 w-12 mx-auto" : ""
            }`}
            title={isCollapsed ? (theme === "dark" ? "Light Theme" : "Dark Theme") : undefined}
          >
            {theme === "dark" ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!isCollapsed && (
              <span className="transition-opacity duration-300">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>

          {/* Sign Out Button */}
          <button 
            onClick={() => { 
              logout();
              router.push("/"); 
            }} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-rose-500/10 text-rose-500 transition-all font-bold ${
              isCollapsed ? "justify-center px-0 w-12 mx-auto" : ""
            }`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="transition-opacity duration-300">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto bg-background/50 transition-colors duration-300">
        <header className="h-20 border-b bg-card/85 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
          <h2 className="text-xl font-bold font-mono tracking-tight">
            {links.find(l => l.href === pathname)?.name || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 font-mono uppercase tracking-wider border ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? "bg-emerald-500" : "bg-rose-500"}`} />
              {isConnected ? "Live" : "Offline"}
            </div>
            <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-500 font-mono uppercase tracking-wider">
              {role}
            </div>
          </div>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
