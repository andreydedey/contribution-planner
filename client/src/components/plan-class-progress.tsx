import { AssetClassMarker } from '@/components/asset-class-marker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { assetClassInfo } from '@/config/asset-classes'
import { formatCents, percentOf } from '@/lib/money'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types/api'

export function PlanClassProgress({ plan }: { plan: Plan }) {
  const rows = plan.classes.map((c) => ({
    ...c,
    currentPercent: percentOf(c.currentCents, plan.totalCents),
    targetPercent: percentOf(c.targetCents, plan.totalCents),
  }))
  // A escala vai até o maior percentual, para as barras não ficarem minúsculas.
  const scale = Math.max(1, ...rows.flatMap((r) => [r.currentPercent, r.targetPercent]))

  return (
    <Card>
      <CardHeader className="px-6">
        <CardTitle className="text-base">Atual × alvo</CardTitle>
        <CardDescription>Sobre o patrimônio de {formatCents(plan.totalCents)}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 px-6">
        {rows.map((row) => {
          const info = assetClassInfo(row.assetClass)
          const receives = row.allocatedCents > 0

          return (
            <div key={row.assetClass} className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 whitespace-nowrap text-sm">
                  <AssetClassMarker assetClass={row.assetClass} />
                  <span className={receives ? 'font-semibold' : 'font-medium'}>{info.label}</span>
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-xs tabular-nums',
                    receives ? 'font-semibold text-primary' : 'text-muted-foreground',
                  )}
                >
                  {row.currentPercent}% de {row.targetPercent}%
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', info.colorClass)}
                  style={{ width: `${(row.currentPercent * 100) / scale}%` }}
                />
                <div
                  className="-top-1 absolute h-4 w-0.5 bg-foreground"
                  style={{ left: `${(row.targetPercent * 100) / scale}%` }}
                />
              </div>
            </div>
          )
        })}
        <p className="text-muted-foreground text-xs">Barra = atual · traço = alvo</p>
      </CardContent>
    </Card>
  )
}
