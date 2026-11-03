import type { ApiErrorBody, ApiErrorCode } from '@/types/api'

export class ApiError extends Error {
  readonly status: number
  readonly code?: ApiErrorCode

  constructor(status: number, body?: Partial<ApiErrorBody>) {
    super(body?.message ?? `Erro ${status} na API`)
    this.status = status
    this.code = body?.code
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined)
    throw new ApiError(response.status, errorBody)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}
