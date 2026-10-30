// The profile photo as a portrait screen beside the About text, like the artist's
// portrait at a gallery entrance. It is the same screen as the projects (metal bezel,
// glass, edge light) and stays switched off until the visitor reaches About, so it never
// competes with the hero; then it powers on as the camera turns to it.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from 'zustand';
import { easing } from 'maath';
import type { Group } from 'three';
import { Screen } from './Screen';
import { LightPool } from './LightPool';
import type { World } from '../layout';
import { MOONLIGHT } from '../../lib/color';
import { store } from '../../lib/store';
import type { SceneData } from '../../lib/types';

export function Portrait({ world, photo }: { world: World; photo: NonNullable<SceneData['portrait']> }) {
  const slot = world.portrait;
  const bob = useRef<Group>(null);
  const power = useRef({ value: 0 });
  const ready = useStore(store, (s) => s.ready);

  useFrame((state, delta) => {
    const { section, reducedMotion } = store.getState();
    easing.damp(power.current, 'value', section === 'about' ? 1 : 0, 0.6, delta);
    if (bob.current && !reducedMotion) bob.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + 2) * 0.04;
  });

  if (!slot) return null;
  return (
    <group position={slot.position} rotation-y={slot.rotationY}>
      <group ref={bob}>
        <Screen
          index={-1}
          width={slot.width}
          height={slot.height}
          glow={MOONLIGHT}
          textures={photo.textures}
          level={ready ? 'md' : null}
          power={power.current}
        />
      </group>
      <LightPool
        color={MOONLIGHT}
        width={slot.width * 1.8}
        depth={3.4}
        position={[0, -slot.position.y + 0.012, 1.1]}
        intensity={0.4}
        power={power.current}
      />
    </group>
  );
}
