// Text entrances. Section headings wipe in like light passing over them; the hero plays
// once the intro screen lifts. Content is never hidden without JS (see global.css).
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

/** Roles resolve out of random characters, once, in under a second. */
function decode(list: HTMLElement) {
  const items = Array.from(list.querySelectorAll('li'));
  list.setAttribute('aria-busy', 'true');
  let pending = items.length;
  items.forEach((li, index) => {
    const text = li.textContent ?? '';
    const width = li.getBoundingClientRect().width;
    li.style.width = `${width}px`;
    li.style.whiteSpace = 'nowrap';
    li.style.overflow = 'hidden';
    const start = performance.now() + 250 + index * 90;
    const duration = 650;
    const frame = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const shown = Math.floor(t * text.length);
      let out = text.slice(0, shown);
      for (let i = shown; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      li.textContent = out;
      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }
      li.textContent = text;
      li.removeAttribute('style');
      if (--pending === 0) list.removeAttribute('aria-busy');
    };
    requestAnimationFrame(frame);
  });
}

let played = false;

export function playIntro(reducedMotion: boolean) {
  if (played) return;
  played = true;
  document.querySelectorAll<HTMLElement>('[data-intro]').forEach((el, i) => {
    el.style.setProperty('--d', `${i * 90}ms`);
    el.classList.add('is-in');
  });
  const roles = document.querySelector<HTMLElement>('[data-roles]');
  if (roles && !reducedMotion) decode(roles);
}
