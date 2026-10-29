// In-page navigation: smooth scroll to the exact camera stop of a section, then move
// keyboard focus there. Also the mobile menu and "show me this project" requests.
import { store, openProject } from '../lib/store';
import { scrollToElement, scrollToY } from './scroll';

const stopY = (key: string) => store.getState().stops.find((s) => s.key === key)?.y;

function navigateTo(id: string, target: HTMLElement) {
  const focusEl =
    id === 'top' ? document.getElementById('hero-title') : (target.querySelector<HTMLElement>('[tabindex="-1"]') ?? target);
  const stopEl = target.matches('[data-stop]') ? target : target.querySelector<HTMLElement>('[data-stop]');
  const y = id === 'top' ? 0 : stopEl ? stopY(stopEl.dataset.stop!) : undefined;
  const done = () => focusEl?.focus({ preventScroll: true });
  if (y !== undefined) scrollToY(y, { onComplete: done });
  else scrollToElement(target, { onComplete: done });
  history.replaceState(null, '', id === 'top' ? location.pathname + location.search : `#${id}`);
}

export function initNav() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const list = document.querySelector<HTMLElement>('[data-nav-list]');

  const setOpen = (open: boolean) => {
    toggle?.setAttribute('aria-expanded', String(open));
    list?.classList.toggle('is-open', open);
  };

  toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = decodeURIComponent(link.hash.slice(1));
    const target = id === 'top' ? document.getElementById('top') : document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setOpen(false);
    navigateTo(id, target);
  });

  // A screen in the hero ring was clicked: travel to that project, then open it.
  window.addEventListener('rm1:goto-project', (event) => {
    const index = (event as CustomEvent<number>).detail;
    const y = stopY(`project:${index}`);
    if (y === undefined) return;
    scrollToY(y, { duration: 1.8, onComplete: () => openProject(index) });
  });

  // Arriving with a #hash: land on the section's camera stop once it is measured.
  const initial = location.hash.slice(1);
  if (initial) {
    const target = document.getElementById(decodeURIComponent(initial));
    if (target) {
      const unsub = store.subscribe((s) => {
        if (!s.stops.length) return;
        unsub();
        const stopEl = target.matches('[data-stop]') ? target : target.querySelector<HTMLElement>('[data-stop]');
        const y = stopEl ? stopY(stopEl.dataset.stop!) : undefined;
        if (y !== undefined) scrollToY(y, { immediate: true });
      });
    }
  }
}
