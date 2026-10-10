// Upgrade 05 — emails da recuperação de password, nas 6 línguas da app.
// Texto simples + HTML mínimo (estilos inline, sem imagens externas: os
// clientes de email bloqueiam-nas e algumas marcam como spam).
import type { EmailMessage } from './email'
import type { ServerLocale } from './i18n'

// O contacto publicado nos Termos e na Política de Privacidade.
export const SUPPORT_EMAIL = 'dinismiguelcosta@gmail.com'

interface ResetTexts {
  subject: string
  greeting: (name: string) => string
  intro: string
  button: string
  expiry: (minutes: number) => string
  ignore: string
}

interface ChangedTexts {
  subject: string
  greeting: (name: string) => string
  body: string
  notYou: (support: string) => string
}

const RESET: Record<ServerLocale, ResetTexts> = {
  'pt-PT': {
    subject: 'Definir uma nova password — FinanceFlow',
    greeting: (n) => `Olá${n ? ` ${n}` : ''},`,
    intro: 'Recebemos um pedido para definir uma nova password na tua conta FinanceFlow.',
    button: 'Definir nova password',
    expiry: (m) => `O link é válido durante ${m} minutos e só pode ser usado uma vez.`,
    ignore: 'Se não foste tu, ignora este email: a tua password continua a mesma.',
  },
  en: {
    subject: 'Set a new password — FinanceFlow',
    greeting: (n) => `Hi${n ? ` ${n}` : ''},`,
    intro: 'We received a request to set a new password for your FinanceFlow account.',
    button: 'Set new password',
    expiry: (m) => `The link is valid for ${m} minutes and can only be used once.`,
    ignore: "If this wasn't you, ignore this email: your password stays the same.",
  },
  fr: {
    subject: 'Définir un nouveau mot de passe — FinanceFlow',
    greeting: (n) => `Bonjour${n ? ` ${n}` : ''},`,
    intro: 'Nous avons reçu une demande pour définir un nouveau mot de passe sur ton compte FinanceFlow.',
    button: 'Définir un nouveau mot de passe',
    expiry: (m) => `Le lien est valable ${m} minutes et ne peut être utilisé qu'une seule fois.`,
    ignore: "Si ce n'était pas toi, ignore cet e-mail : ton mot de passe reste le même.",
  },
  de: {
    subject: 'Neues Passwort festlegen — FinanceFlow',
    greeting: (n) => `Hallo${n ? ` ${n}` : ''},`,
    intro: 'Wir haben eine Anfrage erhalten, für dein FinanceFlow-Konto ein neues Passwort festzulegen.',
    button: 'Neues Passwort festlegen',
    expiry: (m) => `Der Link ist ${m} Minuten gültig und kann nur einmal verwendet werden.`,
    ignore: 'Wenn du das nicht warst, ignoriere diese E-Mail: Dein Passwort bleibt unverändert.',
  },
  it: {
    subject: 'Imposta una nuova password — FinanceFlow',
    greeting: (n) => `Ciao${n ? ` ${n}` : ''},`,
    intro: 'Abbiamo ricevuto una richiesta per impostare una nuova password sul tuo account FinanceFlow.',
    button: 'Imposta nuova password',
    expiry: (m) => `Il link è valido per ${m} minuti e può essere usato una sola volta.`,
    ignore: 'Se non sei stato tu, ignora questa email: la tua password resta la stessa.',
  },
  es: {
    subject: 'Establecer una nueva contraseña — FinanceFlow',
    greeting: (n) => `Hola${n ? ` ${n}` : ''},`,
    intro: 'Hemos recibido una solicitud para establecer una nueva contraseña en tu cuenta de FinanceFlow.',
    button: 'Establecer nueva contraseña',
    expiry: (m) => `El enlace es válido durante ${m} minutos y solo se puede usar una vez.`,
    ignore: 'Si no fuiste tú, ignora este email: tu contraseña sigue siendo la misma.',
  },
}

const CHANGED: Record<ServerLocale, ChangedTexts> = {
  'pt-PT': {
    subject: 'A tua password foi alterada — FinanceFlow',
    greeting: (n) => `Olá${n ? ` ${n}` : ''},`,
    body: 'A password da tua conta FinanceFlow foi alterada. Por segurança, terminámos as sessões abertas noutros dispositivos.',
    notYou: (s) => `Se não foste tu, escreve-nos de imediato para ${s}.`,
  },
  en: {
    subject: 'Your password was changed — FinanceFlow',
    greeting: (n) => `Hi${n ? ` ${n}` : ''},`,
    body: 'The password of your FinanceFlow account was changed. For your security, we signed you out on other devices.',
    notYou: (s) => `If this wasn't you, contact us right away at ${s}.`,
  },
  fr: {
    subject: 'Ton mot de passe a été modifié — FinanceFlow',
    greeting: (n) => `Bonjour${n ? ` ${n}` : ''},`,
    body: 'Le mot de passe de ton compte FinanceFlow a été modifié. Par sécurité, nous avons fermé les sessions ouvertes sur tes autres appareils.',
    notYou: (s) => `Si ce n'était pas toi, écris-nous immédiatement à ${s}.`,
  },
  de: {
    subject: 'Dein Passwort wurde geändert — FinanceFlow',
    greeting: (n) => `Hallo${n ? ` ${n}` : ''},`,
    body: 'Das Passwort deines FinanceFlow-Kontos wurde geändert. Zu deiner Sicherheit haben wir dich auf anderen Geräten abgemeldet.',
    notYou: (s) => `Wenn du das nicht warst, schreib uns sofort an ${s}.`,
  },
  it: {
    subject: 'La tua password è stata cambiata — FinanceFlow',
    greeting: (n) => `Ciao${n ? ` ${n}` : ''},`,
    body: 'La password del tuo account FinanceFlow è stata cambiata. Per sicurezza, abbiamo chiuso le sessioni aperte sugli altri dispositivi.',
    notYou: (s) => `Se non sei stato tu, scrivici subito a ${s}.`,
  },
  es: {
    subject: 'Tu contraseña ha cambiado — FinanceFlow',
    greeting: (n) => `Hola${n ? ` ${n}` : ''},`,
    body: 'La contraseña de tu cuenta de FinanceFlow ha cambiado. Por seguridad, hemos cerrado las sesiones abiertas en otros dispositivos.',
    notYou: (s) => `Si no fuiste tú, escríbenos de inmediato a ${s}.`,
  },
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function layout(paragraphs: string[], button?: { label: string; href: string }): string {
  const ps = paragraphs.map((p) => `<p style="margin:0 0 16px;line-height:1.5">${escapeHtml(p)}</p>`).join('')
  const btn = button
    ? `<p style="margin:24px 0"><a href="${escapeHtml(button.href)}" style="background:#6366f1;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;display:inline-block;font-weight:600">${escapeHtml(button.label)}</a></p>` +
      `<p style="margin:0 0 16px;font-size:12px;color:#6b7280;word-break:break-all">${escapeHtml(button.href)}</p>`
    : ''
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f4f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827">` +
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">` +
    `<p style="margin:0 0 20px;font-size:18px;font-weight:700">FinanceFlow</p>${ps}${btn}</div></body></html>`
}

export function passwordResetEmail(opts: { to: string; name: string; link: string; minutes: number; locale: ServerLocale }): EmailMessage {
  const t = RESET[opts.locale] || RESET.en
  const text = [t.greeting(opts.name), '', t.intro, '', `${t.button}: ${opts.link}`, '', t.expiry(opts.minutes), t.ignore, '', 'FinanceFlow'].join('\n')
  return {
    to: opts.to,
    subject: t.subject,
    text,
    html: layout([t.greeting(opts.name), t.intro], { label: t.button, href: opts.link }).replace(
      '</div></body>',
      `<p style="margin:0 0 8px;line-height:1.5;color:#374151">${escapeHtml(t.expiry(opts.minutes))}</p><p style="margin:0;line-height:1.5;color:#374151">${escapeHtml(t.ignore)}</p></div></body>`
    ),
  }
}

export function passwordChangedEmail(opts: { to: string; name: string; locale: ServerLocale }): EmailMessage {
  const t = CHANGED[opts.locale] || CHANGED.en
  const paragraphs = [t.greeting(opts.name), t.body, t.notYou(SUPPORT_EMAIL)]
  return {
    to: opts.to,
    subject: t.subject,
    text: [...paragraphs, '', 'FinanceFlow'].join('\n\n'),
    html: layout(paragraphs),
  }
}
