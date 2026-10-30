import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { buildWorld } from './layout';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { Effects } from './Effects';
import { HeroRing } from './objects/HeroRing';
import { Gallery } from './objects/Gallery';
import { Timeline } from './objects/Timeline';
import { Beacon } from './objects/Beacon';
import { Portrait } from './objects/Portrait';
import { Floor } from './objects/Floor';
import { Dust, Sky, FOG } from './objects/Atmosphere';
import { loadTexture, track } from './textures';
import type { TierSettings } from './quality';
import { store } from '../lib/store';
import type { SceneData } from '../lib/types';

/** Ready when the hero previews are on the GPU and the shaders are compiled. */
function useIntroReady(data: SceneData) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let alive = true;
    const urls = data.projects.flatMap((p) => (p.textures ? [p.textures.sm] : []));
    Promise.allSettled(urls.map((url) => track(loadTexture(url, gl))))
      .then(async () => {
        // Compile every shader now, while the intro screen is still up.
        if (gl.extensions.has('KHR_parallel_shader_compile')) await gl.compileAsync(scene, camera).catch(() => undefined);
        else gl.compile(scene, camera);
      })
      .then(() => {
        if (!alive) return;
        requestAnimationFrame(() => requestAnimationFrame(() => alive && store.setState({ ready: true, progress: 1 })));
      });
    return () => {
      alive = false;
    };
  }, [data, gl, scene, camera]);
}

export function Scene({ data, settings }: { data: SceneData; settings: TierSettings }) {
  const world = useMemo(
    () => buildWorld(data.projects.map((p) => p.aspect), data.experienceCount, data.portrait?.aspect ?? null),
    [data],
  );
  useIntroReady(data);

  return (
    <>
      <color attach="background" args={[FOG.color]} />
      <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
      <CameraRig world={world} />
      <Lighting settings={settings} />
      <Sky />
      <Floor world={world} reflections={settings.reflections} />
      <HeroRing projects={data.projects} />
      {data.portrait && <Portrait world={world} photo={data.portrait} />}
      <Gallery world={world} projects={data.projects} level={settings.texture} />
      <Timeline world={world} />
      <Beacon position={world.beacon} />
      <Dust world={world} count={settings.particles} />
      {settings.post && <Effects settings={settings} />}
    </>
  );
}
