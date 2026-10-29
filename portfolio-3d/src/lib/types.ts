/** Serializable data handed from the page to the WebGL island. */
export interface SceneProject {
  slug: string;
  name: string;
  aspect: number;
  glow: string;
  textures: { sm: string; md: string; lg: string } | null;
}

export interface SceneData {
  projects: SceneProject[];
  experienceCount: number;
}

export type QualityTier = 'low' | 'medium' | 'high';
