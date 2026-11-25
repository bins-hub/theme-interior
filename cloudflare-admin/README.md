# TheMi Cloudflare 관리자 — 배포 안내

기존 GitHub Pages 운영 홈페이지 및 /admin/은 변경하지 않았습니다. 이 디렉터리는 별도 Cloudflare Worker로 배포합니다. Supabase, R2, D1은 필요하지 않습니다.

## 최초 설치 (Cloudflare 계정 소유자)

1. Cloudflare 계정에서 Workers & Pages를 활성화합니다. 무료 요금제 가능 여부와 사용량을 확인합니다.
2. 이 작업 브랜치를 체크아웃하고 cloudflare-admin 디렉터리에서 Wrangler로 로그인 및 배포합니다. 배포 전에는 인증에 필요한 값이 없으면 모든 요청이 403으로 거부됩니다.
3. Worker의 production URL에 Cloudflare Access를 활성화합니다. 이메일 일회용 PIN 또는 승인된 IdP를 구성하고 관리자 이메일 한 개만 허용합니다. 모든 사용자를 허용하는 정책을 사용하지 않습니다. Preview URL은 끕니다.
4. Worker Settings > Variables and Secrets에 ACCESS_TEAM_DOMAIN (예: example.cloudflareaccess.com), ACCESS_AUD (해당 Access application audience), ADMIN_EMAIL (운영자가 지정한 주소), GITHUB_TOKEN (secret)을 추가합니다. GITHUB_TOKEN은 bins-hub/theme-interior 저장소만 선택한 fine-grained PAT, Contents read/write 권한으로 생성합니다. 채팅이나 코드에 토큰을 붙이지 않습니다. 적절한 만료 기한을 지정하고 만료 전에 갱신합니다.
5. production URL에서 미인증/허용하지 않은 이메일 접근 차단, 관리자 로그인, 비민감 시험 사진 게시·수정·삭제, GitHub Pages 실제 반영 여부를 검증합니다.
6. themi.co.kr 도메인이 Cloudflare DNS에서 관리되는 경우 별도 admin.themi.co.kr Worker custom domain 연결을 검토합니다. 기존 홈페이지 DNS를 변경하지 않습니다. 새 주소를 검증한 뒤 기존 /admin/을 새 로그인 주소 안내 페이지로 교체합니다.

## 보안

Worker는 서명, 발급자, audience, 유효기간, 지정한 이메일을 검사합니다. API는 같은 origin의 요청만 쓰기 허용하며 GitHub의 저장소와 main 브랜치를 고정합니다. 토큰은 서버 secret으로만 보관합니다. 관리자는 GitHub token을 매번 입력하지 않습니다. 공개 Git 기록에 게시물과 사진이 남을 수 있으므로 고객 개인정보와 비공개 사진을 올리지 않습니다.

문서:
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- https://developers.cloudflare.com/workers/static-assets/binding/

## 검증 상태

JS 구문, 필수 DOM ID, 미설정 인증 차단, API 경로 제한, 파일 경로 검증, force push 거부 및 클라이언트 토큰 입력 제거를 모의 환경에서 검사했습니다. 실제 Worker 배포, JWT 및 로그인, 사진 게시/수정/삭제는 계정 연결과 설정 이후 검증해야 합니다.
