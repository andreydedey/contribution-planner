import axios from 'axios'
import type { ApiErrorBody, ApiErrorCode } from '@/types/api'

export class ApiError extends Error {
  readonly status: number
  readonly code?: ApiErrorCode

  constructor(status: number, body?: Partial<ApiErrorBody>) {
    super(body?.message ?? `Erro ${status} na API`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code
  }
}

export const http = axios.create({ baseURL: '/api' })

// Toda resposta de erro da API vira ApiError, com o status e a mensagem da spec.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      throw new ApiError(error.response.status, error.response.data as Partial<ApiErrorBody>)
    }
    throw error
  },
)

export const api = {
  get: <T>(path: string) => http.get<T>(path).then((response) => response.data),
  post: <T>(path: string, body: unknown) => http.post<T>(path, body).then((response) => response.data),
  put: <T>(path: string, body: unknown) => http.put<T>(path, body).then((response) => response.data),
  delete: (path: string) => http.delete(path).then(() => undefined),
}
