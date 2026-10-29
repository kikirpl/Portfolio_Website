// Quality tiers. The starting tier is guessed from the device; PerformanceMonitor then
// steps it down (or back up, never above the start) based on measured frame rate.
import type { QualityTier } from '../lib/types';

export interface TierSettings {
  dpr: [number, number];
  reflections: boolean;
  shadows: boolean;
  shadowMapSize: number;
  post: boolean;
  msaa: number;
  particles: number;
  texture: 'sm' | 'md';
  envResolution: number;
  pointerLight: boolean;
}

export const TIERS: Record<QualityTier, TierSettings> = {
  high: {
    dpr: [1, 1.75],
    reflections: true,
    shadows: true,
    shadowMapSize: 1024,
    post: true,
    msaa: 4,
    particles: 1400,
    texture: 'md',
    envResolution: 256,
    pointerLight: true,
  },
  medium: {
    dpr: [1, 1.5],
    reflections: false,
    shadows: true,
    shadowMapSize: 1024,
    post: true,
    msaa: 0,
    particles: 800,
    texture: 'md',
    envResolution: 128,
    pointerLight: true,
  },
  low: {
    dpr: [1, 1],
    reflections: false,
    shadows: false,
    shadowMapSize: 512,
    post: false,
    msaa: 0,
    particles: 360,
    texture: 'sm',
    envResolution: 64,
    pointerLight: false,
  },
};

export const ORDER: QualityTier[] = ['low', 'medium', 'high'];

export function initialTier(): QualityTier {
  const forced = new URLSearchParams(location.search).get('quality');
  if (forced === 'low' || forced === 'medium' || forced === 'high') return forced;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const handheld = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900;
  if (cores <= 2 || memory <= 2) return 'low';
  if (handheld) return cores <= 4 || memory <= 3 ? 'low' : 'medium';
  return cores <= 4 ? 'medium' : 'high';
}
