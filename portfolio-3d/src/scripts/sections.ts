// Measures where each scroll stop sits, tracks the section in view, and drives the
// position indicators and the accent colour (the colour of the work currently in view).
import { store } from '../lib/store';
import { MOONLIGHT } from '../lib/color';
import { onScroll } from './scroll';

interface Range {
  id: string;
  top: number;
  bottom: number;
}

function debounce(fn: () => void, ms: number) {
  let t = 0;
  return () => {
    window.clearTimeout(t);
    t = window.setTimeout(fn, ms);
  };
}

export function initSections() {
  const root = document.documentElement;
  const stopEls = Array.from(document.querySelectorAll<HTMLElement>('[data-stop]'));
  const sectionEls = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  const projectEls = Array.from(document.querySelectorAll<HTMLElement>('[data-project]'));
  const navLinks = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-link]'));
  const railMarks = Array.from(document.querySelectorAll<HTMLElement>('[data-rail-mark]'));
  const railFill = document.querySelector<HTMLElement>('[data-rail-fill]');
  const now = document.querySelector<HTMLElement>('[data-now]');
  const labels = new Map(railMarks.map((m) => [m.dataset.railMark!, m.textContent?.trim() ?? '']));

  let sections: Range[] = [];
  let projects: (Range & { index: number; glow: string })[] = [];
  let maxScroll = 1;
  let current = '';

  const box = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height };
  };

  function measure() {
    const vh = window.innerHeight;
    maxScroll = Math.max(1, root.scrollHeight - vh);
    const stops = stopEls.map((el) => {
      const key = el.dataset.stop!;
      const { top, height } = box(el);
      const y = key === 'hero' ? 0 : top + height / 2 - vh / 2;
      return { key, y: Math.round(Math.min(maxScroll, Math.max(0, y))) };
    });
    sections = sectionEls.map((el) => {
      const { top, height } = box(el);
      return { id: el.dataset.section!, top, bottom: top + height };
    });
    projects = projectEls.map((el) => {
      const { top, height } = box(el);
      return { id: el.id, index: Number(el.dataset.project), glow: el.dataset.glow ?? MOONLIGHT, top, bottom: top + height };
    });
    store.setState({ stops });
    update();
  }

  function update() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    let section = sections[0]?.id ?? 'hero';
    for (const s of sections) if (s.top <= y + vh * 0.5) section = s.id;
    const probe = y + vh * 0.5;
    const inView = projects.find((p) => probe >= p.top && probe < p.bottom);
    const { active } = store.getState();
    const accent = active !== null ? (projects[active]?.glow ?? MOONLIGHT) : (inView?.glow ?? MOONLIGHT);

    railFill?.style.setProperty('--progress', Math.min(1, y / maxScroll).toFixed(4));

    if (section !== current) {
      current = section;
      for (const link of navLinks) {
        if (link.dataset.navLink === section) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
      for (const mark of railMarks) {
        if (mark.dataset.railMark === section) mark.setAttribute('aria-current', 'true');
        else mark.removeAttribute('aria-current');
      }
      if (now) now.textContent = labels.get(section) ?? '';
    }

    const focus = section === 'projects' && inView ? inView.index : null;
    const state = store.getState();
    if (accent !== state.accent || section !== state.section || focus !== state.focus) {
      store.setState({ accent, section, focus });
    }
  }

  store.subscribe((s, prev) => {
    if (s.accent !== prev.accent) root.style.setProperty('--accent', s.accent);
    if (s.active !== prev.active) update();
  });

  measure();
  onScroll(update);
  const remeasure = debounce(measure, 120);
  window.addEventListener('resize', remeasure);
  new ResizeObserver(remeasure).observe(document.body);
  document.fonts?.ready.then(measure);
  window.addEventListener('rm1:mode', measure);
}
