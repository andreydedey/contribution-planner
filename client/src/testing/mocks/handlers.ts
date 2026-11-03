import { HttpResponse, http } from 'msw/http'
import { ASSET_CLASSES } from '@/config/asset-classes'
import { MAX_ASSET_VALUE_CENTS, MAX_CONTRIBUTION_CENTS } from '@/lib/money'
import type { ApiErrorBody, AssetInput, ClassTarget } from '@/types/api'
import { calculatePlan } from './calculate-plan'
import { db } from './db'

// Mock da API do design.md, com as mesmas validações e códigos de erro do server.

const error = (status: number, body: ApiErrorBody) => HttpResponse.json(body, { status })

const validClasses = new Set<string>(ASSET_CLASSES.map((info) => info.id))

function validateAsset(input: AssetInput, ignoreId?: number) {
  const code = input.code?.trim().toUpperCase() ?? ''
  if (!code) return error(400, { code: 'CODE_REQUIRED', message: 'Informe o código do ativo' })
  if (!validClasses.has(input.assetClass)) {
    return error(400, { code: 'INVALID_CLASS', message: 'Classe inválida' })
  }
  if (
    !Number.isInteger(input.valueCents) ||
    input.valueCents < 0 ||
    input.valueCents > MAX_ASSET_VALUE_CENTS
  ) {
    return error(400, {
      code: 'VALUE_OUT_OF_RANGE',
      message: 'Valor deve estar entre R$ 0,00 e R$ 100.000.000,00',
    })
  }
  if (db.assets.some((a) => a.code === code && a.id !== ignoreId)) {
    return error(409, { code: 'DUPLICATE_CODE', message: 'Ativo já cadastrado' })
  }
  return null
}

export const handlers = [
  http.get('/api/assets', () => HttpResponse.json(db.assets)),

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
    db.assets[index] = { ...input, code: input.code.trim().toUpperCase(), id }
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
      return error(400, {
        code: 'TARGET_OUT_OF_RANGE',
        message: 'Meta deve ser um número inteiro de 0% a 100%',
      })
    }
    if (targets.reduce((sum, t) => sum + t.targetPercent, 0) !== 100) {
      return error(400, { code: 'TARGETS_SUM_NOT_100', message: 'As metas devem somar 100%' })
    }
    db.targets = targets
    return HttpResponse.json(db.targets)
  }),

  http.post('/api/plans', async ({ request }) => {
    const { contributionCents } = (await request.json()) as { contributionCents: number }
    if (
      !Number.isInteger(contributionCents) ||
      contributionCents <= 0 ||
      contributionCents > MAX_CONTRIBUTION_CENTS
    ) {
      return error(400, {
        code: 'CONTRIBUTION_OUT_OF_RANGE',
        message: 'Valor do aporte deve ser maior que R$ 0,00 e até R$ 1.000.000,00',
      })
    }
    return HttpResponse.json(calculatePlan(db.assets, db.targets, contributionCents))
  }),
]
