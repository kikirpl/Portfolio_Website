// The display surface of a screen: the preview image with rounded corners, a glass
// sheen that follows the viewing angle, and an edge light in the project's colour.
import { Color, ShaderMaterial, UniformsLib, UniformsUtils, Vector2, type Texture } from 'three';

const vertexShader = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = -mvPosition.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  uniform sampler2D map;
  uniform float uHasMap;
  uniform vec3 uGlow;
  uniform float uBrightness;
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uSize;
  uniform float uRadius;
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  float roundedBox(vec2 p, vec2 halfSize, float r) {
    vec2 q = abs(p) - halfSize + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = roundedBox(p, uSize * 0.5, uRadius);
    if (d > 0.0) discard;

    vec3 image = texture2D(map, vUv).rgb * uBrightness;
    // While loading: a faint wash of the project's own colour.
    vec3 placeholder = uGlow * (0.05 + 0.05 * vUv.y);
    vec3 color = mix(placeholder, image, uHasMap);

    // Glass: Fresnel sheen and one slow diagonal reflection band.
    float facing = clamp(dot(normalize(vNormalView), normalize(vViewDir)), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 4.0);
    float diagonal = vUv.x * 0.55 + vUv.y * 0.85;
    float band = smoothstep(0.16, 0.0, abs(diagonal - 0.95 - 0.18 * sin(uTime * 0.12)));
    color += vec3(0.82, 0.86, 0.96) * (fresnel * 0.3 + band * 0.03);

    // Edge light in the project's colour, brighter on hover or when open.
    float edge = 1.0 - smoothstep(0.0, 0.04, -d);
    color += uGlow * edge * (0.1 + 0.8 * uHover);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export class ScreenMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          map: { value: null },
          uHasMap: { value: 0 },
          uGlow: { value: new Color('#a9bbff') },
          uBrightness: { value: 0.88 },
          uHover: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: new Vector2(1, 1) },
          uRadius: { value: 0.025 },
        },
      ]),
      vertexShader,
      fragmentShader,
      fog: true,
    });
  }

  set image(texture: Texture | null) {
    this.uniforms.map.value = texture;
  }
}
