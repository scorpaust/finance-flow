// A EasyPay espera datas no formato "Y-m-d H:i" (ex. `start_time` de uma
// subscrição), SEM fuso, e lê-as na hora de Portugal. O servidor em produção
// (Netlify/AWS Lambda) corre em UTC: formatar com a hora local do servidor
// dava uma hora no passado durante a hora de verão, e a EasyPay recusava o
// checkout de cartão/débito direto com "payment.start_time: date must be in
// the future" (2026-10-07). Em desenvolvimento (PC em hora de Lisboa) nunca
// falhava. Formata sempre no fuso Europe/Lisbon, seja qual for o do servidor.
export function easypayDateTime(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Lisbon',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  )
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
}

// Início de uma subscrição: "agora" com margem, para a EasyPay o ver sempre
// no futuro mesmo com o relógio de um lado ou do outro uns minutos à frente.
export const EASYPAY_START_MARGIN_MS = 5 * 60 * 1000
