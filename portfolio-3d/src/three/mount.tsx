import { createRoot } from 'react-dom/client';
import App from './App';
import type { SceneData } from '../lib/types';

/** Mounts the WebGL scene into `host`; returns a function that removes it again. */
export function mount(host: HTMLElement, data: SceneData) {
  const root = createRoot(host);
  root.render(<App data={data} />);
  return () => root.unmount();
}
