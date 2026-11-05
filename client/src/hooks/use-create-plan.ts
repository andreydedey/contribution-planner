import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Plan } from '@/types/api'

// O plano não é gravado: cada cálculo é um POST novo.
export function useCreatePlan() {
  return useMutation({
    mutationFn: (contributionCents: number) => api.post<Plan>('/plans', { contributionCents }),
  })
}
