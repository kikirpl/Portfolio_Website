// The corridor: one large screen per project, alternating sides, each floating over
// a pool of its own light. Textures sharpen once the intro is done, and the open
// project gets the full-resolution image.
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from 'zustand';
import type { Group } from 'three';
import { Screen } from './Screen';
import { LightPool } from './LightPool';
import type { World } from '../layout';
import type { Level } from '../textures';
import { openProject, store } from '../../lib/store';
import type { SceneProject } from '../../lib/types';

function Float({ index, children }: { index: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current || store.getState().reducedMotion) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.55 + index * 1.7) * 0.045;
    ref.current.rotation.z = Math.sin(t * 0.4 + index) * 0.004;
  });
  return <group ref={ref}>{children}</group>;
}

interface GalleryProps {
  world: World;
  projects: SceneProject[];
  level: Level;
}

export function Gallery({ world, projects, level }: GalleryProps) {
  const active = useStore(store, (s) => s.active);
  const ready = useStore(store, (s) => s.ready);

  return (
    <group>
      {world.slots.map((slot) => {
        const project = projects[slot.index];
        const screenLevel: Level = active === slot.index ? 'lg' : ready ? level : 'sm';
        return (
          <group key={project.slug} position={slot.position} rotation-y={slot.rotationY}>
            <Float index={slot.index}>
              <Screen
                index={slot.index}
                width={slot.width}
                height={slot.height}
                glow={project.glow}
                textures={project.textures}
                level={screenLevel}
                tracksActive
                dimmable
                onSelect={openProject}
              />
            </Float>
            <LightPool
              color={project.glow}
              width={slot.width * 1.6}
              depth={3.6}
              position={[0, -slot.position.y + 0.012, 1.1]}
              focusIndex={slot.index}
            />
          </group>
        );
      })}
    </group>
  );
}
