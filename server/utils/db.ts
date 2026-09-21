import mongoose from 'mongoose'

// Ligação ao MongoDB partilhada e memorizada. O Nitro chama os plugins SEM
// `await` (nitropack/dist/runtime/internal/app.mjs), por isso o `await
// mongoose.connect()` do plugin nunca bloqueou pedidos: com `bufferCommands:
// false`, um pedido que chegue antes de a ligação estar pronta (arranque a frio,
// reload do dev server) rebenta com "Cannot call `users.findOne()` before initial
// connection is complete". server/middleware/00-db.ts espera por isto antes de
// cada rota /api.
let connecting: Promise<unknown> | null = null

export async function ensureDb(): Promise<void> {
  const state = mongoose.connection.readyState
  if (state === 1) return
  // 0 = nunca ligou ou caiu: a promessa anterior (já resolvida) já não vale.
  if (state === 0) connecting = null

  if (!connecting) {
    const config = useRuntimeConfig()
    connecting = mongoose
      .connect(config.mongodbUri, { dbName: 'financeflow', bufferCommands: false })
      .then(() => console.log('✅ MongoDB connected successfully'))
      .catch((error) => {
        connecting = null // deixa o pedido seguinte tentar de novo
        console.error('❌ MongoDB connection failed:', error)
        throw error
      })
  }
  await connecting
}
