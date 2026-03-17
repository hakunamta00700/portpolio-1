import { Resend } from 'resend'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.SMTP_FROM ?? 'noreply@reserveos.kr'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  reservationId: string
  template: string
}

export async function sendEmail({ to, subject, html, reservationId, template }: SendEmailOptions) {
  const [notification] = await db
    .insert(notifications)
    .values({ reservationId, type: 'email', recipient: to, template, status: 'pending' })
    .returning()

  // 개발용 더미 키면 실제 발송 스킵
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_dev_')) {
    console.log(`[Email] (dev skip) to=${to} subject=${subject}`)
    await db
      .update(notifications)
      .set({ status: 'sent', sentAt: new Date().toISOString() })
      .where(eq(notifications.id, notification.id))
    return
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, html })
    await db
      .update(notifications)
      .set({ status: 'sent', sentAt: new Date().toISOString() })
      .where(eq(notifications.id, notification.id))
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    await db
      .update(notifications)
      .set({ status: 'failed', errorMessage })
      .where(eq(notifications.id, notification.id))
    console.error(`[Email] failed to=${to}`, err)
  }
}
