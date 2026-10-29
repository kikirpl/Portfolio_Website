// Preview textures: cached, uploaded to the GPU on arrival, and upgraded in place
// (512 px → 1024 px → full size for the detail view) without ever downgrading.
import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader, type Texture, type WebGLRenderer } from 'three';
import { store } from '../lib/store';

export type Level = 'sm' | 'md' | 'lg';
const RANK: Record<Level, number> = { sm: 0, md: 1, lg: 2 };

const loader = new TextureLoader();
const cache = new Map<string, Promise<Texture>>();

let total = 0;
let settled = 0;

/** Counts a load towards the intro screen's progress bar. */
export function track<T>(promise: Promise<T>): Promise<T> {
  total += 1;
  const done = () => {
    settled += 1;
    store.setState({ progress: Math.min(0.98, settled / total) });
  };
  promise.then(done, done);
  return promise;
}

export function loadTexture(url: string, gl?: WebGLRenderer): Promise<Texture> {
  let promise = cache.get(url);
  if (!promise) {
    promise = loader.loadAsync(url).then((texture) => {
      texture.colorSpace = SRGBColorSpace;
      if (gl) {
        texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        gl.initTexture(texture);
      }
      return texture;
    });
    cache.set(url, promise);
  }
  return promise;
}

/** The sharpest texture loaded so far for a screen, at most `level`. */
export function useScreenTexture(urls: Record<Level, string> | null, level: Level | null): Texture | null {
  const gl = useThree((s) => s.gl);
  const [state, setState] = useState<{ texture: Texture; rank: number } | null>(null);

  useEffect(() => {
    if (!urls || !level) return;
    const rank = RANK[level];
    if (state && state.rank >= rank) return;
    let alive = true;
    loadTexture(urls[level], gl)
      .then((texture) => {
        if (alive) setState((prev) => (prev && prev.rank >= rank ? prev : { texture, rank }));
      })
      .catch(() => {
        // A missing texture leaves the screen on its placeholder glow.
      });
    return () => {
      alive = false;
    };
  }, [urls, level, gl, state]);

  return state?.texture ?? null;
}
