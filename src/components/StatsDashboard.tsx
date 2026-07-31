import React from 'react';
import { NetworkMetrics, RouterNode, SimulationState } from '../types';
import { Activity, Zap, ShieldCheck, Wifi, ArrowUpRight, TrendingUp } from 'lucide-react';

interface StatsDashboardProps {
  metrics: NetworkMetrics;
  currentRouter?: RouterNode;
  simulationState: SimulationState;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  metrics,
  currentRouter,
  simulationState
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Metric 1: Total & Avg Latency */}
      <div className="rounded-xl border border-white/10 bg-black/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-gray-400 font-mono text-xs mb-1">
          <span>Latency Stats</span>
          <Activity className="h-4 w-4 text-[#00E5FF]" />
        </div>
        <div className="font-mono text-xl font-extrabold text-[#00E5FF]">
          {metrics.totalLatency} <span className="text-xs font-normal">ms</span>
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-gray-400">
          <span>Avg: {metrics.avgLatency} ms</span>
          <span>Min/Max: {metrics.minLatency}/{metrics.maxLatency}</span>
        </div>
      </div>

      {/* Metric 2: Network Health & Loss */}
      <div className="rounded-xl border border-white/10 bg-black/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-gray-400 font-mono text-xs mb-1">
          <span>Network Health</span>
          <ShieldCheck className="h-4 w-4 text-[#00FF9D]" />
        </div>
        <div className="font-mono text-xl font-extrabold text-[#00FF9D]">
          {metrics.networkHealth}%
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-gray-400">
          <span>Loss: {metrics.packetLoss}%</span>
          <span>Jitter: &lt; 2.1ms</span>
        </div>
      </div>

      {/* Metric 3: Active Router & Hop Count */}
      <div className="rounded-xl border border-white/10 bg-black/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-gray-400 font-mono text-xs mb-1">
          <span>Current Router</span>
          <Zap className="h-4 w-4 text-purple-400" />
        </div>
        <div className="truncate font-mono text-sm font-bold text-white">
          {currentRouter ? currentRouter.name : 'Awaiting Path'}
        </div>
        <div className="mt-1 font-mono text-[10px] text-gray-400">
          Hop {metrics.completedHops} of {metrics.totalHops} ({metrics.totalDistanceKm} km)
        </div>
      </div>

      {/* Metric 4: Throughput Speed */}
      <div className="rounded-xl border border-white/10 bg-black/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-gray-400 font-mono text-xs mb-1">
          <span>Subsea Bandwidth</span>
          <Wifi className="h-4 w-4 text-yellow-400" />
        </div>
        <div className="font-mono text-xl font-extrabold text-yellow-400">
          {metrics.avgSpeedGbps} <span className="text-xs font-normal">Gbps</span>
        </div>
        <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-gray-400">
          <TrendingUp className="h-3 w-3 text-[#00FF9D]" />
          <span>Optic Glass Speed 0.67c</span>
        </div>
      </div>
    </div>
  );
};
