"use client";
import { Dossier } from "@/lib/types";
import {
  FileText, AlertOctagon, MapPin, Clock, Shield, ChevronRight,
  TrendingUp, Hash, Printer
} from "lucide-react";

interface EnforcementDossierProps {
  dossier: Dossier;
}

const THREAT_STYLES: Record<string, { border: string; badge: string; glow: string }> = {
  CRITICAL: {
    border: "border-red-500/40",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    glow: "shadow-red-500/10",
  },
  HIGH: {
    border: "border-orange-500/40",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    glow: "shadow-orange-500/10",
  },
  MEDIUM: {
    border: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    glow: "shadow-amber-500/10",
  },
  LOW: {
    border: "border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    glow: "shadow-emerald-500/10",
  },
};

export function EnforcementDossier({ dossier }: EnforcementDossierProps) {
  const styles = THREAT_STYLES[dossier.threat_level] || THREAT_STYLES.MEDIUM;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`rounded-2xl border ${styles.border} bg-slate-900/80 backdrop-blur-md shadow-2xl ${styles.glow} overflow-hidden print:shadow-none print:border-gray-300`}
      id="enforcement-dossier"
    >
      {/* Dossier Header */}
      <div className="bg-slate-950/60 border-b border-slate-800 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Enforcement Dossier</div>
              <div className="font-mono text-base font-bold text-slate-100">{dossier.case_id}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${styles.badge}`}>
              {dossier.threat_level}
            </span>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all print:hidden"
              title="Export / Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Plate & Risk Score */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle Plate</div>
            <div className="font-mono text-xl font-black text-white tracking-widest">{dossier.plate}</div>
            <div className="text-[10px] text-slate-400 mt-1">{dossier.last_violation_type} · {dossier.junction_zone} Zone</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex flex-col items-center justify-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Risk Score</div>
            <div className="text-3xl font-black text-rose-400">{dossier.risk_score}</div>
            <div className="text-[10px] text-slate-500">/ 10.0</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Hash, label: "Sightings", value: dossier.sightings, color: "text-cyan-400" },
            { icon: MapPin, label: "Junctions", value: dossier.distinct_junctions, color: "text-fuchsia-400" },
            { icon: TrendingUp, label: "Evidence", value: dossier.evidence_count, color: "text-amber-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/40 text-center">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-[10px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Movement Timeline */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Movement Timeline
          </div>
          <div className="relative pl-4">
            {/* Vertical line */}
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-700" />
            <div className="space-y-2">
              {dossier.movement_path.map((stop, i) => {
                const isLast = i === dossier.movement_path.length - 1;
                return (
                  <div key={i} className="relative flex items-start gap-3">
                    {/* Dot */}
                    <div className={`absolute -left-2.5 mt-1.5 w-2 h-2 rounded-full border ${
                      isLast ? 'bg-rose-500 border-rose-400' : 'bg-slate-600 border-slate-500'
                    }`} />
                    <div className="flex-1 bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-200">{stop.junction}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(stop.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600">
                          {stop.violation_type}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {Math.round(stop.confidence * 100)}% confidence
                        </span>
                        {isLast && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                            LAST KNOWN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommended Action */}
        <div className={`rounded-xl border p-3 ${styles.border} bg-slate-800/30`}>
          <div className="flex items-start gap-2">
            <Shield className={`w-4 h-4 mt-0.5 ${
              dossier.threat_level === 'CRITICAL' ? 'text-red-400' :
              dossier.threat_level === 'HIGH' ? 'text-orange-400' : 'text-amber-400'
            } shrink-0`} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Recommended Action</div>
              <p className="text-sm text-slate-200 leading-relaxed">{dossier.recommended_action}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-600 font-mono text-right">
          Generated: {new Date(dossier.generated_at).toLocaleString()} · SentinelAI v2.0
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          #enforcement-dossier {
            page-break-inside: avoid;
            color: #000;
            background: #fff;
          }
        }
      `}</style>
    </div>
  );
}
