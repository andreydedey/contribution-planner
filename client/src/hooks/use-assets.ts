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

function useInvalidateAssets() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: assetsQueryKey })
}

export function useCreateAsset() {
  const invalidate = useInvalidateAssets()
  return useMutation({
    mutationFn: (input: AssetInput) => api.post<Asset>('/assets', input),
    onSuccess: invalidate,
  })
}

export function useUpdateAsset() {
  const invalidate = useInvalidateAssets()
  return useMutation({
    mutationFn: ({ id, ...input }: Asset) => api.put<Asset>(`/assets/${id}`, input),
    onSuccess: invalidate,
  })
}

export function useDeleteAsset() {
  const invalidate = useInvalidateAssets()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/assets/${id}`),
    onSuccess: invalidate,
  })
}
