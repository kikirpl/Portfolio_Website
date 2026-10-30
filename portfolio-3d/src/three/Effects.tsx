// Post-processing: light bloom for screens and gates, neutral tone mapping (keeps the
// preview images' colours true), a vignette, and fine film grain.
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import type { TierSettings } from './quality';

export function Effects({ settings }: { settings: TierSettings }) {
  return (
    <EffectComposer multisampling={settings.msaa} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.24} darkness={0.72} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.32} />
    </EffectComposer>
  );
}
