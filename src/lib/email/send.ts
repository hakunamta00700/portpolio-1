import { Resend } from 'resend'
import { getEM } from '@/lib/db'
import { NotificationSchema } from '@/lib/db/entities'

const FROM = process.env.SMTP_FROM ?? 'noreply@reserveos.kr'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  reservationId: string
  template: string
}

export async function sendEmail({ to, subject, html, reservationId, template }: SendEmailOptions) {
  const em = await getEM()
  const notification = em.create(NotificationSchema, {
    reservationId,
    type:      'email',
    recipient: to,
    template,
    status:    'pending',
  })
  await em.persistAndFlush(notification)

  // 개발용 더미 키면 실제 발송 스킵
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_dev_')) {
    console.log(`[Email] (dev skip) to=${to} subject=${subject}`)
    em.assign(notification, { status: 'sent', sentAt: new Date().toISOString() })
    await em.flush()
    return
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({ from: FROM, to, subject, html })
    em.assign(notification, { status: 'sent', sentAt: new Date().toISOString() })
    await em.flush()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    em.assign(notification, { status: 'failed', errorMessage })
    await em.flush()
    console.error(`[Email] failed to=${to}`, err)
  }
}
