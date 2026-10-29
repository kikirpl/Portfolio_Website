import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { easing } from 'maath';
import { MeshBasicMaterial, MeshStandardMaterial, type Group } from 'three';
import { ScreenMaterial } from '../materials/ScreenMaterial';
import { useScreenTexture, type Level } from '../textures';
import { store } from '../../lib/store';

const bezel = new MeshStandardMaterial({ color: '#14161c', metalness: 0.9, roughness: 0.32 });
const noRaycast = () => null;

interface ScreenProps {
  index: number;
  width: number;
  height: number;
  glow: string;
  textures: Record<Level, string> | null;
  level: Level | null;
  /** Lights up while this project is open in the detail view. */
  tracksActive?: boolean;
  /** Dims while another project has the visitor's attention. */
  dimmable?: boolean;
  onSelect?: (index: number) => void;
  castShadow?: boolean;
}

export function Screen({
  index,
  width,
  height,
  glow,
  textures,
  level,
  tracksActive,
  dimmable,
  onSelect,
  castShadow = true,
}: ScreenProps) {
  const display = useMemo(() => new ScreenMaterial(), []);
  const status = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), []);
  const texture = useScreenTexture(textures, level);
  const lift = useRef<Group>(null);
  const hover = useRef({ value: 0 });
  const light = useRef({ value: 1 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    display.uniforms.uGlow.value.set(glow);
    status.color.set(glow);
  }, [display, status, glow]);
  useEffect(() => {
    display.uniforms.uSize.value.set(width, height);
  }, [display, width, height]);
  useEffect(() => {
    if (texture) display.image = texture;
  }, [display, texture]);
  useEffect(
    () => () => {
      display.dispose();
      status.dispose();
    },
    [display, status],
  );

  useFrame((state, delta) => {
    const { active, focus, highlight, reducedMotion } = store.getState();
    const target = hovered || highlight === index || (tracksActive && active === index) ? 1 : 0;
    easing.damp(hover.current, 'value', target, 0.2, delta);
    const lit = !dimmable || hovered || (active === null ? focus === null || focus === index : active === index);
    easing.damp(light.current, 'value', lit ? 1 : 0.16, 0.45, delta);
    const u = display.uniforms;
    easing.damp(u.uHasMap, 'value', texture ? 1 : 0, 0.4, delta);
    const h = hover.current.value;
    u.uHover.value = h;
    u.uBrightness.value = (0.86 + 0.14 * h) * light.current.value;
    if (!reducedMotion) u.uTime.value = state.clock.elapsedTime;
    status.color.set(glow).multiplyScalar((0.6 + 1.6 * h) * light.current.value);
    if (lift.current) {
      lift.current.position.z = h * 0.14;
      lift.current.scale.setScalar(1 + h * 0.02);
    }
  });

  const handlers = onSelect
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (e.pointerType !== 'mouse') return;
          setHovered(true);
          store.setState({ hovered: index });
          document.body.style.cursor = 'pointer';
        },
        onPointerOut: () => {
          setHovered(false);
          if (store.getState().hovered === index) store.setState({ hovered: null });
          document.body.style.cursor = '';
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(index);
        },
      }
    : {};

  return (
    <group ref={lift}>
      <RoundedBox
        args={[width + 0.1, height + 0.1, 0.07]}
        radius={0.03}
        smoothness={2}
        position-z={-0.04}
        material={bezel}
        castShadow={castShadow}
        raycast={noRaycast}
      />
      <mesh material={display} {...handlers}>
        <planeGeometry args={[width, height]} />
      </mesh>
      <mesh material={status} position={[0, -height / 2 - 0.022, 0.001]} raycast={noRaycast}>
        <planeGeometry args={[Math.min(0.5, width * 0.18), 0.008]} />
      </mesh>
    </group>
  );
}
