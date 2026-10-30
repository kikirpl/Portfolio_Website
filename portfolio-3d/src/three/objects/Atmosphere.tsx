// Air and sky: drifting dust lit like motes in a dark hall (one draw call), and a
// gradient dome whose horizon matches the fog so the floor dissolves into the night.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, Color, ShaderMaterial, type Mesh } from 'three';
import type { World } from '../layout';
import { store } from '../../lib/store';

export const FOG = { color: '#0b0d13', near: 9, far: 40 };

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uNear;
  uniform float uFar;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.11 + aSeed * 31.0) * 0.35;
    p.y += sin(uTime * 0.17 + aSeed * 17.0) * 0.25;
    p.z += cos(uTime * 0.09 + aSeed * 11.0) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    gl_PointSize = uSize * uPixelRatio * (0.4 + aSeed) / max(depth, 0.5);
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.6 + aSeed) + aSeed * 40.0);
    vAlpha = (1.0 - smoothstep(uNear, uFar, depth)) * smoothstep(0.4, 2.0, depth) * twinkle;
  }
`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor * a * vAlpha * 0.55, 1.0);
  }
`;

export function Dust({ world, count }: { world: World; count: number }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const length = world.zMax - world.zMin;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = 0.2 + Math.random() * 7.5;
      positions[i * 3 + 2] = world.zMax - Math.random() * length;
      seeds[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    return g;
  }, [count, world]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 26 },
          uPixelRatio: { value: 1 },
          uNear: { value: FOG.near * 0.6 },
          uFar: { value: FOG.far * 0.9 },
          uColor: { value: new Color('#c8d3ff') },
        },
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    material.uniforms.uPixelRatio.value = dpr;
    if (!store.getState().reducedMotion) material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uZenith;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    vec3 color = mix(uHorizon, uZenith, pow(h, 0.45));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Sky() {
  const ref = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uHorizon: { value: new Color(FOG.color) }, uZenith: { value: new Color('#040507') } },
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: BackSide,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return (
    <mesh ref={ref} material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[60, 32, 16]} />
    </mesh>
  );
}
