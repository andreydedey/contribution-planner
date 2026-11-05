import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app'

// Com VITE_API_MOCK=true (bun run dev:mock) a API é simulada no navegador, sem o server.
async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_API_MOCK !== 'true') return
  const { network } = await import('virtual:msw')
  const { handlers } = await import('./testing/mocks/handlers')
  network.configure({ handlers, onUnhandledFrame: 'bypass' })
  await network.enable()
}

enableMocking().then(() => {
  const root = document.getElementById('root')
  if (!root) throw new Error('Elemento #root não encontrado no index.html')
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
