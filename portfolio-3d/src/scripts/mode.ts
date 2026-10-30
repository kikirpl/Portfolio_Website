// 3D or 2D view. The choice is made before first paint (see Base.astro); this module
// handles the visitor's own switch and the automatic fallback when WebGL fails.
import { store } from '../lib/store';

const KEY = 'rm1-view';

export function getMode(): '3d' | '2d' {
  return document.documentElement.dataset.mode === '3d' ? '3d' : '2d';
}

export function fallbackTo2D(reason: string) {
  if (getMode() === '2d') return;
  console.warn(`Switching to the 2D view: ${reason}`);
  const root = document.documentElement;
  root.classList.replace('mode-3d', 'mode-2d');
  root.dataset.mode = '2d';
  store.setState({ mode: '2d', ready: true, hovered: null });
  window.dispatchEvent(new CustomEvent('rm1:mode', { detail: '2d' }));
}

export function initViewToggle() {
  document.querySelector('[data-view-toggle]')?.addEventListener('click', () => {
    const next = getMode() === '3d' ? '2d' : '3d';
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage blocked: the URL parameter below still carries the choice.
    }
    const url = new URL(location.href);
    url.searchParams.set('view', next);
    url.hash = '';
    location.replace(url.href);
  });
}
