# 소상공인 예약 관리 시스템 - 문서 인덱스

> 개발 에이전시 포트폴리오용 프로젝트
> "네이버 예약 수수료 없이, 내 브랜드로 예약받는 시스템"

## 문서 목록

| 문서 | 설명 | 상태 |
|------|------|------|
| [01_PRD.md](./01_PRD.md) | 제품 요구사항 정의서 | 작성완료 |
| [02_system-architecture.md](./02_system-architecture.md) | 시스템 아키텍처 설계 | 작성완료 |
| [03_database-schema.md](./03_database-schema.md) | 데이터베이스 스키마 설계 | 작성완료 |
| [04_api-design.md](./04_api-design.md) | API 설계 명세 | 작성완료 |
| [05_ui-ux-spec.md](./05_ui-ux-spec.md) | UI/UX 화면 명세 | 작성완료 |
| [06_dev-environment.md](./06_dev-environment.md) | 개발환경 설정 가이드 | 작성완료 |
| [07_deployment.md](./07_deployment.md) | 배포 가이드 | 작성완료 |

## 기술 스택 요약

| 구분 | 개발환경 | 운영환경 |
|------|----------|----------|
| Frontend | Next.js 14 + React | Next.js 14 + React |
| Backend | Next.js API Routes | Next.js API Routes |
| Database | SQLite (파일 기반) | Supabase (PostgreSQL) |
| ORM | Drizzle ORM | Drizzle ORM |
| Auth | NextAuth.js (Credentials) | NextAuth.js (Credentials) |
| Storage | public/ 폴더 | Supabase Storage |
| 배포 | 로컬 `npm run dev` | Vercel + Supabase Cloud |

## 프로젝트 구조 (예정)

```
portpolio_1/
├── docs/                   # 개발 문서
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # 인증 페이지
│   │   ├── (customer)/     # 고객용 예약 페이지
│   │   ├── (dashboard)/    # 사장님 관리 대시보드
│   │   └── api/            # API Routes
│   ├── components/         # 공통 컴포넌트
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts   # Drizzle 스키마 (공통)
│   │   │   ├── index.ts    # DB 클라이언트 (환경별 자동 선택)
│   │   │   └── migrations/ # Drizzle 마이그레이션 파일
│   │   └── ...
│   └── types/              # TypeScript 타입 정의
├── dev.db                  # SQLite DB 파일 (gitignore)
├── drizzle.config.ts       # Drizzle Kit 설정
└── .env.example            # 환경변수 예시
```
