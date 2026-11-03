import { Check, CircleAlert } from 'lucide-react'
import { AssetClassMarker } from '@/components/asset-class-marker'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { assetClassInfo } from '@/config/asset-classes'
import { formatAmount, formatCents, percentOf } from '@/lib/money'
import type { Plan } from '@/types/api'

type Props = {
  plan: Plan
  contributionCents: number
}

function describeShare(amountCents: number, contributionCents: number): string {
  if (amountCents === contributionCents) return 'todo o aporte'
  if (amountCents * 2 === contributionCents) return 'metade do aporte'
  return `${percentOf(amountCents, contributionCents)}% do aporte`
}

function subtitle(plan: Plan): string {
  const receiving = plan.classes
    .filter((c) => c.allocatedCents > 0)
    .sort((a, b) => b.allocatedCents - a.allocatedCents)
    .map((c) => assetClassInfo(c.assetClass).label)
  if (receiving.length === 0) return 'Nada a comprar com este aporte'
  if (receiving.length === 1) return `${receiving[0]} é a classe mais abaixo do alvo`
  return `O aporte foi dividido entre ${receiving.slice(0, -1).join(', ')} e ${receiving.at(-1)}`
}

export function PlanAllocations({ plan, contributionCents }: Props) {
  const fullyAllocated = plan.unallocatedCents === 0

  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="border-b px-6">
        <CardTitle className="text-base">O que comprar este mês</CardTitle>
        <CardDescription>{subtitle(plan)}</CardDescription>
        <CardAction>
          {fullyAllocated ? (
            <Badge className="bg-accent text-accent-foreground">
              <Check />
              Aporte 100% alocado
            </Badge>
          ) : (
            <Badge className="bg-warning text-warning-foreground">
              <CircleAlert />
              Sobrou parte do aporte
            </Badge>
          )}
        </CardAction>
      </CardHeader>

      <ul className="flex-1">
        {plan.allocations.map((allocation) => (
          <li key={allocation.code} className="flex items-center gap-4 border-b px-6 py-5">
            <AssetClassMarker assetClass={allocation.assetClass} shape="bar" className="h-10" />
            <div className="grid flex-1 gap-0.5">
              <span className="font-semibold text-lg">{allocation.code}</span>
              <span className="text-muted-foreground text-sm">
                {assetClassInfo(allocation.assetClass).label} ·{' '}
                {describeShare(allocation.amountCents, contributionCents)}
              </span>
            </div>
            <MoneyHighlight cents={allocation.amountCents} />
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between bg-muted px-6 py-3.5">
        <span className="text-muted-foreground text-sm">Não alocado</span>
        <span className="font-semibold text-sm tabular-nums">{formatCents(plan.unallocatedCents)}</span>
      </div>
    </Card>
  )
}

/** "R$ 3.000 ,00" com o inteiro em destaque, como no design. */
function MoneyHighlight({ cents }: { cents: number }) {
  const [whole, fraction] = formatAmount(cents).split(',')
  return (
    <span className="tabular-nums">
      <span className="sr-only">{formatCents(cents)}</span>
      <span aria-hidden className="flex items-end gap-1">
        <span className="pb-1 text-muted-foreground">R$</span>
        <span className="font-semibold text-3xl leading-none tracking-tight">{whole}</span>
        <span className="pb-1 font-semibold text-muted-foreground">,{fraction}</span>
      </span>
    </span>
  )
}
