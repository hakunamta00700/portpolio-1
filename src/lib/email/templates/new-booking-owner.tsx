interface NewBookingOwnerProps {
  ownerName: string
  businessName: string
  customerName: string
  customerPhone: string
  serviceName: string
  date: string
  startTime: string
  reservationNo: string
  customerMemo?: string | null
}

export function newBookingOwnerHtml({
  ownerName,
  businessName,
  customerName,
  customerPhone,
  serviceName,
  date,
  startTime,
  reservationNo,
  customerMemo,
}: NewBookingOwnerProps): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>신규 예약 알림</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; font-size: 24px;">ReserveOS</h1>
  </div>
  <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 8px; font-size: 20px;">새 예약이 들어왔습니다! 🎉</h2>
    <p style="margin: 0; color: #64748b;">${ownerName}님의 업체 <strong>${businessName}</strong>에 신규 예약이 접수되었습니다.</p>
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr><td style="padding: 8px 0; color: #64748b;">예약번호</td><td style="padding: 8px 0; font-weight: bold; color: #2563eb;">${reservationNo}</td></tr>
    <tr><td style="padding: 8px 0; color: #64748b;">고객명</td><td style="padding: 8px 0;">${customerName}</td></tr>
    <tr><td style="padding: 8px 0; color: #64748b;">연락처</td><td style="padding: 8px 0;">${customerPhone}</td></tr>
    <tr><td style="padding: 8px 0; color: #64748b;">서비스</td><td style="padding: 8px 0;">${serviceName}</td></tr>
    <tr><td style="padding: 8px 0; color: #64748b;">일시</td><td style="padding: 8px 0;">${date} ${startTime}</td></tr>
    ${customerMemo ? `<tr><td style="padding: 8px 0; color: #64748b;">요청사항</td><td style="padding: 8px 0; font-style: italic;">${customerMemo}</td></tr>` : ''}
  </table>
  <div style="text-align: center; margin: 24px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reservations"
       style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
      대시보드에서 확인하기
    </a>
  </div>
</body>
</html>
  `.trim()
}
