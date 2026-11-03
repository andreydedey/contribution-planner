// Contrato da API (design.md da contribution-plan). Todo valor em reais trafega em centavos inteiros.

export type AssetClass = 'BR_STOCKS' | 'US_STOCKS' | 'FIXED_INCOME' | 'BITCOIN'

export type Asset = {
  id: number
  code: string
  assetClass: AssetClass
  valueCents: number
}

export type AssetInput = Omit<Asset, 'id'>

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

export type ApiErrorCode =
  | 'CODE_REQUIRED'
  | 'CODE_TOO_LONG'
  | 'INVALID_CLASS'
  | 'VALUE_OUT_OF_RANGE'
  | 'DUPLICATE_CODE'
  | 'ASSET_NOT_FOUND'
  | 'TARGET_OUT_OF_RANGE'
  | 'TARGETS_INCOMPLETE'
  | 'TARGETS_SUM_NOT_100'
  | 'CONTRIBUTION_OUT_OF_RANGE'
  | 'INVALID_REQUEST'

export type ApiErrorBody = {
  code: ApiErrorCode
  message: string
}
