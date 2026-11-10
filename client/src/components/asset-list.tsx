import { CircleDashed, Pencil, Trash2 } from 'lucide-react'
import { AssetClassMarker } from '@/components/asset-class-marker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ASSET_CLASSES } from '@/config/asset-classes'
import { formatCents, percentOf } from '@/lib/money'
import { cn } from '@/lib/utils'
import type { Asset, ClassTarget } from '@/types/api'

type Props = {
  assets: Asset[]
  targets: ClassTarget[]
  onEdit: (asset: Asset) => void
  onDelete: (asset: Asset) => void
}

export function AssetList({ assets, targets, onEdit, onDelete }: Props) {
  const total = assets.reduce((sum, asset) => sum + asset.valueCents, 0)

  return (
    <Card className="gap-0 py-0">
      {ASSET_CLASSES.map((info) => {
        const classAssets = assets
          .filter((asset) => asset.assetClass === info.id)
          .sort((a, b) => a.code.localeCompare(b.code))
        const classTotal = classAssets.reduce((sum, asset) => sum + asset.valueCents, 0)
        const target = targets.find((t) => t.assetClass === info.id)?.targetPercent

        return (
          <section key={info.id} aria-label={info.label} className="border-t first:border-t-0">
            <header className="flex items-center justify-between gap-4 bg-muted py-3.5 pr-4 pl-5 sm:pr-24">
              <div className="flex items-center gap-2.5">
                <AssetClassMarker assetClass={info.id} shape="bar" />
                <h2 className="font-semibold text-sm">{info.label}</h2>
                <span className="text-muted-foreground text-xs">
                  {percentOf(classTotal, total)}%{target !== undefined && ` · alvo ${target}%`}
                </span>
              </div>
              <span className="font-semibold text-sm tabular-nums">{formatCents(classTotal)}</span>
            </header>

            {classAssets.length === 0 ? (
              <p className="flex items-center gap-2 border-t px-5 py-4 text-muted-foreground text-sm">
                <CircleDashed className="size-3.5" />
                Nenhum ativo nesta classe
              </p>
            ) : (
              <ul>
                {classAssets.map((asset) => (
                  <li key={asset.id} className="flex items-center gap-4 border-t py-3 pr-4 pl-5">
                    <span className="flex flex-1 items-center gap-2 font-medium text-sm">
                      {asset.code}
                      {asset.pluggyInvestmentId && <Badge variant="secondary">Pluggy</Badge>}
                    </span>
                    <span
                      className={cn(
                        'text-sm tabular-nums',
                        asset.valueCents === 0 && 'text-muted-foreground',
                      )}
                    >
                      {formatCents(asset.valueCents)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${asset.code}`}
                        onClick={() => onEdit(asset)}
                      >
                        <Pencil className="text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover ${asset.code}`}
                        onClick={() => onDelete(asset)}
                      >
                        <Trash2 className="text-muted-foreground" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </Card>
  )
}
