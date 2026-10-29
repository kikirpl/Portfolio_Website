// World layout and camera framing. Pure functions only: everything here is recomputed
// from the project aspects and the viewport, so the scene adapts to any screen.
import { Vector3 } from 'three';

export interface Pose {
  pos: Vector3;
  target: Vector3;
}

export interface Viewport {
  aspect: number;
  /** Vertical field of view in degrees. */
  fov: number;
}

export const WORLD = {
  hero: { center: new Vector3(0, 2.55, 0), ringRadius: 3.4, ringScreenHeight: 0.74, tilt: 0.24 },
  gallery: { startZ: -18, spacing: 9, sideX: 2.7, y: 1.95, height: 1.9, yaw: 0.52 },
  gates: { gap: 18, spacing: 9, width: 4.6, height: 3.5 },
  beacon: { gap: 14, radius: 2.3, y: 2.7 },
};

export interface ScreenSlot {
  index: number;
  position: Vector3;
  rotationY: number;
  normal: Vector3;
  width: number;
  height: number;
  /** 1 = right-hand side of the corridor, -1 = left. */
  side: 1 | -1;
}

export interface World {
  slots: ScreenSlot[];
  gates: { index: number; z: number }[];
  beacon: Vector3;
  /** Corridor extent along z, used for the floor and particles. */
  zMin: number;
  zMax: number;
}

export function buildWorld(aspects: number[], gateCount: number): World {
  const g = WORLD.gallery;
  const slots: ScreenSlot[] = aspects.map((aspect, index) => {
    const side = (index % 2 === 0 ? 1 : -1) as 1 | -1;
    const rotationY = -side * g.yaw;
    return {
      index,
      side,
      rotationY,
      height: g.height,
      width: g.height * aspect,
      position: new Vector3(side * g.sideX, g.y, g.startZ - index * g.spacing),
      normal: new Vector3(Math.sin(rotationY), 0, Math.cos(rotationY)),
    };
  });
  const lastZ = slots.length ? slots[slots.length - 1].position.z : g.startZ;
  const gates = Array.from({ length: gateCount }, (_, index) => ({
    index,
    z: lastZ - WORLD.gates.gap - index * WORLD.gates.spacing,
  }));
  const lastGateZ = gates.length ? gates[gates.length - 1].z : lastZ;
  const beacon = new Vector3(0, WORLD.beacon.y, lastGateZ - WORLD.beacon.gap);
  return { slots, gates, beacon, zMin: beacon.z - 24, zMax: 18 };
}

export const isTall = (vp: Viewport) => vp.aspect < 0.85;

export function fovFor(aspect: number) {
  if (aspect < 0.85) return 56;
  if (aspect < 1.25) return 47;
  return 40;
}

const UP = new Vector3(0, 1, 0);

interface FrameOptions {
  /** Fraction of the viewport height the object should fill. */
  fill: number;
  /** Upper bound on the fraction of the viewport width it may fill. */
  maxFillW?: number;
  /** Where the object's centre lands, in normalised device coordinates. */
  ox?: number;
  oy?: number;
}

/**
 * Pose that shows a w×h object centred at `center`, seen from direction `dir`,
 * at the requested size and screen position. Camera and target are shifted
 * together, so the object moves on screen without changing perspective.
 */
export function frame(center: Vector3, dir: Vector3, w: number, h: number, vp: Viewport, o: FrameOptions): Pose {
  const tanV = Math.tan((vp.fov * Math.PI) / 360);
  const tanH = tanV * vp.aspect;
  const d = Math.max(h / o.fill / (2 * tanV), w / (o.maxFillW ?? 1) / (2 * tanH));
  const back = dir.clone().normalize();
  const forward = back.clone().negate();
  const right = new Vector3().crossVectors(forward, UP).normalize();
  const up = new Vector3().crossVectors(right, forward).normalize();
  const shift = right
    .multiplyScalar(-(o.ox ?? 0) * d * tanH)
    .add(up.multiplyScalar(-(o.oy ?? 0) * d * tanV));
  return {
    pos: center.clone().addScaledVector(back, d).add(shift),
    target: center.clone().add(shift),
  };
}

function look(pos: [number, number, number], target: [number, number, number]): Pose {
  return { pos: new Vector3(...pos), target: new Vector3(...target) };
}

const HERO_WIDTH = 2 * (WORLD.hero.ringRadius + 0.85);

/** Camera pose for a scroll stop (see data-stop attributes in the page). */
export function stopPose(key: string, world: World, vp: Viewport): Pose {
  const tall = isTall(vp);
  const [name, arg] = key.split(':');
  const index = Number(arg);
  const g = WORLD.gallery;
  switch (name) {
    case 'hero':
      return frame(WORLD.hero.center, new Vector3(0, 0.2, 1), HERO_WIDTH, 3.7, vp,
        tall ? { fill: 0.5, maxFillW: 1.45, oy: 0.5 } : { fill: 0.62, maxFillW: 0.44, ox: 0.38 });
    case 'about':
      return frame(WORLD.hero.center, new Vector3(-0.62, 0.7, 0.55), HERO_WIDTH, HERO_WIDTH * 0.7, vp,
        tall ? { fill: 0.4, maxFillW: 1.05, oy: 0.36 } : { fill: 0.6, maxFillW: 0.42, ox: -0.4 });
    case 'projects':
      return tall
        ? look([0, 8.2, g.startZ + 15], [0, 1.2, g.startZ - 16])
        : look([0, 6.6, g.startZ + 13], [0, 1.5, g.startZ - 13]);
    case 'project': {
      const slot = world.slots[index];
      if (!slot) break;
      const dir = slot.normal.clone().setY(0.1);
      return frame(slot.position, dir, slot.width, slot.height, vp,
        tall
          ? { fill: 0.34, maxFillW: 0.86, oy: 0.32 }
          : { fill: 0.5, maxFillW: 0.46, ox: slot.side > 0 ? 0.36 : -0.4 });
    }
    case 'experience': {
      const z = world.gates[0]?.z ?? g.startZ;
      return tall ? look([0, 3.1, z + 11], [0, 1.9, z - 12]) : look([0, 2.8, z + 9], [0, 1.9, z - 12]);
    }
    case 'exp': {
      const gate = world.gates[index];
      if (!gate) break;
      const c = new Vector3(0, WORLD.gates.height / 2 + 0.1, gate.z);
      return frame(c, new Vector3(0, 0.06, 1), WORLD.gates.width, WORLD.gates.height, vp,
        tall ? { fill: 0.5, maxFillW: 1.1, oy: 0.3 } : { fill: 0.66, maxFillW: 0.4, ox: 0.35 });
    }
    case 'contact': {
      const size = 2 * WORLD.beacon.radius + 0.8;
      return frame(world.beacon, new Vector3(0, 0.12, 1), size, size, vp,
        tall ? { fill: 0.34, maxFillW: 0.85, oy: 0.3 } : { fill: 0.6, maxFillW: 0.4, ox: 0.35 });
    }
  }
  return look([0, 2, 12], [0, 2, 0]);
}

/** Close-up used while a project is open in the detail view. */
export function detailPose(slot: ScreenSlot, vp: Viewport): Pose {
  return isTall(vp)
    ? frame(slot.position, slot.normal, slot.width, slot.height, vp, { fill: 0.3, maxFillW: 0.9, oy: 0.5 })
    : frame(slot.position, slot.normal, slot.width, slot.height, vp, { fill: 0.82, maxFillW: 0.52, ox: -0.38 });
}

/** Ease with zero velocity at both stops, so the camera settles while a panel is read. */
export const settle = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
