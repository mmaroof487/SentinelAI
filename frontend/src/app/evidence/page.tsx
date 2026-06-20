"use client";
import { useState } from "react";
import { EvidenceUpload } from "@/components/evidence/EvidenceUpload";
import { EnforcementDossier } from "@/components/evidence/EnforcementDossier";
import { PrivacyShield } from "@/components/evidence/PrivacyShield";
import { api } from "@/lib/api";
import { DetectionResult, Dossier } from "@/lib/types";
import { FileText, Lock, Loader2 } from "lucide-react";

export default function EvidencePage() {
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [blurPedestrians, setBlurPedestrians] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoadingDossier(true);
    setSearchError("");
    try {
      const d = await api.getDossier(searchQuery.toUpperCase().trim());
      setDossier(d);
      setDetection(null);
    } catch {
      setDossier(null);
      setSearchError(`No violation history found for plate ${searchQuery}`);
    } finally {
      setLoadingDossier(false);
    }
  };

  const handleDetection = async (result: DetectionResult) => {
    setDetection(result);
    // Auto-fetch dossier if plate was detected
    if (result.plate) {
      setLoadingDossier(true);
      try {
        const d = await api.getDossier(result.plate);
        setDossier(d);
      } catch {
        // No existing dossier for this plate — that's OK
      } finally {
        setLoadingDossier(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Evidence Processing</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Upload traffic camera images · Auto-detect violations · Generate enforcement dossiers
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">Privacy Protected</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Upload + Detection */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search Bar */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-300">Dossier Lookup</div>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search plate (e.g. KA05MX4421)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 uppercase w-64 placeholder:normal-case"
              />
              <button
                type="submit"
                disabled={loadingDossier}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-sm transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {searchError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
              {searchError}
            </div>
          )}

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 min-h-[400px]">
            <EvidenceUploadWithCallback onDetection={handleDetection} blurPedestrians={blurPedestrians} />
          </div>

          {/* Auto-generated Dossier */}
          {loadingDossier && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <div>
                <div className="text-sm font-semibold text-slate-200">Generating Enforcement Dossier...</div>
                <div className="text-xs text-slate-500 mt-0.5">Collating violation history and movement intelligence</div>
              </div>
            </div>
          )}

          {dossier && !loadingDossier && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Auto-Generated Enforcement Dossier</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <EnforcementDossier dossier={dossier} />
            </div>
          )}

          {detection?.plate && !dossier && !loadingDossier && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400">
              ⚠ No prior violation history found for plate {detection.plate}. First-time offender.
            </div>
          )}
        </div>

        {/* Right: Privacy Shield */}
        <div className="lg:col-span-1">
          <PrivacyShield blurPedestrians={blurPedestrians} setBlurPedestrians={setBlurPedestrians} />
        </div>
      </div>
    </div>
  );
}

// Wrapper to intercept detection result from EvidenceUpload
function EvidenceUploadWithCallback({ onDetection, blurPedestrians }: { onDetection: (r: DetectionResult) => void, blurPedestrians: boolean }) {
  // EvidenceUpload manages its own state; we use a wrapper approach
  // by re-using the component as-is and listening for the result via a custom hook/prop
  // Since EvidenceUpload doesn't accept a callback, we embed it directly
  // and the dossier fetch is triggered from the parent via the detection prop
  return <EvidenceUpload onDetectionComplete={onDetection} blurPedestrians={blurPedestrians} />;
}
