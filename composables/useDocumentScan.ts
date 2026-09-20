import type { DocumentScanResult } from '~/types'

// Fase 5 — captura (câmara nativa Android) e envio de um recibo/fatura para
// POST /api/transactions/scan. Ver context/features/05-FASE-5-scan-documentos-ia.md
// tarefa 4. O resultado só pré-preenche o TransactionModal; nada é gravado aqui.

const MAX_SIDE_PX = 2000
const RESIZE_THRESHOLD_BYTES = 4 * 1024 * 1024 // margem sob o limite de 5 MB por imagem do servidor

export class ScanError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
  }
}

function base64ToFile(base64: string, mime: string, name: string): File {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new File([bytes], name, { type: mime })
}

// Fotos de telemóvel escolhidas pelo picker podem passar os 5 MB — reduz para
// no máx. 2000px de lado maior e JPEG. Para PDF, ou se o browser não conseguir
// descodificar a imagem, envia o ficheiro original (o servidor valida na mesma).
async function downscaleImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size <= RESIZE_THRESHOLD_BYTES) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    return blob ? new File([blob], 'documento.jpg', { type: 'image/jpeg' }) : file
  } catch {
    return file
  }
}

export function useDocumentScan() {
  const { isNative } = usePlatform()

  // Câmara nativa (só Android/nativo). Devolve null se o utilizador cancelar.
  async function capturePhoto(): Promise<File | null> {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
        quality: 80,
        width: MAX_SIDE_PX,
        height: MAX_SIDE_PX,
        correctOrientation: true,
        saveToGallery: false,
      })
      if (!photo.base64String) return null
      return base64ToFile(photo.base64String, `image/${photo.format === 'jpg' ? 'jpeg' : photo.format}`, `documento.${photo.format}`)
    } catch (e: any) {
      // O plugin rejeita quando o utilizador fecha a câmara — não é um erro.
      if (/cancel/i.test(e?.message || '')) return null
      throw new ScanError('Não foi possível abrir a câmara. Verifica as permissões da app ou escolhe um ficheiro.')
    }
  }

  async function scan(file: File): Promise<DocumentScanResult> {
    const prepared = await downscaleImage(file)
    const body = new FormData()
    body.append('file', prepared, prepared.name)
    try {
      return await $fetch<DocumentScanResult>('/api/transactions/scan', { method: 'POST', body })
    } catch (e: any) {
      throw new ScanError(
        e?.data?.message || 'Erro ao digitalizar o documento. Tenta novamente.',
        e?.data?.data?.error
      )
    }
  }

  return { isNative, capturePhoto, scan }
}
