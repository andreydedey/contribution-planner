import { Target } from 'lucide-react'
import { AssetClassMarker } from '@/components/asset-class-marker'
import { Button } from '@/components/ui/button'
import { ASSET_CLASSES } from '@/config/asset-classes'
import { formatCents, percentOf } from '@/lib/money'
import type { Asset } from '@/types/api'

type Props = {
  assets: Asset[]
  onEditTargets: () => void
}

export function PortfolioSummary({ assets, onEditTargets }: Props) {
  const total = assets.reduce((sum, asset) => sum + asset.valueCents, 0)
  const classes = ASSET_CLASSES.map((info) => ({
    ...info,
    value: assets
      .filter((asset) => asset.assetClass === info.id)
      .reduce((sum, asset) => sum + asset.valueCents, 0),
  }))

  return (
    <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div className="grid gap-1">
        <p className="text-muted-foreground text-sm">Patrimônio cadastrado</p>
        <p className="font-semibold text-4xl tabular-nums tracking-tight">{formatCents(total)}</p>
      </div>

      <div className="grid w-full gap-2.5 lg:max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">Distribuição atual</p>
          <Button variant="outline" size="sm" onClick={onEditTargets}>
            <Target />
            Editar metas
          </Button>
        </div>
        <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted">
          {total > 0 &&
            classes
              .filter((c) => c.value > 0)
              .map((c) => (
                <div
                  key={c.id}
                  className={`${c.colorClass} h-full`}
                  style={{ width: `${(c.value * 100) / total}%` }}
                />
              ))}
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {classes.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground text-xs"
            >
              <AssetClassMarker assetClass={c.id} />
              <span className="text-foreground">{c.label}</span>
              <span className="tabular-nums">{percentOf(c.value, total)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
