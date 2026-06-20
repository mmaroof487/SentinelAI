"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePolling } from "@/hooks/usePolling";
import { api } from "@/lib/api";
import { Activity, Cpu, Zap, Timer } from "lucide-react";

interface ModelMetric {
  name: string;
  version: string;
  precision: number;
  recall: number;
  f1_score: number;
  dataset_size: number;
  avg_inference_ms: number;
}

export function SystemPerformance() {
  const { data: metrics } = usePolling(api.getPerformanceMetrics, 60000);

  if (!metrics) {
    return (
      <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
        <CardContent className="p-4 flex items-center justify-center text-slate-500 text-sm h-32">
          Loading metrics...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md flex flex-col h-full min-h-[300px]">
      <CardHeader className="pb-3 border-b border-slate-800 shrink-0">
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <Activity className="w-5 h-5 text-indigo-400" />
          System Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto min-h-0">
        {/* Pipeline Overview */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Throughput
            </div>
            <div className="text-xl font-mono text-slate-200">{metrics.pipeline.throughput_fps} <span className="text-xs text-slate-500">FPS</span></div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              Avg Inference
            </div>
            <div className="text-xl font-mono text-slate-200">{metrics.pipeline.total_avg_processing_ms} <span className="text-xs text-slate-500">ms</span></div>
          </div>
        </div>

        {/* Model Metrics */}
        <div className="space-y-3">
          <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 mb-4">
            <div className="text-amber-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Prototype Evaluation
            </div>
            <p className="text-[10px] text-amber-200/70 leading-relaxed mb-2">
              <strong className="text-amber-300">Internal Validation Set (Size: 14)</strong>
              <br/>
              Current Limitation: Stock COCO weights underperform on low-resolution top-down traffic imagery.
              <br/>
              Future Improvement: Fine-tune on traffic-specific datasets.
            </p>
          </div>

          {metrics.models.map((model: ModelMetric, idx: number) => (
            <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-200">{model.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{model.version}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Precision</span>
                  <span className="text-sm font-mono text-emerald-400">{model.precision}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Recall</span>
                  <span className="text-sm font-mono text-amber-400">{model.recall}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">F1 Score</span>
                  <span className="text-sm font-mono text-cyan-400">{model.f1_score}%</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500">
                <span>Validation Set: {model.dataset_size.toLocaleString()} images</span>
                <span>{model.avg_inference_ms}ms / frame</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
