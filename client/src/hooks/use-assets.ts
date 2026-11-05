import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Asset, AssetInput, PageResponse } from '@/types/api'

export const assetsQueryKey = ['assets'] as const

const PAGE_SIZE = 50

// The portfolio totals and the plan need every asset, so one query walks through all the pages.
async function fetchAllAssets(): Promise<Asset[]> {
  const assets: Asset[] = []
  for (let page = 0; ; page++) {
    const response = await api.get<PageResponse<Asset>>(`/assets?page=${page}&size=${PAGE_SIZE}&sort=code`)
    assets.push(...response.content)
    if (page + 1 >= response.totalPages) return assets
  }
}

export function useAssets() {
  return useQuery({ queryKey: assetsQueryKey, queryFn: fetchAllAssets })
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
