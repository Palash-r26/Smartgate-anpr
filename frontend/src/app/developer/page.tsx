"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Code2, Globe, Briefcase } from "lucide-react";

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mb-8 flex items-center justify-center text-4xl text-white font-bold shadow-xl">
              <Code2 className="w-12 h-12" />
            </div>
            
            <h1 className="text-4xl font-black mb-2">Developed by Palash</h1>
            <p className="text-xl text-indigo-500 font-medium mb-6">Full Stack AI Developer</p>
            
            <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
              SmartGate ANPR is a high-performance automated number plate recognition system built to modernize campus security. 
              By leveraging Deep Learning (PaddleOCR), Node.js, and Next.js, it offers a real-time, resilient, and beautiful solution for access control.
            </p>
            
            <div className="flex gap-4">
              <button className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                <Globe className="w-6 h-6" />
              </button>
              <button className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                <Briefcase className="w-6 h-6" />
              </button>
              <button className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                <Mail className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
