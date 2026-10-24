(() => {
  'use strict';
  const dialog = document.getElementById('residential-lightbox');
  if (!dialog) return;
  const groups = {
    misa: [
      {src:'misa-dining.webp',alt:'미사 단독주택의 우드톤 다이닝과 주방',title:'주방 · 다이닝'},
      {src:'misa-bath.webp',alt:'미사 단독주택의 차콜 타일 욕실과 욕조',title:'욕실'},
      {src:'misa-hall.webp',alt:'미사 단독주택의 우드 마감 복도와 다이닝 공간',title:'복도 · 수납'}
    ],
    deokpung: [
      {src:'deokpung-open-space.webp',alt:'덕풍동 제일풍경채 리모델링의 오픈형 주방과 생활공간',title:'거실 · 주방 전체'},
      {src:'deokpung-kitchen-overview.webp',alt:'덕풍동 제일풍경채 리모델링의 주방 전체 동선',title:'주방 · 수납'},
      {src:'deokpung-kitchen-front.webp',alt:'덕풍동 제일풍경채 리모델링의 그레이 톤 조리 공간',title:'주방 디테일'},
      {src:'deokpung-kitchen-side.webp',alt:'덕풍동 제일풍경채 리모델링의 주방 측면',title:'주방의 다른 시선'},
      {src:'deokpung-room.webp',alt:'덕풍동 제일풍경채 리모델링의 라벤더 톤 생활공간',title:'생활공간'},
      {src:'deokpung-dressing.webp',alt:'덕풍동 제일풍경채 리모델링의 밝은 수납·드레스룸 동선',title:'수납 · 복도'},
      {src:'deokpung-living.webp',alt:'덕풍동 제일풍경채 리모델링의 클래식 마감과 바닥 디자인',title:'거실 · 공간 전체'}
    ]
  };
  const labels = {misa:'미사 단독주택',deokpung:'덕풍동 제일풍경채'};
  const image = document.getElementById('residential-lightbox-image');
  const name = document.getElementById('residential-lightbox-title');
  const count = document.getElementById('residential-lightbox-count');
  const projectLabel = document.getElementById('residential-lightbox-project');
  let group = 'misa';
  let index = 0;
  let savedY = 0;
  let trigger = null;
  let bodyStyles = null;

  function renderPhoto() {
    const items = groups[group];
    index = (index + items.length) % items.length;
    const selected = items[index];
    image.src = 'assets/images/residential/' + selected.src;
    image.alt = selected.alt;
    name.textContent = selected.title;
    count.textContent = (index + 1) + ' / ' + items.length;
    projectLabel.textContent = labels[group];
  }

  function lockScroll(source) {
    savedY = window.scrollY || document.documentElement.scrollTop || 0;
    trigger = source;
    const s = document.body.style;
    bodyStyles = {position:s.position,top:s.top,left:s.left,right:s.right,width:s.width};
    s.position = 'fixed'; s.top = '-' + savedY + 'px'; s.left='0'; s.right='0'; s.width='100%';
  }

  function restoreScroll() {
    if (!bodyStyles) return;
    Object.assign(document.body.style,bodyStyles);
    bodyStyles = null;
    const root = document.documentElement;
    const oldBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0,savedY);
    requestAnimationFrame(() => {
      window.scrollTo(0,savedY);
      try {trigger?.focus({preventScroll:true})} catch (_) {}
      root.style.scrollBehavior = oldBehavior;
      trigger = null;
    });
  }

  document.querySelectorAll('[data-res-photo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const project = btn.dataset.project;
      if (!groups[project]) return;
      group = project; index = Number(btn.dataset.index) || 0;
      renderPhoto(); lockScroll(btn);
      try {dialog.showModal()} catch (_) {restoreScroll()}
    });
  });
  document.getElementById('residential-photo-prev').addEventListener('click',() => {index--;renderPhoto()});
  document.getElementById('residential-photo-next').addEventListener('click',() => {index++;renderPhoto()});
  dialog.querySelectorAll('[data-res-close]').forEach(btn => btn.addEventListener('click',() => dialog.close()));
  dialog.addEventListener('click',ev => {if(ev.target===dialog)dialog.close()});
  dialog.addEventListener('close',restoreScroll);
  document.addEventListener('keydown',ev => {
    if(!dialog.open)return;
    if(ev.key==='ArrowLeft'){ev.preventDefault();index--;renderPhoto()}
    else if(ev.key==='ArrowRight'){ev.preventDefault();index++;renderPhoto()}
  });
})();