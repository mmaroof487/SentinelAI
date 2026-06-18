"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Lock } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Command Center" },
  { href: "/evidence", label: "Evidence" },
  { href: "/simulate", label: "Simulate" },
  { href: "/intelligence", label: "Intelligence" },
];

export function Navbar() {
  const [time, setTime] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 text-cyan-400 hover:text-cyan-300 transition-colors">
            <div className="relative">
              <Shield className="w-6 h-6" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="font-black text-base tracking-tight leading-none">SentinelAI</div>
              <div className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">Command & Prediction Platform</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-0.5 text-sm font-medium text-slate-400">
            {NAV_LINKS.map(link => {
              const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-slate-800 text-slate-100 font-semibold'
                      : 'hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  {link.label}
                  {link.href === "/simulate" && (
                    <span className="ml-1.5 text-[9px] font-bold uppercase bg-fuchsia-500/20 text-fuchsia-400 px-1 py-0.5 rounded border border-fuchsia-500/20">NEW</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Privacy Shield indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            <Lock className="w-3 h-3" />
            Protected
          </div>

          {/* Time */}
          <span className="text-slate-500 font-mono text-sm">{time || "00:00:00"}</span>

          {/* System Status */}
          <button 
            onClick={() => {
              sessionStorage.removeItem("sentinel_booted");
              window.dispatchEvent(new Event("replay-sentinel-boot"));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
            title="Click to replay system boot diagnostics"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE
          </button>
        </div>
      </div>
    </nav>
  );
}
