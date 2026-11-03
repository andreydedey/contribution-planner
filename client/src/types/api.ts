// Contrato da API (design.md da contribution-plan). Todo valor em reais trafega em centavos inteiros.

export type AssetClass = 'BR_STOCKS' | 'US_STOCKS' | 'FIXED_INCOME' | 'BITCOIN'

export type Asset = {
  id: number
  code: string
  assetClass: AssetClass
  valueCents: number
}

export type AssetInput = Omit<Asset, 'id'>

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

export type ApiErrorBody = {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}
