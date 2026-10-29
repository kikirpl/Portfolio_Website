// The end of the walk: a standing ring of light around a small core, with a beam
// rising into the dark. Frames the contact section.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color, DoubleSide, MeshBasicMaterial, ShaderMaterial, type Group, type Vector3 } from 'three';
import { Core } from './Core';
import { LightPool } from './LightPool';
import { WORLD } from '../layout';
import { store } from '../../lib/store';

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float core = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 6.0);
    float rise = smoothstep(1.0, 0.0, vUv.y) * smoothstep(0.0, 0.06, vUv.y);
    float flicker = 0.85 + 0.15 * sin(uTime * 1.3 + vUv.y * 9.0);
    gl_FragColor = vec4(uColor * core * rise * flicker * 0.9, 1.0);
  }
`;

export function Beacon({ position }: { position: Vector3 }) {
  const ring = useRef<Group>(null);
  const target = useMemo(() => new Color(), []);
  const ringMaterial = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), []);
  const beam = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uColor: { value: new Color() }, uTime: { value: 0 } },
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        toneMapped: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      ringMaterial.dispose();
      beam.dispose();
    },
    [ringMaterial, beam],
  );

  useFrame((state, delta) => {
    const { accent, reducedMotion } = store.getState();
    target.set(accent).multiplyScalar(1.4);
    ringMaterial.color.lerp(target, 1 - Math.exp(-delta * 2));
    beam.uniforms.uColor.value.copy(ringMaterial.color);
    beam.uniforms.uTime.value = state.clock.elapsedTime;
    if (ring.current && !reducedMotion) ring.current.rotation.z += delta * 0.08;
  });

  const r = WORLD.beacon.radius;
  return (
    <group position={position}>
      <group ref={ring}>
        <mesh material={ringMaterial}>
          <torusGeometry args={[r, 0.028, 12, 220]} />
        </mesh>
        <mesh material={ringMaterial} rotation-z={Math.PI / 4}>
          <torusGeometry args={[r + 0.22, 0.006, 8, 220, Math.PI * 0.6]} />
        </mesh>
      </group>
      <Core scale={0.62} light={false} interactive={false} />
      <mesh material={beam} position={[0, 9, -0.4]}>
        <planeGeometry args={[1.6, 18]} />
      </mesh>
      <LightPool color="#a9bbff" width={7} depth={5} position={[0, -position.y + 0.012, 0.4]} intensity={0.45} />
    </group>
  );
}
