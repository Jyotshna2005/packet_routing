export type NetworkProtocol = 'ICMP' | 'TCP' | 'UDP' | 'HTTPS';

export interface RouterNode {
  id: string;
  name: string;
  ip: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  x: number; // percentage coordinate on SVG map (0-100)
  y: number; // percentage coordinate on SVG map (0-100)
  region: string;
  description: string;
  tier: 'Tier-1 Backbone' | 'Regional IXP' | 'Edge Gateway' | 'Datacenter';
}

export type LatencyGrade = 'fast' | 'medium' | 'slow';

export interface HopInfo {
  hopNumber: number;
  router: RouterNode;
  ip: string;
  country: string;
  distanceKm: number;
  latencyMs: number;
  latencyGrade: LatencyGrade;
  timestamp: string;
  status: 'Success' | 'Queued' | 'Jitter' | 'Inspected';
  cumulativeLatency: number;
}

export type SimulationState = 'idle' | 'running' | 'paused' | 'completed';

export interface RoutePreset {
  id: string;
  name: string;
  description: string;
  sourceId: string;
  destId: string;
  protocol: NetworkProtocol;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'packet';
  message: string;
  hopNumber?: number;
}

export interface NetworkMetrics {
  totalLatency: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  totalHops: number;
  completedHops: number;
  totalDistanceKm: number;
  packetLoss: number;
  networkHealth: number;
  avgSpeedGbps: number;
}
