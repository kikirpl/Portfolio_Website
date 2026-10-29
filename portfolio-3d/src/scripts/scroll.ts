// Smooth scrolling (Lenis) with a native fallback for reduced motion.
import Lenis from 'lenis';
import { live } from '../lib/store';

let lenis: Lenis | null = null;

export function initScroll(smooth: boolean) {
  if (smooth) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.09, smoothWheel: true, syncTouch: false, stopInertiaOnNavigate: true });
    lenis.on('scroll', () => {
      live.scroll = lenis!.animatedScroll;
    });
  }
  live.scroll = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      if (!lenis) live.scroll = window.scrollY;
    },
    { passive: true },
  );
}

export function onScroll(fn: () => void) {
  if (lenis) lenis.on('scroll', fn);
  else window.addEventListener('scroll', fn, { passive: true });
}

export function scrollToY(y: number, options: { immediate?: boolean; duration?: number; onComplete?: () => void } = {}) {
  if (lenis) {
    lenis.scrollTo(y, { immediate: options.immediate, duration: options.duration ?? 1.4, force: true, onComplete: options.onComplete });
    return;
  }
  window.scrollTo({ top: y, behavior: 'auto' });
  live.scroll = window.scrollY;
  options.onComplete?.();
}

export function scrollToElement(el: HTMLElement, options: { immediate?: boolean; center?: boolean; onComplete?: () => void } = {}) {
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const y = options.center ? top + rect.height / 2 - window.innerHeight / 2 : top;
  scrollToY(Math.max(0, y), options);
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.classList.toggle('is-scroll-locked', locked);
}
