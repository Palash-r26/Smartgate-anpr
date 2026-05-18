"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight, Activity, Terminal } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate secure session establishment
    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      
      // Allow standard checks and fallback creds
      if (trimmedUser === "admin" && password === "password") {
        localStorage.setItem("smartgate_role", "Admin");
        router.push("/dashboard");
      } else if (trimmedUser && password) {
        const role = trimmedUser.includes("admin") ? "Admin" : "Security";
        localStorage.setItem("smartgate_role", role);
        router.push("/dashboard");
      } else {
        setError("AUTHENTICATION FAILED: INVALID CREDENTIALS");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Ambient background tactical glowing zones */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-card border border-border/80 rounded-xl shadow-2xl relative z-10 overflow-hidden card-glow"
      >
        {/* Glow accent top bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500" />
        
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/5">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-mono font-bold tracking-wider text-center text-foreground flex items-center gap-2">
              SMARTGATE <span className="text-indigo-400">ANPR</span>
            </h1>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mt-1">
              Intelligent Perimeter Control
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-xs font-mono font-semibold text-destructive flex items-center gap-2"
              >
                <Activity className="w-4 h-4 animate-pulse" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest block">
                Operator ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                  <Terminal className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-md pl-9 pr-4 py-2.5 outline-none font-mono text-sm transition-all placeholder:text-muted-foreground/30"
                  placeholder="Enter Operator ID..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest block">
                Access Code
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground/60">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-md pl-9 pr-4 py-2.5 outline-none font-mono text-sm transition-all placeholder:text-muted-foreground/30"
                  placeholder="Enter Code..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-md font-mono font-semibold text-sm tracking-wider uppercase flex justify-center items-center gap-2 border border-indigo-500/30 hover:border-indigo-400/50 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Establish Session
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Technical military footer */}
        <div className="bg-black/30 border-t border-border px-8 py-4 flex justify-between items-center text-[10px] font-mono text-muted-foreground/40 uppercase">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Gateway: Core_ANPR_v1.0
          </span>
          <span>Secured Link</span>
        </div>
      </motion.div>

      {/* Interactive Helper Credentials */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => {
          setUsername("admin");
          setPassword("password");
        }}
      >
        Default Operator ID: <span className="text-indigo-400 font-bold underline">admin</span> / Access Code: <span className="text-indigo-400 font-bold underline">password</span>
      </motion.p>
    </div>
  );
}
