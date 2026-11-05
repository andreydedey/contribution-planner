import { HttpResponse, http } from 'msw/http'
import { describe, expect, it } from 'vitest'
import { db } from '@/testing/mocks/db'
import { server } from '@/testing/setup-tests'
import { renderApp, screen, waitFor, within } from '@/testing/test-utils'

async function fillNewAsset(user: ReturnType<typeof renderApp>['user'], code: string, value: string) {
  const codeInput = await screen.findByLabelText('Código')
  if (code) await user.type(codeInput, code)
  await user.type(screen.getByLabelText('Valor atual'), value)
  await user.click(screen.getByRole('button', { name: 'Salvar ativo' }))
}

describe('Carteira', () => {
  it('AC-001: ativo cadastrado aparece na classe certa @spec:AC-001', async () => {
    db.reset([])
    const { user } = renderApp()

    await fillNewAsset(user, 'wege3', '1.000,00')

    const brStocks = await screen.findByRole('region', { name: 'Ações BR' })
    expect(await within(brStocks).findByText('WEGE3')).toBeInTheDocument()
    expect(within(brStocks).getAllByText('R$ 1.000,00').length).toBeGreaterThan(0)
    // Gravado na API: continua lá ao recarregar.
    expect(db.assets).toEqual([{ id: 1, code: 'WEGE3', assetClass: 'BR_STOCKS', valueCents: 100_000 }])
  })

  it('AC-002: valor editado aparece atualizado @spec:AC-002', async () => {
    db.reset([{ code: 'WEGE3', assetClass: 'BR_STOCKS', valueCents: 100_000 }])
    const { user } = renderApp()

    await user.click(await screen.findByRole('button', { name: 'Editar WEGE3' }))
    const value = screen.getByLabelText('Valor atual')
    await user.clear(value)
    await user.type(value, '1.500,00')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    const brStocks = screen.getByRole('region', { name: 'Ações BR' })
    expect(await within(brStocks).findAllByText('R$ 1.500,00')).not.toHaveLength(0)
    expect(db.assets[0].valueCents).toBe(150_000)
  })

  it('AC-003: ativo removido sai da lista @spec:AC-003', async () => {
    const { user } = renderApp()

    await user.click(await screen.findByRole('button', { name: 'Remover LREN3' }))
    await user.click(await screen.findByRole('button', { name: 'Remover' }))

    await waitFor(() => expect(screen.queryByText('LREN3')).not.toBeInTheDocument())
    expect(db.assets.some((a) => a.code === 'LREN3')).toBe(false)
  })

  it('AC-004: código vazio é recusado @spec:AC-004', async () => {
    db.reset([])
    const { user } = renderApp()

    await fillNewAsset(user, '', '10,00')

    expect(await screen.findByText('Informe o código do ativo')).toBeInTheDocument()
    expect(db.assets).toHaveLength(0)
  })

  it('AC-005: valor fora da faixa é recusado @spec:AC-005', async () => {
    db.reset([])
    const { user } = renderApp()
    const message = 'Valor deve estar entre R$ 0,00 e R$ 100.000.000,00'

    await fillNewAsset(user, 'WEGE3', '-10,00')
    expect(await screen.findByText(message)).toBeInTheDocument()

    const value = screen.getByLabelText('Valor atual')
    await user.clear(value)
    await user.type(value, '100.000.000,01')
    await user.click(screen.getByRole('button', { name: 'Salvar ativo' }))
    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(db.assets).toHaveLength(0)
  })

  it('AC-006: código repetido é recusado @spec:AC-006', async () => {
    const { user } = renderApp()

    await fillNewAsset(user, 'WEGE3', '10,00')

    expect(await screen.findByText('Ativo já cadastrado')).toBeInTheDocument()
  })

  it('AC-007: só existem as quatro classes @spec:AC-007', async () => {
    const { user } = renderApp()

    await user.click(await screen.findByRole('combobox', { name: 'Classe' }))

    const options = await screen.findAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'Ações BR',
      'Stocks',
      'Renda fixa',
      'Bitcoin',
    ])
  })

  it('AC-008: carteira vazia convida a cadastrar @spec:AC-008', async () => {
    db.reset([])
    const { user } = renderApp()

    expect(await screen.findByText('Nenhum ativo cadastrado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Adicionar ativo' }))
    expect(screen.getByLabelText('Código')).toHaveFocus()
  })

  it('AC-009: falha ao salvar não perde o que foi digitado @spec:AC-009', async () => {
    db.reset([])
    server.use(http.post('/api/assets', () => new HttpResponse(null, { status: 500 })))
    const { user } = renderApp()

    await fillNewAsset(user, 'WEGE3', '1.000,00')

    expect(await screen.findByText('Não foi possível salvar. Tente novamente.')).toBeInTheDocument()
    expect(screen.getByLabelText('Código')).toHaveValue('WEGE3')
    expect(screen.getByLabelText('Valor atual')).toHaveValue('1.000,00')
  })
})

describe('Metas por classe', () => {
  async function openTargets() {
    const app = renderApp()
    await app.user.click(await screen.findByRole('button', { name: 'Editar metas' }))
    return { ...app, dialog: await screen.findByRole('dialog') }
  }

  async function setTarget(
    user: ReturnType<typeof renderApp>['user'],
    dialog: HTMLElement,
    label: string,
    value: string,
  ) {
    const input = within(dialog).getByLabelText(label)
    await user.clear(input)
    await user.type(input, value)
  }

  it('AC-056: metas iniciais @spec:AC-056', async () => {
    const { dialog } = await openTargets()

    expect(within(dialog).getByLabelText('Ações BR')).toHaveValue('40')
    expect(within(dialog).getByLabelText('Stocks')).toHaveValue('30')
    expect(within(dialog).getByLabelText('Renda fixa')).toHaveValue('20')
    expect(within(dialog).getByLabelText('Bitcoin')).toHaveValue('10')
  })

  it('AC-051: metas salvas aparecem e continuam salvas @spec:AC-051', async () => {
    const { user, dialog } = await openTargets()

    await setTarget(user, dialog, 'Ações BR', '50')
    await setTarget(user, dialog, 'Stocks', '20')
    await user.click(within(dialog).getByRole('button', { name: 'Salvar metas' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(db.targets.map((t) => t.targetPercent)).toEqual([50, 20, 20, 10])

    await user.click(screen.getByRole('button', { name: 'Editar metas' }))
    const reopened = await screen.findByRole('dialog')
    expect(within(reopened).getByLabelText('Ações BR')).toHaveValue('50')
    expect(within(reopened).getByLabelText('Stocks')).toHaveValue('20')
  })

  it('AC-052: metas que não somam 100% são recusadas @spec:AC-052', async () => {
    const { user, dialog } = await openTargets()

    await setTarget(user, dialog, 'Ações BR', '30')

    expect(within(dialog).getByText('As metas devem somar 100%')).toBeInTheDocument()
    expect(within(dialog).getByText('Soma: 90% · faltam 10%')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Salvar metas' })).toBeDisabled()
    expect(db.targets.map((t) => t.targetPercent)).toEqual([40, 30, 20, 10])
  })

  it('AC-053: meta fora da faixa é recusada @spec:AC-053', async () => {
    const { user, dialog } = await openTargets()

    await setTarget(user, dialog, 'Ações BR', '12,5')

    expect(within(dialog).getByText('Meta deve ser um número inteiro de 0% a 100%')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Salvar metas' })).toBeDisabled()
  })
})
