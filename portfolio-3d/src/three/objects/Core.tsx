// The faceted core at the centre of the hero ring (and again inside the contact beacon):
// a dark iridescent glass shell around a glowing lattice that takes the accent colour.
// It leans toward the pointer and pulses when clicked or tapped.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import {
  Color,
  DoubleSide,
  EdgesGeometry,
  IcosahedronGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Group,
  type PointLight,
} from 'three';
import { live, store } from '../../lib/store';

interface CoreProps {
  scale?: number;
  light?: boolean;
  interactive?: boolean;
}

export function Core({ scale = 1, light = true, interactive = true }: CoreProps) {
  const body = useRef<Group>(null);
  const lattice = useRef<Group>(null);
  const orbits = useRef<Group>(null);
  const glow = useRef<PointLight>(null);
  const pulse = useRef({ value: 0 });
  const spin = useRef({ value: 0 });
  const target = useMemo(() => new Color(), []);

  const parts = useMemo(() => {
    const shellGeometry = new IcosahedronGeometry(0.9, 0);
    return {
      shellGeometry,
      edges: new EdgesGeometry(shellGeometry),
      latticeGeometry: new IcosahedronGeometry(0.46, 1),
      shell: new MeshPhysicalMaterial({
        color: '#0b0f19',
        metalness: 0.15,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        iridescence: 1,
        iridescenceIOR: 1.35,
        iridescenceThicknessRange: [180, 640],
        transparent: true,
        opacity: 0.6,
        side: DoubleSide,
        depthWrite: false,
        flatShading: true,
        envMapIntensity: 1.5,
      }),
      edgeMaterial: new LineBasicMaterial({ color: '#dfe6ff', transparent: true, opacity: 0.32 }),
      latticeMaterial: new MeshBasicMaterial({ color: '#a9bbff', wireframe: true, toneMapped: false }),
      orbitMaterial: new MeshStandardMaterial({ color: '#c4ccdc', metalness: 1, roughness: 0.25 }),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(parts).forEach((p) => p.dispose());
    },
    [parts],
  );

  useFrame((state, delta) => {
    const { reducedMotion, accent } = store.getState();
    const t = state.clock.elapsedTime;
    easing.damp(pulse.current, 'value', 0, 0.5, delta);
    easing.damp(spin.current, 'value', 0, 1.2, delta);
    const p = pulse.current.value;

    target.set(accent);
    parts.latticeMaterial.color.lerp(target, 1 - Math.exp(-delta * 2.5));
    if (glow.current) {
      glow.current.color.copy(parts.latticeMaterial.color);
      glow.current.intensity = 2.6 + p * 22;
    }
    if (lattice.current) {
      lattice.current.scale.setScalar(1 + p * 0.35);
      if (!reducedMotion) {
        lattice.current.rotation.y -= delta * (0.5 + spin.current.value * 4);
        lattice.current.rotation.x += delta * 0.2;
      }
    }
    if (body.current) {
      const lean = reducedMotion ? 0 : 1;
      const tx = Math.sin(t * 0.3) * 0.15 * lean - live.pointer.y * 0.35 * lean;
      const tz = live.pointer.x * -0.25 * lean;
      easing.damp(body.current.rotation, 'x', tx, 0.5, delta);
      easing.damp(body.current.rotation, 'z', tz, 0.5, delta);
      if (!reducedMotion) body.current.rotation.y += delta * (0.12 + spin.current.value * 2);
    }
    if (orbits.current && !reducedMotion) {
      orbits.current.rotation.y += delta * 0.25;
      orbits.current.rotation.z = Math.sin(t * 0.2) * 0.3;
    }
  });

  const onPulse = interactive
    ? (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        pulse.current.value = 1;
        spin.current.value = 1;
      }
    : undefined;

  return (
    <group scale={scale}>
      <group ref={body}>
        <mesh
          geometry={parts.shellGeometry}
          material={parts.shell}
          castShadow
          onClick={onPulse}
          onPointerOver={interactive ? () => (document.body.style.cursor = 'pointer') : undefined}
          onPointerOut={interactive ? () => (document.body.style.cursor = '') : undefined}
        />
        <lineSegments geometry={parts.edges} material={parts.edgeMaterial} scale={1.002} />
        <group ref={lattice}>
          <mesh geometry={parts.latticeGeometry} material={parts.latticeMaterial} />
        </group>
      </group>
      <group ref={orbits}>
        <mesh material={parts.orbitMaterial} rotation-x={Math.PI / 2.3}>
          <torusGeometry args={[1.32, 0.008, 8, 128]} />
        </mesh>
        <mesh material={parts.orbitMaterial} rotation={[Math.PI / 1.7, 0.6, 0]}>
          <torusGeometry args={[1.55, 0.006, 8, 128]} />
        </mesh>
        <mesh material={parts.latticeMaterial} position={[1.32, 0, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
        </mesh>
      </group>
      {light && <pointLight ref={glow} distance={5.5} decay={1.8} intensity={2.6} />}
    </group>
  );
}
