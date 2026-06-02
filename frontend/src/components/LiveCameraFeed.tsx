"use client";

import { useState, useEffect } from "react";
import { Camera, RefreshCw, AlertTriangle, Play, HelpCircle } from "lucide-react";

export default function LiveCameraFeed() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const streamUrl = `http://localhost:5050/video_feed?key=${retryKey}`;

  // Reset check and test image loading on mount
  useEffect(() => {
    const testImg = new Image();
    testImg.src = `http://localhost:5050/video_feed?test=true`;
    testImg.onload = () => setIsOnline(true);
    testImg.onerror = () => setIsOnline(false);
  }, [retryKey]);

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
    setIsOnline(true);
  };

  return (
    <div className="w-full bg-card rounded-3xl p-6 border border-border/80 shadow-2xl relative overflow-hidden group min-h-[400px] flex flex-col justify-between">
      {/* Laser Scanning Keyframe Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes laser-scan {
          0% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.3; }
        }
        .laser-line {
          animation: laser-scan 4s ease-in-out infinite;
        }
        .tech-grid {
          background-size: 20px 20px;
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
        }
      `}} />

      {/* Futuristic left-border tech indicator */}
      <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-indigo-500/35 group-hover:bg-indigo-500/60 transition-colors" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase leading-tight">
              LIVE GATE CAMERA
            </h3>
            <span className="text-[9px] font-mono text-muted-foreground/50 uppercase">
              SOURCE: GATE_01_FEED • LOCALHOST
            </span>
          </div>
        </div>

        {/* Live / Offline Status Badge */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
              LIVE FEED
            </div>
          ) : (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold text-rose-500 uppercase tracking-widest transition-all duration-300 active:scale-95"
            >
              <RefreshCw className="w-3 h-3 animate-spin-slow" />
              OFFLINE (RETRY)
            </button>
          )}
        </div>
      </div>

      {/* Camera Stream Display Container */}
      <div className="flex-1 bg-black/60 border border-border/40 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[280px]">
        {isOnline ? (
          <>
            {/* Tech grid overlay */}
            <div className="absolute inset-0 tech-grid z-10 pointer-events-none" />

            {/* Corner Target Reticles */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-indigo-500/60 pointer-events-none z-10" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-indigo-500/60 pointer-events-none z-10" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-indigo-500/60 pointer-events-none z-10" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-indigo-500/60 pointer-events-none z-10" />

            {/* Scanning Laser */}
            <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent pointer-events-none z-10 laser-line shadow-[0_0_8px_rgba(99,102,241,0.6)]" />

            {/* Actual Live Image Stream */}
            <img
              src={streamUrl}
              alt="Live Gate Stream"
              className="w-full h-full object-cover rounded-xl"
              onError={() => setIsOnline(false)}
            />

            {/* Micro Camera Target Indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-30">
              <div className="w-10 h-10 border border-dashed border-indigo-500 rounded-full animate-spin-slow" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </div>
          </>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 max-w-sm">
            <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-mono text-sm font-bold text-foreground uppercase tracking-wider">
                Camera Stream Offline
              </h4>
              <p className="text-[10px] font-mono text-muted-foreground/60 leading-normal uppercase">
                To view the live gate feed, please ensure the Python Vision Engine is started and running:
              </p>
            </div>
            
            {/* Quick command reminder */}
            <div className="w-full bg-secondary/80 border border-border/40 rounded-xl p-3 text-left">
              <code className="text-[9px] font-mono text-muted-foreground block select-all">
                cd vision<br />
                venv\Scripts\activate<br />
                python main.py
              </code>
            </div>

            <button
              onClick={handleRetry}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold tracking-widest px-5 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              RETRY CONNECTION
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-muted-foreground/45 uppercase tracking-wider relative z-10">
        <span>FPS: ~25 • CODEC: MJPEG</span>
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-indigo-500/60" />
          Press 'Q' inside OpenCV window to quit vision
        </span>
      </div>
    </div>
  );
}
