// Environment lighting for the PBR materials: a few emissive panels (ceiling strip,
// side softboxes, a ring behind the camera) rendered once into a PMREM. Built directly
// on three's PMREMGenerator so no HDR/EXR loaders end up in the bundle.
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  PlaneGeometry,
  RingGeometry,
  Scene,
  type BufferGeometry,
} from 'three';

type Panel = {
  geometry: BufferGeometry;
  color: string;
  intensity: number;
  position: [number, number, number];
  rotation?: [number, number, number];
};

const PANELS: Panel[] = [
  { geometry: new PlaneGeometry(24, 1.4), color: '#dbe3ff', intensity: 2.4, position: [0, 10, -4], rotation: [Math.PI / 2, 0, 0] },
  { geometry: new PlaneGeometry(14, 3), color: '#9fb2ff', intensity: 1.4, position: [-12, 4, 0], rotation: [0, Math.PI / 2, 0] },
  { geometry: new PlaneGeometry(14, 2), color: '#ffffff', intensity: 0.9, position: [12, 3, -6], rotation: [0, -Math.PI / 2, 0] },
  { geometry: new RingGeometry(2, 2.5, 64), color: '#a9bbff', intensity: 1.6, position: [0, 4, 14] },
];

export function LightPanels({ resolution, intensity = 0.85 }: { resolution: number; intensity?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const studio = new Scene();
    studio.background = new Color('#030304');
    const materials: MeshBasicMaterial[] = [];
    for (const panel of PANELS) {
      const material = new MeshBasicMaterial({
        color: new Color(panel.color).multiplyScalar(panel.intensity),
        side: DoubleSide,
        toneMapped: false,
      });
      materials.push(material);
      const mesh = new Mesh(panel.geometry, material);
      mesh.position.set(...panel.position);
      if (panel.rotation) mesh.rotation.set(...panel.rotation);
      else mesh.lookAt(0, mesh.position.y, 0);
      studio.add(mesh);
    }
    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(studio, 0.02, 0.1, 100, { size: resolution });
    scene.environment = target.texture;
    scene.environmentIntensity = intensity;
    pmrem.dispose();
    materials.forEach((m) => m.dispose());
    return () => {
      if (scene.environment === target.texture) scene.environment = null;
      target.dispose();
    };
  }, [gl, scene, resolution, intensity]);

  return null;
}
