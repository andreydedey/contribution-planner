import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { ClassTarget } from '@/types/api'

export const classTargetsQueryKey = ['class-targets'] as const

export function useClassTargets() {
  return useQuery({
    queryKey: classTargetsQueryKey,
    queryFn: () => api.get<ClassTarget[]>('/class-targets'),
  })
}

export function useUpdateClassTargets() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targets: ClassTarget[]) => api.put<ClassTarget[]>('/class-targets', targets),
    onSuccess: (saved) => queryClient.setQueryData(classTargetsQueryKey, saved),
  })
}
