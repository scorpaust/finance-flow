import { getPlanPrices } from '../../utils/playPrices'

// Preços dos planos em euros (Portugal, IVA incluído), lidos da Play Console
// — a mesma fonte que a app Android mostra e que o checkout EasyPay cobra
// (server/utils/playPrices.ts). Público: são os preços de venda.
export default defineEventHandler(async () => {
  const { prices, source } = await getPlanPrices()
  return { currency: 'EUR', prices, source }
})
