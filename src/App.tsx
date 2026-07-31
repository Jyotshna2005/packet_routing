import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivityLogEntry,
  HopInfo,
  NetworkMetrics,
  NetworkProtocol,
  RouterNode,
  SimulationState
} from './types';
import { GLOBAL_ROUTERS, ROUTE_PRESETS, calculateRoute, findRouterById } from './data/routers';
import { calculateDistanceKm, calculateHopLatency, getLatencyGrade } from './utils/geo';
import { cyberAudio } from './utils/audio';

import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { WorldMapVisualizer } from './components/WorldMapVisualizer';
import { HopList } from './components/HopList';
import { StatsDashboard } from './components/StatsDashboard';
import { ActivityLog } from './components/ActivityLog';
import { PacketInspectorModal } from './components/PacketInspectorModal';
import { Footer } from './components/Footer';

export default function App() {
  const [sourceId, setSourceId] = useState<string>('nyc');
  const [destId, setDestId] = useState<string>('tyo');
  const [protocol, setProtocol] = useState<NetworkProtocol>('HTTPS');
  const [speed, setSpeed] = useState<number>(1.0);

  const [simulationState, setSimulationState] = useState<SimulationState>('idle');
  const [routeNodes, setRouteNodes] = useState<RouterNode[]>([]);
  const [currentHopIndex, setCurrentHopIndex] = useState<number>(0);
  const [hopProgress, setHopProgress] = useState<number>(0);

  const [completedHops, setCompletedHops] = useState<HopInfo[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);

  // Recalculate route whenever source or destination changes
  useEffect(() => {
    const nodes = calculateRoute(sourceId, destId);
    setRouteNodes(nodes);
    setCurrentHopIndex(0);
    setHopProgress(0);
  }, [sourceId, destId]);

  // Helper to add activity log
  const addLog = useCallback(
    (type: ActivityLogEntry['type'], message: string, hopNumber?: number) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`;

      setActivityLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: timeStr,
          type,
          message,
          hopNumber
        }
      ]);
    },
    []
  );

  // Initial welcome log
  useEffect(() => {
    addLog('info', 'Cyber Network Packet Tracer v2.4 initialized.');
    addLog('info', 'Subsea fiber optics telemetry connection established.');
  }, [addLog]);

  // Simulation Animation Loop
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (simulationState !== 'running') {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setHopProgress((prev) => {
        const increment = delta * 0.85 * speed;
        const nextProgress = prev + increment;

        if (nextProgress >= 1.0) {
          // Complete current hop step
          const sourceNode = routeNodes[currentHopIndex];
          const targetNode = routeNodes[currentHopIndex + 1];

          if (targetNode) {
            const dist = calculateDistanceKm(
              sourceNode.lat,
              sourceNode.lng,
              targetNode.lat,
              targetNode.lng
            );
            const latency = calculateHopLatency(dist, speed);
            const grade = getLatencyGrade(latency);

            const now = new Date();
            const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now
              .getMinutes()
              .toString()
              .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

            setCompletedHops((prevHops) => {
              const cum = prevHops.reduce((sum, h) => sum + h.latencyMs, 0) + latency;
              const newHop: HopInfo = {
                hopNumber: prevHops.length + 1,
                router: targetNode,
                ip: targetNode.ip,
                country: targetNode.country,
                distanceKm: dist,
                latencyMs: latency,
                latencyGrade: grade,
                timestamp,
                status: 'Success',
                cumulativeLatency: cum
              };
              return [...prevHops, newHop];
            });

            addLog(
              'success',
              `Hop ${currentHopIndex + 1} completed: ${targetNode.name} [IP: ${targetNode.ip}] | Latency: ${latency} ms (${dist} km)`,
              currentHopIndex + 1
            );
          }

          // Advance to next hop or finish
          if (currentHopIndex < routeNodes.length - 2) {
            setCurrentHopIndex((idx) => idx + 1);
            return 0.0;
          } else {
            // Reached destination!
            setSimulationState('completed');
            cyberAudio.playCompletion();

            const destNode = routeNodes[routeNodes.length - 1];
            addLog(
              'success',
              `★ Destination reached successfully! Packet delivered to ${destNode.name} (${destNode.ip}).`
            );
            return 1.0;
          }
        }

        return nextProgress;
      });

      if (simulationState === 'running') {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [simulationState, speed, currentHopIndex, routeNodes, addLog]);

  // Start Simulation Handler
  const handleStart = () => {
    if (routeNodes.length <= 1) return;

    setCurrentHopIndex(0);
    setHopProgress(0);
    setCompletedHops([]);
    setSimulationState('running');

    const src = routeNodes[0];
    const dst = routeNodes[routeNodes.length - 1];

    addLog('packet', `==============================================`);
    addLog('packet', `Packet created. Protocol: ${protocol} | Size: 64B | TTL: 64`);
    addLog('info', `Leaving Source: ${src.name} [${src.ip}] -> Destination: ${dst.name} [${dst.ip}]`);
  };

  // Pause & Resume
  const handlePause = () => {
    setSimulationState('paused');
    addLog('warning', `Simulation paused at Hop ${currentHopIndex + 1}.`);
  };

  const handleResume = () => {
    setSimulationState('running');
    addLog('info', `Simulation resumed.`);
  };

  // Restart Handler
  const handleRestart = () => {
    setSimulationState('idle');
    setCurrentHopIndex(0);
    setHopProgress(0);
    setCompletedHops([]);
    addLog('info', `Route simulation reset. Ready for launch.`);
  };

  // Apply Preset Handler
  const handleApplyPreset = (presetId: string) => {
    const preset = ROUTE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSourceId(preset.sourceId);
    setDestId(preset.destId);
    setProtocol(preset.protocol);
    setSimulationState('idle');
    setCompletedHops([]);
    setCurrentHopIndex(0);
    setHopProgress(0);

    addLog('info', `Preset applied: ${preset.name} (${preset.description})`);
  };

  // Compute Metrics Summary
  const totalLatency = completedHops.reduce((sum, h) => sum + h.latencyMs, 0);
  const avgLatency = completedHops.length > 0 ? Math.round(totalLatency / completedHops.length) : 0;
  const latencies = completedHops.map((h) => h.latencyMs);
  const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
  const totalDistanceKm = completedHops.reduce((sum, h) => sum + h.distanceKm, 0);

  const metrics: NetworkMetrics = {
    totalLatency,
    avgLatency,
    minLatency,
    maxLatency,
    totalHops: Math.max(1, routeNodes.length - 1),
    completedHops: completedHops.length,
    totalDistanceKm,
    packetLoss: 0,
    networkHealth: 100,
    avgSpeedGbps: 100
  };

  const currentRouter = routeNodes[currentHopIndex] || findRouterById(sourceId);

  return (
    <div className="min-h-screen w-full bg-[#0B0B0B] text-gray-100 selection:bg-[#00E5FF] selection:text-black">
      {/* Top Cyber Header */}
      <Header
        simulationState={simulationState}
        activeProtocol={protocol}
        onOpenInspector={() => setInspectorOpen(true)}
      />

      {/* Main Content Dashboard */}
      <main className="mx-auto max-w-7xl px-4 py-4 md:px-6 space-y-4">
        {/* Top Section: Left Config Panel + Right World Map Visualizer */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left Panel (4 cols on lg) */}
          <div className="lg:col-span-4">
            <ControlPanel
              sourceId={sourceId}
              destId={destId}
              onSourceChange={(id) => {
                setSourceId(id);
                setSimulationState('idle');
                setCompletedHops([]);
              }}
              onDestChange={(id) => {
                setDestId(id);
                setSimulationState('idle');
                setCompletedHops([]);
              }}
              protocol={protocol}
              onProtocolChange={setProtocol}
              simulationState={simulationState}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onRestart={handleRestart}
              speed={speed}
              onSpeedChange={setSpeed}
              totalLatency={totalLatency}
              currentHopNum={completedHops.length}
              totalHopsNum={Math.max(1, routeNodes.length - 1)}
              onApplyPreset={handleApplyPreset}
            />
          </div>

          {/* Right Panel (8 cols on lg): Large Animated World Map */}
          <div className="lg:col-span-8">
            <WorldMapVisualizer
              routeNodes={routeNodes}
              currentHopIndex={currentHopIndex}
              hopProgress={hopProgress}
              simulationState={simulationState}
              speed={speed}
              onSelectNode={(node) => {
                addLog('info', `Inspecting Node: ${node.name} (${node.ip}) - Tier: ${node.tier}`);
              }}
            />
          </div>
        </div>

        {/* Middle Section: Metrics Dashboard */}
        <StatsDashboard
          metrics={metrics}
          currentRouter={currentRouter}
          simulationState={simulationState}
        />

        {/* Bottom Section: Hop Information Telemetry + Terminal Activity Logs */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <HopList
              completedHops={completedHops}
              currentHopIndex={currentHopIndex}
              totalHops={Math.max(1, routeNodes.length - 1)}
            />
          </div>
          <div className="lg:col-span-5">
            <ActivityLog
              logs={activityLogs}
              onClearLogs={() => setActivityLogs([])}
            />
          </div>
        </div>
      </main>

      {/* Footer with Developer Name & Latency Color Legend */}
      <Footer />

      {/* Packet DPI Inspector Modal */}
      <PacketInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        protocol={protocol}
        sourceRouter={findRouterById(sourceId)}
        destRouter={findRouterById(destId)}
      />
    </div>
  );
}
