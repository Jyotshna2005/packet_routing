import React from 'react';
import { HopInfo } from '../types';
import { getLatencyColorHex } from '../utils/geo';
import { Server, ArrowDownRight, Clock, MapPin, Gauge } from 'lucide-react';

interface HopListProps {
  completedHops: HopInfo[];
  currentHopIndex: number;
  totalHops: number;
}

export const HopList: React.FC<HopListProps> = ({
  completedHops,
  currentHopIndex,
  totalHops
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#00E5FF]/20 bg-[#0B0B0B]/80 p-4 backdrop-blur-md lg:p-5">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-[#00E5FF]" />
          <h3 className="font-mono text-sm font-bold tracking-wider text-white uppercase">
            Hop Telemetry & Router Logs
          </h3>
        </div>
        <span className="font-mono text-xs text-gray-400">
          Hops Recorded: <span className="font-bold text-[#00FF9D]">{completedHops.length}</span> / {totalHops}
        </span>
      </div>

      {/* Color Legend Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/5 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-gray-300">
        <span className="text-gray-400 font-semibold">Latency Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00FF9D]" />
          <span className="text-[#00FF9D] font-bold">Fast (&lt;20ms)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFD700]" />
          <span className="text-[#FFD700] font-bold">Medium (20-70ms)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF3366]" />
          <span className="text-[#FF3366] font-bold">Slow (&gt;70ms)</span>
        </div>
      </div>

      {/* Hop List Cards */}
      <div className="flex max-h-[380px] flex-col gap-2.5 overflow-y-auto pr-1">
        {completedHops.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/40 text-center font-mono text-xs text-gray-500">
            <ArrowDownRight className="mb-2 h-6 w-6 text-gray-600 animate-bounce" />
            <span>Simulation idle. Press "START SIMULATION" to trace route packet.</span>
          </div>
        ) : (
          completedHops.map((hop) => {
            const badgeColor = getLatencyColorHex(hop.latencyGrade);
            return (
              <div
                key={hop.hopNumber}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/60 p-3 transition duration-200 hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/5"
              >
                {/* Left accent color bar */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-1"
                  style={{ backgroundColor: badgeColor }}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pl-2">
                  {/* Left: Hop Number & Router Name */}
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-mono text-xs font-bold text-[#00E5FF]">
                      #{hop.hopNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {hop.router.name}
                        </span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-gray-300">
                          {hop.router.tier}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs text-gray-400">
                        <span>IP: <span className="text-[#00FF9D]">{hop.ip}</span></span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          {hop.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Latency & Distance */}
                  <div className="flex items-center gap-3 font-mono text-xs">
                    {/* Latency Grade Badge */}
                    <span
                      className="rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color: badgeColor,
                        borderColor: `${badgeColor}60`,
                        backgroundColor: `${badgeColor}15`
                      }}
                    >
                      {hop.latencyGrade === 'fast'
                        ? '🟢 Fast (<20ms)'
                        : hop.latencyGrade === 'medium'
                        ? '🟡 Medium (20-70ms)'
                        : '🔴 Slow (>70ms)'}
                    </span>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 font-bold" style={{ color: badgeColor }}>
                        <Gauge className="h-3.5 w-3.5" />
                        {hop.latencyMs} ms
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Cumul: {hop.cumulativeLatency} ms
                      </div>
                    </div>

                    <div className="hidden sm:block text-right">
                      <div className="text-gray-300 font-semibold">{hop.distanceKm} km</div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="h-2.5 w-2.5" />
                        {hop.timestamp}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className="rounded-md border border-[#00FF9D]/40 bg-[#00FF9D]/10 px-2 py-1 font-mono text-[10px] font-bold text-[#00FF9D]">
                      {hop.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
