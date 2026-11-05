import { HttpResponse, http } from 'msw/http'
import { afterEach, describe, expect, it } from 'vitest'
import { THEME_STORAGE_KEY } from '@/components/theme-provider'
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

  it('mostra o erro de carregamento e tenta de novo', async () => {
    server.use(http.get('/api/assets', () => new HttpResponse(null, { status: 500 }), { once: true }))
    const { user } = renderApp()

    expect(await screen.findByText('Não foi possível carregar a carteira.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText('WEGE3')).toBeInTheDocument()
  })
})
