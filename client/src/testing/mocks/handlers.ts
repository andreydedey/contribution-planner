import { HttpResponse, http } from 'msw/http'
import { ASSET_CLASSES } from '@/config/asset-classes'
import { MAX_ASSET_VALUE_CENTS, MAX_CONTRIBUTION_CENTS } from '@/lib/money'
import type {
  ApiErrorBody,
  Asset,
  AssetClass,
  AssetInput,
  ClassTarget,
  PageResponse,
  PluggyPosition,
  PluggySyncResult,
} from '@/types/api'
import { calculatePlan } from './calculate-plan'
import { db } from './db'

// Mock da API do design.md, com as mesmas validações e códigos de erro do server.

const ERROR_NAMES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
}

export const error = (status: number, message: string) =>
  HttpResponse.json<ApiErrorBody>(
    { timestamp: new Date().toISOString(), status, error: ERROR_NAMES[status], message, path: '' },
    { status },
  )

const validClasses = new Set<string>(ASSET_CLASSES.map((info) => info.id))

function validateAsset(input: AssetInput, ignoreId?: number) {
  const code = input.code?.trim().toUpperCase() ?? ''
  if (!code) return error(400, 'Informe o código do ativo')
  if (!validClasses.has(input.assetClass)) {
    return error(400, 'Classe inválida')
  }
  if (
    !Number.isInteger(input.valueCents) ||
    input.valueCents < 0 ||
    input.valueCents > MAX_ASSET_VALUE_CENTS
  ) {
    return error(400, 'Valor deve estar entre R$ 0,00 e R$ 100.000.000,00')
  }
  if (db.assets.some((a) => a.code === code && a.id !== ignoreId)) {
    return error(409, 'Ativo já cadastrado')
  }
  return null
}

function pluggyAssetClass(position: PluggyPosition): AssetClass | null {
  if (position.type === 'EQUITY' && position.subtype === 'STOCK') return 'BR_STOCKS'
  if (position.type === 'FIXED_INCOME') return 'FIXED_INCOME'
  return null
}

function pluggyCode(position: PluggyPosition) {
  const code = (position.code?.trim() ? position.code : position.name).trim().toUpperCase()
  return code.slice(0, 20).trim()
}

export const handlers = [
  http.get('/api/assets', ({ request }) => {
    const params = new URL(request.url).searchParams
    const page = Number(params.get('page') ?? 0)
    const size = Number(params.get('size') ?? 50)
    const sorted = [...db.assets].sort((a, b) => a.code.localeCompare(b.code))
    return HttpResponse.json<PageResponse<Asset>>({
      content: sorted.slice(page * size, (page + 1) * size),
      page,
      size,
      totalElements: sorted.length,
      totalPages: Math.ceil(sorted.length / size),
    })
  }),

  http.post('/api/assets', async ({ request }) => {
    const input = (await request.json()) as AssetInput
    const invalid = validateAsset(input)
    if (invalid) return invalid
    const asset = { ...input, code: input.code.trim().toUpperCase(), id: db.nextId++ }
    db.assets.push(asset)
    return HttpResponse.json(asset, { status: 201 })
  }),

  http.put('/api/assets/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const index = db.assets.findIndex((a) => a.id === id)
    if (index === -1) return new HttpResponse(null, { status: 404 })
    const input = (await request.json()) as AssetInput
    const invalid = validateAsset(input, id)
    if (invalid) return invalid
    // Editing keeps the link to Pluggy, as on the server.
    db.assets[index] = { ...db.assets[index], ...input, code: input.code.trim().toUpperCase(), id }
    return HttpResponse.json(db.assets[index])
  }),

  http.delete('/api/assets/:id', ({ params }) => {
    const id = Number(params.id)
    if (!db.assets.some((a) => a.id === id)) return new HttpResponse(null, { status: 404 })
    db.assets = db.assets.filter((a) => a.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/class-targets', () => HttpResponse.json(db.targets)),

  http.put('/api/class-targets', async ({ request }) => {
    const targets = (await request.json()) as ClassTarget[]
    if (
      targets.some((t) => !Number.isInteger(t.targetPercent) || t.targetPercent < 0 || t.targetPercent > 100)
    ) {
      return error(400, 'Meta deve ser um número inteiro de 0% a 100%')
    }
    if (targets.reduce((sum, t) => sum + t.targetPercent, 0) !== 100) {
      return error(400, 'As metas devem somar 100%')
    }
    db.targets = targets
    return HttpResponse.json(db.targets)
  }),

  // Same rules as PluggySyncService on the server.
  http.post('/api/pluggy/sync', () => {
    const result: PluggySyncResult = { updated: [], created: [], missing: [], ignored: [] }
    const syncedIds = new Set<string>()
    for (const position of db.pluggyPositions) {
      const assetClass = pluggyAssetClass(position)
      if (!assetClass) {
        result.ignored.push(position.name)
        continue
      }
      const code = pluggyCode(position)
      const existing =
        db.assets.find((a) => a.pluggyInvestmentId === position.id) ??
        db.assets.find((a) => a.code === code && !a.pluggyInvestmentId)
      if (!existing && db.assets.some((a) => a.code === code)) {
        result.ignored.push(position.name)
        continue
      }
      if (existing) {
        existing.valueCents = position.valueCents
        existing.pluggyInvestmentId = position.id
        result.updated.push(existing.code)
      } else {
        db.assets.push({
          id: db.nextId++,
          code,
          assetClass,
          valueCents: position.valueCents,
          pluggyInvestmentId: position.id,
        })
        result.created.push(code)
      }
      syncedIds.add(position.id)
    }
    result.missing = db.assets
      .filter((a) => a.pluggyInvestmentId && !syncedIds.has(a.pluggyInvestmentId))
      .map((a) => a.code)
      .sort()
    return HttpResponse.json(result)
  }),

  http.post('/api/plans', async ({ request }) => {
    const { contributionCents } = (await request.json()) as { contributionCents: number }
    if (
      !Number.isInteger(contributionCents) ||
      contributionCents <= 0 ||
      contributionCents > MAX_CONTRIBUTION_CENTS
    ) {
      return error(400, 'Valor do aporte deve ser maior que R$ 0,00 e até R$ 1.000.000,00')
    }
    return HttpResponse.json(calculatePlan(db.assets, db.targets, contributionCents))
  }),
]
