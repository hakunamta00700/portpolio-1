# 시스템 아키텍처 설계

## 1. 전체 아키텍처 개요

### 1.1 개발환경 vs 운영환경

```
┌─────────────────────────────────────────────────────────────┐
│                       개발환경 (Local)                        │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Browser   │───▶│  Next.js     │───▶│  SQLite       │  │
│  │             │    │  :3000       │    │  (dev.db)     │  │
│  └─────────────┘    │  npm run dev │    │  파일 기반    │  │
│                     └──────────────┘    └───────────────┘  │
│                     Docker 불필요 - Node.js만 있으면 됨      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      운영환경 (Production)                    │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Browser   │───▶│  Vercel      │───▶│   Supabase    │  │
│  │             │    │  (Next.js)   │    │  - PostgreSQL │  │
│  └─────────────┘    │              │    │  - Storage    │  │
│                     └──────────────┘    └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 개발환경 아키텍처

### 2.1 구성 요소

Docker 없이 Node.js 하나만으로 개발 가능합니다.

```
개발환경
├── Next.js dev server (npm run dev)
├── SQLite DB (./dev.db 파일)  ← 서버 설치 불필요
└── Drizzle ORM                ← SQLite ↔ PostgreSQL 추상화
```

### 2.2 개발환경 데이터 흐름

```
Browser
  │
  ▼
Next.js App (localhost:3000)
  ├── /app/(customer)/[slug]/    → 고객 예약 페이지 (SSR)
  ├── /app/(dashboard)/          → 사장님 대시보드 (CSR)
  └── /app/api/                  → API Routes
        ├── /api/auth/           → 인증 처리
        ├── /api/businesses/     → 업체 관리
        ├── /api/reservations/   → 예약 관리
        └── /api/slots/          → 시간 슬롯 조회
            │
            ▼
        Drizzle ORM
            │
            ▼
        SQLite (./dev.db)
```

---

## 3. 운영환경 아키텍처

### 3.1 Vercel + Supabase 구성

```
사용자 브라우저
  │
  ▼
Vercel CDN (Edge Network)
  │
  ▼
Next.js Application (Vercel Serverless)
  ├── Static Assets       → Vercel CDN 캐싱
  ├── SSR Pages           → Vercel Edge/Serverless Function
  └── API Routes          → Vercel Serverless Function
        │
        ├──────────────────────────────┐
        ▼                              ▼
  Supabase PostgreSQL          Supabase Storage
  (DB 쿼리)                    (이미지 업로드)
        │
        ▼
  Supabase Auth
  (JWT 토큰 검증)
```

### 3.2 환경변수 분리 전략

```
.env.local (개발용 - git 제외)
  DATABASE_URL=file:./dev.db          ← SQLite 파일 경로
  NEXTAUTH_SECRET=dev-secret
  NEXT_PUBLIC_APP_URL=http://localhost:3000

.env.production (Vercel 환경변수로 관리)
  DATABASE_URL=postgresql://...       ← Supabase DB 연결 문자열
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
  SUPABASE_SERVICE_ROLE_KEY=xxx
  NEXTAUTH_SECRET=prod-secret
  NEXT_PUBLIC_APP_URL=https://reserveos.kr
```

> **환경 판별 방식**: `DATABASE_URL`이 `file:`로 시작하면 SQLite, `postgresql:`로 시작하면 Supabase.
> Drizzle ORM이 드라이버를 자동으로 선택합니다.

---

## 4. Next.js 애플리케이션 구조

### 4.1 App Router 라우팅

```
src/app/
├── (auth)/
│   ├── login/               # 사장님 로그인
│   │   └── page.tsx
│   └── signup/              # 사장님 회원가입
│       └── page.tsx
│
├── (customer)/              # 고객용 (레이아웃 분리)
│   └── [slug]/              # 업체별 예약 페이지
│       ├── page.tsx         # 업체 소개 + 서비스 목록
│       ├── book/
│       │   └── page.tsx     # 예약 진행 (날짜/시간 선택)
│       └── confirm/
│           └── page.tsx     # 예약 완료
│
├── (dashboard)/             # 사장님 대시보드 (인증 필요)
│   ├── layout.tsx           # 대시보드 공통 레이아웃 + 인증 체크
│   ├── page.tsx             # 오늘의 예약 현황
│   ├── reservations/
│   │   └── page.tsx         # 전체 예약 관리
│   ├── services/
│   │   └── page.tsx         # 서비스 관리
│   ├── schedule/
│   │   └── page.tsx         # 영업시간/휴무일 설정
│   └── settings/
│       └── page.tsx         # 업체 정보 설정
│
└── api/
    ├── auth/
    │   └── [...nextauth]/   # NextAuth.js (개발) or Supabase Auth
    ├── businesses/
    │   └── route.ts
    ├── reservations/
    │   └── route.ts
    └── slots/
        └── route.ts
```

### 4.2 데이터 페칭 전략

| 페이지 | 렌더링 방식 | 이유 |
|--------|-------------|------|
| 고객 예약 페이지 | SSR (Server Component) | SEO 필요, 초기 로딩 속도 |
| 예약 가능 슬롯 | CSR (Client Component) | 실시간 변경, 인터랙션 많음 |
| 대시보드 현황 | SSR + Client 혼합 | 초기 데이터 SSR, 실시간 업데이트 CSR |
| 예약 폼 | CSR | 사용자 인터랙션 중심 |

---

## 5. 인증 전략

### 5.1 채택 방식: NextAuth.js (Credentials Provider)

개발환경과 운영환경 **모두 NextAuth.js**를 사용합니다.
환경별로 인증 방식을 다르게 가져가면 운영 배포 시 예상치 못한 동작 차이가 생기기 때문입니다.

| 환경 | DB | 방식 |
|------|----|------|
| 개발 | PostgreSQL (Docker) | NextAuth.js Credentials Provider + bcrypt |
| 운영 | Supabase | NextAuth.js Credentials Provider + Supabase DB |

> **Supabase Auth를 쓰지 않는 이유**: Supabase Auth는 클라이언트 SDK와 tight coupling되어
> 개발환경(순수 PostgreSQL)과 코드가 달라지는 문제가 있습니다.
> NextAuth.js Credentials Provider를 사용하면 DB만 교체하면 되므로 일관성이 유지됩니다.

### 5.2 인증 흐름

```
사장님 로그인
  │
  ▼
POST /api/auth/[...nextauth]  (NextAuth.js Credentials Provider)
  │
  ▼
users 테이블에서 이메일 조회 + bcrypt 패스워드 검증
  │
  ▼
NextAuth.js 세션 발급 → httpOnly Cookie (next-auth.session-token)
  │
  ▼
src/middleware.ts에서 세션 검증 → 미인증 시 /login 리다이렉트
```

### 5.3 미들웨어 보호 경로

```typescript
// src/middleware.ts
export const config = {
  matcher: ['/dashboard/:path*'],  // 대시보드 전체 보호
}
```

---

## 6. 알림 시스템

### 6.1 이메일 알림 (MVP)

```
예약 생성/변경 이벤트
  │
  ▼
API Route (서버사이드)
  │
  ▼
Nodemailer or Resend API
  │
  ├── 고객에게: 예약 확인 이메일
  └── 사장님에게: 신규 예약 알림 이메일
```

### 6.2 카카오톡 알림 (Phase 2)
- 카카오 비즈메시지 API (알림톡) 연동
- 예약 확정, 리마인더(1일 전) 발송

---

## 7. 환경별 의존성 추상화

개발환경(PostgreSQL)과 운영환경(Supabase)의 DB 접근을 통일하기 위한 레이어 구성:

```typescript
// src/lib/db.ts
// 환경변수에 따라 클라이언트 자동 선택

import { createClient } from '@supabase/supabase-js'  // 운영
import { Pool } from 'pg'                               // 개발

export const db = process.env.SUPABASE_URL
  ? createSupabaseClient()   // Supabase 클라이언트
  : createPgPool()           // 직접 PostgreSQL 연결
```

> **권장**: Supabase는 로컬 개발 도구(`supabase start`)를 제공하지만,
> 이 프로젝트는 Docker Compose + 순수 PostgreSQL로 개발환경을 구성하여
> Supabase 없이도 개발 가능한 구조를 채택합니다.
> 운영환경에서는 Supabase의 Auth, Storage, RLS 기능을 활용합니다.
