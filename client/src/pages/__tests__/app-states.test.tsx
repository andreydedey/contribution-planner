import { HttpResponse, http } from 'msw/http'
import { afterEach, describe, expect, it } from 'vitest'
import { THEME_STORAGE_KEY } from '@/components/theme-provider'
import { db } from '@/testing/mocks/db'
import { server } from '@/testing/setup-tests'
import { renderApp, screen } from '@/testing/test-utils'

describe('Tema', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('alterna entre claro e escuro e lembra a escolha', async () => {
    const { user } = renderApp()

    await user.click(await screen.findByRole('button', { name: 'Usar tema escuro' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'Usar tema claro' }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })
})

describe('Estados das telas', () => {
  it('mostra o convite antes do primeiro cálculo', async () => {
    renderApp('/plano')

    expect(await screen.findByText('Digite quanto vai aportar')).toBeInTheDocument()
  })

  it('carrega todas as páginas de ativos antes de mostrar a carteira', async () => {
    server.use(
      http.get('/api/assets', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'))
        const sorted = [...db.assets].sort((a, b) => a.code.localeCompare(b.code))
        return HttpResponse.json({
          content: sorted.slice(page * 2, page * 2 + 2),
          page,
          size: 2,
          totalElements: sorted.length,
          totalPages: Math.ceil(sorted.length / 2),
        })
      }),
    )
    renderApp()

    expect(await screen.findByText('R$ 27.000,00')).toBeInTheDocument()
    for (const code of ['BTC', 'EGIE3', 'ITUB3', 'LREN3', 'Tesouro IPCA+ 2035', 'WEGE3']) {
      expect(screen.getByText(code)).toBeInTheDocument()
    }
  })

  it('mostra o erro de carregamento e tenta de novo', async () => {
    server.use(http.get('/api/assets', () => new HttpResponse(null, { status: 500 }), { once: true }))
    const { user } = renderApp()

    expect(await screen.findByText('Não foi possível carregar a carteira.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('WEGE3')).toBeInTheDocument()
  })
})
