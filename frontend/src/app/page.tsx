"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Eye, Database, Zap, ArrowRight, Code2 } from "lucide-react";

export default function LandingPage() {
  const heroRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-reveal", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <nav className="flex justify-between items-center p-6 lg:px-12 backdrop-blur-md sticky top-0 z-50 border-b border-border/40">
        <div className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-indigo-500" />
          SmartGate
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/developer" className="text-sm font-medium hover:text-indigo-500 transition-colors flex items-center gap-1">
             <Code2 className="w-4 h-4"/> Developer
          </Link>
          <Link href="/login">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
              Login to Portal <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </nav>

      <main ref={heroRef} className="container mx-auto px-6 py-24 lg:py-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-medium text-sm border border-indigo-500/20"
        >
          <Zap className="w-4 h-4" /> AI-Powered Access Control
        </motion.div>
        
        <h1 className="gsap-reveal text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">Security Gates</span>
        </h1>
        
        <p className="gsap-reveal text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
          Automated Number Plate Recognition (ANPR) system equipped with deep learning, real-time logging, and role-based access management for modern campuses.
        </p>

        <div className="gsap-reveal flex gap-4">
          <Link href="/login">
            <button className="bg-foreground text-background px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
              Access Dashboard
            </button>
          </Link>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            { icon: Eye, title: "Real-time AI Vision", desc: "Instant plate recognition using PaddleOCR and YOLO with 98% accuracy." },
            { icon: Database, title: "Preloaded Databases", desc: "Seamless entry for registered faculty, VIPs, and authorized vehicles." },
            { icon: ShieldCheck, title: "Role-based Security", desc: "Separate dashboards for Admins and Security Heads to monitor audit logs." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="gsap-reveal p-6 rounded-2xl bg-card border shadow-lg text-left"
            >
              <feature.icon className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
