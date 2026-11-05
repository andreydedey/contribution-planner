import { zodResolver } from '@hookform/resolvers/zod'
import { Check, CircleAlert, Lock, Plus } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AssetClassMarker } from '@/components/asset-class-marker'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ASSET_CLASSES, assetClassInfo } from '@/config/asset-classes'
import { useCreateAsset, useUpdateAsset } from '@/hooks/use-assets'
import { ApiError } from '@/lib/api-client'
import { formatAmount, MAX_ASSET_VALUE_CENTS, parseCents } from '@/lib/money'
import type { Asset, AssetClass } from '@/types/api'

export const ASSET_CODE_INPUT_ID = 'asset-code'

const VALUE_OUT_OF_RANGE = 'Valor deve estar entre R$ 0,00 e R$ 100.000.000,00'
const SAVE_FAILED = 'Não foi possível salvar. Tente novamente.'

const assetFormSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código do ativo'),
  assetClass: z.enum(ASSET_CLASSES.map((info) => info.id) as [AssetClass, ...AssetClass[]]),
  value: z.string().refine((text) => {
    const cents = parseCents(text)
    return cents !== null && cents >= 0 && cents <= MAX_ASSET_VALUE_CENTS
  }, VALUE_OUT_OF_RANGE),
})

type AssetFormValues = z.input<typeof assetFormSchema>

type Props = {
  /** Ativo em edição; sem ele o formulário cadastra um ativo novo. */
  asset?: Asset
  onFinished?: () => void
}

export function AssetForm({ asset, onFinished }: Props) {
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const isEditing = asset !== undefined

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      code: asset?.code ?? '',
      assetClass: asset?.assetClass ?? 'BR_STOCKS',
      value: asset ? formatAmount(asset.valueCents) : '',
    },
  })

  async function onSubmit(values: AssetFormValues) {
    const input = {
      code: values.code.trim().toUpperCase(),
      assetClass: values.assetClass,
      valueCents: parseCents(values.value) ?? 0,
    }
    try {
      if (asset) await updateAsset.mutateAsync({ id: asset.id, ...input })
      else await createAsset.mutateAsync(input)
      form.reset()
      onFinished?.()
    } catch (error) {
      // Em caso de falha o formulário continua preenchido (AC-009).
      if (error instanceof ApiError && error.status === 409) {
        form.setError('code', { message: 'Ativo já cadastrado' })
      } else {
        form.setError('root', { message: SAVE_FAILED })
      }
    }
  }

  const rootError = form.formState.errors.root?.message

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{asset ? `Editar ${asset.code}` : 'Novo ativo'}</CardTitle>
        <CardDescription>
          {asset ? assetClassInfo(asset.assetClass).label : 'Informe o valor atual em reais.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={ASSET_CODE_INPUT_ID}>Código</FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id={ASSET_CODE_INPUT_ID}
                      placeholder="Ex.: WEGE3"
                      autoComplete="off"
                      disabled={isEditing}
                      aria-invalid={fieldState.invalid}
                    />
                    {isEditing && (
                      <Lock className="-translate-y-1/2 absolute top-1/2 right-3 size-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {!isEditing && (
              <Controller
                name="assetClass"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="asset-class">Classe</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="asset-class" className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_CLASSES.map((info) => (
                          <SelectItem key={info.id} value={info.id}>
                            <AssetClassMarker assetClass={info.id} />
                            {info.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}

            <Controller
              name="value"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="asset-value">Valor atual</FieldLabel>
                  <div className="relative">
                    <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      {...field}
                      id="asset-value"
                      inputMode="decimal"
                      placeholder="0,00"
                      autoComplete="off"
                      className="pl-9 tabular-nums"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {rootError && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>{rootError}</AlertTitle>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  form.reset()
                  onFinished?.()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {isEditing ? <Check /> : <Plus />}
                {isEditing ? 'Salvar alterações' : 'Salvar ativo'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
