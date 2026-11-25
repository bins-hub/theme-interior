(() => {
  'use strict';
  let pending = null, installing = false;
  const button = document.getElementById('themi-native-install');
  const help = document.getElementById('themi-install-help');
  const status = document.getElementById('themi-install-status');
  const links = document.querySelectorAll('[data-themi-install]');
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function refresh() {
    button.hidden = !pending || standalone();
    button.disabled = installing;
  }
  function guide(message) {
    help.open = true;
    status.textContent = message;
    document.getElementById('install-guide').scrollIntoView({block:'start'});
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pending = event;
    refresh();
  });
  window.addEventListener('appinstalled', () => {
    pending = null;
    refresh();
    status.textContent = '설치가 완료되었습니다. 기기의 앱 목록 또는 홈 화면에서 확인하세요.';
  });
  async function requestInstall(event) {
    event.preventDefault();
    if (installing) return;
    if (standalone()) { guide('현재 앱으로 실행 중입니다.'); return; }
    if (!pending) { guide('아래에서 사용 중인 기기의 설치 방법을 확인하세요.'); return; }
    const promptEvent = pending;
    pending = null;
    installing = true;
    refresh();
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') guide('설치를 승인했습니다. 브라우저의 설치 완료 안내를 확인하세요.');
      else guide('설치가 취소되었습니다. 다시 설치하려면 아래 방법을 이용하세요.');
    } catch { guide('자동 설치 창을 열 수 없습니다. 아래 방법을 이용하세요.'); }
    finally { installing = false; refresh(); }
  }
  links.forEach(link => link.addEventListener('click', requestInstall));
  button.addEventListener('click', requestInstall);
  refresh();
})();