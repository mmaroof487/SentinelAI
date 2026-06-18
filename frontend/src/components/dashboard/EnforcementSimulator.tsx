"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { SimulationResult } from "@/lib/types";
import { Zap, Users, Truck, TrendingDown, Clock, ShieldCheck } from "lucide-react";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";

const JUNCTIONS = [
  "Silk Board", "Marathahalli", "MG Road", "Koramangala", "Electronic City",
  "Indiranagar", "HSR Layout", "Hebbal", "Whitefield", "Jayanagar",
  "JP Nagar", "Banashankari", "Rajajinagar", "Malleshwaram", "Yelahanka"
];

const DEPLOYMENTS = [
  { id: "officer_1", label: "+1 Officer", icon: Users, description: "Single enforcement officer", color: "#38bdf8" },
  { id: "officer_2", label: "+2 Officers", icon: Users, description: "Two officers deployed", color: "#8b5cf6" },
  { id: "towing_unit", label: "+Towing Unit", icon: Truck, description: "Heavy vehicle removal", color: "#f59e0b" },
  { id: "officer_2_towing", label: "2 Officers + Towing", icon: ShieldCheck, description: "Full enforcement package", color: "#22c55e" },
];

const EFFECTIVENESS_COLORS: Record<string, string> = {
  "VERY HIGH": "text-emerald-400",
  "HIGH": "text-cyan-400",
  "MODERATE": "text-amber-400",
  "LOW": "text-slate-400",
};

interface EnforcementSimulatorProps {
  defaultJunction?: string;
}

export function EnforcementSimulator({ defaultJunction }: EnforcementSimulatorProps) {
  const [junction, setJunction] = useState(defaultJunction || "Silk Board");
  const [deploymentType, setDeploymentType] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSim = async (type: string) => {
    setDeploymentType(type);
    setLoading(true);
    try {
      const res = await api.simulate(junction, type);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-md h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <Zap className="w-5 h-5 text-yellow-400" />
          Enforcement Impact Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
        {/* Junction Selector */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Select Junction</label>
          <select
            value={junction}
            onChange={e => { setJunction(e.target.value); setResult(null); }}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            {JUNCTIONS.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>

        {/* Deployment Options */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Simulate Deployment</label>
          <div className="grid grid-cols-2 gap-2">
            {DEPLOYMENTS.map(d => {
              const Icon = d.icon;
              const isActive = deploymentType === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => runSim(d.id)}
                  disabled={loading}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-200 ${
                    isActive
                      ? 'border-opacity-60 shadow-lg'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'
                  } disabled:opacity-50`}
                  style={isActive ? {
                    borderColor: d.color,
                    backgroundColor: d.color + '15',
                    boxShadow: `0 0 16px ${d.color}30`,
                  } : {}}
                >
                  <Icon className="w-4 h-4" style={{ color: d.color }} />
                  <span className="text-xs font-bold text-slate-200">{d.label}</span>
                  <span className="text-[10px] text-slate-500">{d.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-slate-400 animate-pulse">Simulating deployment...</p>
          </div>
        )}

        {/* Result Panel */}
        {result && !loading && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Simulation Result</span>
                <span className={`text-xs font-bold ${EFFECTIVENESS_COLORS[result.effectiveness]}`}>
                  {result.effectiveness} EFFECTIVENESS
                </span>
              </div>
            </div>

            {/* Big Reduction Number */}
            <div className="p-4 text-center border-b border-slate-700/50">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-cyan-400">
                <AnimatedCounter value={result.reduction_pct} suffix="%" />
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Expected Violation Reduction</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-slate-700/50">
              <div className="p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Before</div>
                <div className="text-2xl font-bold text-rose-400">
                  <AnimatedCounter value={result.current_violations} />
                </div>
                <div className="text-[10px] text-slate-500">violations</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">After</div>
                <div className="text-2xl font-bold text-emerald-400">
                  <AnimatedCounter value={result.projected_violations} />
                </div>
                <div className="text-[10px] text-slate-500">projected</div>
              </div>
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
                  <TrendingDown className="w-3 h-3" />Prevented
                </div>
                <div className="text-lg font-bold text-cyan-400">
                  <AnimatedCounter value={result.violations_prevented} />
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
                  <Clock className="w-3 h-3" />Clear Time
                </div>
                <div className="text-sm font-bold text-purple-400">{result.estimated_time_to_clear}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-900/40 text-[10px] text-slate-500 flex justify-between">
              <span>Cost: ₹{result.cost_per_hour_inr}/hr</span>
              <span>Deployment: {result.deployment_label}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
