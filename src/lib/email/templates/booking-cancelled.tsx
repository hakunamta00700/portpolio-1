interface BookingCancelledProps {
  customerName: string
  businessName: string
  serviceName: string
  date: string
  startTime: string
  reservationNo: string
  cancelReason?: string
}

export function bookingCancelledHtml({
  customerName,
  businessName,
  serviceName,
  date,
  startTime,
  reservationNo,
  cancelReason,
}: BookingCancelledProps): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>예약 취소</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; font-size: 24px;">ReserveOS</h1>
  </div>
  <div style="background: #fef2f2; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 8px; font-size: 20px; color: #dc2626;">예약이 취소되었습니다</h2>
    <p style="margin: 0; color: #64748b;">${customerName}님의 예약이 취소 처리되었습니다.</p>
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr><td style="padding: 8px 0; color: #64748b;">예약번호</td><td style="padding: 8px 0; font-weight: bold;">${reservationNo}</td></tr>
    <tr><td style="padding: 8px 0; color: #64748b;">업체</td><td style="padding: 8px 0;">${businessName}</td></tr>
    <tr><td style="padding: 8px 0; color: #64748b;">서비스</td><td style="padding: 8px 0;">${serviceName}</td></tr>
    <tr><td style="padding: 8px 0; color: #64748b;">일시</td><td style="padding: 8px 0;">${date} ${startTime}</td></tr>
    ${cancelReason ? `<tr><td style="padding: 8px 0; color: #64748b;">취소 사유</td><td style="padding: 8px 0;">${cancelReason}</td></tr>` : ''}
  </table>
  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
    본 메일은 발신 전용입니다. 예약 문의는 업체로 직접 연락해주세요.
  </p>
</body>
</html>
  `.trim()
}
