import React from 'react';
import { Heart, Globe, Cpu, Zap, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-[#00E5FF]/20 bg-[#05070A]/95 py-6 px-4 md:px-6 backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        
        {/* Left: Developer Credit Banner */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF9D] opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00FF9D]"></span>
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
              Cyber Packet Tracer Engine v2.4
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
            <Cpu className="h-4 w-4 text-[#00FF9D]" />
            <span>Developed by <strong className="font-bold text-[#00FF9D] underline decoration-[#00FF9D]/40 underline-offset-4">Jyotshnarani Sahoo</strong></span>
          </div>

          <p className="font-mono text-[11px] text-gray-400">
            Interactive Global Network Route Telemetry & Subsea Cable Routing Simulator
          </p>
        </div>

        {/* Center: Latency Color Spectrum Guide */}
        <div className="rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-xs">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Global Latency Color Indicators
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#00FF9D] shadow-[0_0_8px_#00FF9D]" />
              <span className="font-bold text-[#00FF9D]">Green (&lt;20ms)</span>
              <span className="text-gray-400 text-[10px]">Fast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700]" />
              <span className="font-bold text-[#FFD700]">Yellow (20-70ms)</span>
              <span className="text-gray-400 text-[10px]">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#FF3366] shadow-[0_0_8px_#FF3366]" />
              <span className="font-bold text-[#FF3366]">Red (&gt;70ms)</span>
              <span className="text-gray-400 text-[10px]">High</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Status */}
        <div className="flex items-center gap-4 font-mono text-xs text-gray-400">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
            <Globe className="h-3.5 w-3.5 text-[#00E5FF]" />
            <span>Tier-1 Transit Backbone</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00FF9D]" />
            <span>BGP Optimal Route</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
