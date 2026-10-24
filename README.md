# 디자인더미 TheMe | 공식 홈페이지

**공개 사이트:** https://bins-hub.github.io/theme-interior/  
**저장소:** https://github.com/bins-hub/theme-interior

경기도 하남의 **디자인더미(TheMe)** 인테리어 홈페이지. 아파트 전체 리모델링과 상업공간 인테리어를 소개하고 온라인 상담을 접수하는 정적 HTML/CSS/JavaScript 사이트입니다.

## 공개 페이지

| 페이지 | 역할 |
|---|---|
| `index.html` | 메인 소개, 주거공간·상업공간 연결, 상담 양식, 연락처 |
| `apartment-remodeling.html` | 미사 단독주택(3장), 덕풍동 제일풍경채(7장) 포트폴리오 |
| `commercial-interior.html` | 상업공간 사진 5장 포트폴리오 |
| `sitemap.xml` | 공개 페이지 3개의 사이트맵 |
| `assets/images/residential/` | 주거공간 프로젝트 이미지 |
| `assets/images/commercial/` | 상업공간 프로젝트 이미지 |

사진 원본과 편집본 사용 권한, 프로젝트 표기 권한은 운영자가 관리·확인합니다. 설명에는 확인된 사실만 사용하고 실제 후기, 공사비, 공사 기간이나 자격을 임의로 기재하지 않습니다.

## 운영 연락처

- 상호: **디자인더미** (TheMe)
- 전화: **031-792-4551**
- 주소: **경기 하남시 덕풍북로251번길 36 1층**
- 블로그: https://blog.naver.com/771jung
- 현재 온라인 상담 수신 주소: `n3888171@gmail.com`

**연락처 변경:** `assets/site-config.js`의 `inquiryEmail`, `phoneDisplay`, `phoneDial`, `address`, `blogUrl`을 수정합니다. 티맵 길찾기 목적지 좌표도 동일한 설정 파일에서 관리합니다.

## 상담 전송

메인 페이지의 상담 폼은 `FormSubmit` AJAX 서비스(`https://formsubmit.co/ajax/`)를 이용해 현재 이메일 수신 주소로 데이터를 전송합니다. 주거공간과 상업공간 항목은 선택에 따라 달라집니다. 개인정보 수집·이용 고지 및 동의 체크를 필수로 유지합니다.

- 이메일 주소 변경 시 새 수신함에서 FormSubmit 인증이 다시 필요할 수 있습니다.
- API 응답 성공과 **실제 수신함 도착 확인은 다른 사항**입니다. 전송 오류 또는 인증 미완료일 때 고객에게 접수 완료를 표시하지 않습니다.
- 메일 앱 직접 작성과 전화 상담도 대안으로 제공합니다.
- 외부 접수 서비스 이용약관, 개인정보 처리·보유 기간, 국외 처리 여부 등의 최신 정책은 운영자가 정기적으로 확인해야 합니다.

## 포트폴리오/길찾기

- 주거공간: 프로젝트별 사진 확대, 이전/다음, 팝업 종료 후 원래 스크롤 위치 복귀
- 상업공간: 사진 5장, 모바일 가로 탐색, 사진 확대
- 메인 갤러리와 상세페이지에서 **네이버 블로그 시공사례**로 이동
- 티맵 길찾기는 모바일 앱 딥링크를 사용하므로 앱 미설치/일부 브라우저에서는 열리지 않을 수 있습니다. 주소 복사 및 티맵 설치 링크가 함께 제공됩니다. `site-config.js`의 목적지 좌표는 현장에서 정확한 입구 위치 확인을 권장합니다.

## 배포

GitHub 저장소 Settings → Pages → Deploy from a branch → **main / (root)**. `.nojekyll` 파일로 Jekyll 변환을 건너뛰며, main 변경 후 Pages 빌드·배포가 실행됩니다. 최신 HTML과 JS에는 캐시 구분자가 설정되어 있습니다.

SEO: 세 공개 페이지에 페이지별 `title`, `description`, `canonical`, 구조화 데이터가 있고 메인 페이지의 `robots`는 `index,follow`입니다. 사이트맵은 `/theme-interior/sitemap.xml`에 있습니다. 별도 도메인이 없는 GitHub 프로젝트 경로에서는 `robots.txt`가 호스트 루트의 공통 robots 규칙을 대체하지 않습니다. **검색 노출·검색엔진 소유 확인·색인 등록은 별도 검증 대상**입니다.

## 보존 및 복구

최종 공개용 문구 정리 전 브랜치: `backup/before-production-copy-audit-20261024`.

실사용 상담 수신함에서의 전송·수신 확인, 휴대폰에서 티맵 호출, 포트폴리오 팝업 동작은 운영 환경에서 확인해야 합니다. 이 README는 GitHub 유지보수용 문서이며 고객용 홈페이지에 표시되지 않습니다.
