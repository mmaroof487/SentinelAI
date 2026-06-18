"use client";
import React, { useEffect, useState, useRef } from "react";
import { Terminal, Shield, Cpu, Database, Wifi } from "lucide-react";

interface SystemBootOverlayProps {
  onComplete?: () => void;
}

const BOOT_LOGS = [
  { text: "INITIALIZING SENTINEL_AI SYSTEM ENVELOPE...", icon: Cpu, delay: 100 },
  { text: "ESTABLISHING CORE SYSTEM KERNEL...", icon: Cpu, delay: 150 },
  { text: "CONNECTING TO SENTINEL SECURE DATABASE (SQLite v3)... OK", icon: Database, delay: 200 },
  { text: "RESOLVING BENGALURU MUNICIPAL JURISDICTIONS (15 sectors)... OK", icon: Database, delay: 150 },
  { text: "MAPPING SYSTEM FLOW CHANNELS (Indiranagar, MG Road, Silk Board)... OK", icon: Wifi, delay: 220 },
  { text: "INITIALIZING YOLO-V8 COMPUTER VISION HEURISTICS... OK", icon: Shield, delay: 250 },
  { text: "SYNCING TRAFFIC RISK PREDICTION CORES... OK", icon: Cpu, delay: 180 },
  { text: "CONNECTING COMMAND BRIEFING INTEL AGENT... OK", icon: Wifi, delay: 200 },
  { text: "VERIFYING GDPR PRIVACY SHIELD AUDIT LOGGERS... OK", icon: Shield, delay: 150 },
  { text: "ESTABLISHING TELEMETRY FEED... ONLINE", icon: Terminal, delay: 180 },
  { text: "DECRYPTING COMMAND CONSOLE ENVELOPE...", icon: Terminal, delay: 100 }
];

export function SystemBootOverlay({ onComplete }: SystemBootOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentLogIdx, setCurrentLogIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("SYSTEM DIAGNOSTICS STARTING...");
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const startBootSequence = () => {
    setVisible(true);
    setLogs([]);
    setCurrentLogIdx(0);
    setProgress(0);
    setStatusText("RUNNING TELEMETRY CHECKS...");
  };

  useEffect(() => {
    // Check if already booted in this session
    const hasBooted = sessionStorage.getItem("sentinel_booted");
    if (!hasBooted) {
      startBootSequence();
    } else {
      onComplete?.();
    }

    // Listen for custom replay event
    const handleReplay = () => {
      startBootSequence();
    };

    window.addEventListener("replay-sentinel-boot", handleReplay);
    return () => {
      window.removeEventListener("replay-sentinel-boot", handleReplay);
    };
  }, []);

  // Log printing effect
  useEffect(() => {
    if (!visible || currentLogIdx >= BOOT_LOGS.length) return;

    const logItem = BOOT_LOGS[currentLogIdx];
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, logItem.text]);
      setProgress(Math.round(((currentLogIdx + 1) / BOOT_LOGS.length) * 100));
      setCurrentLogIdx(prev => prev + 1);

      if (currentLogIdx === BOOT_LOGS.length - 1) {
        setStatusText("SYSTEM DECRYPTED. STANDING BY...");
        setTimeout(() => {
          sessionStorage.setItem("sentinel_booted", "true");
          setVisible(false);
          onComplete?.();
        }, 1200);
      } else {
        setStatusText(`CALIBRATING SENSOR: ${logItem.text.split("...")[0]}`);
      }
    }, logItem.delay);

    return () => clearTimeout(timer);
  }, [visible, currentLogIdx]);

  // Scroll to bottom of logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden font-mono select-none">
      {/* Sci-Fi Grid Background Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)`,
          backgroundSize: "20px 20px"
        }}
      />

      {/* Futuristic Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/2 w-full animate-pulse top-0 left-0" style={{ animationDuration: '4s' }} />

      <div className="max-w-2xl w-full bg-slate-900/40 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col h-[500px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">SENTINEL OPERATING SYSTEM v3.4.1</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500/50" />
            <span className="w-2 h-2 rounded-full bg-amber-500/50" />
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Console Logs Area */}
        <div 
          ref={logsContainerRef}
          className="flex-1 overflow-y-auto py-4 space-y-2 text-xs md:text-sm text-cyan-300/80 scrollbar-none"
        >
          {logs.map((log, idx) => {
            const LogIcon = BOOT_LOGS[idx]?.icon || Terminal;
            const isLast = idx === logs.length - 1;
            return (
              <div 
                key={idx} 
                className={`flex items-start gap-2.5 transition-all duration-200 ${
                  isLast ? "text-cyan-400 font-bold glow-cyan" : ""
                }`}
              >
                <span className="text-cyan-600 shrink-0">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                <LogIcon className={`w-4 h-4 shrink-0 mt-0.5 ${isLast ? "animate-pulse" : "opacity-60"}`} />
                <span>{log}</span>
              </div>
            );
          })}
          {currentLogIdx < BOOT_LOGS.length && (
            <div className="flex items-center gap-2 text-cyan-500/40 animate-pulse">
              <span>&gt; LOADING ENVELOPE SECTOR...</span>
              <span className="w-1.5 h-4 bg-cyan-500/60 inline-block animate-blink" />
            </div>
          )}
        </div>

        {/* Progress Bar & Footer status */}
        <div className="border-t border-slate-800 pt-4 mt-auto shrink-0 space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
            <span>{statusText}</span>
            <span className="text-cyan-400">{progress}%</span>
          </div>
          {/* Progress outer bar */}
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        .glow-cyan {
          text-shadow: 0 0 8px rgba(34, 211, 238, 0.4);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
