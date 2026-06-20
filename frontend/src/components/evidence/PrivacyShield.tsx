"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePolling } from "@/hooks/usePolling";
import { api } from "@/lib/api";
import { AuditLogEntry } from "@/lib/types";
import { Lock, Eye, EyeOff, Truck, CheckCircle2, AlertOctagon, Database } from "lucide-react";

const RETENTION_OPTIONS = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "indefinite", label: "Indefinite" },
];

function Toggle({ enabled, onToggle, label, description }: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
      <div>
        <div className="text-sm font-medium text-slate-200">{label}</div>
        <div className="text-[10px] text-slate-500">{description}</div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-emerald-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function PrivacyShield({ 
  blurPedestrians, 
  setBlurPedestrians 
}: { 
  blurPedestrians?: boolean; 
  setBlurPedestrians?: (v: boolean) => void;
}) {
  const [internalBlur, setInternalBlur] = useState(true);
  const isBlurring = blurPedestrians !== undefined ? blurPedestrians : internalBlur;
  const toggleBlur = () => {
    if (setBlurPedestrians) setBlurPedestrians(!isBlurring);
    else setInternalBlur(!isBlurring);
  };

  const [blurVehicles, setBlurVehicles] = useState(false);
  const [retention, setRetention] = useState("30d");
  const { data: auditLog } = usePolling(api.getAuditLog, 30000);

  return (
    <Card className="bg-slate-900/60 border-emerald-500/20 backdrop-blur-md shadow-xl shadow-emerald-500/5">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <Lock className="w-5 h-5 text-emerald-400" />
          Privacy Shield
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {["GDPR-Aligned", "Privacy-First", "Audit-Ready"].map(badge => (
            <span key={badge} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {badge}
            </span>
          ))}
        </div>

        {/* Privacy Controls */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Privacy Controls</div>
          <Toggle
            enabled={isBlurring}
            onToggle={toggleBlur}
            label="Blur Pedestrians"
            description="Automatically anonymize pedestrians in all captured images"
          />
          <Toggle
            enabled={blurVehicles}
            onToggle={() => setBlurVehicles(p => !p)}
            label="Blur Non-Offender Vehicles"
            description="Redact vehicles not flagged as violations"
          />
        </div>

        {/* Retention Policy */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
            <Database className="w-3 h-3" />
            Data Retention Policy
          </div>
          <select
            value={retention}
            onChange={e => setRetention(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {RETENTION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Audit Log */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Recent Audit Log</div>
          <div className="rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-[10px]">
                <thead className="bg-slate-800/60 sticky top-0">
                  <tr>
                    <th className="text-left px-2 py-2 text-slate-500 font-semibold uppercase">Time</th>
                    <th className="text-left px-2 py-2 text-slate-500 font-semibold uppercase">Junction</th>
                    <th className="text-left px-2 py-2 text-slate-500 font-semibold uppercase">Plate</th>
                    <th className="text-left px-2 py-2 text-slate-500 font-semibold uppercase">Status</th>
                    <th className="text-left px-2 py-2 text-slate-500 font-semibold uppercase">Privacy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {(auditLog || []).slice(0, 20).map((entry, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-2 py-1.5 text-slate-500 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-2 py-1.5 text-slate-300 truncate max-w-[80px]">{entry.junction}</td>
                      <td className="px-2 py-1.5">
                        {entry.plate !== '—' ? (
                          <span className={`font-mono ${entry.is_repeat_offender ? 'text-rose-400' : 'text-slate-300'}`}>
                            {entry.plate}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`${entry.status === 'OPEN' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        {entry.privacy_blurred ? (
                          <span className="text-emerald-500 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> ON
                          </span>
                        ) : (
                          <span className="text-slate-500">OFF</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!auditLog && (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-center text-slate-600">Loading audit log...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
