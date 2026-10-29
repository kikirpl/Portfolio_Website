// State shared by the page scripts and the WebGL island. Low-frequency, reactive state
// lives in the zustand store; per-frame values (pointer, scroll) live in `live` so
// reading them never triggers subscribers.
import { createStore } from 'zustand/vanilla';
import { MOONLIGHT } from './color';
import type { QualityTier } from './types';

export interface Stop {
  /** "hero", "about", "projects", "project:3", "experience", "exp:2", "contact" */
  key: string;
  /** Scroll position (px) at which this stop is centred in the viewport. */
  y: number;
}

export interface AppState {
  mode: '3d' | '2d';
  reducedMotion: boolean;
  /** WebGL scene has rendered and the hero textures are in. */
  ready: boolean;
  /** Loading progress 0..1 for the intro screen. */
  progress: number;
  stops: Stop[];
  /** Project open in the detail view, by index. */
  active: number | null;
  /** Project screen under the pointer in the 3D scene. */
  hovered: number | null;
  /** Project whose panel is in view while scrolling the gallery. */
  focus: number | null;
  section: string;
  /** Colour of the work currently in view; tints UI and scene. */
  accent: string;
  quality: QualityTier;
}

export const store = createStore<AppState>(() => ({
  mode: '3d',
  reducedMotion: false,
  ready: false,
  progress: 0,
  stops: [],
  active: null,
  hovered: null,
  focus: null,
  section: 'hero',
  accent: MOONLIGHT,
  quality: 'high',
}));

export const live = {
  /** Pointer position in normalised device coordinates (-1..1), y up. */
  pointer: { x: 0, y: 0 },
  pointerActive: false,
  /** Current (smoothed) scroll position in px. */
  scroll: 0,
};

export function openProject(index: number) {
  store.setState({ active: index });
}

export function closeProject() {
  store.setState({ active: null });
}
