// Upgrade 11 — cliente mínimo da API v2 do InvoiceXpress (programa de
// faturação certificado). Documentação consultada via Context7
// (/websites/invoicexpress_api-v2): documentos em
// `https://<conta>.app.invoicexpress.com/<tipo>.json?api_key=…`, criados em
// rascunho, depois `PUT …/change-state.json` com `finalized` e
// `PUT …/email-document.json` para enviar o PDF ao cliente.
//
// Configuração lida do ambiente em runtime (não do runtimeConfig): uma
// variável marcada como secreta no Netlify chega mascarada ao build local.
import { logEvent } from './logger'

export interface InvoiceXpressConfig {
  account: string
  apiKey: string
  taxName: string
  exemptionCode: string
}

export function getInvoiceXpressConfig(): InvoiceXpressConfig | null {
  const account = process.env.INVOICEXPRESS_ACCOUNT?.trim()
  const apiKey = process.env.INVOICEXPRESS_API_KEY?.trim()
  if (!account || !apiKey) return null
  return {
    account,
    apiKey,
    // Operador isento pelo art. 53.º do CIVA: IVA 0% com o motivo M10.
    taxName: process.env.INVOICEXPRESS_TAX_NAME?.trim() || 'IVA0',
    exemptionCode: process.env.INVOICEXPRESS_TAX_EXEMPTION?.trim() || 'M10',
  }
}

function baseUrl(config: InvoiceXpressConfig): string {
  // Só os testes apontam para um servidor simulado.
  return process.env.INVOICEXPRESS_API_BASE_URL || `https://${config.account}.app.invoicexpress.com`
}

async function ixFetch<T>(config: InvoiceXpressConfig, method: 'POST' | 'PUT', path: string, body: unknown): Promise<T> {
  const url = `${baseUrl(config)}${path}?api_key=${encodeURIComponent(config.apiKey)}`
  const res = await fetch(url, {
    method,
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    // O corpo de erro do InvoiceXpress só traz mensagens de validação; mesmo
    // assim, nunca vai para o log o pedido (nome, email, NIF do cliente).
    const detail = (await res.text().catch(() => '')).slice(0, 300)
    logEvent('error', 'invoicexpress.http_error', { status: res.status, path: path.replace(/\d+/g, ':id'), detail })
    throw new Error(`InvoiceXpress ${res.status}: ${detail}`)
  }
  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

export interface InvoiceReceiptInput {
  date: Date
  client: { code: string; name: string; email: string; fiscalId?: string | null; language: 'pt' | 'en' | 'es' }
  item: { name: string; description: string; unitPrice: number }
  reference: string
}

const ddmmyyyy = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

// Cria a fatura-recibo em rascunho e finaliza-a. Devolve o id e o número
// atribuído pela série (ex. "FR 2026/12").
export async function createFinalizedInvoiceReceipt(
  config: InvoiceXpressConfig,
  input: InvoiceReceiptInput
): Promise<{ id: string; number: string | null }> {
  const date = ddmmyyyy(input.date)
  const created = await ixFetch<Record<string, { id?: number | string }>>(config, 'POST', '/invoice_receipts.json', {
    invoice: {
      date,
      due_date: date,
      reference: input.reference,
      tax_exemption: config.exemptionCode,
      client: {
        name: input.client.name,
        code: input.client.code,
        email: input.client.email,
        language: input.client.language,
        ...(input.client.fiscalId ? { fiscal_id: input.client.fiscalId } : {}),
      },
      items: [
        {
          name: input.item.name,
          description: input.item.description,
          unit_price: input.item.unitPrice.toFixed(2),
          quantity: '1',
          unit: 'service',
          tax: { name: config.taxName },
        },
      ],
    },
  })
  const doc = created.invoice_receipt || created.invoice || Object.values(created)[0]
  if (!doc?.id) throw new Error('InvoiceXpress: resposta sem id do documento')
  const id = String(doc.id)

  const finalized = await ixFetch<Record<string, { inverted_sequence_number?: string; sequence_number?: string }>>(
    config,
    'PUT',
    `/invoice_receipts/${id}/change-state.json`,
    { invoice: { state: 'finalized' } }
  )
  const fin = finalized.invoice_receipt || finalized.invoice || Object.values(finalized)[0]
  return { id, number: fin?.inverted_sequence_number || fin?.sequence_number || null }
}

export async function emailInvoiceReceipt(
  config: InvoiceXpressConfig,
  id: string,
  message: { email: string; subject: string; body: string }
): Promise<void> {
  await ixFetch(config, 'PUT', `/invoice_receipts/${id}/email-document.json`, {
    message: { client: { email: message.email, save: '0' }, subject: message.subject, body: message.body, logo: '0' },
  })
}
