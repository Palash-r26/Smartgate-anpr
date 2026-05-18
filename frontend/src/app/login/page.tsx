"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, KeyRound, UserRound, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"Admin" | "Security">("Admin");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("smartgate_role", role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-500 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Access Control Portal</h2>
        <p className="text-muted-foreground text-center mb-8 text-sm">Please select your role and sign in.</p>

        <div className="flex gap-4 mb-8">
          <button 
            type="button"
            onClick={() => setRole("Admin")}
            className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === "Admin" ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" : "hover:bg-secondary"}`}
          >
            <KeyRound className="w-5 h-5" />
            <span className="font-semibold text-sm">Admin</span>
          </button>
          <button 
            type="button"
            onClick={() => setRole("Security")}
            className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === "Security" ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" : "hover:bg-secondary"}`}
          >
            <UserRound className="w-5 h-5" />
            <span className="font-semibold text-sm">Security Head</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Passcode</label>
            <input 
              type="password" 
              required
              className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
              placeholder="Enter your passcode..."
              defaultValue="password123"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-foreground text-background py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Authenticate <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
