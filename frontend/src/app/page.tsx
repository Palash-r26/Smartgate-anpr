"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { 
  Shield, Lock, ArrowRight, Activity, Terminal, Sun, Moon, 
  Eye, EyeOff, Cpu, Video, CheckCircle, AlertTriangle, List, LockKeyhole
} from "lucide-react";

export default function LandingLoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"Security" | "Admin">("Security");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Simulated live ANPR scans
  const simulatedScans = [
    { plate: "MH12AB1234", owner: "Dr. Arun Kumar", role: "HOD of CSE", status: "ALLOWED", type: "Faculty" },
    { plate: "DL03CC9012", owner: "Visitor (Unregistered)", role: "N/A", status: "DENIED", type: "Guest" },
    { plate: "HR26AJ8855", owner: "Col. Ravindra Singh", role: "Armed Forces", status: "ALLOWED", type: "VIP" }
  ];
  const [activeScan, setActiveScan] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Autofill credentials when role changes
    if (role === "Security") {
      setUsername("sec_operator_01");
      setPassword("password");
    } else {
      setUsername("admin");
      setPassword("password");
    }
  }, [role]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScan((prev) => (prev + 1) % simulatedScans.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      
      if (role === "Admin") {
        if (trimmedUser === "admin" && password === "password") {
          localStorage.setItem("smartgate_role", "Admin");
          router.push("/dashboard");
        } else {
          setError("AUTHENTICATION FAILED: INVALID ADMIN ACCREDITATION");
          setIsLoading(false);
        }
      } else {
        if (trimmedUser && password === "password") {
          localStorage.setItem("smartgate_role", "Security");
          router.push("/dashboard");
        } else {
          setError("AUTHENTICATION FAILED: INVALID OPERATOR CREDENTIALS");
          setIsLoading(false);
        }
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative overflow-hidden transition-colors duration-300">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Floating Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Column: Product Showcase & simulated scanner */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-between relative z-10 border-b md:border-b-0 md:border-r border-border/40 backdrop-blur-[2px]">
        {/* Branding header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/10 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono font-black text-xl tracking-wider">SMARTGATE</span>
            <span className="ml-1.5 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-xs font-mono font-bold border border-indigo-500/10">ANPR</span>
          </div>
        </div>

        {/* Dynamic scan simulator panel */}
        <div className="my-12 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4">
            Next-Generation <br className="hidden md:block"/>
            Perimeter Authorization
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed">
            Real-time optical character recognition scanning, automated gate integration, and security auditing. Empowering control rooms with millisecond-latency logging.
          </p>

          {/* Scanner Card Simulation */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">CAMERA_NODE_01 // LIVE FEED</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] font-mono font-bold text-emerald-500 tracking-wider">ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Animated camera scan frame */}
              <div className="aspect-[4/3] bg-black/60 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-border/50">
                {/* Scanner targeting indicators */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-indigo-500" />

                {/* Laser scan lines */}
                <motion.div 
                  animate={{ y: [-40, 40, -40] }} 
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
                  className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-lg shadow-indigo-500/50"
                />

                <span className="text-2xl font-mono font-black tracking-widest text-white drop-shadow-md select-none bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                  {simulatedScans[activeScan].plate}
                </span>
                <span className="text-[10px] font-mono text-indigo-400 mt-3 tracking-widest uppercase">PLATE EXTRACTED</span>
              </div>

              {/* Scan result info box */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase block mb-1">Target Owner</label>
                  <p className="font-bold text-base">{simulatedScans[activeScan].owner}</p>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase block mb-1">Designation</label>
                  <p className="text-sm font-semibold text-muted-foreground">{simulatedScans[activeScan].role}</p>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase block mb-1">Gate Instruction</label>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mt-1 ${simulatedScans[activeScan].status === "ALLOWED" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}>
                    {simulatedScans[activeScan].status === "ALLOWED" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {simulatedScans[activeScan].status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex gap-6 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>PaddleOCR 2.8</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Socket.IO Sync</span>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Login Portal */}
      <div className="w-full md:w-[480px] p-8 md:p-12 flex flex-col justify-between relative z-10 bg-card/30 backdrop-blur-md">
        
        {/* Top bar: Theme Switcher */}
        <div className="flex justify-end mb-8">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-3 bg-card border border-border/80 rounded-2xl text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95 shadow-md"
            title="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Login panel */}
        <div className="my-auto space-y-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Security Command Center</h3>
            <p className="text-muted-foreground mt-2 text-sm">Please log in to manage gates and check activity logs.</p>
          </div>

          {/* Sliding segmented switch between Security and Admin */}
          <div className="p-1 bg-secondary border border-border/60 rounded-2xl flex relative overflow-hidden">
            <button
              type="button"
              onClick={() => setRole("Security")}
              className={`flex-1 py-3 text-sm font-black transition-colors rounded-xl relative z-10 ${role === "Security" ? "text-white" : "text-muted-foreground"}`}
            >
              Security Portal
            </button>
            <button
              type="button"
              onClick={() => setRole("Admin")}
              className={`flex-1 py-3 text-sm font-black transition-colors rounded-xl relative z-10 ${role === "Admin" ? "text-white" : "text-muted-foreground"}`}
            >
              Admin Control
            </button>

            {/* Sliding backdrop indicator */}
            <motion.div
              layoutId="roleIndicator"
              className="absolute top-1 bottom-1 left-1 right-1 bg-indigo-600 rounded-xl"
              style={{
                width: "calc(50% - 4px)",
                left: role === "Security" ? "4px" : "calc(50% + 2px)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs font-mono font-bold text-rose-500 flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                {role === "Security" ? "Security Guard Operator ID" : "Administrator ID"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground/60">
                  <Terminal className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border-2 border-border/50 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500 font-mono text-sm transition-colors"
                  placeholder="Enter ID..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                Access Code
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground/60">
                  <LockKeyhole className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border-2 border-border/50 rounded-2xl pl-12 pr-12 py-3.5 outline-none focus:border-indigo-500 font-mono text-sm transition-colors"
                  placeholder="Enter access code..."
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm tracking-wider uppercase flex justify-center items-center gap-2 border border-indigo-500/20 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group h-[52px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Connect Gateways
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security watermark footer */}
        <div className="mt-8 pt-6 border-t border-border/40 flex justify-between items-center text-[10px] font-mono text-muted-foreground/60 uppercase">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Core_Gateway: Active
          </span>
          <span>SSL Secured</span>
        </div>
      </div>
    </div>
  );
}
