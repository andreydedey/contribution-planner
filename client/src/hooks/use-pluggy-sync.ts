import { useMutation } from '@tanstack/react-query'
import { useRefetchAssets } from '@/hooks/use-assets'
import { api } from '@/lib/api-client'
import type { PluggySyncResult } from '@/types/api'

export function usePluggySync() {
  const refetchAssets = useRefetchAssets()
  return useMutation({
    mutationFn: () => api.post<PluggySyncResult>('/pluggy/sync', {}),
    onSuccess: refetchAssets,
  })
}
