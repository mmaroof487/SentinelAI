"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { EventSimulationResult } from "@/lib/types";
import { CalendarDays, MapPin, Users, Clock, Loader2 } from "lucide-react";

const JUNCTIONS = [
  "Silk Board", "Marathahalli", "MG Road", "Koramangala", "Electronic City",
  "Indiranagar", "HSR Layout", "Hebbal", "Whitefield", "Jayanagar",
  "JP Nagar", "Banashankari", "Rajajinagar", "Malleshwaram", "Yelahanka"
];

function CrowdSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const formatCrowd = (n: number) => {
    if (n >= 100000) return "1 Lakh+";
    if (n >= 10000) return `${(n / 1000).toFixed(0)}K`;
    return n.toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Expected Crowd Size
        </label>
        <span className="text-lg font-black text-fuchsia-400">{formatCrowd(value)}</span>
      </div>
      <input
        type="range"
        min={1000}
        max={200000}
        step={1000}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-fuchsia-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-600 mt-1">
        <span>1K (Small)</span>
        <span>10K (Medium)</span>
        <span>1L+ (Mega)</span>
      </div>
    </div>
  );
}

interface EventSimulatorFormProps {
  onResult: (r: EventSimulationResult) => void;
}

export function EventSimulatorForm({ onResult }: EventSimulatorFormProps) {
  const [location, setLocation] = useState("Silk Board");
  const [crowd, setCrowd] = useState(10000);
  const [duration, setDuration] = useState(3);
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    setLoading(true);
    try {
      const result = await api.simulateEvent(location, crowd, duration);
      onResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <CalendarDays className="w-5 h-5 text-fuchsia-400" />
          Event Traffic Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {/* Location */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block flex items-center gap-1">
            <MapPin className="w-3 h-3" />Event Location
          </label>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 transition-colors"
          >
            {JUNCTIONS.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>

        {/* Crowd Slider */}
        <CrowdSlider value={crowd} onChange={setCrowd} />

        {/* Duration */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />Duration
            </label>
            <span className="text-lg font-black text-cyan-400">{duration}h</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 6, 8, 12, 24].map(h => (
              <button
                key={h}
                onClick={() => setDuration(h)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  duration === h
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-500 hover:border-slate-600'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={simulate}
          disabled={loading}
          className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 text-sm transition-all"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Simulating Impact...</>
          ) : (
            <><CalendarDays className="w-4 h-4 mr-2" />Simulate Event Impact</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
