// Page entry. Everything here works without WebGL; the 3D scene is loaded on top
// only in 3D mode, as a separate chunk, so the 2D view never downloads three.js.
import { store, live } from '../lib/store';
import type { SceneData } from '../lib/types';
import { initScroll, scrollToY } from './scroll';
import { initSections } from './sections';
import { initNav } from './nav';
import { initDialog } from './dialog';
import { initReveal, playIntro } from './reveal';
import { initLoader, initCursor, initCopy } from './ui';
import { getMode, fallbackTo2D, initViewToggle } from './mode';

document.documentElement.classList.add('js-ready');

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mode = getMode();
store.setState({ mode, reducedMotion });

initScroll(!reducedMotion);
initSections();
initNav();
initDialog();
initReveal();
initCopy();
initViewToggle();

window.addEventListener(
  'pointermove',
  (event) => {
    live.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    live.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    live.pointerActive = true;
  },
  { passive: true },
);

window.addEventListener('rm1:mode', () => playIntro(reducedMotion));
store.subscribe((s, prev) => {
  if (s.ready && !prev.ready) document.documentElement.classList.add('is-scene-ready');
});

// ?debug exposes the state and scroll helper to automated browser checks.
if (new URLSearchParams(location.search).has('debug')) {
  Object.assign(window, { __rm1: { store, scrollToY } });
}

if (mode === '3d') {
  initLoader(() => playIntro(reducedMotion));
  if (matchMedia('(pointer: fine)').matches && !reducedMotion) initCursor();
  const host = document.getElementById('webgl');
  const data = JSON.parse(document.getElementById('scene-data')?.textContent ?? '{}') as SceneData;
  import('../three/mount')
    .then(({ mount }) => {
      if (!host || getMode() !== '3d') return;
      const unmount = mount(host, data);
      window.addEventListener('rm1:mode', unmount, { once: true });
    })
    .catch((error) => {
      console.error(error);
      fallbackTo2D('the 3D scene could not be loaded');
    });
} else {
  playIntro(reducedMotion);
}
