// Conversão entre centavos inteiros e o formato brasileiro ("R$ 1.500,00"), só na borda da tela.
// Nada de ponto flutuante: o texto é lido como dígitos.

export const MAX_ASSET_VALUE_CENTS = 10_000_000_000 // R$ 100.000.000,00
export const MAX_CONTRIBUTION_CENTS = 100_000_000 // R$ 1.000.000,00

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** 150000 → "1.500,00" */
export function formatAmount(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
  const fraction = String(abs % 100).padStart(2, '0')
  return `${sign}${groupThousands(String(whole))},${fraction}`
}

/** 150000 → "R$ 1.500,00"; negativos saem como "- R$ 9.400,00", como no design. */
export function formatCents(cents: number): string {
  if (cents < 0) return `- R$ ${formatAmount(-cents)}`
  return `R$ ${formatAmount(cents)}`
}

/**
 * Lê o que o usuário digitou ("1.500,00", "R$ 1500,5", "-10") e devolve centavos.
 * Devolve null quando o texto não é um valor em reais.
 */
export function parseCents(text: string): number | null {
  const cleaned = text.replace(/R\$/i, '').replace(/\s/g, '')
  const match = /^(-)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/.exec(cleaned)
  if (!match) return null
  const [, minus, whole, fraction = ''] = match
  const cents = Number(whole.replaceAll('.', '')) * 100 + Number(fraction.padEnd(2, '0'))
  if (!Number.isSafeInteger(cents)) return null
  return minus ? -cents : cents
}

/** Percentual inteiro de parte sobre total, para legendas ("18%"). */
export function percentOf(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part * 100) / total)
}
