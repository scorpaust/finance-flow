import { ensureDb } from '../utils/db'

// Começa a ligar ao arrancar (para o log e para o primeiro pedido já a encontrar a
// ligação pronta). Não bloqueia pedidos — o Nitro não espera por plugins; quem
// garante a ligação antes de cada rota /api é server/middleware/00-db.ts.
export default defineNitroPlugin(() => {
  ensureDb().catch(() => {
    // já registado em ensureDb(); o middleware volta a tentar no próximo pedido
  })
})
