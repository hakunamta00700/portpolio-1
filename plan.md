# ReserveOS 구현 계획

> 소상공인 예약 관리 시스템 - 처음부터 배포까지

## 현재 상태

- [x] Next.js 16 + TypeScript + Tailwind CSS 설치
- [x] Drizzle ORM + SQLite 개발환경 설정
- [x] DB 스키마 8개 테이블 정의 (`src/lib/db/schema.ts`)
- [x] 마이그레이션 적용 (`dev.db` 생성)
- [x] Seed 데이터 스크립트 (`demo@reserveos.kr` / `demo1234`)
- [x] 개발 서버 실행 확인 (http://localhost:3001)

---

## Phase 1. 공통 기반 (Foundation)

> 모든 페이지가 의존하는 인증, 레이아웃, 공통 컴포넌트, DB 쿼리 레이어

### 1-1. shadcn/ui 설치
- [x] `npx shadcn@latest init` 실행
- [x] 필요한 컴포넌트 추가: `button card input label select textarea badge calendar avatar dropdown-menu separator skeleton sonner`

### 1-2. NextAuth.js 설정
- [x] `src/lib/auth.ts` — NextAuth 옵션 (Credentials Provider + bcrypt 검증)
- [x] `src/app/api/auth/[...nextauth]/route.ts` — NextAuth 핸들러

### 1-3. 미들웨어 (라우트 보호)
- [x] `src/middleware.ts` — `/dashboard/:path*` 미인증 시 `/login` 리다이렉트

### 1-4. DB 쿼리 레이어
- [x] `src/lib/db/queries/users.ts` — 이메일로 사용자 조회
- [x] `src/lib/db/queries/businesses.ts` — 업체 CRUD, slug로 조회
- [x] `src/lib/db/queries/services.ts` — 서비스 CRUD
- [x] `src/lib/db/queries/schedules.ts` — 영업시간 CRUD
- [x] `src/lib/db/queries/reservations.ts` — 예약 CRUD, 날짜별/업체별 조회

### 1-5. 공통 유틸
- [x] `src/lib/reservation-no.ts` — 예약번호 생성 (`RSV-YYYYMMDD-XXXX`)
- [x] `src/lib/format.ts` — 날짜/시간/금액 포맷 함수
- [x] `src/types/index.ts` — 공통 TypeScript 타입

### 1-6. 공통 UI 컴포넌트
- [x] `src/components/layout/header.tsx` — 서비스 공통 헤더
- [x] `src/components/layout/dashboard-sidebar.tsx` — 대시보드 사이드바 네비게이션
- [x] `src/components/status-badge.tsx` — 예약 상태 뱃지 (색상 매핑)

---

## Phase 2. 사장님 인증

### 2-1. 회원가입
- [x] `src/app/(auth)/signup/page.tsx` — 회원가입 폼 UI
- [x] `src/app/api/auth/signup/route.ts` — POST: 이메일 중복 확인, bcrypt 해싱, 사용자 생성

### 2-2. 로그인
- [x] `src/app/(auth)/login/page.tsx` — 로그인 폼 UI (NextAuth signIn 호출)
- [x] `src/app/(auth)/layout.tsx` — 인증 페이지 레이아웃 (로고 + 중앙 정렬)

---

## Phase 3. 업체 최초 설정 플로우

> 로그인 직후 업체가 없으면 온보딩으로 유도

### 3-1. 온보딩 페이지
- [x] `src/app/(dashboard)/onboarding/page.tsx` — 업체 최초 등록 (이름, slug, 카테고리)
- [x] `src/app/api/businesses/route.ts` — GET(내 업체 목록), POST(업체 생성)

### 3-2. 업체 설정 페이지 (OWN-01)
- [x] `src/app/(dashboard)/dashboard/settings/page.tsx` — 업체 기본 정보 수정 폼
- [x] `src/app/api/businesses/[id]/route.ts` — PUT(업체 수정), DELETE(비활성화)

---

## Phase 4. 사장님 대시보드 - 서비스/스케줄 관리

### 4-1. 대시보드 레이아웃
- [x] `src/app/(dashboard)/layout.tsx` — 인증 체크 + 사이드바 레이아웃
- [x] `src/app/(dashboard)/dashboard/layout.tsx` — 업체 컨텍스트 (현재 선택 업체)

### 4-2. 서비스 관리 (OWN-02)
- [x] `src/app/(dashboard)/dashboard/services/page.tsx` — 서비스 목록 + 추가/수정/삭제 UI
- [x] `src/components/services/service-form.tsx` — 서비스 추가/수정 모달 폼
- [x] `src/app/api/businesses/[businessId]/services/route.ts` — GET, POST
- [x] `src/app/api/businesses/[businessId]/services/[serviceId]/route.ts` — PUT, DELETE

### 4-3. 영업시간 관리 (OWN-05)
- [x] `src/app/(dashboard)/dashboard/schedule/page.tsx` — 요일별 영업시간 + 휴무일 설정 UI
- [x] `src/components/schedule/weekday-schedule.tsx` — 요일별 시간 설정 컴포넌트
- [x] `src/components/schedule/blocked-date-picker.tsx` — 휴무일 달력 선택 컴포넌트
- [x] `src/app/api/businesses/[businessId]/schedules/route.ts` — GET, PUT(일괄 수정)
- [x] `src/app/api/businesses/[businessId]/blocked-dates/route.ts` — GET, POST
- [x] `src/app/api/businesses/[businessId]/blocked-dates/[date]/route.ts` — DELETE

---

## Phase 5. 사장님 대시보드 - 예약 관리

### 5-1. 대시보드 홈 (OWN-03)
- [ ] `src/app/(dashboard)/dashboard/page.tsx` — 오늘 예약 현황 (카드 요약 + 타임라인)
- [ ] `src/components/reservations/today-timeline.tsx` — 시간순 예약 목록 컴포넌트
- [ ] `src/app/api/businesses/[businessId]/reservations/route.ts` — GET(필터: 날짜, 상태, 페이지)

### 5-2. 예약 관리 페이지 (OWN-04)
- [ ] `src/app/(dashboard)/dashboard/reservations/page.tsx` — 전체 예약 목록 + 필터
- [ ] `src/components/reservations/reservation-card.tsx` — 예약 카드 (고객 정보, 상태, 액션)
- [ ] `src/components/reservations/reservation-detail-modal.tsx` — 예약 상세 + 메모 + 상태변경
- [ ] `src/app/api/businesses/[businessId]/reservations/[reservationId]/route.ts` — PUT(상태 변경)

### 5-3. 통계 페이지 (OWN-07)
- [ ] `src/app/(dashboard)/dashboard/stats/page.tsx` — 기간 선택 + 예약 건수/매출/인기서비스
- [ ] `src/app/api/businesses/[businessId]/stats/route.ts` — GET

---

## Phase 6. 예약 가능 슬롯 API

> 고객 예약 페이지의 핵심 로직, 별도 Phase로 분리

- [ ] `src/lib/slots.ts` — 슬롯 계산 순수 함수 (영업시간 + 휴무일 + 기존예약 → 가능 슬롯)
  - 영업시간 → slot_duration 단위로 슬롯 생성
  - break_start/break_end 구간 제거
  - 서비스 소요시간 고려 (슬롯 + duration > close_time 제외)
  - 기존 예약 겹침 확인 (pending + confirmed)
  - min_advance_hours 기준 과거 슬롯 제외
- [ ] `src/app/api/businesses/[businessId]/slots/route.ts` — GET(`?date=&service_id=`)

---

## Phase 7. 고객 예약 페이지

### 7-1. 업체 소개 + 서비스 선택 (CUS-01, CUS-02)
- [ ] `src/app/(customer)/[slug]/page.tsx` — 업체 정보 + 서비스 목록 (SSR)
- [ ] `src/app/(customer)/layout.tsx` — 고객용 레이아웃
- [ ] `src/app/api/businesses/[slug]/public/route.ts` — GET(공개 업체 정보 + 서비스 포함)
- [ ] `src/components/customer/business-header.tsx` — 업체명, 주소, 영업시간 표시
- [ ] `src/components/customer/service-card.tsx` — 서비스 카드 (이름, 시간, 가격, 선택 버튼)

### 7-2. 예약 진행 - 날짜/시간 선택 (CUS-03)
- [ ] `src/app/(customer)/[slug]/book/page.tsx` — 3단계 예약 플로우 (CSR)
- [ ] `src/components/customer/booking/step-indicator.tsx` — Step 1/2/3 진행 표시
- [ ] `src/components/customer/booking/date-picker.tsx` — 달력 (예약 가능 날짜 강조)
- [ ] `src/components/customer/booking/time-slot-picker.tsx` — 가용 슬롯 버튼 그리드

### 7-3. 예약자 정보 입력 + 확정 (CUS-04, CUS-05)
- [ ] `src/components/customer/booking/customer-form.tsx` — 이름/연락처/이메일/요청사항 폼
- [ ] `src/components/customer/booking/booking-summary.tsx` — 예약 내용 최종 확인
- [ ] `src/app/api/reservations/route.ts` — POST(예약 생성 + 동시성 제어)

### 7-4. 예약 완료 페이지 (CUS-05)
- [ ] `src/app/(customer)/[slug]/confirm/page.tsx` — 예약번호 + 내용 확인 + 안내

### 7-5. 예약 조회/취소 (CUS-06)
- [ ] `src/app/(customer)/[slug]/lookup/page.tsx` — 예약번호 + 전화번호 조회 폼
- [ ] `src/app/api/reservations/lookup/route.ts` — GET(`?reservation_no=&phone=`)
- [ ] `src/app/api/reservations/[reservationNo]/cancel/route.ts` — POST(취소, 정책 검증)

---

## Phase 8. 이메일 알림

- [ ] `src/lib/email/templates/booking-confirmed.tsx` — 예약 완료 이메일 템플릿 (React Email)
- [ ] `src/lib/email/templates/booking-cancelled.tsx` — 예약 취소 이메일 템플릿
- [ ] `src/lib/email/templates/new-booking-owner.tsx` — 사장님용 신규 예약 알림 템플릿
- [ ] `src/lib/email/send.ts` — Resend API 발송 함수 + notifications 테이블 기록
- [ ] 예약 생성 API에 이메일 발송 연동
- [ ] 예약 상태 변경 API에 이메일 발송 연동

---

## Phase 9. 마무리 및 품질

### 9-1. 에러 처리
- [ ] `src/app/not-found.tsx` — 404 페이지
- [ ] `src/app/error.tsx` — 전역 에러 페이지
- [ ] `src/app/(customer)/[slug]/not-found.tsx` — 존재하지 않는 업체 slug

### 9-2. 반응형 / UX 개선
- [ ] 고객 예약 페이지 모바일 최적화 확인 (< 768px)
- [ ] 대시보드 태블릿 레이아웃 확인 (768px ~)
- [ ] 로딩 스켈레톤 컴포넌트 (예약 목록, 슬롯 조회)
- [ ] Toast 알림 (예약 생성 성공/실패, 상태 변경 등)

### 9-3. 보안
- [ ] API Route 입력값 Zod 검증 전 적용 확인
- [ ] 사장님 API 소유권 검증 (본인 업체만 수정 가능)
- [ ] Rate limiting 검토 (예약 생성 API)

---

## Phase 10. 배포

### 10-1. Supabase 설정
- [ ] Supabase 프로젝트 생성 (리전: ap-northeast-1 Tokyo)
- [ ] `supabase link --project-ref [ref]`
- [ ] `supabase db push` — 마이그레이션 적용
- [ ] RLS 정책 적용 (`docs/03_database-schema.md` 참고)
- [ ] Storage 버킷 생성 (`business-assets`, public)

### 10-2. Vercel 배포
- [ ] GitHub 저장소 연결
- [ ] Vercel 환경변수 설정 (`DATABASE_URL`, `NEXTAUTH_SECRET`, `SUPABASE_*`, `RESEND_API_KEY`)
- [ ] 도메인 설정 (선택)
- [ ] 배포 후 전체 플로우 테스트

---

## 파일 구조 최종 형태

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (customer)/
│   │   ├── layout.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── book/page.tsx
│   │       ├── confirm/page.tsx
│   │       ├── lookup/page.tsx
│   │       └── not-found.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── onboarding/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── reservations/page.tsx
│   │       ├── services/page.tsx
│   │       ├── schedule/page.tsx
│   │       ├── stats/page.tsx
│   │       └── settings/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── signup/route.ts
│   │   ├── businesses/
│   │   │   ├── route.ts
│   │   │   └── [businessId]/
│   │   │       ├── route.ts
│   │   │       ├── services/
│   │   │       │   ├── route.ts
│   │   │       │   └── [serviceId]/route.ts
│   │   │       ├── schedules/route.ts
│   │   │       ├── blocked-dates/
│   │   │       │   ├── route.ts
│   │   │       │   └── [date]/route.ts
│   │   │       ├── slots/route.ts
│   │   │       ├── reservations/
│   │   │       │   ├── route.ts
│   │   │       │   └── [reservationId]/route.ts
│   │   │       └── stats/route.ts
│   │   └── reservations/
│   │       ├── route.ts
│   │       ├── lookup/route.ts
│   │       └── [reservationNo]/cancel/route.ts
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   └── dashboard-sidebar.tsx
│   ├── customer/
│   │   ├── business-header.tsx
│   │   ├── service-card.tsx
│   │   └── booking/
│   │       ├── step-indicator.tsx
│   │       ├── date-picker.tsx
│   │       ├── time-slot-picker.tsx
│   │       ├── customer-form.tsx
│   │       └── booking-summary.tsx
│   ├── reservations/
│   │   ├── today-timeline.tsx
│   │   ├── reservation-card.tsx
│   │   └── reservation-detail-modal.tsx
│   ├── services/
│   │   └── service-form.tsx
│   ├── schedule/
│   │   ├── weekday-schedule.tsx
│   │   └── blocked-date-picker.tsx
│   ├── status-badge.tsx
│   └── ui/                  ← shadcn/ui 자동 생성
├── lib/
│   ├── auth.ts
│   ├── slots.ts
│   ├── format.ts
│   ├── reservation-no.ts
│   ├── email/
│   │   ├── send.ts
│   │   └── templates/
│   │       ├── booking-confirmed.tsx
│   │       ├── booking-cancelled.tsx
│   │       └── new-booking-owner.tsx
│   └── db/
│       ├── index.ts          ← 완료
│       ├── schema.ts         ← 완료
│       ├── seed.ts           ← 완료
│       ├── migrations/       ← 완료
│       └── queries/
│           ├── users.ts
│           ├── businesses.ts
│           ├── services.ts
│           ├── schedules.ts
│           └── reservations.ts
├── middleware.ts
└── types/
    └── index.ts
```

---

## 진행 체크리스트 요약

| Phase | 내용 | 완료 |
|-------|------|------|
| 0 | 환경 설정, DB 스키마, Seed | ✅ |
| 1 | shadcn/ui, NextAuth, 미들웨어, 쿼리 레이어, 공통 유틸 | ✅ |
| 2 | 사장님 로그인/회원가입 | ✅ |
| 3 | 업체 온보딩/설정 | ✅ |
| 4 | 서비스 관리, 영업시간 관리 | ✅ |
| 5 | 예약 관리 대시보드, 통계 | ⬜ |
| 6 | 슬롯 계산 API | ⬜ |
| 7 | 고객 예약 페이지 전체 플로우 | ⬜ |
| 8 | 이메일 알림 | ⬜ |
| 9 | 에러 처리, 반응형, 보안 | ⬜ |
| 10 | Supabase + Vercel 배포 | ⬜ |
