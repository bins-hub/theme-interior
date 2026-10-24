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
  document.querySelectorAll('[data-theme-directions-link]').forEach(a => {
    if (company.directionsUrl) a.href = company.directionsUrl;
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
  document.querySelectorAll('[data-open-inquiry], [data-open-inquiry-link]').forEach(btn => btn.addEventListener('click', event => {
    event.preventDefault();
    setNavOpen(false);
    inquiry.showModal();
    syncDialogBody();
    if (btn.matches('[data-open-inquiry-link]')) {
      const projectType = document.getElementById('form-type');
      projectType.value = '상업공간 인테리어';
      projectType.dispatchEvent(new Event('change', {bubbles:true}));
    }
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

  // 상담 접수: GitHub Pages 자체에는 메일 서버가 없으므로 FormSubmit AJAX 사용.
  // 전송 오류나 수신 이메일 미인증 상태는 절대로 '접수 완료'로 표시하지 않습니다.
  const formType = document.getElementById('form-type');
  const formSize = document.getElementById('form-size');
  const commercialWrap = document.getElementById('form-commercial-wrap');
  const commercialField = document.getElementById('form-commercial');
  const formStatus = document.getElementById('inquiry-status');
  const submitButton = document.getElementById('send-inquiry');
  const fallbackButton = document.getElementById('email-fallback');
  const formMessage = document.getElementById('inquiry-result-message');
  let isSubmitting = false;

  const field = id => document.getElementById(id).value.trim();
  const valueOrUnknown = id => field(id) || '미정';
  const formatSubject = () => '[디자인더미 TheMe] ' + (field('form-type') || '인테리어') + ' 상담 - ' + (field('form-name') || '고객');
  const formatDetails = () => [
    '회사: 디자인더미 TheMe',
    '상담 분야: ' + valueOrUnknown('form-type'),
    '고객 성함: ' + valueOrUnknown('form-name'),
    '고객 연락처: ' + valueOrUnknown('form-phone'),
    '공사 예정 위치: ' + valueOrUnknown('form-location'),
    '면적/평형: ' + valueOrUnknown('form-size'),
    ...(formType.value === '상업공간 인테리어' ? ['상업공간 종류: ' + valueOrUnknown('form-commercial')] : []),
    '희망 공사 시기: ' + valueOrUnknown('form-when'),
    '예상 예산: ' + valueOrUnknown('form-budget'),
    '상담 내용: ' + valueOrUnknown('form-notes')
  ].join('\n');

  function updateConsultationType() {
    const commercial = formType.value === '상업공간 인테리어';
    const previousValue = formSize.value;
    const sizes = commercial
      ? ['10평 미만', '10~20평', '20~40평', '40~60평', '60평 이상', '미정']
      : ['20평대', '30평대', '40평대', '50평대 이상', '아직 미정'];
    formSize.replaceChildren(new Option('선택해주세요', ''), ...sizes.map(v => new Option(v, v)));
    if (sizes.includes(previousValue)) formSize.value = previousValue;
    commercialWrap.hidden = !commercial;
    commercialField.disabled = !commercial;
    commercialField.required = commercial;
    if (!commercial) commercialField.value = '';
    document.getElementById('form-location-label').textContent = commercial ? '매장·사무실 위치' : '아파트 위치';
    document.getElementById('form-location').placeholder = commercial ? '예: 경기 하남시, 미사역 인근' : '예: 경기 하남시';
  }
  formType.addEventListener('change', updateConsultationType);
  updateConsultationType();

  const clearStatus = () => {
    formStatus.textContent = '';
    formStatus.className = 'inquiry-status';
  };
  const setStatus = (kind, text) => {
    formStatus.textContent = text;
    formStatus.className = 'inquiry-status' + (kind ? ' ' + kind : '');
  };

  function mailFallback() {
    const email = String(company.inquiryEmail || '').trim();
    if (!email) {
      setStatus('is-error', '상담 이메일이 설정되지 않았습니다. 전화 상담을 이용해주세요.');
      return;
    }
    if (!field('form-name') || !field('form-phone')) {
      setStatus('is-error', '성함과 연락처를 먼저 입력해 주세요.');
      return;
    }
    const url = 'mailto:' + encodeURIComponent(email)
      + '?subject=' + encodeURIComponent(formatSubject())
      + '&body=' + encodeURIComponent(formatDetails());
    window.location.href = url;
    setStatus('is-note', '메일 앱이 열리면 내용을 확인한 뒤 직접 보내기를 눌러주세요.');
  }
  fallbackButton.addEventListener('click', mailFallback);

  inquiryForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (isSubmitting) return;
    clearStatus();
    if (!inquiryForm.reportValidity()) return;

    const phone = field('form-phone').replace(/[\s\-().]/g, '');
    if (!/^0\d{8,10}$/.test(phone)) {
      setStatus('is-error', '연락처를 다시 확인해 주세요. 숫자로 9~11자리를 입력해주세요.');
      document.getElementById('form-phone').focus();
      return;
    }
    const inbox = String(company.inquiryEmail || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inbox)) {
      setStatus('is-error', '상담 이메일이 아직 설정되지 않았습니다. 전화 상담을 이용해주세요.');
      return;
    }
    if (field('form-honey')) {
      setStatus('is-error', '상담 전송을 처리하지 못했습니다. 전화로 문의해주세요.');
      return;
    }

    const payload = {
      name: field('form-name'),
      phone: field('form-phone'),
      consultation_type: field('form-type'),
      location: field('form-location') || '미정',
      space_size: field('form-size') || '미정',
      commercial_category: formType.value === '상업공간 인테리어' ? valueOrUnknown('form-commercial') : '해당 없음',
      schedule: field('form-when') || '미정',
      budget: field('form-budget') || '미정',
      message: field('form-notes') || '별도 문의 내용 없음',
      _subject: formatSubject(),
      _template: 'table',
      _honey: '',
      _url: 'https://bins-hub.github.io/theme-interior/'
    };

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = '전송 처리 중…';
    setStatus('is-note', '전송 서비스로 신청 정보를 전달하는 중입니다.');
    try {
      const endpoint = (company.formSubmitEndpoint || 'https://formsubmit.co/ajax/')
        + encodeURIComponent(inbox);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const raw = await response.text();
      let result;
      try { result = JSON.parse(raw); } catch { throw new Error('서버가 올바른 응답을 반환하지 않았습니다.'); }
      // FormSubmit uses string "true" / "false" even for HTTP 200 failures.
      if (!response.ok || String(result.success).toLowerCase() !== 'true') {
        const providerMessage = String(result.message || '');
        if (/activat|verif|confirm|actived/i.test(providerMessage)) {
          setStatus('is-warning', '수신 이메일 인증이 필요합니다. 디자인더미 담당자가 테스트 수신 메일의 “Activate Form”을 눌러야 이후 상담 메일이 수신됩니다. 지금은 접수 완료 상태가 아닙니다.');
        } else {
          setStatus('is-error', '상담 정보가 전송되지 않았습니다. 전화 상담 또는 메일 앱 직접 작성 기능을 이용해주세요.');
        }
        return;
      }
      inquiryForm.hidden = true;
      document.getElementById('inquiry-result').hidden = false;
      formMessage.textContent = '상담 내용이 전송 서비스에서 성공으로 처리됐습니다. 담당자가 실제 이메일 수신을 확인한 뒤 연락드립니다.';
      liveFeedback.textContent = '';
    } catch {
      setStatus('is-error', '네트워크 문제로 자동 전송 여부를 확인하지 못했습니다. 중복 제출 전에 담당자에게 전화로 확인하거나 메일 앱으로 직접 보내주세요.');
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.innerHTML = '상담 신청 전송하기 <span aria-hidden="true">→</span>';
    }
  });

  document.getElementById('edit-inquiry').addEventListener('click', () => {
    inquiryForm.reset();
    updateConsultationType();
    inquiryForm.hidden = false;
    document.getElementById('inquiry-result').hidden = true;
    clearStatus();
    document.getElementById('form-type').focus();
  });
})();
