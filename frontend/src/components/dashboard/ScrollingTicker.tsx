"use client";
import { usePolling } from "@/hooks/usePolling";
import { api } from "@/lib/api";
import { AlertCircle } from "lucide-react";

interface TickerLog {
  timestamp: string;
  junction: string;
  type: string;
  plate: string | null;
}

export function ScrollingTicker() {
  const { data: recent } = usePolling(api.getRecentActivity, 15000);

  if (!recent || recent.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 h-8 flex items-center overflow-hidden shrink-0 mt-3 rounded-lg border">
      <div className="bg-rose-500/20 text-rose-400 px-3 h-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider shrink-0 border-r border-rose-500/20 z-10">
        <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
        Live Feed
      </div>
      
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="absolute whitespace-nowrap animate-ticker flex items-center gap-12 pl-4">
          {recent.slice(0, 15).map((log: TickerLog, idx: number) => (
            <span key={idx} className="text-xs text-slate-300 flex items-center gap-2">
              <span className="text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-cyan-400 font-bold">{log.junction}</span>
              <span className="text-slate-400">•</span>
              <span className="text-rose-400 font-medium">{log.type}</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {log.plate || "UNKNOWN"}
              </span>
            </span>
          ))}
          {/* Duplicate for infinite seamless scrolling */}
          {recent.slice(0, 15).map((log: TickerLog, idx: number) => (
            <span key={`dup-${idx}`} className="text-xs text-slate-300 flex items-center gap-2">
              <span className="text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-cyan-400 font-bold">{log.junction}</span>
              <span className="text-slate-400">•</span>
              <span className="text-rose-400 font-medium">{log.type}</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {log.plate || "UNKNOWN"}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
