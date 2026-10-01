import { z } from 'zod'
import { User } from '../../models'
import { requireAuth } from '../../utils/auth'
import { validateBody } from '../../utils/validate'
import { getEurRate, getSupportedCurrencies, getUserDisplayCurrency } from '../../utils/displayCurrency'
import { getServerLocale, serverT } from '../../utils/i18n'

// Fase 10 — moeda de apresentação do utilizador (guardada na conta, por isso
// a mesma na web e no Android).
//   GET → { selected, currency, rate, day, stale, currencies }
//   PUT { currency } → idem, depois de guardar
// `selected` é a escolha do utilizador; `currency`/`rate` é o que a app deve
// aplicar (pode ser euros, com `stale`, se o câmbio estiver indisponível).
const CurrencySchema = z.object({
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
})

async function payload(selected: string) {
  const [rate, currencies] = await Promise.all([getEurRate(selected), getSupportedCurrencies()])
  return { selected, ...rate, currencies }
}

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    return payload(await getUserDisplayCurrency(userId))
  }

  if (method === 'PUT') {
    const { currency } = await validateBody(event, CurrencySchema)
    const supported = await getSupportedCurrencies()
    if (!supported.includes(currency)) {
      throw createError({ statusCode: 400, message: serverT(getServerLocale(event), 'currency.unsupported') })
    }
    await User.updateOne({ _id: userId }, { $set: { displayCurrency: currency } })
    return payload(currency)
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
