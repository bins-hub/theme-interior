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
  // Contact data is managed in one place: assets/site-config.js
  const company = window.THEME_SITE_CONFIG || {};
  const inquiryEmail = String(company.inquiryEmail || '').trim();
  document.querySelectorAll('[data-theme-email-link]').forEach(a => {
    if (inquiryEmail) a.href = 'mailto:' + inquiryEmail;
  });
  document.querySelectorAll('[data-theme-phone-link]').forEach(a => {
    if (company.phoneDial) a.href = 'tel:' + company.phoneDial;
    if (company.phoneDisplay) a.textContent = a.closest('.footer')
      ? '전화 · ' + company.phoneDisplay
      : '전화 상담 · ' + company.phoneDisplay + ' ↗';
  });
  document.querySelectorAll('[data-theme-blog-link]').forEach(a => {
    if (company.blogUrl) a.href = company.blogUrl;
  });
  document.querySelectorAll('[data-theme-map-link]').forEach(a => {
    if (company.mapUrl) a.href = company.mapUrl;
  });
  document.querySelectorAll('[data-theme-address]').forEach(el => {
    if (company.address) el.textContent = company.address;
  });


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
  let preparedEmail = '';
  inquiryForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    if (!inquiryEmail) {
      window.alert('상담 이메일이 아직 설정되지 않았습니다. 전화 상담을 이용해주세요.');
      return;
    }
    inquiryOutput.textContent = [
      '[디자인더미 TheMe | 아파트 전체 리모델링 상담]',
      '',
      '성함: ' + field('form-name'),
      '연락처: ' + field('form-phone'),
      '아파트 위치: ' + field('form-location'),
      '평형: ' + field('form-size'),
      '희망 공사 시기: ' + field('form-when'),
      '예상 예산: ' + field('form-budget'),
      '상담하고 싶은 내용: ' + field('form-notes'),
      '',
      '※ 이 화면만으로는 상담이 접수되지 않습니다. 메일 앱에서 보내기를 눌러주세요.'
    ].join('\n');
    const subject = '[디자인더미 TheMe] 아파트 리모델링 상담 - ' + field('form-name');
    preparedEmail = 'mailto:' + encodeURIComponent(inquiryEmail)
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(inquiryOutput.textContent);
    inquiryForm.hidden = true;
    inquiryResult.hidden = false;
    liveFeedback.textContent = '상담 메일 초안이 준비됐습니다. 메일 앱에서 직접 전송해주세요.';
    document.getElementById('send-inquiry').focus();
  });

  document.getElementById('send-inquiry').addEventListener('click', () => {
    if (!preparedEmail) return;
    liveFeedback.textContent = '메일 앱을 열고, 전송 버튼을 눌러주세요. 홈페이지에서 자동 접수되지 않습니다.';
    window.location.href = preparedEmail;
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
        const temp = document.createElement('textarea');
        temp.value = data;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        const copied = document.execCommand('copy');
        temp.remove();
        if (!copied) throw new Error('copy unavailable');
      }
      liveFeedback.textContent = '내용을 복사했습니다. 이메일에 붙여넣어 직접 보내주세요.';
    } catch {
      liveFeedback.textContent = '자동 복사를 사용할 수 없습니다. 내용을 길게 눌러 복사해주세요.';
    }
  });
})();
