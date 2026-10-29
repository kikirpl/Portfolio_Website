import { Component, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { NeutralToneMapping } from 'three';
import { Scene } from './Scene';
import { ORDER, TIERS, initialTier } from './quality';
import { store } from '../lib/store';
import { fallbackTo2D } from '../scripts/mode';
import type { QualityTier, SceneData } from '../lib/types';

// Stable objects: a new object on each render would make R3F re-apply them (and reset the FOV).
const CAMERA = { fov: 40, near: 0.1, far: 100, position: [0, 3, 14] as [number, number, number] };
const GL = { antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' as const };

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(error);
    fallbackTo2D('the 3D scene hit an error');
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function App({ data }: { data: SceneData }) {
  const [start] = useState<QualityTier>(initialTier);
  const [tier, setTier] = useState<QualityTier>(start);
  const settings = TIERS[tier];
  const [dpr, setDpr] = useState(settings.dpr[1]);
  const [hidden, setHidden] = useState(document.hidden);

  useEffect(() => {
    store.setState({ quality: tier });
    setDpr((d) => Math.min(Math.max(d, settings.dpr[0]), settings.dpr[1]));
  }, [tier, settings]);

  // Stop rendering entirely while the tab is in the background.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const step = useCallback(
    (direction: 1 | -1) =>
      setTier((current) => {
        const next = ORDER[ORDER.indexOf(current) + direction];
        // Never climb above the tier the device started on.
        if (!next || ORDER.indexOf(next) > ORDER.indexOf(start)) return current;
        return next;
      }),
    [start],
  );

  return (
    <WebGLBoundary>
      <Canvas
        dpr={dpr}
        shadows={TIERS[start].shadows ? 'percentage' : false}
        frameloop={hidden ? 'never' : 'always'}
        camera={CAMERA}
        gl={GL}
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping;
          const canvas = gl.domElement;
          let lost = 0;
          canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            lost = window.setTimeout(() => fallbackTo2D('the graphics context was lost'), 3000);
          });
          canvas.addEventListener('webglcontextrestored', () => window.clearTimeout(lost));
        }}
      >
        <PerformanceMonitor
          flipflops={4}
          onChange={({ factor }) => {
            const [min, max] = TIERS[store.getState().quality].dpr;
            setDpr(Math.round((min + (max - min) * factor) * 100) / 100);
          }}
          onDecline={() => step(-1)}
          onIncline={() => step(1)}
          onFallback={() => setTier('low')}
        >
          <Suspense fallback={null}>
            <Scene data={data} settings={settings} />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </WebGLBoundary>
  );
}
