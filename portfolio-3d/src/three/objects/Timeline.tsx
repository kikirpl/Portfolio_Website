// Experience as gates the camera passes through: dark brushed-metal portals with a light
// strip set into their inner edge, one portal per entry. Frames and strips are two
// instanced meshes; each strip brightens as the camera approaches its gate. A rail of
// light in the floor runs through them, with pulses travelling forward in time.
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  ShaderMaterial,
  Vector3,
  type InstancedMesh,
} from 'three';
import { WORLD, type World } from '../layout';
import { MOONLIGHT } from '../../lib/color';
import { store } from '../../lib/store';

const FRAME_PARTS = 3;
const STRIP_PARTS = 3;
const BAR = 0.16;
const STRIP = 0.024;

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
    vec3 color = uColor * (0.1 + head * 0.9) * across * fade;
    gl_FragColor = vec4(color, 1.0);
  }
`;

type Part = [x: number, y: number, z: number, sx: number, sy: number, sz: number];

export function Timeline({ world }: { world: World }) {
  const frames = useRef<InstancedMesh>(null);
  const strips = useRef<InstancedMesh>(null);
  const { width: W, height: H } = WORLD.gates;
  const count = world.gates.length;
  const base = useMemo(() => new Color(MOONLIGHT), []);
  const tint = useMemo(() => new Color(), []);
  const metal = useMemo(() => new MeshStandardMaterial({ color: '#15171d', metalness: 0.9, roughness: 0.34 }), []);
  const light = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), []);
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
      metal.dispose();
      light.dispose();
      rail.dispose();
    },
    [metal, light, rail],
  );

  useLayoutEffect(() => {
    const f = frames.current;
    const s = strips.current;
    if (!f || !s) return;
    const matrix = new Matrix4();
    const q = new Quaternion();
    const p = new Vector3();
    const scale = new Vector3();
    const place = (mesh: InstancedMesh, index: number, [x, y, z, sx, sy, sz]: Part) => {
      matrix.compose(p.set(x, y, z), q, scale.set(sx, sy, sz));
      mesh.setMatrixAt(index, matrix);
    };
    // The strips sit on the inner faces of the frame, facing the opening.
    const inX = W / 2 - BAR / 2 - STRIP / 2;
    const inY = H - BAR / 2 - STRIP / 2;
    world.gates.forEach((gate, j) => {
      const frameParts: Part[] = [
        [-W / 2, H / 2, gate.z, BAR, H, BAR],
        [W / 2, H / 2, gate.z, BAR, H, BAR],
        [0, H, gate.z, W + BAR, BAR, BAR],
      ];
      const stripParts: Part[] = [
        [-inX, H / 2, gate.z, STRIP, H - BAR, BAR * 0.6],
        [inX, H / 2, gate.z, STRIP, H - BAR, BAR * 0.6],
        [0, inY, gate.z, W - BAR, STRIP, BAR * 0.6],
      ];
      frameParts.forEach((part, k) => place(f, j * FRAME_PARTS + k, part));
      stripParts.forEach((part, k) => {
        place(s, j * STRIP_PARTS + k, part);
        s.setColorAt(j * STRIP_PARTS + k, base);
      });
    });
    f.instanceMatrix.needsUpdate = true;
    s.instanceMatrix.needsUpdate = true;
    if (s.instanceColor) s.instanceColor.needsUpdate = true;
    f.computeBoundingSphere();
    s.computeBoundingSphere();
  }, [world, W, H, base]);

  useFrame(({ camera, clock }) => {
    const s = strips.current;
    if (!s) return;
    rail.uniforms.uTime.value = store.getState().reducedMotion ? 0 : clock.elapsedTime;
    world.gates.forEach((gate, j) => {
      const ahead = camera.position.z - gate.z;
      const near = 1 - Math.min(1, Math.max(0, (ahead - 2) / 16));
      const k = ahead > 0 ? 0.25 + 1.35 * near * near : 0.5;
      tint.copy(base).multiplyScalar(k);
      for (let i = 0; i < STRIP_PARTS; i++) s.setColorAt(j * STRIP_PARTS + i, tint);
    });
    if (s.instanceColor) s.instanceColor.needsUpdate = true;
  });

  if (!count) return null;
  const first = world.gates[0].z + 9;
  const last = world.gates[count - 1].z - 6;
  const length = first - last;

  return (
    <group>
      <instancedMesh ref={frames} args={[undefined, undefined, count * FRAME_PARTS]} material={metal} castShadow>
        <boxGeometry />
      </instancedMesh>
      <instancedMesh ref={strips} args={[undefined, undefined, count * STRIP_PARTS]} material={light}>
        <boxGeometry />
      </instancedMesh>
      <mesh material={rail} rotation-x={-Math.PI / 2} position={[0, 0.01, (first + last) / 2]}>
        <planeGeometry args={[0.05, length]} />
      </mesh>
    </group>
  );
}
