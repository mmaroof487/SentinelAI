"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Newspaper, TrendingUp, ShieldAlert, Route } from "lucide-react";
import { usePolling } from "@/hooks/usePolling";

export function DailyBriefing() {
  const { data: briefing, loading } = usePolling(api.getDailyBriefing, 60000);

  if (loading && !briefing) {
    return <Card className="bg-slate-900 border-slate-800 animate-pulse"><CardContent className="h-full"></CardContent></Card>;
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900/80">
        <CardTitle className="flex items-center justify-between text-lg text-slate-100">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-indigo-500" />
            Executive Briefing
          </div>
          <Badge variant="outline" className="font-mono text-[10px] border-slate-700 text-slate-400">
            {briefing?.generated_at ? new Date(briefing.generated_at).toLocaleDateString() : "TODAY"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 overflow-y-auto space-y-6">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">
            {briefing?.summary}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" /> Highest Risk Zone
            </div>
            <div className="text-lg font-semibold text-rose-300">{briefing?.highest_risk}</div>
          </div>
          
          <div className="p-3 rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5">
            <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Route className="w-4 h-4" /> Top Corridor
            </div>
            <div className="text-sm font-semibold text-fuchsia-300">{briefing?.top_corridor}</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Zone Intelligence
          </h4>
          <div className="space-y-2">
            {briefing?.zone_stats.map((zone, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-800/40 text-sm">
                <span className="font-medium text-slate-200">{zone.zone}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs">{zone.top_type}</span>
                  <Badge variant="secondary" className="bg-slate-700 hover:bg-slate-700 text-slate-300">
                    {zone.violation_count}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">Recommendation</h4>
          <p className="text-sm text-emerald-400 font-medium">
            {briefing?.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
