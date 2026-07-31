import React, { useRef, useEffect } from 'react';
import { ActivityLogEntry } from '../types';
import { Terminal, Trash2, Copy, Check } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

interface ActivityLogProps {
  logs: ActivityLogEntry[];
  onClearLogs: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs, onClearLogs }) => {
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Auto-scroll on new log entry
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    cyberAudio.playClick();
    const text = logs.map((l) => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#00E5FF]/20 bg-[#0B0B0B]/80 p-4 backdrop-blur-md">
      {/* Log Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#00E5FF]" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            System Terminal & Activity Log
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            title="Copy logs"
            className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check className="h-3 w-3 text-[#00FF9D]" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => {
              cyberAudio.playClick();
              onClearLogs();
            }}
            title="Clear logs"
            className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-gray-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Log Terminal Window */}
      <div
        ref={logContainerRef}
        className="flex max-h-[160px] flex-col gap-1 overflow-y-auto rounded-xl border border-white/10 bg-black/80 p-3 font-mono text-[11px] leading-relaxed text-gray-300"
      >
        {logs.length === 0 ? (
          <span className="text-gray-600 italic">&gt; Activity log empty...</span>
        ) : (
          logs.map((log) => {
            let textColor = 'text-gray-300';
            if (log.type === 'success') textColor = 'text-[#00FF9D] font-semibold';
            if (log.type === 'warning') textColor = 'text-yellow-400';
            if (log.type === 'error') textColor = 'text-red-400 font-semibold';
            if (log.type === 'packet') textColor = 'text-[#00E5FF]';

            return (
              <div key={log.id} className="flex items-start gap-2">
                <span className="text-gray-600">[{log.timestamp}]</span>
                <span className={textColor}>&gt; {log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
