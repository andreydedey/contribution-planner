import type { Asset, ClassTarget } from '@/types/api'

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

export const db = {
  assets: [] as Asset[],
  targets: [] as ClassTarget[],
  nextId: 1,

  reset(assets: Omit<Asset, 'id'>[] = []) {
    db.assets = assets.map((asset, index) => ({ id: index + 1, ...asset }))
    db.targets = DEFAULT_TARGETS.map((t) => ({ ...t }))
    db.nextId = assets.length + 1
  },

  seed() {
    db.reset(initialAssets)
  },
}

db.seed()
