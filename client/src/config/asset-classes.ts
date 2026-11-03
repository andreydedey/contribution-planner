import type { AssetClass } from '@/types/api'

type AssetClassInfo = {
  id: AssetClass
  label: string
  /** Classe do Tailwind com a cor fixa da classe (tokens --class-* do tema). */
  colorClass: string
}

// As quatro classes são fixas (AC-007), nesta ordem, que é a ordem validada para daltonismo.
export const ASSET_CLASSES: AssetClassInfo[] = [
  { id: 'BR_STOCKS', label: 'Ações BR', colorClass: 'bg-class-br-stocks' },
  { id: 'US_STOCKS', label: 'Stocks', colorClass: 'bg-class-us-stocks' },
  { id: 'FIXED_INCOME', label: 'Renda fixa', colorClass: 'bg-class-fixed-income' },
  { id: 'BITCOIN', label: 'Bitcoin', colorClass: 'bg-class-bitcoin' },
]

const byId = new Map(ASSET_CLASSES.map((info) => [info.id, info]))

export function assetClassInfo(id: AssetClass): AssetClassInfo {
  const info = byId.get(id)
  if (!info) throw new Error(`Classe desconhecida: ${id}`)
  return info
}
