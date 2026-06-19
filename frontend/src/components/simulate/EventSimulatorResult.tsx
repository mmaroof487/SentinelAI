"use client";
import { EventSimulationResult } from "@/lib/types";
import {
  AlertOctagon, ArrowRight, MapPin, Users, UserCheck, Truck,
  ShieldCheck, Clock, TrendingUp, Navigation
} from "lucide-react";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";

interface EventSimulatorResultProps {
  result: EventSimulationResult;
}

const IMPACT_STYLES: Record<string, { gradient: string; border: string; text: string; badge: string }> = {
  CRITICAL: {
    gradient: "from-red-900/40 to-slate-900",
    border: "border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500/20 border-red-500/30 text-red-300",
  },
  HIGH: {
    gradient: "from-orange-900/30 to-slate-900",
    border: "border-orange-500/30",
    text: "text-orange-400",
    badge: "bg-orange-500/20 border-orange-500/30 text-orange-300",
  },
  MEDIUM: {
    gradient: "from-amber-900/25 to-slate-900",
    border: "border-amber-500/30",
    text: "text-amber-400",
    badge: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  },
  LOW: {
    gradient: "from-emerald-900/20 to-slate-900",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
  },
};

export function EventSimulatorResult({ result }: EventSimulatorResultProps) {
  const style = IMPACT_STYLES[result.congestion_impact] || IMPACT_STYLES.MEDIUM;

  return (
    <div className={`rounded-2xl border ${style.border} bg-gradient-to-b ${style.gradient} backdrop-blur-md overflow-hidden`}>
      {/* Impact Header */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Predicted Congestion Impact</div>
            <div className={`text-4xl font-black ${style.text}`}>{result.congestion_impact}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 mb-1">Congestion Increase</div>
            <div className={`text-3xl font-black ${style.text}`}>
              <AnimatedCounter value={result.congestion_increase_pct} prefix="+" suffix="%" />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/40">
            <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-slate-200">
              <AnimatedCounter value={result.estimated_peak_delay_minutes} prefix="+" suffix=" min" />
            </div>
            <div className="text-[10px] text-slate-500">Peak Delay</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/40">
            <Navigation className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-slate-200">{result.affected_radius_km} km</div>
            <div className="text-[10px] text-slate-500">Impact Radius</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/40">
            <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-slate-200">
              <AnimatedCounter value={result.expected_crowd} />
            </div>
            <div className="text-[10px] text-slate-500">Crowd Size</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Recommended Diversions */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />Recommended Diversions
          </div>
          <div className="space-y-1.5">
            {result.predicted_diversions.map((d, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/30">
                <div className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                  {i + 1}
                </div>
                <span className="text-sm text-slate-300">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Requirements */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />Resource Requirements
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xl font-black text-cyan-400">
                  <AnimatedCounter value={result.resource_requirements.officers} />
                </div>
                <div className="text-[10px] text-slate-500">Officers Required</div>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xl font-black text-amber-400">
                  <AnimatedCounter value={result.resource_requirements.tow_units} />
                </div>
                <div className="text-[10px] text-slate-500">Tow Units</div>
              </div>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
              <div className="text-[10px] text-slate-500 mb-0.5">Barriers</div>
              <div className="text-sm font-semibold text-slate-300">{result.resource_requirements.barriers}</div>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
              <div className="text-[10px] text-slate-500 mb-0.5">Advance Notice</div>
              <div className="text-sm font-semibold text-slate-300">{result.resource_requirements.advance_notice_required}</div>
            </div>
          </div>
        </div>

        {/* Affected Junctions */}
        {result.affected_junctions.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />Affected Junctions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.affected_junctions.map((j, i) => (
                <span key={i} className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                  {j}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-[10px] text-slate-600 font-mono text-right border-t border-slate-800 pt-3">
          Simulation · {result.location} · {result.duration_hours}h event · SentinelAI v2.0
        </div>
      </div>
    </div>
  );
}
