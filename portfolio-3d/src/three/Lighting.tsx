// Moonlight from above (soft PCF shadows that follow the camera), a cool sky fill, an
// environment built from light panels for PBR reflections, and a small light that
// follows the pointer through the dark.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Color, Object3D, Vector3, type DirectionalLight, type PointLight } from 'three';
import { live, store } from '../lib/store';
import type { TierSettings } from './quality';

export function Lighting({ settings }: { settings: TierSettings }) {
  const moon = useRef<DirectionalLight>(null);
  const torch = useRef<PointLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const focus = useMemo(() => new Vector3(), []);
  const dir = useMemo(() => new Vector3(), []);
  const ray = useMemo(() => new Vector3(), []);
  const tint = useMemo(() => new Color(), []);

  useFrame(({ camera }, delta) => {
    camera.getWorldDirection(dir);
    focus.copy(camera.position).addScaledVector(dir, 9);
    focus.y = 0;
    if (moon.current) {
      moon.current.position.set(focus.x - 6, 15, focus.z + 7);
      target.position.copy(focus);
      target.updateMatrixWorld();
    }
    if (torch.current) {
      ray.set(live.pointer.x, live.pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      torch.current.position.copy(camera.position).addScaledVector(ray, 5.5);
      tint.set(store.getState().accent);
      torch.current.color.lerp(tint, 1 - Math.exp(-delta * 3));
      torch.current.intensity = live.pointerActive ? 7 : 0;
    }
  });

  const size = settings.shadowMapSize;
  return (
    <>
      <hemisphereLight args={['#8fa3dd', '#040508', 0.45]} />
      <directionalLight
        ref={moon}
        target={target}
        color="#cdd8ff"
        intensity={1.15}
        castShadow={settings.shadows}
        shadow-mapSize={[size, size]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={7}
      />
      <primitive object={target} />
      {settings.pointerLight && <pointLight ref={torch} distance={7} decay={1.8} intensity={0} />}
      <Environment resolution={settings.envResolution} frames={1} environmentIntensity={0.85}>
        <color attach="background" args={['#030304']} />
        <Lightformer form="rect" intensity={2.4} color="#dbe3ff" scale={[24, 1.4, 1]} position={[0, 10, -4]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.4} color="#9fb2ff" scale={[14, 3, 1]} position={[-12, 4, 0]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} color="#ffffff" scale={[14, 2, 1]} position={[12, 3, -6]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.6} color="#a9bbff" scale={5} position={[0, 4, 14]} />
      </Environment>
    </>
  );
}
