// Light cast on the floor by a screen or the beacon: an additive radial gradient
// tinted with the source's colour. Far cheaper than a real area light per screen.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { AdditiveBlending, CanvasTexture, Color, MeshBasicMaterial, type Texture } from 'three';
import { store } from '../../lib/store';

let gradient: Texture | null = null;

function radialGradient(): Texture {
  if (gradient) return gradient;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  gradient = new CanvasTexture(canvas);
  return gradient;
}

interface LightPoolProps {
  color: string;
  width: number;
  depth: number;
  position: [number, number, number];
  intensity?: number;
  /** Gallery index: the pool fades with its screen when another project is in focus. */
  focusIndex?: number;
}

export function LightPool({ color, width, depth, position, intensity = 0.55, focusIndex }: LightPoolProps) {
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: radialGradient(),
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const base = useMemo(() => new Color(color).multiplyScalar(intensity), [color, intensity]);
  const level = useRef({ value: 1 });
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, delta) => {
    let lit = true;
    if (focusIndex !== undefined) {
      const { focus, active } = store.getState();
      lit = active === null ? focus === null || focus === focusIndex : active === focusIndex;
    }
    easing.damp(level.current, 'value', lit ? 1 : 0.15, 0.45, delta);
    material.color.copy(base).multiplyScalar(level.current.value);
  });
  return (
    <mesh material={material} position={position} rotation-x={-Math.PI / 2} renderOrder={1}>
      <planeGeometry args={[width, depth]} />
    </mesh>
  );
}
