import React, { useRef, useEffect, useState } from 'react';
import { RouterNode, SimulationState } from '../types';
import { GLOBAL_ROUTERS } from '../data/routers';
import { getCurvedPathD, getQuadraticPoint } from '../utils/geo';
import { cyberAudio } from '../utils/audio';
import { ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';

interface WorldMapVisualizerProps {
  routeNodes: RouterNode[];
  currentHopIndex: number;
  hopProgress: number; // 0 to 1 between routeNodes[currentHopIndex] and routeNodes[currentHopIndex + 1]
  simulationState: SimulationState;
  speed: number;
  onSelectNode?: (node: RouterNode) => void;
}

// Simplified continent outlines in normalized SVG coordinates (0 to 1000 x 0 to 500)
// For a high-resolution dark vector world map look.
const CONTINENT_PATHS = [
  // North America
  "M 150,110 L 220,90 L 290,110 L 320,180 L 280,240 L 220,250 L 180,210 L 130,170 Z",
  // South America
  "M 290,270 L 350,290 L 380,360 L 330,440 L 280,380 L 270,310 Z",
  // Europe
  "M 450,110 L 530,100 L 570,160 L 510,210 L 440,180 Z",
  // Africa
  "M 460,210 L 560,200 L 600,280 L 570,390 L 490,380 L 450,280 Z",
  // Asia
  "M 570,100 L 820,90 L 890,180 L 810,280 L 710,270 L 600,220 Z",
  // Australia
  "M 780,330 L 880,320 L 910,390 L 820,410 Z",
  // Greenland
  "M 330,50 L 410,40 L 430,80 L 360,95 Z"
];

export const WorldMapVisualizer: React.FC<WorldMapVisualizerProps> = ({
  routeNodes,
  currentHopIndex,
  hopProgress,
  simulationState,
  onSelectNode
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoveredNode, setHoveredNode] = useState<RouterNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Burst particles effect list
  const burstParticlesRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; alpha: number; color: string; size: number }>
  >([]);

  // Background floating ambient particles
  const bgParticlesRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number }>
  >([]);

  // Packet trailing points memory
  const trailRef = useRef<Array<{ x: number; y: number; alpha: number }>>([]);

  // Initialize background floating particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        alpha: Math.random() * 0.5 + 0.2,
        size: Math.random() * 2 + 1
      });
    }
    bgParticlesRef.current = particles;
  }, []);

  // Trigger burst particles when reaching a router
  useEffect(() => {
    if (simulationState === 'running' && hopProgress >= 0.98 && routeNodes[currentHopIndex + 1]) {
      const target = routeNodes[currentHopIndex + 1];
      const bursts = [];
      const colors = ['#00E5FF', '#00FF9D', '#8A2BE2', '#FFFFFF'];
      for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1;
        bursts.push({
          x: target.x,
          y: target.y,
          vx: Math.cos(angle) * speed * 0.15,
          vy: Math.sin(angle) * speed * 0.15,
          alpha: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 1.5
        });
      }
      burstParticlesRef.current.push(...bursts);
      cyberAudio.playHopHit(true);
    }
  }, [currentHopIndex, hopProgress, routeNodes, simulationState]);

  // Main Canvas Animation Loop (Particles, Trail, Packet motion glow)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Handle canvas resizing
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      // Draw background floating stars / particles
      bgParticlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;

        const px = (p.x / 100) * width;
        const py = (p.y / 100) * height;

        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Calculate exact current packet location if running or paused in route
      let packetPos: { x: number; y: number } | null = null;
      if (
        routeNodes.length > 1 &&
        currentHopIndex < routeNodes.length - 1 &&
        (simulationState === 'running' || simulationState === 'paused')
      ) {
        const n1 = routeNodes[currentHopIndex];
        const n2 = routeNodes[currentHopIndex + 1];
        packetPos = getQuadraticPoint(n1, n2, 0.2, hopProgress);

        // Append to trail
        trailRef.current.push({ x: packetPos.x, y: packetPos.y, alpha: 1.0 });
        if (trailRef.current.length > 25) {
          trailRef.current.shift();
        }
      } else {
        trailRef.current = [];
      }

      // Render Packet Particle Trail
      trailRef.current.forEach((t, i) => {
        t.alpha -= 0.03;
        if (t.alpha <= 0) return;

        const tx = (t.x / 100) * width;
        const ty = (t.y / 100) * height;
        const radius = (i / trailRef.current.length) * 5 + 1;

        ctx.fillStyle = `rgba(0, 229, 255, ${t.alpha * 0.7})`;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(tx, ty, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Packet glowing orb
      if (packetPos) {
        const px = (packetPos.x / 100) * width;
        const py = (packetPos.y / 100) * height;

        // Outer glow
        const gradient = ctx.createRadialGradient(px, py, 2, px, py, 18);
        gradient.addColorStop(0, 'rgba(0, 255, 157, 1)');
        gradient.addColorStop(0.4, 'rgba(0, 229, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fill();

        // Core bright white circle
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00FF9D';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render Burst Particles
      for (let i = burstParticlesRef.current.length - 1; i >= 0; i--) {
        const p = burstParticlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          burstParticlesRef.current.splice(i, 1);
          continue;
        }

        const px = (p.x / 100) * width;
        const py = (p.y / 100) * height;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [routeNodes, currentHopIndex, hopProgress, simulationState]);

  // Pan & Drag map handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Helper to determine if a node is part of active path or visited
  const isVisitedNode = (nodeId: string) => {
    if (!routeNodes || routeNodes.length === 0) return false;
    const index = routeNodes.findIndex((n) => n.id === nodeId);
    return index >= 0 && index <= currentHopIndex;
  };

  const isCurrentActiveNode = (nodeId: string) => {
    if (!routeNodes || routeNodes.length === 0) return false;
    return routeNodes[currentHopIndex]?.id === nodeId;
  };

  const isDestinationNode = (nodeId: string) => {
    if (!routeNodes || routeNodes.length === 0) return false;
    return routeNodes[routeNodes.length - 1]?.id === nodeId;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative h-[480px] w-full overflow-hidden rounded-2xl border border-[#00E5FF]/30 bg-[#05070A] shadow-[0_0_30px_rgba(0,0,0,0.9)] lg:h-[580px] ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Animated Matrix Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(#00E5FF 1px, transparent 1px), radial-gradient(#8A2BE2 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px'
        }}
      />

      {/* Map Control Buttons overlay */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 rounded-xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
          title="Zoom In"
          className="rounded-lg p-1.5 text-gray-300 transition hover:bg-[#00E5FF]/20 hover:text-[#00E5FF]"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.25))}
          title="Zoom Out"
          className="rounded-lg p-1.5 text-gray-300 transition hover:bg-[#00E5FF]/20 hover:text-[#00E5FF]"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset Map View"
          className="rounded-lg p-1.5 text-gray-300 transition hover:bg-[#00FF9D]/20 hover:text-[#00FF9D]"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Map Legend & Active Route Badge */}
      <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2.5 rounded-xl border border-white/10 bg-black/80 px-3.5 py-2 font-mono text-xs text-gray-300 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-1.5 font-bold text-[#00E5FF]">
          <Layers className="h-4 w-4 text-[#00E5FF]" />
          <span>Subsea Core</span>
        </div>

        <div className="flex items-center gap-2 border-l border-white/20 pl-2.5 text-[11px]">
          <span className="flex items-center gap-1" title="Fast (<20ms)">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00FF9D] shadow-[0_0_6px_#00FF9D]" />
            <span className="text-[#00FF9D] font-bold">&lt;20ms</span>
          </span>

          <span className="flex items-center gap-1" title="Medium (20-70ms)">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_#FFD700]" />
            <span className="text-[#FFD700] font-bold">20-70ms</span>
          </span>

          <span className="flex items-center gap-1" title="Slow (>70ms)">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF3366] shadow-[0_0_6px_#FF3366]" />
            <span className="text-[#FF3366] font-bold">&gt;70ms</span>
          </span>
        </div>
      </div>

      {/* Map Transformer Layer */}
      <div
        className="relative h-full w-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}
      >
        {/* SVG World Vector Map & Cable Lines */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Glowing SVG Filters */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="active-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#00FF9D" />
              <stop offset="100%" stopColor="#8A2BE2" />
            </linearGradient>
          </defs>

          {/* Latitude & Longitude Subtle Grid */}
          <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="3,3">
            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
              <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="500" />
            ))}
            {[100, 200, 300, 400].map((y) => (
              <line key={`h-${y}`} x1="0" y1={y} x2="1000" y2={y} />
            ))}
          </g>

          {/* Continent Landmass Vectors */}
          <g fill="rgba(15, 23, 42, 0.7)" stroke="rgba(0, 229, 255, 0.15)" strokeWidth="1.2">
            {CONTINENT_PATHS.map((path, idx) => (
              <path key={idx} d={path} />
            ))}
          </g>

          {/* Background Inter-router Subsea Mesh Cables */}
          <g stroke="rgba(0, 229, 255, 0.12)" strokeWidth="1" fill="none" strokeDasharray="2,4">
            {GLOBAL_ROUTERS.map((r1, i) =>
              GLOBAL_ROUTERS.slice(i + 1).map((r2) => {
                const dist = Math.hypot(r1.x - r2.x, r1.y - r2.y);
                if (dist > 35) return null; // Only connect reasonably close regional neighbors
                const n1 = { x: r1.x * 10, y: r1.y * 5 };
                const n2 = { x: r2.x * 10, y: r2.y * 5 };
                return <path key={`${r1.id}-${r2.id}`} d={getCurvedPathD(n1, n2, 0.15)} />;
              })
            )}
          </g>

          {/* Active Simulation Route Lines */}
          {routeNodes.length > 1 &&
            routeNodes.map((node, i) => {
              if (i >= routeNodes.length - 1) return null;
              const nextNode = routeNodes[i + 1];
              const n1 = { x: node.x * 10, y: node.y * 5 };
              const n2 = { x: nextNode.x * 10, y: nextNode.y * 5 };
              const pathD = getCurvedPathD(n1, n2, 0.2);

              const isCompletedSegment = i < currentHopIndex;
              const isCurrentActiveSegment = i === currentHopIndex && simulationState === 'running';

              return (
                <g key={`route-segment-${i}`}>
                  {/* Underlay glow */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      isCompletedSegment
                        ? '#00FF9D'
                        : isCurrentActiveSegment
                        ? '#00E5FF'
                        : 'rgba(255, 255, 255, 0.15)'
                    }
                    strokeWidth={isCompletedSegment || isCurrentActiveSegment ? '3' : '1.5'}
                    opacity={isCompletedSegment || isCurrentActiveSegment ? '0.9' : '0.4'}
                    filter="url(#glow-cyan)"
                  />
                  {/* Animated flowing line dash for active segment */}
                  {isCurrentActiveSegment && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#active-line-grad)"
                      strokeWidth="3.5"
                      strokeDasharray="8,8"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}

          {/* Render All Router Nodes */}
          {GLOBAL_ROUTERS.map((router) => {
            const cx = router.x * 10;
            const cy = router.y * 5;
            const visited = isVisitedNode(router.id);
            const active = isCurrentActiveNode(router.id);
            const dest = isDestinationNode(router.id);

            return (
              <g
                key={router.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectNode && onSelectNode(router)}
                onMouseEnter={() => setHoveredNode(router)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Radar pulse outer animation for active node */}
                {active && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="16"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Outer Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={active || dest ? '10' : '7'}
                  fill={
                    active
                      ? 'rgba(0, 229, 255, 0.3)'
                      : visited
                      ? 'rgba(0, 255, 157, 0.25)'
                      : dest
                      ? 'rgba(138, 43, 226, 0.3)'
                      : 'rgba(15, 23, 42, 0.8)'
                  }
                  stroke={
                    active
                      ? '#00E5FF'
                      : visited
                      ? '#00FF9D'
                      : dest
                      ? '#8A2BE2'
                      : 'rgba(0, 229, 255, 0.4)'
                  }
                  strokeWidth={active ? '2.5' : '1.5'}
                  filter={active || visited ? 'url(#glow-green)' : undefined}
                />

                {/* Center Core Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? '4.5' : '3'}
                  fill={active ? '#FFFFFF' : visited ? '#00FF9D' : dest ? '#8A2BE2' : '#00E5FF'}
                />

                {/* Router Label */}
                <text
                  x={cx}
                  y={cy + 18}
                  textAnchor="middle"
                  fill={active ? '#00E5FF' : visited ? '#00FF9D' : '#94A3B8'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={active || visited ? 'bold' : 'normal'}
                >
                  {router.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* HTML Particle Overlay Canvas */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div
          className="pointer-events-none absolute z-40 rounded-xl border border-[#00E5FF]/40 bg-black/90 p-3 font-mono text-xs text-white shadow-[0_0_15px_rgba(0,229,255,0.4)] backdrop-blur-md"
          style={{
            left: `${Math.min(80, hoveredNode.x)}%`,
            top: `${Math.max(10, hoveredNode.y - 12)}%`
          }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 pb-1 font-bold text-[#00E5FF]">
            <span className="h-2 w-2 rounded-full bg-[#00FF9D]" />
            {hoveredNode.name}
          </div>
          <div className="mt-1.5 space-y-0.5 text-[11px] text-gray-300">
            <p>IP Address: <span className="text-[#00FF9D]">{hoveredNode.ip}</span></p>
            <p>Country: {hoveredNode.country}</p>
            <p>Region: {hoveredNode.region}</p>
            <p className="text-[10px] text-gray-400 italic mt-1">{hoveredNode.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
