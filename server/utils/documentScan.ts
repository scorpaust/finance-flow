// Utilitários do scan de documentos (Fase 5): deteção do tipo real do ficheiro
// e contador mensal atómico por utilizador. Ver
// context/features/05-FASE-5-scan-documentos-ia.md tarefa 3.
import { DocumentScanUsage } from '../models'

// Limites de tamanho — 5 MB é o máximo por imagem aceite pela Messages API da
// Anthropic; para PDF a API aceita bem mais, mas 8 MB chega para um recibo/fatura
// de uma página e limita o custo/abuso.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_PDF_BYTES = 8 * 1024 * 1024

export type DocumentMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'application/pdf'

// Deteta o tipo pelos magic bytes — nunca confiar no `Content-Type` do upload,
// que é controlado pelo client. `heic` é devolvido à parte: a API da Anthropic
// não o aceita, por isso o endpoint rejeita-o com uma mensagem própria.
export function detectDocumentType(buf: Buffer): DocumentMediaType | 'heic' | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.subarray(0, 4).toString('latin1') === 'GIF8') return 'image/gif'
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') {
    return 'image/webp'
  }
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf'
  if (buf.subarray(4, 8).toString('latin1') === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('latin1')
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) return 'heic'
  }
  return null
}

function usageKey(userId: string): { key: string; month: string } {
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  return { key: `${userId}:${month}`, month }
}

// Reserva atómica de 1 scan no mês corrente. O filtro `count < limit` com
// upsert garante que, no teto, o insert implícito colide com o `_id` já
// existente — o erro 11000 é o sinal de "limite atingido", sem race entre
// pedidos concorrentes.
export async function reserveDocumentScan(userId: string, limit: number): Promise<boolean> {
  if (limit <= 0) return false
  const { key, month } = usageKey(userId)
  try {
    await DocumentScanUsage.findOneAndUpdate(
      { _id: key, count: { $lt: limit } },
      { $inc: { count: 1 }, $setOnInsert: { userId, month } },
      { upsert: true }
    )
    return true
  } catch (e: any) {
    if (e?.code === 11000) return false
    throw e
  }
}

// Devolve a reserva quando a falha foi nossa/da Anthropic (não do utilizador).
export async function refundDocumentScan(userId: string): Promise<void> {
  await DocumentScanUsage.updateOne({ _id: usageKey(userId).key, count: { $gt: 0 } }, { $inc: { count: -1 } })
}
