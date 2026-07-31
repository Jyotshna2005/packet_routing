import { LatencyGrade, RouterNode } from '../types';

// Calculate distance in kilometers using the Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Calculate realistic latency for a hop based on physical distance
export function calculateHopLatency(distanceKm: number, speedMultiplier: number = 1): number {
  if (distanceKm === 0) return Math.floor(Math.random() * 3) + 2; // local loopback (2-4ms)

  if (distanceKm < 400) {
    // Short / Intra-city Hop (<20ms = GREEN)
    return Math.floor(Math.random() * 10) + 8;
  } else if (distanceKm < 3000) {
    // Medium / Regional Hop (20-70ms = YELLOW)
    return Math.floor(Math.random() * 40) + 25;
  } else {
    // Long / Subsea Transoceanic Hop (>70ms = RED)
    return Math.floor(Math.random() * 70) + 75;
  }
}

// Grade latency according to user prompt requirement:
// Green: Fast (<20ms)
// Yellow: Medium (20-70ms)
// Red: High (>70ms)
export function getLatencyGrade(latencyMs: number): LatencyGrade {
  if (latencyMs < 20) return 'fast';
  if (latencyMs <= 70) return 'medium';
  return 'slow';
}

export function getLatencyColorHex(grade: LatencyGrade): string {
  switch (grade) {
    case 'fast':
      return '#00FF9D'; // Neon Green
    case 'medium':
      return '#FFD700'; // Neon Yellow
    case 'slow':
      return '#FF3366'; // Neon Red/Pink
  }
}

// Generates an SVG curved Path string between two percentage-based router nodes (x1,y1) -> (x2,y2)
export function getCurvedPathD(
  n1: { x: number; y: number },
  n2: { x: number; y: number },
  curvature: number = 0.25
): string {
  const dx = n2.x - n1.x;
  const dy = n2.y - n1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular offset for organic arch curvature
  const nx = -dy / dist;
  const ny = dx / dist;

  // Midpoint with curve offset
  const midX = (n1.x + n2.x) / 2 + nx * dist * curvature;
  const midY = (n1.y + n2.y) / 2 + ny * dist * curvature;

  return `M ${n1.x} ${n1.y} Q ${midX} ${midY} ${n2.x} ${n2.y}`;
}

// Compute point on Quadratic Bezier curve at t (0 <= t <= 1)
export function getQuadraticPoint(
  n1: { x: number; y: number },
  n2: { x: number; y: number },
  curvature: number,
  t: number
): { x: number; y: number } {
  const dx = n2.x - n1.x;
  const dy = n2.y - n1.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const nx = -dy / dist;
  const ny = dx / dist;

  const controlX = (n1.x + n2.x) / 2 + nx * dist * curvature;
  const controlY = (n1.y + n2.y) / 2 + ny * dist * curvature;

  const invT = 1 - t;
  const x = invT * invT * n1.x + 2 * invT * t * controlX + t * t * n2.x;
  const y = invT * invT * n1.y + 2 * invT * t * controlY + t * t * n2.y;

  return { x, y };
}
