# API 설계 명세

## 1. 기본 규칙

### 1.1 Base URL
- 개발: `http://localhost:3000/api`
- 운영: `https://reserveos.kr/api`

### 1.2 응답 형식

```typescript
// 성공 응답
{
  "success": true,
  "data": { ... }
}

// 목록 응답
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "RESERVATION_CONFLICT",
    "message": "이미 예약된 시간대입니다."
  }
}
```

### 1.3 인증
- 사장님 API: `Authorization: Bearer {jwt_token}` 헤더 필요
- 고객 API: 인증 불필요 (예약 조회는 예약번호 + 전화번호 사용)

### 1.4 에러 코드

| Code | HTTP Status | 설명 |
|------|-------------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |
| `RESERVATION_CONFLICT` | 409 | 예약 시간 충돌 |
| `SLOT_NOT_AVAILABLE` | 409 | 예약 불가 슬롯 |
| `CANCEL_NOT_ALLOWED` | 422 | 취소 정책 위반 |

---

## 2. 인증 API

### POST /api/auth/signup
사장님 회원가입

**Request Body**
```json
{
  "email": "owner@shop.com",
  "password": "password123",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "owner@shop.com", "name": "홍길동" },
    "token": "jwt_token"
  }
}
```

---

### POST /api/auth/signin
사장님 로그인

**Request Body**
```json
{
  "email": "owner@shop.com",
  "password": "password123"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "owner@shop.com", "name": "홍길동" },
    "token": "jwt_token"
  }
}
```

---

### POST /api/auth/signout
로그아웃 (토큰 무효화)

**Auth Required**: Yes

---

## 3. 업체(Business) API

### GET /api/businesses
내 업체 목록 조회

**Auth Required**: Yes

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "hairshop-hong",
      "name": "홍길동 헤어샵",
      "category": "hairshop",
      "is_active": true
    }
  ]
}
```

---

### POST /api/businesses
업체 등록

**Auth Required**: Yes

**Request Body**
```json
{
  "slug": "hairshop-hong",
  "name": "홍길동 헤어샵",
  "description": "청담동 감성 헤어샵",
  "address": "서울시 강남구 청담동 123",
  "phone": "02-1234-5678",
  "category": "hairshop",
  "slot_duration": 30,
  "max_advance_days": 30,
  "min_advance_hours": 1,
  "cancel_policy_hours": 24
}
```

**Response 201**

---

### GET /api/businesses/:slug
업체 정보 조회 (고객용 - 공개)

**Auth Required**: No

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "hairshop-hong",
    "name": "홍길동 헤어샵",
    "description": "...",
    "address": "서울시 강남구 청담동 123",
    "phone": "02-1234-5678",
    "logo_url": "https://...",
    "services": [
      {
        "id": "uuid",
        "name": "커트",
        "duration": 30,
        "price": 25000
      }
    ],
    "schedules": [
      { "day_of_week": 1, "is_open": true, "open_time": "09:00", "close_time": "18:00" }
    ]
  }
}
```

---

### PUT /api/businesses/:id
업체 정보 수정

**Auth Required**: Yes (본인 업체만)

---

### DELETE /api/businesses/:id
업체 삭제 (비활성화)

**Auth Required**: Yes (본인 업체만)

---

## 4. 서비스(Service) API

### GET /api/businesses/:businessId/services
서비스 목록 조회

**Auth Required**: No (고객도 조회 가능)

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "커트",
      "description": "기본 커트",
      "duration": 30,
      "price": 25000,
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

---

### POST /api/businesses/:businessId/services
서비스 추가

**Auth Required**: Yes

**Request Body**
```json
{
  "name": "커트",
  "description": "기본 커트",
  "duration": 30,
  "price": 25000,
  "sort_order": 1
}
```

---

### PUT /api/businesses/:businessId/services/:serviceId
서비스 수정

**Auth Required**: Yes

---

### DELETE /api/businesses/:businessId/services/:serviceId
서비스 삭제

**Auth Required**: Yes

---

## 5. 스케줄(Schedule) API

### GET /api/businesses/:businessId/schedules
영업시간 조회

**Auth Required**: No

---

### PUT /api/businesses/:businessId/schedules
영업시간 일괄 수정

**Auth Required**: Yes

**Request Body**
```json
{
  "schedules": [
    { "day_of_week": 0, "is_open": false },
    { "day_of_week": 1, "is_open": true, "open_time": "09:00", "close_time": "18:00" },
    { "day_of_week": 2, "is_open": true, "open_time": "09:00", "close_time": "18:00", "break_start": "12:00", "break_end": "13:00" }
  ]
}
```

---

### GET /api/businesses/:businessId/blocked-dates
휴무일 목록 조회

**Auth Required**: No

**Query Params**: `?year=2024&month=3`

---

### POST /api/businesses/:businessId/blocked-dates
휴무일 추가

**Auth Required**: Yes

**Request Body**
```json
{
  "date": "2024-03-15",
  "reason": "임시 휴무"
}
```

---

### DELETE /api/businesses/:businessId/blocked-dates/:date
휴무일 삭제

**Auth Required**: Yes

---

## 6. 예약 가능 슬롯 API

### GET /api/businesses/:businessId/slots
예약 가능 시간 슬롯 조회

**Auth Required**: No

**Query Params**
```
?date=2024-03-15
&service_id=uuid   (서비스 소요시간 기반 슬롯 계산)
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "date": "2024-03-15",
    "slots": [
      { "time": "09:00", "available": true },
      { "time": "09:30", "available": true },
      { "time": "10:00", "available": false },
      { "time": "10:30", "available": true }
    ]
  }
}
```

**슬롯 계산 로직 상세**:

```
1. 업체 영업시간 조회 (business_schedules - 해당 요일)
2. blocked_dates 확인 → 휴무일이면 빈 배열 반환
3. 영업시간을 slot_duration(분) 단위로 슬롯 목록 생성
   예) 09:00 ~ 18:00, 30분 단위 → [09:00, 09:30, 10:00 ... 17:30]
4. break_start/break_end가 있으면 해당 구간 슬롯 제거
5. 서비스 소요시간(duration) 고려:
   - 슬롯 시작시간 + duration이 close_time을 초과하면 해당 슬롯 제외
   - 예) close_time=18:00, 서비스 60분 → 17:30 슬롯은 제외 (17:30+60분=18:30 초과)
6. 해당 날짜 기존 예약(pending + confirmed) 조회
   - 예약 점유 구간: [start_time, end_time)
   - 슬롯 점유 구간: [slot_time, slot_time + duration)
   - 두 구간이 겹치면 해당 슬롯 available = false
7. min_advance_hours 기준: 현재 시간 + min_advance_hours 이전 슬롯은 제외
```

---

## 7. 예약(Reservation) API

### POST /api/reservations
예약 생성 (고객용)

**Auth Required**: No

**Request Body**
```json
{
  "business_id": "uuid",
  "service_id": "uuid",
  "date": "2024-03-15",
  "start_time": "10:00",
  "customer": {
    "name": "김철수",
    "phone": "010-9876-5432",
    "email": "customer@email.com"
  },
  "customer_memo": "앞머리 시술 원합니다"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "reservation_no": "RSV-20240315-0001",
    "status": "pending",
    "date": "2024-03-15",
    "start_time": "10:00",
    "end_time": "10:30",
    "service": { "name": "커트", "price": 25000 },
    "business": { "name": "홍길동 헤어샵", "phone": "02-1234-5678" }
  }
}
```

---

### GET /api/reservations/lookup
예약 조회 (고객용 - 비회원)

**Auth Required**: No

**Query Params**: `?reservation_no=RSV-20240315-0001&phone=01098765432`

---

### DELETE /api/reservations/lookup/:reservationNo
예약 취소 (고객용 - 비회원)

**Auth Required**: No

**Request Body**
```json
{
  "phone": "01098765432",
  "cancel_reason": "일정 변경"
}
```

---

### GET /api/businesses/:businessId/reservations
예약 목록 조회 (사장님용)

**Auth Required**: Yes

**Query Params**
```
?date=2024-03-15         (특정 날짜)
&start_date=2024-03-01   (기간 조회 시작)
&end_date=2024-03-31     (기간 조회 종료)
&status=pending          (상태 필터)
&page=1
&limit=20
```

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reservation_no": "RSV-20240315-0001",
      "status": "confirmed",
      "date": "2024-03-15",
      "start_time": "10:00",
      "end_time": "10:30",
      "service": { "name": "커트", "price": 25000 },
      "customer": { "name": "김철수", "phone": "010-9876-5432" },
      "customer_memo": "앞머리 시술 원합니다",
      "owner_memo": null
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45 }
}
```

---

### PUT /api/businesses/:businessId/reservations/:reservationId
예약 상태 변경 (사장님용)

**Auth Required**: Yes

**Request Body**
```json
{
  "status": "confirmed",
  "owner_memo": "단골 고객"
}
```

---

## 8. 통계 API

### GET /api/businesses/:businessId/stats
예약 통계 조회

**Auth Required**: Yes

**Query Params**: `?start_date=2024-03-01&end_date=2024-03-31`

**Response 200**
```json
{
  "success": true,
  "data": {
    "total_reservations": 45,
    "confirmed": 40,
    "cancelled": 3,
    "no_show": 2,
    "popular_services": [
      { "name": "커트", "count": 20 }
    ],
    "popular_times": [
      { "time": "10:00", "count": 8 }
    ]
  }
}
```
