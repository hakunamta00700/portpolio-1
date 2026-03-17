/**
 * 날짜/시간/금액 포맷 유틸
 */

/** 'YYYY-MM-DD' → '2024년 1월 1일' */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-')
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`
}

/** 'YYYY-MM-DD' → '01/01 (월)' */
export function formatDateShort(date: string): string {
  const d = new Date(date)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd} (${days[d.getDay()]})`
}

/** 'HH:MM' → '오전/오후 HH시 MM분' */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${period} ${hour}시` : `${period} ${hour}시 ${m}분`
}

/** 숫자 → '1,000원' */
export function formatPrice(price: number): string {
  if (price === 0) return '무료'
  return `${price.toLocaleString('ko-KR')}원`
}

/** 분 → '1시간 30분' */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

/** ISO 문자열 → 상대 시간 (예: '3분 전') */
export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}
