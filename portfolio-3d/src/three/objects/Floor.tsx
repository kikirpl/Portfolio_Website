// Polished obsidian floor. High tier: real blurred reflections (MeshReflectorMaterial).
// Lower tiers: the same surface lit by the environment only. A faint tile seam texture
// breaks up the reflections so the floor reads as a material, not a mirror.
import { useEffect, useMemo } from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';
import { CanvasTexture, LinearMipmapLinearFilter, RepeatWrapping, type Texture } from 'three';
import type { World } from '../layout';

function seamTexture(): Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(0, 0, size, size);
  // Subtle stone-like variation.
  for (let i = 0; i < 1600; i++) {
    const v = 110 + Math.random() * 40;
    ctx.fillStyle = `rgba(${v},${v},${v},0.08)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 6, 2 + Math.random() * 6);
  }
  ctx.strokeStyle = '#a8a8a8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, size - 2, size - 2);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 8;
  return texture;
}

export function Floor({ world, reflections }: { world: World; reflections: boolean }) {
  const length = world.zMax - world.zMin;
  const width = 90;
  const seams = useMemo(() => {
    const t = seamTexture();
    t.repeat.set(width / 3, length / 3);
    return t;
  }, [length]);
  useEffect(() => () => seams.dispose(), [seams]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, (world.zMax + world.zMin) / 2]} receiveShadow>
      <planeGeometry args={[width, length]} />
      {reflections ? (
        <MeshReflectorMaterial
          resolution={512}
          blur={[320, 90]}
          mixBlur={1}
          mixStrength={2.2}
          mixContrast={1.1}
          mirror={0.65}
          depthScale={0.9}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.3}
          color="#0b0c10"
          metalness={0.6}
          roughness={0.85}
          roughnessMap={seams}
        />
      ) : (
        <meshStandardMaterial color="#090a0d" metalness={0.5} roughness={0.55} roughnessMap={seams} envMapIntensity={0.42} />
      )}
    </mesh>
  );
}
