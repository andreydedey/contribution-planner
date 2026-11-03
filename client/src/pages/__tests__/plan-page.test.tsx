import { describe, expect, it } from 'vitest'
import { db } from '@/testing/mocks/db'
import { renderApp, screen, within } from '@/testing/test-utils'

async function calculate(user: ReturnType<typeof renderApp>['user'], value: string) {
  await user.type(await screen.findByLabelText('Quanto você vai aportar?'), value)
  await user.click(screen.getByRole('button', { name: 'Calcular aporte' }))
}

describe('Plano de aporte', () => {
  it('AC-019: lista do que comprar e do que sobrou @spec:AC-019', async () => {
    const { user } = renderApp('/plano')

    await calculate(user, '6.000,00')

    const buy = (await screen.findByText('O que comprar este mês')).closest('[data-slot="card"]')
    if (!(buy instanceof HTMLElement)) throw new Error('card "O que comprar" não encontrado')
    const items = within(buy).getAllByRole('listitem')
    expect(items.map((item) => within(item).getByText(/^[A-Z0-9]+$/).textContent)).toEqual(['EGIE3', 'ITUB3'])
    expect(within(items[0]).getByText('R$ 3.000,00')).toBeInTheDocument()
    expect(within(items[1]).getByText('R$ 3.000,00')).toBeInTheDocument()
    expect(within(buy).getByText('Não alocado').nextSibling).toHaveTextContent('R$ 0,00')
  })

  it('AC-020: aporte fora da faixa é recusado @spec:AC-020', async () => {
    const { user } = renderApp('/plano')
    const message = 'Valor do aporte deve ser maior que R$ 0,00 e até R$ 1.000.000,00'

    await calculate(user, '0')
    expect(await screen.findByText(message)).toBeInTheDocument()

    const input = screen.getByLabelText('Quanto você vai aportar?')
    await user.clear(input)
    await user.type(input, '1.000.000,01')
    await user.click(screen.getByRole('button', { name: 'Calcular aporte' }))
    expect(screen.getByText(message)).toBeInTheDocument()
    expect(screen.queryByText('O que comprar este mês')).not.toBeInTheDocument()
  })

  it('AC-021: sem ativos não dá para calcular @spec:AC-021', async () => {
    db.reset([])
    renderApp('/plano')

    expect(await screen.findByText('Cadastre seus ativos para calcular o aporte')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calcular aporte' })).toBeDisabled()
  })

  it('AC-025: classe atrasada sem ativos gera aviso @spec:AC-025', async () => {
    db.targets = [
      { assetClass: 'BR_STOCKS', targetPercent: 10 },
      { assetClass: 'US_STOCKS', targetPercent: 60 },
      { assetClass: 'FIXED_INCOME', targetPercent: 20 },
      { assetClass: 'BITCOIN', targetPercent: 10 },
    ]
    const { user } = renderApp('/plano')

    await calculate(user, '6.000,00')

    expect(
      await screen.findByText('A classe Stocks está abaixo do alvo e não tem ativos cadastrados'),
    ).toBeInTheDocument()
  })

  it('AC-031: nenhuma classe com ativos abaixo do alvo @spec:AC-031', async () => {
    db.reset([
      { code: 'Tesouro IPCA+ 2035', assetClass: 'FIXED_INCOME', valueCents: 1_600_000 },
      { code: 'BTC', assetClass: 'BITCOIN', valueCents: 1_100_000 },
    ])
    const { user } = renderApp('/plano')

    await calculate(user, '100,00')

    expect(await screen.findByText('Nenhuma classe com ativos está abaixo do alvo')).toBeInTheDocument()
    expect(screen.getByText('Não alocado').nextSibling).toHaveTextContent('R$ 100,00')
  })
})
