"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Users, Eye, Map, AlertOctagon, Target } from "lucide-react";
import { usePolling } from "@/hooks/usePolling";

interface RepeatOffendersProps {
  selectedPlate?: string | null;
  onSelectPlate?: (plate: string | null) => void;
}

export function RepeatOffenders({ selectedPlate, onSelectPlate }: RepeatOffendersProps) {
  const { data: offenders, loading } = usePolling(() => api.getOffenders(2), 20000);

  if (loading && !offenders) {
    return <Card className="bg-slate-900 border-slate-800 animate-pulse"><CardContent className="h-[400px]"></CardContent></Card>;
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
          <Users className="w-5 h-5 text-indigo-500" />
          Repeat Offenders Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto bg-slate-950/20">
          {offenders?.map((offender) => {
            const isSelected = selectedPlate === offender.plate;
            return (
              <div 
                key={offender.plate} 
                onClick={() => onSelectPlate?.(isSelected ? null : offender.plate)}
                className={`p-4 transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-950/30 border-l-4 border-l-indigo-500 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]' 
                    : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`font-mono text-sm px-2 py-0.5 rounded-sm transition-colors ${
                      isSelected ? 'border-indigo-400 text-indigo-200 bg-indigo-500/20' : 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10'
                    }`}>
                      {offender.plate}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                      <AlertOctagon className="w-3 h-3" />
                      Risk: {offender.risk_score}
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse font-bold">
                        <Target className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                        TRACKING
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Last seen: {new Date(offender.last_seen).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {offender.sightings} sightings
                  </div>
                  <div className="flex items-center gap-1">
                    <Map className="w-3.5 h-3.5" />
                    {offender.distinct_junctions} locations
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {offender.junctions_list.slice(0, 3).map((j, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-sm border border-slate-700">
                      {j}
                    </span>
                  ))}
                  {offender.junctions_list.length > 3 && (
                    <span className="text-[10px] text-slate-500 px-1">+{offender.junctions_list.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
          {offenders?.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">No active repeat offenders found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
