# 데이터베이스 스키마 설계

## 1. 개요

### 1.1 환경별 DB

| 환경 | DB | ORM | 비고 |
|------|----|-----|------|
| 개발 | SQLite (dev.db 파일) | Drizzle ORM | 서버 설치 불필요 |
| 운영 | Supabase (PostgreSQL 15) | Drizzle ORM | RLS 적용 |

### 1.2 타입 차이 (SQLite vs PostgreSQL)

Drizzle ORM이 환경별 타입 차이를 추상화합니다.

| 개념 | SQLite (개발) | PostgreSQL (운영) |
|------|---------------|-------------------|
| PK | `text` (UUID 문자열) | `uuid` |
| Boolean | `integer` (0/1) | `boolean` |
| Timestamp | `text` (ISO 8601) | `timestamptz` |
| Time | `text` ('HH:MM') | `time` |
| Auto UUID | `crypto.randomUUID()` | `gen_random_uuid()` |

### 1.3 네이밍 규칙
- 테이블명: snake_case 복수형 (예: `businesses`, `reservations`)
- 컬럼명: snake_case (예: `created_at`, `business_id`)
- Drizzle 스키마에서는 camelCase로 정의 → DB에는 snake_case로 매핑
- 타임스탬프: `created_at`, `updated_at` 모든 테이블에 포함

---

## 2. ERD (Entity Relationship Diagram)

```
users (사장님 계정)
  │
  │ 1:N
  ▼
businesses (업체)
  │
  ├──── 1:N ───▶ services (서비스/메뉴)
  │                │
  ├──── 1:N ───▶ business_schedules (영업시간)
  │
  ├──── 1:N ───▶ blocked_dates (휴무일)
  │
  └──── 1:N ───▶ reservations (예약)
                   │
                   ├── N:1 ──▶ services
                   └── N:1 ──▶ customers (고객)
```

---

## 3. 테이블 정의

### 3.1 users (사장님 계정)

```sql
CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),           -- 개발환경용, 운영은 Supabase Auth 관리
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  role          VARCHAR(20)  NOT NULL DEFAULT 'owner',  -- owner | admin
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 운영환경(Supabase): auth.users와 연동
-- Supabase Auth가 auth.users를 관리하고, 이 테이블은 프로필 정보만 저장
-- auth.users.id = users.id (동일한 UUID)
```

### 3.2 businesses (업체)

```sql
CREATE TABLE businesses (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug            VARCHAR(100) NOT NULL UNIQUE,  -- URL에 사용 (예: hairshop-hong)
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  address         VARCHAR(500),
  phone           VARCHAR(20),
  logo_url        VARCHAR(500),
  cover_image_url VARCHAR(500),
  category        VARCHAR(50),  -- cafe | restaurant | hairshop | nail | skincare | other
  is_active       BOOLEAN      NOT NULL DEFAULT true,
  -- 예약 설정
  slot_duration   INTEGER      NOT NULL DEFAULT 30,  -- 시간 슬롯 단위 (분)
  max_advance_days INTEGER     NOT NULL DEFAULT 30,  -- 최대 며칠 전까지 예약 가능
  min_advance_hours INTEGER    NOT NULL DEFAULT 1,   -- 최소 몇 시간 전까지 예약 가능
  cancel_policy_hours INTEGER  NOT NULL DEFAULT 24,  -- 취소 가능 시간 (예약 몇 시간 전까지)
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
```

### 3.3 services (서비스/메뉴)

```sql
CREATE TABLE services (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  duration     INTEGER      NOT NULL,    -- 소요시간 (분)
  price        INTEGER      NOT NULL DEFAULT 0,  -- 가격 (원)
  is_active    BOOLEAN      NOT NULL DEFAULT true,
  sort_order   INTEGER      NOT NULL DEFAULT 0,  -- 표시 순서
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_business_id ON services(business_id);
```

### 3.4 business_schedules (업체 정기 영업시간)

```sql
CREATE TABLE business_schedules (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week  SMALLINT     NOT NULL,  -- 0:일 1:월 2:화 3:수 4:목 5:금 6:토
  is_open      BOOLEAN      NOT NULL DEFAULT true,
  open_time    TIME         NOT NULL,  -- 예: '09:00'
  close_time   TIME         NOT NULL,  -- 예: '18:00'
  break_start  TIME,                   -- 점심시간 시작 (선택)
  break_end    TIME,                   -- 점심시간 종료 (선택)
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE(business_id, day_of_week)
);

CREATE INDEX idx_schedules_business_id ON business_schedules(business_id);
```

### 3.5 blocked_dates (휴무일/임시 휴무)

```sql
CREATE TABLE blocked_dates (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date         DATE         NOT NULL,
  reason       VARCHAR(200),  -- 메모 (예: 명절 연휴, 사장님 휴가)
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE(business_id, date)
);

CREATE INDEX idx_blocked_dates_business_id ON blocked_dates(business_id);
CREATE INDEX idx_blocked_dates_date ON blocked_dates(date);
```

### 3.6 customers (고객 - 비회원 예약자 정보)

```sql
CREATE TABLE customers (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  email      VARCHAR(255),
  memo       TEXT,           -- 고객별 사장님 메모
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- phone 기준으로 기존 고객 식별
CREATE INDEX idx_customers_phone ON customers(phone);
```

### 3.7 reservations (예약)

```sql
CREATE TABLE reservations (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_no VARCHAR(20)  NOT NULL UNIQUE,  -- 예약번호 (예: RSV-20240315-0001)
  business_id    UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id     UUID         NOT NULL REFERENCES services(id),
  customer_id    UUID         NOT NULL REFERENCES customers(id),
  -- 예약 시간
  date           DATE         NOT NULL,
  start_time     TIME         NOT NULL,
  end_time       TIME         NOT NULL,
  -- 상태
  status         VARCHAR(20)  NOT NULL DEFAULT 'pending',
    -- pending   : 예약 대기 (고객이 신청, 사장님 확인 전)
    -- confirmed : 예약 확정
    -- completed : 방문 완료
    -- cancelled : 취소
    -- no_show   : 노쇼
    --
    -- 상태 전이 규칙:
    --   pending   → confirmed  (사장님 확정)
    --   pending   → cancelled  (사장님 또는 고객 취소)
    --   confirmed → completed  (사장님: 방문 완료 처리)
    --   confirmed → cancelled  (사장님 또는 고객 취소, cancel_policy_hours 이내)
    --   confirmed → no_show    (사장님: 예약 시간 경과 후 노쇼 처리)
    --   completed, cancelled, no_show → 변경 불가 (terminal state)
  -- 추가 정보
  customer_memo  TEXT,           -- 고객이 남긴 요청사항
  owner_memo     TEXT,           -- 사장님 메모
  cancelled_at   TIMESTAMPTZ,
  cancel_reason  TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 날짜별 예약 조회 시 가장 많이 사용되는 복합 인덱스
CREATE INDEX idx_reservations_business_date ON reservations(business_id, date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_no ON reservations(reservation_no);

-- 동시성 제어: 같은 업체의 같은 시간대 중복 예약 방지
-- (business_id, date, start_time) 조합은 UNIQUE 제약이 아닌 애플리케이션 레벨에서 처리
-- 이유: 취소된 예약(cancelled)은 같은 시간대 재예약을 허용해야 하기 때문
-- API 레벨에서 반드시 트랜잭션 + SELECT ... FOR UPDATE 사용
--
-- 예시:
--   BEGIN;
--   SELECT id FROM reservations
--     WHERE business_id = $1 AND date = $2
--       AND status IN ('pending', 'confirmed')
--       AND NOT (end_time <= $3 OR start_time >= $4)
--     FOR UPDATE;  -- 다른 트랜잭션 대기
--   -- 결과가 없으면 INSERT, 있으면 CONFLICT 에러 반환
--   COMMIT;
```

### 3.8 notifications (알림 발송 이력)

```sql
CREATE TABLE notifications (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID       NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  type         VARCHAR(50)  NOT NULL,  -- email | sms | kakao
  recipient    VARCHAR(255) NOT NULL,  -- 이메일 주소 또는 전화번호
  template     VARCHAR(50)  NOT NULL,  -- booking_confirmed | booking_cancelled | reminder
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending',  -- pending | sent | failed
  sent_at      TIMESTAMPTZ,
  error_message TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

---

## 4. Supabase RLS (Row Level Security) 정책 (운영환경)

```sql
-- businesses 테이블: 본인 업체만 수정 가능
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사장님은 본인 업체만 조회/수정" ON businesses
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "고객은 활성 업체 조회 가능" ON businesses
  FOR SELECT USING (is_active = true);

-- reservations 테이블
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사장님은 본인 업체 예약 조회 가능" ON reservations
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
```

---

## 5. 초기 데이터 (Seed Data)

```sql
-- 개발환경 테스트용 업체 데이터
INSERT INTO users (id, email, name, password_hash)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'demo@reserveos.kr',
  '홍길동',
  '$2b$10$...' -- bcrypt 해시
);

INSERT INTO businesses (owner_id, slug, name, category, slot_duration)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'demo-hairshop',
  '홍길동 헤어샵',
  'hairshop',
  30
);

-- 영업시간 (월~토 09:00-18:00, 일 휴무)
INSERT INTO business_schedules (business_id, day_of_week, is_open, open_time, close_time)
SELECT
  b.id,
  d.day,
  d.day != 0,  -- 일요일 휴무
  '09:00'::TIME,
  '18:00'::TIME
FROM businesses b, (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(day)
WHERE b.slug = 'demo-hairshop';
```

---

## 6. 마이그레이션 전략

### 개발환경
- `src/lib/migrations/` 폴더에 SQL 파일 순서대로 관리
- Docker 컨테이너 초기화 시 자동 실행

### 운영환경 (Supabase)
- Supabase Dashboard의 SQL Editor에서 직접 실행
- 또는 Supabase CLI (`supabase db push`) 사용
