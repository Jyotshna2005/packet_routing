import React from 'react';
import { NetworkProtocol, RouterNode } from '../types';
import { X, Shield, Cpu, Lock, Terminal } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

interface PacketInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: NetworkProtocol;
  sourceRouter?: RouterNode;
  destRouter?: RouterNode;
}

export const PacketInspectorModal: React.FC<PacketInspectorModalProps> = ({
  isOpen,
  onClose,
  protocol,
  sourceRouter,
  destRouter
}) => {
  if (!isOpen) return null;

  const hexPayload =
    '4500 003c 1c2d 4000 4006 b1e6 2d16 0b08 00e5 ff00 0102 0304 0506 0708 090a 0b0c 0d0e 0f10 1112 1314 1516 1718 191a 1b1c 1d1e 1f20';

  const asciiPayload = 'CYBER_PACKET_HEADER_SIGNATURE_OK_TTL_64_OPTIC_GLASS_FIBER_BACKBONE_2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#00E5FF]/40 bg-[#0B0B0B] p-5 shadow-[0_0_40px_rgba(0,229,255,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#00E5FF]" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-white uppercase">
              Deep Packet Inspection (DPI)
            </h3>
          </div>
          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Packet Headers Table */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded-xl border border-white/10 bg-black/60 p-2.5">
            <span className="text-gray-400 block text-[10px]">Version / IHL</span>
            <span className="font-bold text-white">IPv4 / 20 Bytes</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-2.5">
            <span className="text-gray-400 block text-[10px]">Protocol</span>
            <span className="font-bold text-[#00E5FF]">{protocol}</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-2.5">
            <span className="text-gray-400 block text-[10px]">Initial TTL</span>
            <span className="font-bold text-[#00FF9D]">64 Hops</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-2.5">
            <span className="text-gray-400 block text-[10px]">Header Checksum</span>
            <span className="font-bold text-yellow-400">0xB1E6 (Valid)</span>
          </div>
        </div>

        {/* Addresses */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 font-mono text-xs">
          <div className="rounded-xl border border-white/10 bg-black/60 p-3">
            <span className="text-gray-400 block text-[10px]">Source Address</span>
            <div className="font-bold text-[#00E5FF]">{sourceRouter?.ip || '45.22.11.8'}</div>
            <span className="text-[10px] text-gray-400">{sourceRouter?.name} ({sourceRouter?.country})</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-3">
            <span className="text-gray-400 block text-[10px]">Destination Address</span>
            <div className="font-bold text-[#00FF9D]">{destRouter?.ip || '185.220.101.4'}</div>
            <span className="text-[10px] text-gray-400">{destRouter?.name} ({destRouter?.country})</span>
          </div>
        </div>

        {/* Hex Payload Dump */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between font-mono text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-[#00E5FF]" />
              Payload Hex Dump
            </span>
            <span className="text-[10px] text-[#00FF9D]">Payload Size: 64 Bytes</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/90 p-3 font-mono text-[11px] text-[#00E5FF] tracking-wider leading-relaxed">
            {hexPayload}
          </div>
        </div>

        {/* ASCII Payload Dump */}
        <div className="mt-3">
          <span className="text-gray-400 block font-mono text-xs mb-1">ASCII Decoding</span>
          <div className="rounded-xl border border-white/10 bg-black/90 p-3 font-mono text-xs text-[#00FF9D] break-all">
            {asciiPayload}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-gray-400">
          <span className="flex items-center gap-1 text-[#00FF9D]">
            <Lock className="h-3.5 w-3.5" /> End-to-End Encryption OK
          </span>
          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="rounded-xl border border-[#00E5FF]/40 bg-[#00E5FF]/20 px-4 py-2 font-bold text-[#00E5FF] hover:bg-[#00E5FF]/30"
          >
            CLOSE INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
};
