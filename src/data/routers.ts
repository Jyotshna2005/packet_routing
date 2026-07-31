import { RouterNode, RoutePreset } from '../types';

export const GLOBAL_ROUTERS: RouterNode[] = [
  {
    id: 'nyc',
    name: 'New York IXP',
    ip: '45.22.11.8',
    country: 'United States',
    countryCode: 'US',
    lat: 40.7128,
    lng: -74.006,
    x: 28.5,
    y: 35.5,
    region: 'North America',
    description: 'NYIIX Transatlantic Gateway Router',
    tier: 'Tier-1 Backbone'
  },
  {
    id: 'lax',
    name: 'Los Angeles POP',
    ip: '192.241.180.12',
    country: 'United States',
    countryCode: 'US',
    lat: 34.0522,
    lng: -118.2437,
    x: 18.2,
    y: 37.8,
    region: 'North America',
    description: 'Pacific Subsea Cable Terminal',
    tier: 'Tier-1 Backbone'
  },
  {
    id: 'sao',
    name: 'São Paulo Datacenter',
    ip: '177.185.200.10',
    country: 'Brazil',
    countryCode: 'BR',
    lat: -23.5505,
    lng: -46.6333,
    x: 35.8,
    y: 69.5,
    region: 'South America',
    description: 'IX.br South American Fiber Hub',
    tier: 'Regional IXP'
  },
  {
    id: 'lon',
    name: 'LondonLINX',
    ip: '185.60.216.35',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lng: -0.1278,
    x: 48.2,
    y: 28.2,
    region: 'Europe',
    description: 'London Internet Exchange Edge',
    tier: 'Tier-1 Backbone'
  },
  {
    id: 'par',
    name: 'Paris FranceIX',
    ip: '195.154.120.2',
    country: 'France',
    countryCode: 'FR',
    lat: 48.8566,
    lng: 2.3522,
    x: 49.5,
    y: 30.2,
    region: 'Europe',
    description: 'Central European Core Switch',
    tier: 'Tier-1 Backbone'
  },
  {
    id: 'fra',
    name: 'Frankfurt DE-CIX',
    ip: '185.220.101.4',
    country: 'Germany',
    countryCode: 'DE',
    lat: 50.1109,
    lng: 8.6821,
    x: 52.1,
    y: 29.1,
    region: 'Europe',
    description: 'DE-CIX World Leading Traffic Exchange',
    tier: 'Tier-1 Backbone'
  },
  {
    id: 'dxb',
    name: 'Dubai UAE-IX',
    ip: '185.120.44.12',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    lat: 25.2048,
    lng: 55.2708,
    x: 64.8,
    y: 42.5,
    region: 'Middle East',
    description: 'Middle East Submarine Relay',
    tier: 'Regional IXP'
  },
  {
    id: 'jnb',
    name: 'Johannesburg NAPAfrica',
    ip: '197.229.0.1',
    country: 'South Africa',
    countryCode: 'ZA',
    lat: -26.2041,
    lng: 28.0473,
    x: 56.5,
    y: 71.8,
    region: 'Africa',
    description: 'Sub-Saharan Backbone Interconnect',
    tier: 'Regional IXP'
  },
  {
    id: 'bom',
    name: 'Mumbai ExtremeIX',
    ip: '103.21.124.9',
    country: 'India',
    countryCode: 'IN',
    lat: 19.076,
    lng: 72.8777,
    x: 70.2,
    y: 45.2,
    region: 'South Asia',
    description: 'Indian Ocean Optical Cable Landing',
    tier: 'Regional IXP'
  },
  {
    id: 'sin',
    name: 'Singapore SGIX',
    ip: '103.28.248.1',
    country: 'Singapore',
    countryCode: 'SG',
    lat: 1.3521,
    lng: 103.8198,
    x: 78.8,
    y: 55.5,
    region: 'Southeast Asia',
    description: 'ASEAN Telecom Transit Core',
    tier: 'Tier-1 Backbone'
  },
  {
    id: 'tyo',
    name: 'Tokyo JPNAP',
    ip: '133.242.180.8',
    country: 'Japan',
    countryCode: 'JP',
    lat: 35.6762,
    lng: 139.6503,
    x: 88.5,
    y: 36.8,
    region: 'East Asia',
    description: 'Trans-Pacific High-Speed Trunk',
    tier: 'Tier-1 Backbone'
  },
  {
    id: 'syd',
    name: 'Sydney Equinix',
    ip: '139.130.4.5',
    country: 'Australia',
    countryCode: 'AU',
    lat: -33.8688,
    lng: 151.2093,
    x: 91.2,
    y: 77.2,
    region: 'Oceania',
    description: 'Australia Southern Cross Cable',
    tier: 'Edge Gateway'
  }
];

export const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: 'transatlantic',
    name: 'Transatlantic Express',
    description: 'New York ➔ London ➔ Paris ➔ Frankfurt',
    sourceId: 'nyc',
    destId: 'fra',
    protocol: 'HTTPS'
  },
  {
    id: 'transpacific',
    name: 'Transpacific Fast Lane',
    description: 'Los Angeles ➔ Tokyo ➔ Singapore ➔ Sydney',
    sourceId: 'lax',
    destId: 'syd',
    protocol: 'TCP'
  },
  {
    id: 'global-mesh',
    name: 'Global Silk Road',
    description: 'New York ➔ London ➔ Dubai ➔ Mumbai ➔ Singapore ➔ Tokyo',
    sourceId: 'nyc',
    destId: 'tyo',
    protocol: 'UDP'
  },
  {
    id: 'south-hemisphere',
    name: 'Pan-Southern Transit',
    description: 'São Paulo ➔ Johannesburg ➔ Mumbai ➔ Singapore',
    sourceId: 'sao',
    destId: 'sin',
    protocol: 'ICMP'
  }
];

export function findRouterById(id: string): RouterNode | undefined {
  return GLOBAL_ROUTERS.find((r) => r.id === id);
}

// Find a realistic multi-hop path from source to destination router
export function calculateRoute(sourceId: string, destId: string): RouterNode[] {
  const source = findRouterById(sourceId);
  const dest = findRouterById(destId);

  if (!source || !dest) return [];
  if (source.id === dest.id) return [source];

  // Adjacency graph based on geographical network cable corridors
  const connections: Record<string, string[]> = {
    nyc: ['lon', 'lax', 'sao'],
    lax: ['nyc', 'tyo', 'syd'],
    sao: ['nyc', 'jnb'],
    lon: ['nyc', 'par', 'fra', 'dxb'],
    par: ['lon', 'fra', 'dxb'],
    fra: ['lon', 'par', 'dxb'],
    dxb: ['lon', 'fra', 'bom', 'jnb'],
    jnb: ['sao', 'dxb', 'bom'],
    bom: ['dxb', 'jnb', 'sin'],
    sin: ['bom', 'tyo', 'syd'],
    tyo: ['lax', 'sin', 'syd'],
    syd: ['lax', 'sin', 'tyo']
  };

  // Breadth-first search for shortest hop path
  const queue: string[][] = [[sourceId]];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const lastNode = path[path.length - 1];

    if (lastNode === destId) {
      return path.map((id) => findRouterById(id)!);
    }

    const neighbors = connections[lastNode] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  // Fallback direct or simple path if disconnected
  return [source, dest];
}
