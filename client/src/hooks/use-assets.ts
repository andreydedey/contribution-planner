import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/api-client'
import type { Asset, AssetInput, PageResponse } from '@/types/api'

export const assetsQueryKey = ['assets'] as const

const PAGE_SIZE = 50

/**
 * Carrega todas as páginas de ativos: os totais da Carteira e o plano precisam da carteira inteira.
 * `data` só fica pronto depois da última página.
 */
export function useAssets() {
  const query = useInfiniteQuery({
    queryKey: assetsQueryKey,
    queryFn: ({ pageParam }) =>
      api.get<PageResponse<Asset>>(`/assets?page=${pageParam}&size=${PAGE_SIZE}&sort=code`),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
  })

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  // Depende da quantidade de páginas: uma resposta rápida pode não deixar isFetchingNextPage mudar entre renders.
  const loadedPages = query.data?.pages.length ?? 0
  useEffect(() => {
    if (loadedPages > 0 && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [loadedPages, hasNextPage, isFetchingNextPage, fetchNextPage])

  const loadedAll = query.data !== undefined && !hasNextPage
  return {
    data: loadedAll ? query.data.pages.flatMap((page) => page.content) : undefined,
    isError: query.isError,
    refetch: query.refetch,
  }
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
