import { delay, HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { db, pluggyStock } from '@/testing/mocks/db'
import { error } from '@/testing/mocks/handlers'
import { server } from '@/testing/setup-tests'
import { renderApp, screen, waitFor, within } from '@/testing/test-utils'

async function syncWithPluggy(user: ReturnType<typeof renderApp>['user']) {
  await user.click(await screen.findByRole('button', { name: 'Sincronizar com a Pluggy' }))
}

async function valueInClass(className: string, code: string) {
  const region = await screen.findByRole('region', { name: className })
  const row = (await within(region).findByText(code)).closest('li')
  if (!row) throw new Error(`${code} não está na lista`)
  return row
}

describe('Sincronizar com a Pluggy', () => {
  it('AC-057: ativo já cadastrado recebe o valor da Pluggy @spec:AC-057', async () => {
    db.reset([{ code: 'WEGE3', assetClass: 'BR_STOCKS', valueCents: 100_000 }])
    db.pluggyPositions = [pluggyStock('WEGE3', 202_398)]
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(await screen.findByText('1 ativo atualizado')).toBeInTheDocument()
    await waitFor(async () =>
      expect(await valueInClass('Ações BR', 'WEGE3')).toHaveTextContent('R$ 2.023,98'),
    )
  })

  it('AC-058: ação que só existe na Pluggy é cadastrada em Ações BR @spec:AC-058', async () => {
    db.reset([])
    db.pluggyPositions = [pluggyStock('ITUB3', 210_466)]
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(await screen.findByText('1 ativo cadastrado')).toBeInTheDocument()
    expect(await valueInClass('Ações BR', 'ITUB3')).toHaveTextContent('R$ 2.104,66')
  })

  it('AC-059: renda fixa que só existe na Pluggy é cadastrada em Renda fixa @spec:AC-059', async () => {
    db.reset([])
    db.pluggyPositions = [
      {
        ...pluggyStock('CDB', 50_000),
        id: 'inv-cdb',
        code: null,
        name: 'CDB - BANCO INTER S.A',
        type: 'FIXED_INCOME',
        subtype: 'CDB',
      },
    ]
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(await valueInClass('Renda fixa', 'CDB - BANCO INTER S.')).toHaveTextContent('R$ 500,00')
  })

  it('AC-060: ativo digitado à mão não é alterado @spec:AC-060', async () => {
    db.reset([{ code: 'BTC', assetClass: 'BITCOIN', valueCents: 300_000 }])
    db.pluggyPositions = [pluggyStock('WEGE3', 202_398)]
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(await screen.findByText('1 ativo cadastrado')).toBeInTheDocument()
    expect(await valueInClass('Bitcoin', 'BTC')).toHaveTextContent('R$ 3.000,00')
    expect(screen.queryByText(/BTC não veio da Pluggy/)).not.toBeInTheDocument()
  })

  it('AC-061: ativo que sumiu da Pluggy mantém o último valor, com aviso @spec:AC-061', async () => {
    db.reset([
      { code: 'LREN3', assetClass: 'BR_STOCKS', valueCents: 198_600, pluggyInvestmentId: 'inv-LREN3' },
    ])
    db.pluggyPositions = []
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(
      await screen.findByText('LREN3 não veio da Pluggy; o valor anterior foi mantido'),
    ).toBeInTheDocument()
    expect(await valueInClass('Ações BR', 'LREN3')).toHaveTextContent('R$ 1.986,00')
  })

  it('AC-062: tipo de investimento que a carteira não usa é ignorado, com aviso @spec:AC-062', async () => {
    db.reset([])
    db.pluggyPositions = [
      { ...pluggyStock('XYZ', 10_000), name: 'Fundo XYZ', type: 'MUTUAL_FUND', subtype: 'INVESTMENT_FUND' },
    ]
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(
      await screen.findByText('Fundo XYZ foi ignorado: tipo de investimento não usado na carteira'),
    ).toBeInTheDocument()
    expect(db.assets).toHaveLength(0)
  })

  it('AC-063: sincronizar de novo não duplica ativos @spec:AC-063', async () => {
    db.reset([])
    db.pluggyPositions = [pluggyStock('WEGE3', 1), pluggyStock('ITUB3', 2), pluggyStock('LREN3', 3)]
    const { user } = renderApp()

    await syncWithPluggy(user)
    expect(await screen.findByText('3 ativos cadastrados')).toBeInTheDocument()
    await syncWithPluggy(user)
    expect(await screen.findByText('3 ativos atualizados')).toBeInTheDocument()

    const brStocks = screen.getByRole('region', { name: 'Ações BR' })
    for (const code of ['WEGE3', 'ITUB3', 'LREN3']) {
      expect(within(brStocks).getAllByText(code)).toHaveLength(1)
    }
    expect(db.assets).toHaveLength(3)
  })

  it('AC-064: valor digitado à mão é substituído pelo da Pluggy @spec:AC-064', async () => {
    db.reset([
      { code: 'WEGE3', assetClass: 'BR_STOCKS', valueCents: 50_000, pluggyInvestmentId: 'inv-WEGE3' },
    ])
    db.pluggyPositions = [pluggyStock('WEGE3', 202_398)]
    const { user } = renderApp()

    await syncWithPluggy(user)

    await waitFor(async () =>
      expect(await valueInClass('Ações BR', 'WEGE3')).toHaveTextContent('R$ 2.023,98'),
    )
  })

  it('AC-066: falha na Pluggy não altera a carteira @spec:AC-066', async () => {
    db.reset([{ code: 'WEGE3', assetClass: 'BR_STOCKS', valueCents: 100_000 }])
    server.use(http.post('/api/pluggy/sync', () => error(502, 'Não foi possível consultar a Pluggy')))
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(
      await screen.findByText('Não foi possível consultar a Pluggy. Tente novamente.'),
    ).toBeInTheDocument()
    expect(await valueInClass('Ações BR', 'WEGE3')).toHaveTextContent('R$ 1.000,00')
  })

  it('AC-067: sem credenciais da Pluggy a tela avisa @spec:AC-067', async () => {
    db.reset([{ code: 'WEGE3', assetClass: 'BR_STOCKS', valueCents: 100_000 }])
    server.use(http.post('/api/pluggy/sync', () => error(503, 'Integração com a Pluggy não configurada')))
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(await screen.findByText('Integração com a Pluggy não configurada')).toBeInTheDocument()
    expect(db.assets[0].valueCents).toBe(100_000)
  })

  it('AC-068: botão fica bloqueado enquanto sincroniza @spec:AC-068', async () => {
    server.use(
      http.post('/api/pluggy/sync', async () => {
        await delay(100)
        return HttpResponse.json({ updated: [], created: [], missing: [], ignored: [] })
      }),
    )
    const { user } = renderApp()

    await syncWithPluggy(user)

    expect(await screen.findByRole('button', { name: /Sincronizando…/ })).toBeDisabled()
    expect(await screen.findByText('Nenhum ativo veio da Pluggy')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sincronizar com a Pluggy' })).toBeEnabled()
  })
})
