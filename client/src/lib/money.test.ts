import { describe, expect, it } from 'vitest'
import { formatCents, parseCents } from './money'

describe('money', () => {
  it('formata centavos no padrão brasileiro', () => {
    expect(formatCents(0)).toBe('R$ 0,00')
    expect(formatCents(1)).toBe('R$ 0,01')
    expect(formatCents(150_000)).toBe('R$ 1.500,00')
    expect(formatCents(10_000_000_000)).toBe('R$ 100.000.000,00')
    expect(formatCents(-940_000)).toBe('- R$ 9.400,00')
  })

  it('lê valores digitados sem usar ponto flutuante', () => {
    expect(parseCents('1.500,00')).toBe(150_000)
    expect(parseCents('R$ 1500,5')).toBe(150_050)
    expect(parseCents('0,01')).toBe(1)
    expect(parseCents('-10')).toBe(-1000)
    expect(parseCents('100.000.000,01')).toBe(10_000_000_001)
  })

  it('recusa o que não é valor em reais', () => {
    expect(parseCents('')).toBeNull()
    expect(parseCents('abc')).toBeNull()
    expect(parseCents('1,234')).toBeNull()
    expect(parseCents('1.50,00')).toBeNull()
  })
})
