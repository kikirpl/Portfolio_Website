// Hero: every preview as a small screen on a slowly turning ring around the core.
// The ring leans toward the pointer; clicking a screen travels to that project.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import type { Group } from 'three';
import { Screen } from './Screen';
import { Core } from './Core';
import { WORLD } from '../layout';
import { live, store } from '../../lib/store';
import type { SceneProject } from '../../lib/types';

const goTo = (index: number) => window.dispatchEvent(new CustomEvent('rm1:goto-project', { detail: index }));

export function HeroRing({ projects }: { projects: SceneProject[] }) {
  const tilt = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const { ringRadius: radius, ringScreenHeight: height, tilt: baseTilt, center } = WORLD.hero;
  const count = projects.length;

  useFrame((_, delta) => {
    const { reducedMotion } = store.getState();
    if (reducedMotion) return;
    if (spin.current) spin.current.rotation.y += delta * 0.055;
    if (tilt.current) {
      easing.damp(tilt.current.rotation, 'x', baseTilt - live.pointer.y * 0.12, 0.8, delta);
      easing.damp(tilt.current.rotation, 'z', -0.05 - live.pointer.x * 0.1, 0.8, delta);
    }
  });

  return (
    <group position={center}>
      <Core />
      <group ref={tilt} rotation={[baseTilt, 0, -0.05]}>
        <group ref={spin}>
          {projects.map((project, i) => {
            const angle = (i / count) * Math.PI * 2;
            return (
              <group
                key={project.slug}
                position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
                rotation-y={angle}
              >
                <Screen
                  index={i}
                  width={height * project.aspect}
                  height={height}
                  glow={project.glow}
                  textures={project.textures}
                  level="sm"
                  onSelect={goTo}
                />
              </group>
            );
          })}
        </group>
      </group>
    </group>
  );
}
