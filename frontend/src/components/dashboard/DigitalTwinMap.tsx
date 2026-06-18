"use client";
import {
  MapContainer, TileLayer, Polyline, CircleMarker, Tooltip
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { CorridorForecast, Hotspot, Recommendation, RepeatOffender } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';

interface MovingTrackerPathProps {
  coordinates: [number, number][];
  plate: string;
}

function MovingTrackerPath({ coordinates, plate }: MovingTrackerPathProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const percentRef = useRef(0);

  useEffect(() => {
    if (coordinates.length < 2) return;

    const interval = setInterval(() => {
      // 0.4% speed step every 30ms -> takes 7.5 seconds for complete loop
      percentRef.current = (percentRef.current + 0.4) % 100;
      const p = percentRef.current;
      const N = coordinates.length;
      const S = N - 1;
      
      const segmentFloat = (p / 100) * S;
      const k = Math.min(Math.floor(segmentFloat), S - 1);
      const t = segmentFloat - k;
      
      const p1 = coordinates[k];
      const p2 = coordinates[k + 1];
      
      const lat = p1[0] + t * (p2[0] - p1[0]);
      const lon = p1[1] + t * (p2[1] - p1[1]);
      
      setPosition([lat, lon]);
    }, 30);

    return () => clearInterval(interval);
  }, [coordinates]);

  if (!position) return null;

  return (
    <>
      {/* Glow shadow polyline */}
      <Polyline
        positions={coordinates}
        color="#f97316"
        weight={6}
        opacity={0.15}
      />
      {/* Primary dashed track polyline */}
      <Polyline
        positions={coordinates}
        color="#f97316"
        weight={3.5}
        opacity={0.8}
        dashArray="8, 8"
      />
      {/* Outer radar ping */}
      <CircleMarker
        center={position}
        radius={18}
        pathOptions={{
          color: '#f97316',
          fillColor: 'transparent',
          weight: 1.5,
          opacity: 0.45,
        }}
      />
      {/* Glowing center dot */}
      <CircleMarker
        center={position}
        radius={6}
        pathOptions={{
          color: '#ffffff',
          fillColor: '#ef4444',
          fillOpacity: 1,
          weight: 2,
        }}
      >
        <Tooltip permanent direction="top" className="!bg-slate-950/90 !border-orange-500/50 !text-orange-400 !font-mono !text-[9px] !rounded-md !py-0.5 !px-1.5 !shadow-[0_0_12px_rgba(249,115,22,0.4)]">
          <span>📡 TRACKING: {plate}</span>
        </Tooltip>
      </CircleMarker>
    </>
  );
}

interface LayerConfig {
  violations: boolean;
  offenders: boolean;
  corridors: boolean;
  risk: boolean;
  resources: boolean;
}

interface DigitalTwinMapProps {
  corridors: CorridorForecast[];
  hotspots: Hotspot[];
  offenders: RepeatOffender[];
  recommendations: Recommendation[];
  onJunctionClick?: (junction: string) => void;
  selectedPlate?: string | null;
}

const RISK_COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
};

const ACTIVITY_COLORS: Record<string, string> = {
  HIGH: '#d946ef',
  MEDIUM: '#8b5cf6',
  LOW: '#6366f1',
};

export default function DigitalTwinMap({
  corridors, hotspots, offenders, recommendations, onJunctionClick, selectedPlate
}: DigitalTwinMapProps) {
  const center: [number, number] = [12.9716, 77.5946];
  const [layers, setLayers] = useState<LayerConfig>({
    violations: true,
    offenders: true,
    corridors: true,
    risk: true,
    resources: true,
  });

  const toggleLayer = (layer: keyof LayerConfig) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const maxWeight = Math.max(...corridors.map(c => c.weight), 1);

  const offenderJunctions = new Map<string, RepeatOffender[]>();
  offenders.forEach(o => {
    o.junctions_list.forEach(j => {
      if (!offenderJunctions.has(j)) offenderJunctions.set(j, []);
      offenderJunctions.get(j)!.push(o);
    });
  });

  // Layer Toggle Button
  const LayerButton = ({ id, label, color, active }: { id: keyof LayerConfig; label: string; color: string; active: boolean }) => (
    <button
      onClick={() => toggleLayer(id)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
        active
          ? 'border-transparent text-white shadow-lg'
          : 'bg-slate-900/80 border-slate-700 text-slate-400'
      }`}
      style={active ? { backgroundColor: color + 'cc', borderColor: color } : {}}
    >
      <span
        className="w-2.5 h-2.5 rounded-full border-2 transition-all"
        style={{ borderColor: color, backgroundColor: active ? color : 'transparent' }}
      />
      {label}
    </button>
  );

  return (
    <div className="relative h-full w-full">
      {/* Layer Toggle Toolbar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-1.5 max-w-xs">
        <LayerButton id="violations" label="Violations" color="#ef4444" active={layers.violations} />
        <LayerButton id="offenders" label="Offenders" color="#f97316" active={layers.offenders} />
        <LayerButton id="corridors" label="Corridors" color="#d946ef" active={layers.corridors} />
        <LayerButton id="risk" label="Risk Zones" color="#eab308" active={layers.risk} />
        <LayerButton id="resources" label="Resources" color="#22c55e" active={layers.resources} />
      </div>

      {/* City Label */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono">
        🏙️ Bengaluru Traffic Digital Twin
      </div>

      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Layer 4: Congestion Risk Zones (heatmap-style circles) */}
        {layers.risk && hotspots.map((h, i) => {
          const radius = Math.max(20, h.risk_score * 8);
          const color = RISK_COLORS[h.severity] || '#6366f1';
          return (
            <CircleMarker
              key={`risk-${i}`}
              center={[h.lat, h.lon]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.08,
                weight: 1,
                opacity: 0.3,
              }}
            />
          );
        })}

        {/* Layer 3: Corridors */}
        {layers.corridors && corridors.map((c, i) => {
          const opacity = Math.max(0.25, c.weight / maxWeight);
          const weight = Math.max(2, (c.weight / maxWeight) * 8);
          const color = ACTIVITY_COLORS[c.current_activity] || '#d946ef';
          return (
            <Polyline
              key={`corridor-${i}`}
              positions={[[c.from_lat, c.from_lon], [c.to_lat, c.to_lon]]}
              color={color}
              weight={weight}
              opacity={opacity}
              dashArray={c.risk_level === 'HIGH' ? undefined : "8, 6"}
            >
              <Tooltip className="!bg-slate-900 !border-slate-700 !text-slate-200 !rounded-lg !shadow-xl">
                <div className="font-bold text-sm">{c.from_junction} → {c.to_junction}</div>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Activity:</span>
                    <span style={{ color }} className="font-bold">{c.current_activity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Forecast:</span>
                    <span className={`font-bold ${c.risk_level === 'HIGH' ? 'text-red-400' : c.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-green-400'}`}>
                      {c.forecast}
                    </span>
                  </div>
                  {c.escalation_pct > 0 && (
                    <div className="text-xs text-rose-400 font-semibold">↑ +{c.escalation_pct}% escalation</div>
                  )}
                  <div className="text-xs text-slate-400">Volume: {c.weight} tracked vehicles</div>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Layer 1: Violation Hotspot Markers */}
        {layers.violations && hotspots.map((h, i) => {
          const color = RISK_COLORS[h.severity] || '#6366f1';
          const radius = Math.max(8, Math.min(22, h.violation_count / 5));
          return (
            <CircleMarker
              key={`hotspot-${i}`}
              center={[h.lat, h.lon]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onJunctionClick?.(h.junction),
              }}
            >
              <Tooltip direction="top" className="!bg-slate-900 !border-slate-700 !text-slate-200 !rounded-lg !shadow-xl">
                <div className="font-bold text-sm">{h.junction}</div>
                <div className="text-xs text-slate-400 mt-1">
                  <div>{h.violation_count} violations (24h)</div>
                  <div>Risk Score: <span style={{ color }} className="font-bold">{h.risk_score}</span></div>
                  <div>Top: {h.top_violation_type}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Layer 2: Repeat Offender Pulsing Markers */}
        {layers.offenders && offenders.slice(0, 10).map((o, i) => {
          const lastJunction = o.junctions_list[o.junctions_list.length - 1];
          const hotspot = hotspots.find(h => h.junction === lastJunction);
          if (!hotspot) return null;
          return (
            <CircleMarker
              key={`offender-${i}`}
              center={[hotspot.lat, hotspot.lon]}
              radius={6}
              pathOptions={{
                color: '#f97316',
                fillColor: '#f97316',
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Tooltip direction="top" className="!bg-slate-900 !border-slate-700 !text-slate-200 !rounded-lg !shadow-xl">
                <div className="font-mono font-bold text-orange-400 text-sm">{o.plate}</div>
                <div className="text-xs text-slate-400 mt-1">
                  <div>{o.sightings} sightings · Risk: {o.risk_score}</div>
                  <div>Last seen: {new Date(o.last_seen).toLocaleTimeString()}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Live Offender GPS Tracking Trajectory */}
        {layers.offenders && (() => {
          const trackTarget = offenders.find(o => o.plate === selectedPlate) || offenders.find(o => o.plate === "KA05MX4421") || offenders[0];
          if (!trackTarget || trackTarget.junctions_list.length < 2) return null;
          
          const coords = trackTarget.junctions_list
            .map(j => hotspots.find(h => h.junction === j))
            .filter((h): h is Hotspot => !!h)
            .map(h => [h.lat, h.lon] as [number, number]);

          if (coords.length < 2) return null;

          return <MovingTrackerPath coordinates={coords} plate={trackTarget.plate} />;
        })()}

        {/* Layer 5: Resource Allocation (Recommendations) */}
        {layers.resources && recommendations.slice(0, 5).map((r, i) => (
          <CircleMarker
            key={`resource-${i}`}
            center={[r.lat, r.lon]}
            radius={5}
            pathOptions={{
              color: '#22c55e',
              fillColor: '#22c55e',
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Tooltip direction="bottom" className="!bg-slate-900 !border-slate-700 !text-slate-200 !rounded-lg !shadow-xl">
              <div className="font-bold text-sm text-emerald-400">{r.junction}</div>
              <div className="text-xs text-slate-400 mt-1">
                <div>Recommended: <span className="text-emerald-400 font-semibold">{r.recommended_resources}</span></div>
                <div>Confidence: {r.confidence}%</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
