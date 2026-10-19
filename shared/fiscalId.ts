// Upgrade 11 — NIF português (9 dígitos com dígito de controlo módulo 11),
// usado no formulário de pagamento e no servidor antes de o pôr na fatura.
export function normalizeFiscalId(value: string | null | undefined): string {
  return String(value ?? '').replace(/[\s.-]/g, '').replace(/^PT/i, '')
}

export function isValidPortugueseNif(value: string | null | undefined): boolean {
  const nif = normalizeFiscalId(value)
  if (!/^\d{9}$/.test(nif)) return false
  const digits = [...nif].map(Number)
  const sum = digits.slice(0, 8).reduce((acc, d, i) => acc + d * (9 - i), 0)
  const check = 11 - (sum % 11)
  return (check >= 10 ? 0 : check) === digits[8]
}
