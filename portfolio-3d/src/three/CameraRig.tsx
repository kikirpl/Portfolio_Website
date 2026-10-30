// The camera follows the page: each scroll stop measured from the DOM has a pose in the
// world, and the camera travels between them as the visitor scrolls. Opening a project
// flies it to that screen; closing flies it back. The pointer adds a little parallax.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from 'zustand';
import { easing } from 'maath';
import { Vector3, type PerspectiveCamera } from 'three';
import { detailPose, fovFor, settle, stopPose, type Pose, type World } from './layout';
import { live, store } from '../lib/store';

interface PlacedStop {
  key: string;
  y: number;
  pose: Pose;
}

function sample(stops: PlacedStop[], y: number, out: Pose) {
  const first = stops[0];
  if (y <= first.y) {
    out.pos.copy(first.pose.pos);
    out.target.copy(first.pose.target);
    return;
  }
  for (let k = 0; k < stops.length - 1; k++) {
    const a = stops[k];
    const b = stops[k + 1];
    if (y > b.y) continue;
    const span = b.y - a.y;
    const t = span > 0 ? settle(Math.min(1, Math.max(0, (y - a.y) / span))) : 1;
    out.pos.lerpVectors(a.pose.pos, b.pose.pos, t);
    out.target.lerpVectors(a.pose.target, b.pose.target, t);
    // Between two screens the camera lifts slightly, like a dolly on a crane.
    if (a.key.startsWith('project:') && b.key.startsWith('project:')) out.pos.y += Math.sin(Math.PI * t) * 0.45;
    return;
  }
  const last = stops[stops.length - 1];
  out.pos.copy(last.pose.pos);
  out.target.copy(last.pose.target);
}

export function CameraRig({ world }: { world: World }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const stops = useStore(store, (s) => s.stops);
  const placed = useRef<PlacedStop[]>([]);
  const details = useRef<Pose[]>([]);
  const desired = useMemo<Pose>(() => ({ pos: new Vector3(), target: new Vector3() }), []);
  const look = useRef<Vector3 | null>(null);
  const parallax = useMemo(() => ({ x: 0, y: 0 }), []);
  const right = useMemo(() => new Vector3(), []);
  const flightUntil = useRef(0);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    camera.fov = fovFor(aspect);
    camera.updateProjectionMatrix();
    const vp = { aspect, fov: camera.fov };
    placed.current = stops.map((s) => ({ ...s, pose: stopPose(s.key, world, vp) }));
    details.current = world.slots.map((slot) => detailPose(slot, vp));
  }, [stops, size, world, camera]);

  useEffect(
    () =>
      store.subscribe((s, prev) => {
        if (s.active !== prev.active) flightUntil.current = performance.now() + 1600;
      }),
    [],
  );

  useFrame((_, rawDelta) => {
    const list = placed.current;
    if (!list.length) return;
    const delta = Math.min(rawDelta, 1 / 20);
    const fov = fovFor(size.width / Math.max(1, size.height));
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const { active, reducedMotion } = store.getState();
    const detail = active !== null ? details.current[active] : undefined;

    if (detail) {
      desired.pos.copy(detail.pos);
      desired.target.copy(detail.target);
    } else {
      sample(list, live.scroll, desired);
    }

    if (!look.current) {
      // First frame: start exactly on the pose, no fly-in from the origin.
      camera.position.copy(desired.pos);
      look.current = desired.target.clone();
    }

    if (!reducedMotion && !detail) {
      easing.damp(parallax, 'x', live.pointer.x, 0.9, delta);
      easing.damp(parallax, 'y', live.pointer.y, 0.9, delta);
      right.subVectors(desired.target, desired.pos).cross(camera.up).normalize();
      desired.pos.addScaledVector(right, parallax.x * 0.32).addScaledVector(camera.up, parallax.y * 0.18);
      desired.target.addScaledVector(right, parallax.x * 0.08);
    }

    if (reducedMotion) {
      camera.position.copy(desired.pos);
      look.current.copy(desired.target);
    } else {
      const flying = performance.now() < flightUntil.current;
      const smooth = flying ? 0.42 : 0.14;
      easing.damp3(camera.position, desired.pos, smooth, delta);
      easing.damp3(look.current, desired.target, smooth, delta);
    }
    camera.lookAt(look.current);
  });

  return null;
}
