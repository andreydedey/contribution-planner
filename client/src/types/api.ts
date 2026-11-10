// Contrato da API (design.md da contribution-plan). Todo valor em reais trafega em centavos inteiros.

export type AssetClass = 'BR_STOCKS' | 'US_STOCKS' | 'FIXED_INCOME' | 'BITCOIN'

export type Asset = {
  id: number
  code: string
  assetClass: AssetClass
  valueCents: number
  /** Filled when the asset comes from Pluggy; null for assets typed by hand. */
  pluggyInvestmentId?: string | null
}

export type AssetInput = Omit<Asset, 'id' | 'pluggyInvestmentId'>

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ClassTarget = {
  assetClass: AssetClass
  targetPercent: number
}

export type PlanClass = {
  assetClass: AssetClass
  targetCents: number
  currentCents: number
  gapCents: number
  allocatedCents: number
}

export type PlanAllocation = {
  code: string
  assetClass: AssetClass
  amountCents: number
}

export type Plan = {
  totalCents: number
  classes: PlanClass[]
  allocations: PlanAllocation[]
  unallocatedCents: number
  warnings: string[]
}

export type PluggyPosition = {
  id: string
  code: string | null
  name: string
  type: string
  subtype: string | null
  status: string
  quantity: number | null
  valueCents: number
  currencyCode: string
}

/** Codes of the assets updated, created and kept, plus the names of the Pluggy investments left out. */
export type PluggySyncResult = {
  updated: string[]
  created: string[]
  missing: string[]
  ignored: string[]
}

export type ApiErrorBody = {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}
