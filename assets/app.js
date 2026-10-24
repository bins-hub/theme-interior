(() => {
  'use strict';
  // Packaged preview imagery stays local in GitHub Pages.
  // Replace assets/images/*.jpg with verified TheMe project photos when available.
  const USE_REMOTE_DEMO_IMAGES = false;
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const inquiry = document.getElementById('inquiry-dialog');
  const spaceDialog = document.getElementById('space-dialog');
  const inquiryForm = document.getElementById('inquiry-form');
  const inquiryResult = document.getElementById('inquiry-result');
  const inquiryOutput = document.getElementById('inquiry-output');
  const liveFeedback = document.getElementById('copy-feedback');

  const setScrolled = () => header.classList.toggle('scrolled', window.scrollY > 35);
  window.addEventListener('scroll', setScrolled, { passive: true });
  setScrolled();
  document.getElementById('year').textContent = String(new Date().getFullYear());

  const setNavOpen = (open) => {
    mobileNav.classList.toggle('is-active', open);
    navToggle.classList.toggle('is-active', open);
    header.classList.toggle('menu-active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    mobileNav.inert = !open;
    document.body.classList.toggle('menu-open', open);
  };
  navToggle.addEventListener('click', () => setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNavOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNavOpen(false); });

  // Nonessential optional image enhancement: every image has a packaged offline fallback.
  if (USE_REMOTE_DEMO_IMAGES) {
    document.querySelectorAll('img[data-demo-remote]').forEach(img => {
      const remote = img.getAttribute('data-demo-remote');
      if (!remote) return;
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => { img.src = remote; };
      image.src = remote;
    });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -35px 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  const syncDialogBody = () => document.body.classList.toggle('modal-open', inquiry.open || spaceDialog.open);
  document.querySelectorAll('[data-open-inquiry]').forEach(btn => btn.addEventListener('click', () => {
    setNavOpen(false);
    inquiry.showModal();
    syncDialogBody();
  }));
  document.querySelectorAll('[data-close-inquiry]').forEach(btn => btn.addEventListener('click', () => inquiry.close()));
  [inquiry, spaceDialog].forEach(dialog => {
    dialog.addEventListener('close', syncDialogBody);
    dialog.addEventListener('click', e => {
      if (e.target === dialog) dialog.close();
    });
  });

  const roomInfo = [
    { title:'거실', summary:'생활 동선과 빛, 가구 배치를 함께 고려하는 거실 디자인입니다.' },
    { title:'주방', summary:'조리와 수납, 식사 공간의 흐름을 생각한 주방 디자인입니다.' },
    { title:'침실', summary:'온전히 쉴 수 있도록 조도와 소재, 수납을 조율한 침실 디자인입니다.' },
    { title:'현관', summary:'집의 첫인상과 실용적인 수납을 동시에 고려하는 현관 디자인입니다.' }
  ];
  document.querySelectorAll('.space-card').forEach(btn => btn.addEventListener('click', () => {
    const index = Number(btn.dataset.space);
    const photo = btn.querySelector('img');
    const target = document.getElementById('space-dialog-image');
    target.src = photo.currentSrc || photo.src;
    target.alt = photo.alt;
    document.getElementById('space-dialog-title').textContent = roomInfo[index].title;
    document.getElementById('space-dialog-copy').textContent = roomInfo[index].summary;
    spaceDialog.showModal();
    syncDialogBody();
  }));
  document.querySelectorAll('[data-close-space]').forEach(btn => btn.addEventListener('click', () => spaceDialog.close()));

  const field = (id) => document.getElementById(id).value.trim() || '미정';
  inquiryForm.addEventListener('submit', e => {
    e.preventDefault();
    inquiryOutput.textContent = [
      '[더미인테리어 TheMe | 아파트 전체 리모델링 상담 준비]',
      '',
      `아파트 위치: ${field('form-location')}`,
      `평형: ${field('form-size')}`,
      `희망 공사 시기: ${field('form-when')}`,
      `예상 예산: ${field('form-budget')}`,
      `상담하고 싶은 내용: ${field('form-notes')}`,
      '',
      '※ 위 내용은 상담용 초안이며 현재 자동으로 전송되지 않았습니다.'
    ].join('\n');
    inquiryForm.hidden = true;
    inquiryResult.hidden = false;
    liveFeedback.textContent = '';
    document.getElementById('copy-inquiry').focus();
  });
  document.getElementById('edit-inquiry').addEventListener('click', () => {
    inquiryForm.hidden = false;
    inquiryResult.hidden = true;
    document.getElementById('form-location').focus();
  });
  document.getElementById('copy-inquiry').addEventListener('click', async () => {
    const data = inquiryOutput.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data);
      } else {
        const field = document.createElement('textarea');
        field.value = data;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        if (!document.execCommand('copy')) throw new Error('copy unsupported');
        field.remove();
      }
      liveFeedback.textContent = '상담 내용이 복사되었습니다. 원하는 상담 채널에 붙여넣으세요.';
    } catch {
      liveFeedback.textContent = '자동 복사가 지원되지 않습니다. 위 내용을 길게 눌러 직접 복사해주세요.';
    }
  });
})();