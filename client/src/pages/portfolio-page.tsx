import { Calculator, Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { ASSET_CODE_INPUT_ID, AssetForm } from '@/components/asset-form'
import { AssetList } from '@/components/asset-list'
import { ClassTargetsDialog } from '@/components/class-targets-dialog'
import { DeleteAssetDialog } from '@/components/delete-asset-dialog'
import { LoadError } from '@/components/load-error'
import { PluggySyncCard } from '@/components/pluggy-sync-card'
import { PortfolioSummary } from '@/components/portfolio-summary'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/config/paths'
import { useAssets } from '@/hooks/use-assets'
import { useClassTargets } from '@/hooks/use-class-targets'
import type { Asset } from '@/types/api'

export function PortfolioPage() {
  const assets = useAssets()
  const targets = useClassTargets()
  const [editing, setEditing] = useState<Asset | null>(null)
  const [deleting, setDeleting] = useState<Asset | null>(null)
  const [targetsOpen, setTargetsOpen] = useState(false)

  if (assets.isError || targets.isError) {
    return (
      <LoadError
        title="Não foi possível carregar a carteira."
        description="Confira se o servidor está rodando."
        onRetry={() => {
          assets.refetch()
          targets.refetch()
        }}
      />
    )
  }

  if (!assets.data || !targets.data) return <PortfolioSkeleton />

  return (
    <div className="grid gap-8">
      <PortfolioSummary assets={assets.data} onEditTargets={() => setTargetsOpen(true)} />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {assets.data.length === 0 ? (
          <EmptyPortfolio />
        ) : (
          <AssetList assets={assets.data} targets={targets.data} onEdit={setEditing} onDelete={setDeleting} />
        )}

        <aside className="grid gap-6">
          <PluggySyncCard />
          {/* A key remonta o formulário ao trocar entre novo e edição. */}
          <AssetForm
            key={editing?.id ?? 'new'}
            asset={editing ?? undefined}
            onFinished={() => setEditing(null)}
          />
          <div className="flex gap-3 rounded-xl bg-accent p-5">
            <Calculator className="size-4.5 shrink-0 text-accent-foreground" />
            <div className="grid gap-1">
              <p className="font-semibold text-accent-foreground text-sm">Carteira atualizada?</p>
              <p className="text-sm leading-relaxed">
                Vá para o{' '}
                <Link to={paths.plan} className="font-medium underline underline-offset-4">
                  Plano de aporte
                </Link>{' '}
                e digite quanto vai investir este mês.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <DeleteAssetDialog asset={deleting} onClose={() => setDeleting(null)} />
      <ClassTargetsDialog open={targetsOpen} onOpenChange={setTargetsOpen} targets={targets.data} />
    </div>
  )
}

function EmptyPortfolio() {
  return (
    <Card>
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wallet />
          </EmptyMedia>
          <EmptyTitle>Nenhum ativo cadastrado</EmptyTitle>
          <EmptyDescription>
            Cadastre cada ativo com a classe e o valor atual para calcular onde vai o aporte.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => document.getElementById(ASSET_CODE_INPUT_ID)?.focus()}>
            <Plus />
            Adicionar ativo
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
  )
}

const skeletonClasses = [3, 0, 1, 1]

function PortfolioSkeleton() {
  return (
    <div className="grid gap-8" role="status" aria-busy aria-label="Carregando a carteira">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-60" />
        </div>
        <div className="grid w-full gap-3 lg:max-w-xl">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2.5 w-full rounded-full" />
          <div className="flex gap-4">
            {skeletonClasses.map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lista fixa de placeholders
              <Skeleton key={index} className="h-3 w-24" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="gap-0 py-0">
          {skeletonClasses.map((rows, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lista fixa de placeholders
            <div key={index} className="border-t first:border-t-0">
              <div className="flex items-center justify-between bg-muted py-4 pr-24 pl-5">
                <Skeleton className="h-3.5 w-40 bg-border" />
                <Skeleton className="h-3.5 w-24 bg-border" />
              </div>
              {Array.from({ length: rows }, (_, row) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: lista fixa de placeholders
                <div key={row} className="flex items-center justify-between border-t py-4.5 pr-24 pl-5">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              ))}
            </div>
          ))}
        </Card>
        <Card>
          <CardContent className="grid gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-48" />
            {[0, 1, 2].map((field) => (
              <div key={field} className="grid gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
