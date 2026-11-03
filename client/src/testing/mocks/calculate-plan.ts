// Cálculo do plano só para o mock da API (dev e testes do client).
// A fonte da verdade é o ContributionPlanner do server; aqui segue o mesmo passo a passo do design.md,
// com peso igual dentro da classe.

import { ASSET_CLASSES, assetClassInfo } from '@/config/asset-classes'
import type { Asset, ClassTarget, Plan, PlanAllocation } from '@/types/api'

const floorDiv = (a: number, b: number) => Math.floor(a / b)

export function calculatePlan(assets: Asset[], targets: ClassTarget[], contributionCents: number): Plan {
  const totalCents = assets.reduce((sum, a) => sum + a.valueCents, 0) + contributionCents
  const percentOf = (assetClass: Asset['assetClass']) =>
    targets.find((t) => t.assetClass === assetClass)?.targetPercent ?? 0

  const classes = ASSET_CLASSES.map((info) => {
    const pct = percentOf(info.id)
    const currentCents = assets
      .filter((a) => a.assetClass === info.id)
      .reduce((sum, a) => sum + a.valueCents, 0)
    const gapNumerator = totalCents * pct - currentCents * 100
    return {
      assetClass: info.id,
      targetCents: floorDiv(totalCents * pct, 100),
      currentCents,
      gapCents: floorDiv(gapNumerator, 100),
      allocatedCents: 0,
      pct,
      gapNumerator,
    }
  })

  const allocations: PlanAllocation[] = []
  const warnings: string[] = []
  let remaining = contributionCents
  let anyClassWithAssets = false

  const eligible = classes
    .filter((c) => c.pct > 0 && c.gapNumerator > 0)
    .sort((a, b) => b.gapNumerator - a.gapNumerator)

  for (const c of eligible) {
    const classAssets = assets.filter((a) => a.assetClass === c.assetClass)
    if (classAssets.length === 0) {
      warnings.push(
        `A classe ${assetClassInfo(c.assetClass).label} está abaixo do alvo e não tem ativos cadastrados`,
      )
      continue
    }
    anyClassWithAssets = true
    if (remaining === 0) continue

    const budget = Math.min(remaining, c.gapCents)
    const n = classAssets.length
    const ranked = classAssets
      .map((a) => ({
        asset: a,
        missing: floorDiv(totalCents * c.pct - a.valueCents * 100 * n, 100 * n),
        given: 0,
      }))
      .filter((r) => r.missing > 0)
      .sort((a, b) => b.missing - a.missing || a.asset.code.localeCompare(b.asset.code))

    if (ranked.length === 1) {
      ranked[0].given = Math.min(budget, ranked[0].missing)
    } else if (ranked.length >= 2) {
      const half = floorDiv(budget, 2)
      ranked[0].given = Math.min(half + (budget % 2), ranked[0].missing)
      ranked[1].given = Math.min(half, ranked[1].missing)
    }
    // O que passou do teto vai para a outra do par e depois para as próximas.
    let leftover = budget - ranked.reduce((sum, r) => sum + r.given, 0)
    for (const r of ranked) {
      const extra = Math.min(leftover, r.missing - r.given)
      r.given += extra
      leftover -= extra
    }

    for (const r of ranked.filter((r) => r.given > 0)) {
      allocations.push({ code: r.asset.code, assetClass: c.assetClass, amountCents: r.given })
      c.allocatedCents += r.given
      remaining -= r.given
    }
  }

  if (!anyClassWithAssets) warnings.push('Nenhuma classe com ativos está abaixo do alvo')

  return {
    totalCents,
    classes: classes.map(({ pct: _pct, gapNumerator: _gap, ...c }) => c),
    allocations,
    unallocatedCents: remaining,
    warnings,
  }
}
