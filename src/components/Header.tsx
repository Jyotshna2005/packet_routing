import React, { useState, useEffect } from 'react';
import { Activity, Shield, Volume2, VolumeX, Cpu, Radio, Network } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

interface HeaderProps {
  simulationState: string;
  activeProtocol: string;
  onOpenInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  simulationState,
  activeProtocol,
  onOpenInspector
}) => {
  const [soundOn, setSoundOn] = useState(true);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    cyberAudio.soundEnabled = next;
    if (next) cyberAudio.playClick();
  };

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="relative z-20 w-full border-b border-[#00E5FF]/20 bg-[#0B0B0B]/90 backdrop-blur-md px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Network className="h-6 w-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#00FF9D] shadow-[0_0_8px_#00FF9D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-lg font-bold tracking-wider text-white md:text-xl">
                PACKET<span className="text-[#00E5FF]">TRACER</span>
              </h1>
              <span className="rounded-md border border-[#8A2BE2]/40 bg-[#8A2BE2]/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#8A2BE2]">
                v2.4 CYBER
              </span>
            </div>
            <p className="font-mono text-xs text-gray-400">
              Subsea Optical Fiber & Global Routing Visualizer
            </p>
          </div>
        </div>

        {/* Center Live Stats Bar */}
        <div className="hidden items-center gap-6 rounded-lg border border-white/10 bg-black/40 px-4 py-1.5 font-mono text-xs md:flex">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-[#00FF9D] animate-pulse" />
            <span className="text-gray-400">Status:</span>
            <span
              className={`font-semibold ${
                simulationState === 'running'
                  ? 'text-[#00E5FF] animate-pulse'
                  : simulationState === 'completed'
                  ? 'text-[#00FF9D]'
                  : simulationState === 'paused'
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              {simulationState.toUpperCase()}
            </span>
          </div>

          <div className="h-3 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-[#00E5FF]" />
            <span className="text-gray-400">Protocol:</span>
            <span className="font-bold text-[#00E5FF]">{activeProtocol}</span>
          </div>

          <div className="h-3 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-gray-400">Uptime:</span>
            <span className="text-gray-200">{formatUptime(uptimeSeconds)}</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 rounded-lg border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-3 py-1.5 font-mono text-xs font-semibold text-[#00E5FF] transition hover:bg-[#00E5FF]/20 hover:shadow-[0_0_12px_rgba(0,229,255,0.3)]"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Packet</span> Inspector
          </button>

          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute Cyber Audio' : 'Enable Cyber Audio'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition hover:border-[#00E5FF]/50 hover:bg-white/10 hover:text-[#00E5FF]"
          >
            {soundOn ? <Volume2 className="h-4 w-4 text-[#00FF9D]" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
