"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await register(email, password, name);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 text-indigo-500">
          <Shield className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-black">Create Account</h1>
            <p className="text-sm text-muted-foreground">SmartGate ANPR security portal</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-sm text-rose-500 flex gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 bg-background border-2 border-border/50 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-background border-2 border-border/50 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-background border-2 border-border/50 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Min 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : <>Register <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <GoogleSignInButton />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/" className="text-indigo-500 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
