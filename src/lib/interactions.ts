export function initNavigation(): void {
  const button = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const nav = document.querySelector<HTMLElement>('.site-nav');
  const contact = document.querySelector<HTMLAnchorElement>('.nav-join');
  if (!button || !nav || !contact) return;

  const mobile = window.matchMedia('(max-width: 900px)');
  const setOpen = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('span')!.textContent = open ? 'Закрыть' : 'Меню';
    nav.classList.toggle('is-open', open);
    nav.inert = mobile.matches && !open;
    document.body.classList.toggle('menu-open', open && mobile.matches);
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  const followLink = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    setOpen(false);
    if (!mobile.matches) return;

    const section = document.getElementById(link.hash.slice(1));
    const headingId = section?.getAttribute('aria-labelledby');
    const heading = headingId && document.getElementById(headingId);
    if (heading) {
      heading.tabIndex = -1;
      requestAnimationFrame(() => heading.focus({ preventScroll: true }));
    }
  };
  nav.addEventListener('click', followLink);
  contact.addEventListener('click', followLink);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
    if (event.key === 'Tab' && mobile.matches && button.getAttribute('aria-expanded') === 'true') {
      const links = nav.querySelectorAll<HTMLAnchorElement>('a');
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === button) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        button.focus();
      }
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!(event.target as Element).closest('.header-inner')) setOpen(false);
  });
  mobile.addEventListener('change', () => setOpen(false));
  setOpen(false);

  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a'), contact];
  const sections = [...document.querySelectorAll<HTMLElement>('main > section[id]')];
  let scheduled = false;
  const updateActive = () => {
    const offset = Math.min(window.innerHeight * 0.3, 220);
    const active = sections.filter(section => section.getBoundingClientRect().top <= offset).at(-1);
    links.forEach(link => {
      const current = link.hash === `#${active?.id}`;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateActive); }
  }, { passive: true });
  updateActive();
}

export function initReveals(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const elements = document.querySelectorAll<HTMLElement>('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.body.classList.add('motion-ready');
  elements.forEach(element => observer.observe(element));
  reduced.addEventListener('change', event => {
    if (event.matches) {
      document.body.classList.remove('motion-ready');
      observer.disconnect();
    }
  });
}

export function initContactCopy(): void {
  const button = document.querySelector<HTMLButtonElement>('.contact-copy');
  const address = button?.querySelector('.contact-address');
  const status = document.querySelector('.copy-status');
  if (!button || !address || !status) return;

  button.addEventListener('click', async () => {
    if (button.dataset.state === 'prompt') {
      button.dataset.state = 'address';
      button.setAttribute('aria-label', `Скопировать адрес ${address.textContent}`);
      return;
    }

    try {
      await navigator.clipboard.writeText(address.textContent);
      button.dataset.state = 'copied';
      status.textContent = 'Адрес скопирован';
    } catch {
      button.dataset.state = 'address';
      window.getSelection()?.selectAllChildren(address);
      status.textContent = 'Скопируйте выделенный адрес вручную';
    }
  });
}

export function restoreAnchor(): void {
  if (!window.location.hash) return;
  let id: string;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return;
  }
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }));
}
