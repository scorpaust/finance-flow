// Upgrade 05 — envio de emails transacionais pela Resend (recuperação e aviso
// de mudança de password). `fetch` nativo em vez do SDK, como em
// server/utils/anthropic.ts e server/utils/easypay.ts. API confirmada via
// Context7 (resend.com/docs/api-reference/emails/send-email): POST /emails com
// `Authorization: Bearer <chave>` e corpo { from, to[], subject, html, text }.
//
// Variáveis lidas em runtime (não no runtimeConfig: uma variável secreta da
// Netlify chega mascarada ao build local do CLI — ver CONFIG-REFERENCE.md):
//   RESEND_API_KEY   chave da Resend (permissão de envio)
//   EMAIL_FROM       ex. "FinanceFlow <noreply@mail.financeflow-webapp.pt>"
//   EMAIL_REPLY_TO   opcional, para onde vão as respostas
//   RESEND_API_BASE_URL  só nos testes (servidor simulado)
// Sem chave ou remetente, não envia: regista no log e devolve false (útil em
// desenvolvimento). Nunca regista o endereço nem o conteúdo do email.
import { logEvent } from './logger'

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    logEvent('warn', 'email.not_configured', {})
    return false
  }

  const baseUrl = process.env.RESEND_API_BASE_URL || 'https://api.resend.com'
  try {
    const res = await fetch(`${baseUrl}/emails`, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      logEvent('error', 'email.send_failed', { status: res.status, detail: detail.slice(0, 300) })
      return false
    }
    return true
  } catch (e: any) {
    logEvent('error', 'email.send_failed', { message: String(e?.message || e).slice(0, 200) })
    return false
  }
}
