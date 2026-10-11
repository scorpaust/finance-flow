// Upgrade 09 — "Ajuda e opinião": regras partilhadas pelo formulário e pelo servidor.
export const FEEDBACK_TYPES = ['idea', 'problem', 'question', 'payment'] as const
export type FeedbackType = (typeof FEEDBACK_TYPES)[number]

export const FEEDBACK_MAX_LENGTH = 2000
// Mensagens por conta por dia (contra abuso; cada uma envia um email ao operador).
export const FEEDBACK_DAILY_LIMIT = 5

// Pedido de opinião (1 a 5) na web: as mesmas condições do pedido de avaliação
// da loja na app Android (Upgrade 07), e só a quem não o recebeu.
export const RATING_MIN_ACCOUNT_DAYS = 30
export const RATING_MIN_TRANSACTIONS = 10
