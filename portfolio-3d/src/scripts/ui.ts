// Small interface pieces: intro screen, reactive cursor, copy-to-clipboard.
import { store } from '../lib/store';

/** Intro screen with real loading progress; lifts as soon as the scene is ready (max 6 s). */
export function initLoader(onDone: () => void) {
  const el = document.querySelector<HTMLElement>('[data-loader]');
  const fill = el?.querySelector<HTMLElement>('[data-loader-fill]');
  const count = el?.querySelector<HTMLElement>('[data-loader-count]');
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el?.classList.add('is-done');
    onDone();
    window.setTimeout(() => el?.remove(), 900);
  };
  const show = (progress: number) => {
    fill?.style.setProperty('--p', progress.toFixed(3));
    if (count) count.textContent = String(Math.round(progress * 100));
  };
  const unsubscribe = store.subscribe((s) => {
    show(s.progress);
    if (s.ready || s.mode === '2d') {
      unsubscribe();
      show(1);
      window.setTimeout(finish, s.mode === '2d' ? 0 : 280);
    }
  });
  window.setTimeout(finish, 6000);
}

/** A ring that trails the mouse, grows over controls and names the action over 3D screens. */
export function initCursor() {
  const el = document.querySelector<HTMLElement>('[data-cursor]');
  if (!el) return;
  document.documentElement.classList.add('has-cursor');
  let x = -100;
  let y = -100;
  let cx = x;
  let cy = y;
  let raf = 0;
  const loop = () => {
    cx += (x - cx) * 0.24;
    cy += (y - cy) * 0.24;
    el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;
      el.classList.add('is-visible');
      const control = (event.target as Element).closest('a, button, summary, label, [data-cursor-link]');
      el.classList.toggle('is-link', Boolean(control));
      if (!raf) raf = requestAnimationFrame(loop);
    },
    { passive: true },
  );
  document.documentElement.addEventListener('mouseleave', () => el.classList.remove('is-visible'));
  store.subscribe((s) => el.classList.toggle('is-view', s.hovered !== null && s.active === null));
}

export function initCopy() {
  document.addEventListener('click', async (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-copy]');
    if (!button) return;
    const label = button.querySelector<HTMLElement>('[data-copy-label]');
    const reset = () => {
      button.classList.remove('is-done');
      if (label) label.textContent = 'Copy';
    };
    try {
      await navigator.clipboard.writeText(button.dataset.copy ?? '');
      button.classList.add('is-done');
      if (label) label.textContent = 'Copied';
    } catch {
      if (label) label.textContent = 'Copy failed';
    }
    window.setTimeout(reset, 2200);
  });
}
