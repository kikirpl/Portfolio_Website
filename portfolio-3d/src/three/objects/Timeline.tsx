// Experience as gates of light the camera passes through. All gate bars are one
// instanced mesh; each gate brightens as the camera approaches it. A rail of light
// on the floor runs through them, with pulses travelling forward in time.
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  Matrix4,
  MeshBasicMaterial,
  Quaternion,
  ShaderMaterial,
  Vector3,
  type InstancedMesh,
} from 'three';
import { WORLD, type World } from '../layout';
import { MOONLIGHT } from '../../lib/color';
import { store } from '../../lib/store';

const PARTS = 4;

const railVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const railFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float pulse = fract(vUv.y * 7.0 + uTime * 0.18);
    float head = smoothstep(0.55, 1.0, pulse) * step(pulse, 0.999);
    float fade = smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    vec3 color = uColor * (0.12 + head * 1.1) * across * fade;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function Timeline({ world }: { world: World }) {
  const mesh = useRef<InstancedMesh>(null);
  const { width: W, height: H } = WORLD.gates;
  const count = world.gates.length * PARTS;
  const base = useMemo(() => new Color(MOONLIGHT), []);
  const tint = useMemo(() => new Color(), []);
  const material = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), []);
  const rail = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColor: { value: new Color(MOONLIGHT) } },
        vertexShader: railVertex,
        fragmentShader: railFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      material.dispose();
      rail.dispose();
    },
    [material, rail],
  );

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const matrix = new Matrix4();
    const q = new Quaternion();
    const p = new Vector3();
    const s = new Vector3();
    const t = 0.055;
    world.gates.forEach((gate, j) => {
      const parts: [number, number, number, number, number, number][] = [
        [-W / 2, H / 2, gate.z, t, H, t],
        [W / 2, H / 2, gate.z, t, H, t],
        [0, H, gate.z, W + t, t, t],
        [0, 0.006, gate.z, W, 0.012, 0.16],
      ];
      parts.forEach(([x, y, z, sx, sy, sz], k) => {
        matrix.compose(p.set(x, y, z), q, s.set(sx, sy, sz));
        m.setMatrixAt(j * PARTS + k, matrix);
        m.setColorAt(j * PARTS + k, base);
      });
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [world, W, H, base]);

  useFrame(({ camera, clock }) => {
    const m = mesh.current;
    if (!m) return;
    rail.uniforms.uTime.value = store.getState().reducedMotion ? 0 : clock.elapsedTime;
    world.gates.forEach((gate, j) => {
      const ahead = camera.position.z - gate.z;
      const near = 1 - Math.min(1, Math.max(0, (ahead - 2) / 16));
      const k = ahead > 0 ? 0.22 + 1.25 * near * near : 0.5;
      tint.copy(base).multiplyScalar(k);
      for (let i = 0; i < PARTS - 1; i++) m.setColorAt(j * PARTS + i, tint);
      // The sill on the floor stays quieter than the frame.
      m.setColorAt(j * PARTS + PARTS - 1, tint.multiplyScalar(0.22));
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  if (!world.gates.length) return null;
  const first = world.gates[0].z + 9;
  const last = world.gates[world.gates.length - 1].z - 6;
  const length = first - last;

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} material={material}>
        <boxGeometry />
      </instancedMesh>
      <mesh material={rail} rotation-x={-Math.PI / 2} position={[0, 0.01, (first + last) / 2]}>
        <planeGeometry args={[0.07, length]} />
      </mesh>
    </group>
  );
}
