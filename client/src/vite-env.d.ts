/// <reference types="vite/client" />
/// <reference types="msw/vite/client" />

interface ImportMetaEnv {
  /** "true" para simular a API no navegador (bun run dev:mock). */
  readonly VITE_API_MOCK?: string
}
