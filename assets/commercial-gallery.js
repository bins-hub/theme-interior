(() => {
  'use strict';
  const cards = [...document.querySelectorAll('[data-commercial-gallery]')];
  const dialog = document.getElementById('commercial-lightbox');
  if (!cards.length || !dialog) return;

  const photo = document.getElementById('commercial-lightbox-image');
  const caption = document.getElementById('commercial-lightbox-caption');
  const count = document.getElementById('commercial-count');
  let active = 0;
  let originScroll = 0;
  let originElement = null;
  let initialBodyStyle = null;

  const showPhoto = (index) => {
    active = (index + cards.length) % cards.length;
    const selected = cards[active];
    const image = selected.querySelector('img');
    const heading = selected.querySelector('strong');
    photo.src = image.currentSrc || image.src;
    photo.alt = image.alt;
    caption.textContent = heading?.textContent || image.alt;
    count.textContent = (active + 1) + ' / ' + cards.length;
  };

  const freezePage = (clicked) => {
    originScroll = window.scrollY || document.documentElement.scrollTop || 0;
    originElement = clicked;
    initialBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width
    };
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + originScroll + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  const unfreezePage = () => {
    if (!initialBodyStyle) return;
    const previous = initialBodyStyle;
    initialBodyStyle = null;
    Object.assign(document.body.style, previous);
    const root = document.documentElement;
    const scrollStyle = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, originScroll);
    requestAnimationFrame(() => {
      window.scrollTo(0, originScroll);
      if (originElement?.isConnected) {
        try { originElement.focus({ preventScroll: true }); } catch (_) {}
      }
      root.style.scrollBehavior = scrollStyle;
      originElement = null;
    });
  };

  cards.forEach((card, i) => card.addEventListener('click', () => {
    showPhoto(i);
    freezePage(card);
    dialog.showModal();
  }));

  document.getElementById('commercial-prev').addEventListener('click', () => showPhoto(active - 1));
  document.getElementById('commercial-next').addEventListener('click', () => showPhoto(active + 1));
  dialog.querySelectorAll('[data-gallery-close]').forEach(btn => {
    btn.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', unfreezePage);
  document.addEventListener('keydown', (event) => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(active - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(active + 1); }
  });
})();
