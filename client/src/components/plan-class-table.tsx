import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { AssetClassMarker } from '@/components/asset-class-marker'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { assetClassInfo } from '@/config/asset-classes'
import { formatCents } from '@/lib/money'
import { cn } from '@/lib/utils'
import type { ClassTarget, Plan } from '@/types/api'

type Props = {
  plan: Plan
  targets: ClassTarget[]
}

const numeric = 'text-right tabular-nums'

export function PlanClassTable({ plan, targets }: Props) {
  const [open, setOpen] = useState(true)
  const sum = (pick: (c: Plan['classes'][number]) => number) =>
    plan.classes.reduce((acc, c) => acc + pick(c), 0)

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-6 py-5">
        <CardTitle className="text-base">Detalhe do cálculo por classe</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? 'Recolher' : 'Expandir'}
            {open ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </CardAction>
      </CardHeader>
      {open && (
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="pl-6">Classe</TableHead>
              <TableHead className={numeric}>Alvo</TableHead>
              <TableHead className={numeric}>Valor-alvo</TableHead>
              <TableHead className={numeric}>Atual</TableHead>
              <TableHead className={numeric}>Diferença</TableHead>
              <TableHead className={cn(numeric, 'pr-6')}>Recebe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plan.classes.map((c) => (
              <TableRow key={c.assetClass}>
                <TableCell className="pl-6 font-semibold">
                  <span className="flex items-center gap-2">
                    <AssetClassMarker assetClass={c.assetClass} />
                    {assetClassInfo(c.assetClass).label}
                  </span>
                </TableCell>
                <TableCell className={numeric}>
                  {targets.find((t) => t.assetClass === c.assetClass)?.targetPercent ?? 0}%
                </TableCell>
                <TableCell className={numeric}>{formatCents(c.targetCents)}</TableCell>
                <TableCell className={numeric}>{formatCents(c.currentCents)}</TableCell>
                <TableCell className={cn(numeric, c.gapCents < 0 && 'text-muted-foreground')}>
                  {formatCents(c.gapCents)}
                </TableCell>
                <TableCell
                  className={cn(
                    numeric,
                    'pr-6',
                    c.allocatedCents > 0 ? 'font-semibold text-primary' : 'text-muted-foreground',
                  )}
                >
                  {formatCents(c.allocatedCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="pl-6 font-semibold">Total</TableCell>
              <TableCell className={numeric}>
                {targets.reduce((acc, t) => acc + t.targetPercent, 0)}%
              </TableCell>
              <TableCell className={numeric}>{formatCents(sum((c) => c.targetCents))}</TableCell>
              <TableCell className={numeric}>{formatCents(sum((c) => c.currentCents))}</TableCell>
              <TableCell className={numeric}>{formatCents(sum((c) => c.gapCents))}</TableCell>
              <TableCell className={cn(numeric, 'pr-6 font-semibold text-primary')}>
                {formatCents(sum((c) => c.allocatedCents))}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </Card>
  )
}
