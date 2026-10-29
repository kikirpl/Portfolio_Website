// Project detail view. One source of truth: store.active. A click on a 3D screen and a
// click on a "View project" button both set it; this module renders the native <dialog>
// (focus trap, Esc, inert page) while the 3D camera flies to the same project.
import { store, openProject, closeProject } from '../lib/store';
import { lockScroll, scrollToY } from './scroll';

export function initDialog() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-detail]');
  if (!dialog) return;
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-project]'));
  const part = (name: string) => dialog.querySelector<HTMLElement>(`[data-detail-${name}]`)!;
  const title = part('title');
  const count = part('count');
  const desc = part('desc');
  const tech = part('tech');
  const links = part('links');
  const media = part('media');
  const prevName = part('prev');
  const nextName = part('next');
  const total = items.length;
  let returnFocus: HTMLElement | null = null;

  const nameOf = (i: number) => items[i]?.querySelector('[data-project-name]')?.textContent?.trim() ?? '';
  const pad = (n: number) => String(n).padStart(2, '0');

  function render(i: number) {
    const item = items[i];
    if (!item) return;
    dialog!.style.setProperty('--glow', item.dataset.glow ?? '');
    title.textContent = nameOf(i);
    desc.textContent = item.querySelector('[data-project-desc]')?.textContent?.trim() ?? '';
    tech.innerHTML = item.querySelector('[data-project-tech]')?.innerHTML ?? '';
    const anchors = item.querySelectorAll('[data-project-links] a');
    links.replaceChildren(...Array.from(anchors, (a) => a.cloneNode(true)));
    count.textContent = `${pad(i + 1)} / ${pad(total)}`;
    prevName.textContent = nameOf((i - 1 + total) % total);
    nextName.textContent = nameOf((i + 1) % total);

    media.replaceChildren();
    const picture = item.querySelector('picture');
    if (store.getState().mode === '2d' && picture) {
      const clone = picture.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('source').forEach((s) => (s.sizes = '(min-width: 760px) 60vw, 92vw'));
      const img = clone.querySelector('img');
      if (img) img.loading = 'eager';
      media.append(clone);
    }
  }

  function open(i: number) {
    render(i);
    if (dialog!.open) return;
    returnFocus ??= items[i]?.querySelector<HTMLElement>('[data-open-project]') ?? null;
    lockScroll(true);
    document.documentElement.classList.add('is-detail');
    dialog!.showModal();
    title.focus({ preventScroll: true });
  }

  function close(lastIndex: number) {
    if (!dialog!.open) return;
    dialog!.close();
    document.documentElement.classList.remove('is-detail');
    // Leave the page on the project that was shown last, so the camera returns to it.
    const stop = store.getState().stops.find((s) => s.key === `project:${lastIndex}`);
    if (stop && Math.abs(window.scrollY - stop.y) > 4) scrollToY(stop.y, { immediate: true });
    lockScroll(false);
    const focusTarget =
      returnFocus && items[lastIndex]?.contains(returnFocus)
        ? returnFocus
        : items[lastIndex]?.querySelector<HTMLElement>('[data-open-project]');
    focusTarget?.focus({ preventScroll: true });
    returnFocus = null;
  }

  const step = (delta: number) => {
    const { active } = store.getState();
    if (active !== null) openProject((active + delta + total) % total);
  };

  store.subscribe((s, prev) => {
    if (s.active === prev.active) return;
    if (s.active !== null) open(s.active);
    else if (prev.active !== null) close(prev.active);
  });

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element).closest<HTMLElement>('[data-open-project]');
    if (!trigger) return;
    returnFocus = trigger;
    openProject(Number(trigger.dataset.openProject));
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeProject();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeProject();
  });
  part('close').addEventListener('click', closeProject);
  dialog.querySelectorAll<HTMLElement>('[data-detail-step]').forEach((button) => {
    button.addEventListener('click', () => step(Number(button.dataset.detailStep)));
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') step(1);
    else if (event.key === 'ArrowLeft') step(-1);
  });
}
