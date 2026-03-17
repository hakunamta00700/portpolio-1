/**
 * 예약번호 생성: RSV-YYYYMMDD-XXXX
 * XXXX = 랜덤 대문자+숫자 4자리
 */
export function generateReservationNo(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, '0')
  return `RSV-${date}-${rand}`
}
