import { CircleAlert } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteAsset } from '@/hooks/use-assets'
import type { Asset } from '@/types/api'

type Props = {
  asset: Asset | null
  onClose: () => void
}

// Diálogo próprio em vez de window.confirm, para a remoção ser testável (design.md).
export function DeleteAssetDialog({ asset, onClose }: Props) {
  const deleteAsset = useDeleteAsset()

  return (
    <AlertDialog open={asset !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover {asset?.code}?</AlertDialogTitle>
          <AlertDialogDescription>
            O ativo sai da carteira e dos próximos planos de aporte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {deleteAsset.isError && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Não foi possível remover. Tente novamente.</AlertTitle>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteAsset.isPending}
            onClick={(event) => {
              // Mantém o diálogo aberto até a API responder.
              event.preventDefault()
              if (!asset) return
              deleteAsset.mutate(asset.id, { onSuccess: onClose })
            }}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
