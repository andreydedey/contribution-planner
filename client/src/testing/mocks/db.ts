import type { Asset, ClassTarget, PluggyPosition } from '@/types/api'

// Banco em memória do mock. Os dados iniciais são o exemplo do primeiro aporte (AC-027).
const initialAssets: Omit<Asset, 'id'>[] = [
  { code: 'EGIE3', assetClass: 'BR_STOCKS', valueCents: 0 },
  { code: 'ITUB3', assetClass: 'BR_STOCKS', valueCents: 0 },
  { code: 'LREN3', assetClass: 'BR_STOCKS', valueCents: 0 },
  { code: 'WEGE3', assetClass: 'BR_STOCKS', valueCents: 0 },
  { code: 'Tesouro IPCA+ 2035', assetClass: 'FIXED_INCOME', valueCents: 1_600_000 },
  { code: 'BTC', assetClass: 'BITCOIN', valueCents: 1_100_000 },
]

export const DEFAULT_TARGETS: ClassTarget[] = [
  { assetClass: 'BR_STOCKS', targetPercent: 40 },
  { assetClass: 'US_STOCKS', targetPercent: 30 },
  { assetClass: 'FIXED_INCOME', targetPercent: 20 },
  { assetClass: 'BITCOIN', targetPercent: 10 },
]

// What the mocked Pluggy returns in dev:mock; tests set db.pluggyPositions themselves.
const initialPluggyPositions: PluggyPosition[] = [
  pluggyStock('ITUB3', 210_466),
  pluggyStock('LREN3', 198_600),
  pluggyStock('WEGE3', 202_398),
]

export function pluggyStock(code: string, valueCents: number): PluggyPosition {
  return {
    id: `inv-${code}`,
    code,
    name: code,
    type: 'EQUITY',
    subtype: 'STOCK',
    status: 'ACTIVE',
    quantity: 10,
    valueCents,
    currencyCode: 'BRL',
  }
}

export const db = {
  assets: [] as Asset[],
  targets: [] as ClassTarget[],
  pluggyPositions: [] as PluggyPosition[],
  nextId: 1,

  reset(assets: Omit<Asset, 'id'>[] = []) {
    db.assets = assets.map((asset, index) => ({ id: index + 1, ...asset }))
    db.targets = DEFAULT_TARGETS.map((t) => ({ ...t }))
    db.pluggyPositions = []
    db.nextId = assets.length + 1
  },

  seed() {
    db.reset(initialAssets)
    db.pluggyPositions = initialPluggyPositions.map((p) => ({ ...p }))
  },
}

db.seed()
