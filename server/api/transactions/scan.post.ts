import { Category } from '../../models'
import { requireFeature } from '../../utils/requireFeature'
import { extractDocumentData } from '../../utils/anthropic'
import {
  detectDocumentType,
  reserveDocumentScan,
  refundDocumentScan,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
} from '../../utils/documentScan'
import { TIER_LIMITS } from '../../../shared/features'

// Digitalização de recibos/faturas com IA (Pro + Premium) — Fase 5, tarefa 3.
// Recebe o ficheiro, extrai os campos e DEVOLVE-OS ao client. Nunca cria a
// transação: o client pré-preenche o TransactionModal e só a confirmação do
// utilizador grava, via POST /api/transactions (decisão 3 da especificação).
// O ficheiro é processado em memória e descartado — não é guardado.

// Preço de Haiku 4.5 (USD por milhão de tokens) — só para o log de custo por
// documento (tarefa 2, "medir response.usage").
const PRICE_IN_PER_MTOK = 1
const PRICE_OUT_PER_MTOK = 5

export default defineEventHandler(async (event) => {
  const { userId, tier } = await requireFeature(event, 'documentScan')

  // Rejeitar cedo pelo cabeçalho, antes de ler o corpo todo para memória.
  const declaredLength = Number(getRequestHeader(event, 'content-length') || 0)
  if (declaredLength > MAX_PDF_BYTES + 64 * 1024) {
    throw createError({ statusCode: 413, message: 'Ficheiro demasiado grande (máx. 8 MB)', data: { error: 'file_too_large' } })
  }

  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file' && p.data?.length)
  if (!file) {
    throw createError({ statusCode: 400, message: 'Ficheiro em falta', data: { error: 'file_missing' } })
  }

  const mediaType = detectDocumentType(file.data)
  if (mediaType === 'heic') {
    throw createError({
      statusCode: 415,
      message: 'Formato HEIC não suportado — tira a foto em JPEG ou envia um PDF',
      data: { error: 'unsupported_type' },
    })
  }
  if (!mediaType) {
    throw createError({
      statusCode: 415,
      message: 'Tipo de ficheiro não suportado — usa uma imagem (JPEG, PNG, WebP) ou um PDF',
      data: { error: 'unsupported_type' },
    })
  }

  const maxBytes = mediaType === 'application/pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES
  if (file.data.length > maxBytes) {
    throw createError({
      statusCode: 413,
      message: `Ficheiro demasiado grande (máx. ${maxBytes / 1024 / 1024} MB para ${mediaType === 'application/pdf' ? 'PDF' : 'imagens'})`,
      data: { error: 'file_too_large' },
    })
  }

  // Ficheiro válido → só agora consome quota (uploads inválidos não contam).
  const limit = TIER_LIMITS[tier].documentScansPerMonth
  if (!(await reserveDocumentScan(userId, limit))) {
    throw createError({
      statusCode: 429,
      message: `Limite de ${limit} documentos digitalizados por mês atingido`,
      data: { error: 'scan_limit_reached', limit },
    })
  }

  const categories = await Category.find({ userId }).select('name type').lean<{ _id: any; name: string; type: 'income' | 'expense' | 'both' }[]>()

  let result
  try {
    result = await extractDocumentData({
      mediaType,
      base64: file.data.toString('base64'),
      categories: categories.map((c) => ({ name: c.name, type: c.type })),
    })
  } catch (e: any) {
    // Falha da Anthropic/configuração, não do utilizador → devolve a quota.
    await refundDocumentScan(userId)
    // O detalhe (ex. saldo da conta Anthropic, chave inválida) fica só no log do
    // servidor — o utilizador nunca deve ver o erro cru do fornecedor.
    console.error('[scan] falha na extração:', e?.message || e)
    throw createError({
      statusCode: 502,
      message: 'Não foi possível ler o documento neste momento — tenta novamente daqui a pouco ou preenche manualmente',
      data: { error: 'upstream_error' },
    })
  }

  const { extraction, usage } = result
  const costUsd = (usage.input_tokens * PRICE_IN_PER_MTOK + usage.output_tokens * PRICE_OUT_PER_MTOK) / 1_000_000
  console.info(
    `[scan] ${mediaType} ${Math.round(file.data.length / 1024)}KB → ${usage.input_tokens} in / ${usage.output_tokens} out tokens ≈ $${costUsd.toFixed(5)}`
  )

  const amount = typeof extraction.amount === 'number' && Number.isFinite(extraction.amount) ? Math.round(extraction.amount * 100) / 100 : null
  if (!extraction.isReceipt || !amount || amount <= 0) {
    throw createError({
      statusCode: 422,
      message: 'Não conseguimos ler este documento como recibo/fatura — tenta outra foto ou preenche manualmente',
      data: { error: 'not_a_receipt' },
    })
  }

  // O modelo devolve o nome; o client precisa do id — e só aceitamos categorias
  // realmente existentes do utilizador e compatíveis com o tipo extraído.
  const category = extraction.suggestedCategory
    ? categories.find((c) => c.name === extraction.suggestedCategory && (c.type === extraction.type || c.type === 'both'))
    : undefined

  // Datas: só aceita YYYY-MM-DD válidas; caso contrário o client usa "hoje" e
  // realça o campo como pouco fiável.
  const dateValid = !!extraction.date && /^\d{4}-\d{2}-\d{2}$/.test(extraction.date) && !Number.isNaN(new Date(extraction.date).getTime())

  return {
    merchant: extraction.merchant?.trim().slice(0, 120) || null,
    date: dateValid ? extraction.date : null,
    amount,
    currency: (extraction.currency || 'EUR').toUpperCase(),
    type: extraction.type,
    categoryId: category ? String(category._id) : null,
    categoryName: category?.name ?? null,
    confidence: {
      merchant: extraction.merchant ? extraction.confidence.merchant : 'low',
      date: dateValid ? extraction.confidence.date : 'low',
      amount: extraction.confidence.amount,
      type: extraction.confidence.type,
    },
  }
})
