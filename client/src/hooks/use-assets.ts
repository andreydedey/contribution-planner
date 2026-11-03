import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Asset, AssetInput } from '@/types/api'

export const assetsQueryKey = ['assets'] as const

export function useAssets() {
  return useQuery({
    queryKey: assetsQueryKey,
    queryFn: () => api.get<Asset[]>('/assets'),
  })
}

// Há uma só consulta de ativos, compartilhada pela Carteira e pelo Plano: refazê-la já atualiza as duas telas.
function useRefetchAssets() {
  const queryClient = useQueryClient()
  return () => queryClient.refetchQueries({ queryKey: assetsQueryKey })
}

export function useCreateAsset() {
  const refetchAssets = useRefetchAssets()
  return useMutation({
    mutationFn: (input: AssetInput) => api.post<Asset>('/assets', input),
    onSuccess: refetchAssets,
  })
}

export function useUpdateAsset() {
  const refetchAssets = useRefetchAssets()
  return useMutation({
    mutationFn: ({ id, ...input }: Asset) => api.put<Asset>(`/assets/${id}`, input),
    onSuccess: refetchAssets,
  })
}

export function useDeleteAsset() {
  const refetchAssets = useRefetchAssets()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/assets/${id}`),
    onSuccess: refetchAssets,
  })
}
