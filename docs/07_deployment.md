# 배포 가이드

## 1. 운영환경 아키텍처

```
코드 푸시 (GitHub)
  │
  ▼
Vercel (자동 배포)
  ├── Next.js 서버 (Serverless Functions)
  ├── 정적 파일 (CDN)
  └── 환경변수 관리
        │
        ▼
  Supabase
  ├── PostgreSQL 데이터베이스
  ├── Auth (사용자 인증)
  └── Storage (이미지 파일)
```

---

## 2. Supabase 설정

### 2.1 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 후 계정 생성
2. **New Project** 클릭
3. 프로젝트명, DB 비밀번호, 리전(Northeast Asia - Tokyo 권장) 설정
4. 프로젝트 생성 완료까지 약 2분 소요

### 2.2 환경변수 확인

Supabase Dashboard → **Settings** → **API**

```
NEXT_PUBLIC_SUPABASE_URL      = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...  (anon public)
SUPABASE_SERVICE_ROLE_KEY     = eyJhbGci...  (service_role - 절대 클라이언트에 노출 금지)
```

### 2.3 데이터베이스 마이그레이션

Supabase Dashboard → **SQL Editor**에서 마이그레이션 파일 순서대로 실행:

```sql
-- 순서대로 실행
-- 1. src/lib/migrations/001_create_users.sql
-- 2. src/lib/migrations/002_create_businesses.sql
-- 3. ...
-- 6. src/lib/migrations/006_create_notifications.sql
-- (운영환경에는 999_seed_data.sql 실행 불필요)
```

또는 Supabase CLI 사용:

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결 (최초 1회 - Supabase 프로젝트 ref는 대시보드 URL에서 확인)
supabase link --project-ref [프로젝트-ref]

# 로컬 마이그레이션 파일을 원격 DB에 적용
supabase db push
```

### 2.4 Row Level Security (RLS) 설정

Supabase Dashboard → **Authentication** → **Policies**에서 각 테이블에 RLS 정책 적용.
`03_database-schema.md`의 RLS 섹션 참고.

### 2.5 Supabase Auth 설정

1. Dashboard → **Authentication** → **Providers**
2. Email 프로바이더 활성화
3. 이메일 확인 설정 (선택): 개발 초기에는 비활성화 권장

### 2.6 Storage 버킷 생성

```
버킷명: business-assets
공개 설정: Public (업체 로고/커버 이미지는 공개)
허용 파일 타입: image/*
최대 파일 크기: 5MB
```

---

## 3. Vercel 배포 설정

### 3.1 GitHub 연동 배포

1. [vercel.com](https://vercel.com) 접속 후 GitHub 계정으로 로그인
2. **New Project** → GitHub 저장소 선택
3. Framework: **Next.js** 자동 감지
4. 환경변수 설정 (아래 3.2 참고)
5. **Deploy** 클릭

### 3.2 Vercel 환경변수 설정

Vercel Dashboard → **Settings** → **Environment Variables**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# 앱
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app  # 또는 커스텀 도메인

# 이메일
SMTP_HOST=smtp.resend.com   # 운영환경은 Resend 권장
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxx
SMTP_FROM=noreply@reserveos.kr
```

> **주의**: `NEXT_PUBLIC_` 접두사가 붙은 변수는 브라우저에 노출됩니다.
> `SUPABASE_SERVICE_ROLE_KEY`는 절대 `NEXT_PUBLIC_`을 붙이지 마세요.

### 3.3 자동 배포 설정

Vercel은 기본적으로 다음과 같이 자동 배포합니다:

| 브랜치 | 배포 환경 | URL |
|--------|-----------|-----|
| `main` | Production | `your-domain.vercel.app` |
| `develop` | Preview | `develop.your-domain.vercel.app` |
| PR 브랜치 | Preview | `pr-123.your-domain.vercel.app` |

### 3.4 커스텀 도메인 연결

1. Vercel Dashboard → **Settings** → **Domains**
2. 도메인 추가 (예: `reserveos.kr`)
3. DNS 설정: 도메인 등록 업체에서 아래 레코드 추가

```
Type  Name  Value
A     @     76.76.21.21     (Vercel IP)
CNAME www   cname.vercel-dns.com
```

---

## 4. CI/CD 파이프라인

### 4.1 GitHub Actions (선택)

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: lint-and-type-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### 4.2 배포 브랜치 전략

```
main          ← 운영 배포 (Vercel Production)
  └── develop ← 개발 통합 (Vercel Preview)
        └── feature/xxx  ← 기능 개발
        └── fix/xxx      ← 버그 수정
```

---

## 5. Dockerfile (운영환경 참고용)

Vercel을 사용하므로 별도 서버 배포가 필요 없지만,
자체 서버 배포 시를 위한 운영용 Dockerfile:

`Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# 의존성 설치 단계
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 실행 단계
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

`next.config.ts`에 추가:

```typescript
const nextConfig = {
  output: 'standalone',  // Docker 배포 시 필요
}
```

---

## 6. 운영 체크리스트

### 배포 전 확인사항

- [ ] 모든 환경변수 Vercel에 설정 완료
- [ ] Supabase DB 마이그레이션 실행 완료
- [ ] Supabase RLS 정책 적용 완료
- [ ] Storage 버킷 생성 완료
- [ ] 커스텀 도메인 DNS 설정 완료
- [ ] HTTPS 적용 확인 (Vercel 자동 적용)
- [ ] 이메일 발송 테스트 완료
- [ ] 모바일 반응형 확인
- [ ] 예약 전체 플로우 테스트 (고객용)
- [ ] 대시보드 전체 기능 테스트 (사장님용)

### 모니터링

- **Vercel Dashboard**: 배포 현황, 서버리스 함수 로그, 응답 시간
- **Supabase Dashboard**: DB 연결 수, 쿼리 성능, 스토리지 사용량
- **에러 트래킹**: Sentry 연동 권장 (선택)

---

## 7. 이메일 서비스 비교

| 서비스 | 무료 한도 | 가격 | 권장 |
|--------|-----------|------|------|
| Resend | 3,000건/월 | $20/월 (50k건) | ✅ 개발자 친화적 |
| Mailgun | 5,000건/월 | $35/월 | - |
| Sendgrid | 100건/일 | $19.95/월 | - |
| Nodemailer + Gmail | 500건/일 | 무료 | 소규모 테스트용 |

운영환경 권장: **Resend** (Next.js 생태계에서 인기, API 간단)

```bash
npm install resend
```

```typescript
// src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReservationConfirmed(to: string, data: ReservationData) {
  await resend.emails.send({
    from: 'ReserveOS <noreply@reserveos.kr>',
    to,
    subject: `[예약확정] ${data.businessName} - ${data.date} ${data.time}`,
    html: `...`
  })
}
```
