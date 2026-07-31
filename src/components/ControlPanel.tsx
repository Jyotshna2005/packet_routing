import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Globe,
  Radio,
  Sliders,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GLOBAL_ROUTERS, ROUTE_PRESETS, findRouterById } from '../data/routers';
import { NetworkProtocol, SimulationState } from '../types';
import { cyberAudio } from '../utils/audio';

interface ControlPanelProps {
  sourceId: string;
  destId: string;
  onSourceChange: (id: string) => void;
  onDestChange: (id: string) => void;
  protocol: NetworkProtocol;
  onProtocolChange: (proto: NetworkProtocol) => void;
  simulationState: SimulationState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  totalLatency: number;
  currentHopNum: number;
  totalHopsNum: number;
  onApplyPreset: (presetId: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  sourceId,
  destId,
  onSourceChange,
  onDestChange,
  protocol,
  onProtocolChange,
  simulationState,
  onStart,
  onPause,
  onResume,
  onRestart,
  speed,
  onSpeedChange,
  totalLatency,
  currentHopNum,
  totalHopsNum,
  onApplyPreset
}) => {
  const sourceRouter = findRouterById(sourceId);
  const destRouter = findRouterById(destId);

  const handleStart = () => {
    cyberAudio.playPacketLaunch();
    onStart();
  };

  const handleRestart = () => {
    cyberAudio.playClick();
    onRestart();
  };

  const handlePauseToggle = () => {
    cyberAudio.playClick();
    if (simulationState === 'running') onPause();
    else if (simulationState === 'paused') onResume();
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#00E5FF]/20 bg-[#0B0B0B]/80 p-4 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)] lg:p-5">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-[#00E5FF]" />
          <h2 className="font-mono text-sm font-bold tracking-wider text-white uppercase">
            Route Configuration
          </h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#00FF9D]/30 bg-[#00FF9D]/10 px-2.5 py-0.5 font-mono text-[11px] text-[#00FF9D]">
          <span className="h-2 w-2 rounded-full bg-[#00FF9D] animate-ping" />
          SYSTEM READY
        </div>
      </div>

      {/* Preset Fast Selection Chips */}
      <div>
        <label className="mb-2 block font-mono text-xs font-semibold text-gray-400">
          Quick Route Presets
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          {ROUTE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                cyberAudio.playClick();
                onApplyPreset(p.id);
              }}
              className="flex flex-col items-start rounded-lg border border-white/10 bg-white/5 p-2 text-left transition hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10"
            >
              <span className="font-mono text-xs font-bold text-[#00E5FF]">{p.name}</span>
              <span className="line-clamp-1 font-mono text-[10px] text-gray-400">
                {p.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Source & Destination Selectors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Source */}
        <div className="rounded-xl border border-white/10 bg-black/50 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#00E5FF]">SOURCE NODE</span>
            <span className="font-mono text-[10px] text-gray-400">IP: {sourceRouter?.ip}</span>
          </div>
          <select
            value={sourceId}
            disabled={simulationState === 'running'}
            onChange={(e) => {
              cyberAudio.playClick();
              onSourceChange(e.target.value);
            }}
            className="w-full rounded-lg border border-white/10 bg-[#121212] px-2.5 py-1.5 font-mono text-xs font-medium text-white focus:border-[#00E5FF] focus:outline-none"
          >
            {GLOBAL_ROUTERS.map((r) => (
              <option key={r.id} value={r.id} disabled={r.id === destId}>
                {r.name} ({r.countryCode})
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>Location: {sourceRouter?.country}</span>
            <span className="text-[#00FF9D]">{sourceRouter?.region}</span>
          </div>
        </div>

        {/* Destination */}
        <div className="rounded-xl border border-white/10 bg-black/50 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#00FF9D]">DESTINATION NODE</span>
            <span className="font-mono text-[10px] text-gray-400">IP: {destRouter?.ip}</span>
          </div>
          <select
            value={destId}
            disabled={simulationState === 'running'}
            onChange={(e) => {
              cyberAudio.playClick();
              onDestChange(e.target.value);
            }}
            className="w-full rounded-lg border border-white/10 bg-[#121212] px-2.5 py-1.5 font-mono text-xs font-medium text-white focus:border-[#00FF9D] focus:outline-none"
          >
            {GLOBAL_ROUTERS.map((r) => (
              <option key={r.id} value={r.id} disabled={r.id === sourceId}>
                {r.name} ({r.countryCode})
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>Location: {destRouter?.country}</span>
            <span className="text-[#00FF9D]">{destRouter?.region}</span>
          </div>
        </div>
      </div>

      {/* Protocol Selection */}
      <div>
        <label className="mb-2 block font-mono text-xs font-semibold text-gray-400">
          Transmission Protocol
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(['ICMP', 'TCP', 'UDP', 'HTTPS'] as NetworkProtocol[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                cyberAudio.playClick();
                onProtocolChange(p);
              }}
              className={`rounded-lg border py-1.5 font-mono text-xs font-bold transition ${
                protocol === p
                  ? 'border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Speed Slider */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-3">
        <div className="mb-1.5 flex items-center justify-between font-mono text-xs">
          <span className="flex items-center gap-1.5 text-gray-300">
            <Sliders className="h-3.5 w-3.5 text-[#00E5FF]" />
            Simulation Speed
          </span>
          <span className="font-bold text-[#00E5FF]">{speed}x</span>
        </div>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-[#00E5FF]"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-gray-500">
          <span>0.25x (Slow Mo)</span>
          <span>1.0x (Realtime)</span>
          <span>4.0x (Turbo)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {simulationState === 'idle' || simulationState === 'completed' ? (
          <button
            onClick={handleStart}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#00FF9D]/50 bg-gradient-to-r from-[#00FF9D]/30 to-[#00E5FF]/30 py-3 font-mono text-xs font-bold text-white shadow-[0_0_20px_rgba(0,255,157,0.3)] transition hover:scale-[1.02] hover:border-[#00FF9D] active:scale-95"
          >
            <Send className="h-4 w-4 text-[#00FF9D]" />
            START SIMULATION
          </button>
        ) : (
          <button
            onClick={handlePauseToggle}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-yellow-500/50 bg-yellow-500/20 py-3 font-mono text-xs font-bold text-yellow-300 transition hover:bg-yellow-500/30"
          >
            {simulationState === 'running' ? (
              <>
                <Pause className="h-4 w-4" /> PAUSE
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> RESUME
              </>
            )}
          </button>
        )}

        <button
          onClick={handleRestart}
          title="Restart Animation"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-mono text-xs font-bold text-gray-200 transition hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>RESTART</span>
        </button>
      </div>

      {/* Status & Latency Banner */}
      <div className="mt-1 rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/10 p-3 text-center">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-gray-400">Total Latency:</span>
          <span className="text-lg font-extrabold text-[#00E5FF] shadow-sm">
            {totalLatency} <span className="text-xs font-normal">ms</span>
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-gray-300">
          <span>
            Hop Progress: {currentHopNum} / {totalHopsNum}
          </span>
          <span className="flex items-center gap-1 text-[#00FF9D]">
            {simulationState === 'completed' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Reached
              </>
            ) : simulationState === 'running' ? (
              <>
                <Zap className="h-3.5 w-3.5 animate-pulse" /> In Transit
              </>
            ) : (
              <>
                <Radio className="h-3.5 w-3.5 text-gray-400" /> Idle
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
