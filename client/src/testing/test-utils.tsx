import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProvider } from '@/app'
import { routes } from '@/router'

/** Renderiza o app inteiro numa rota, com a API simulada pelo MSW. */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  const result = render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  )
  return { ...result, user, router }
}

export * from '@testing-library/react'
