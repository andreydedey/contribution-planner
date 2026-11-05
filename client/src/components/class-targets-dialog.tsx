import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { AssetClassMarker } from '@/components/asset-class-marker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ASSET_CLASSES } from '@/config/asset-classes'
import { useUpdateClassTargets } from '@/hooks/use-class-targets'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { AssetClass, ClassTarget } from '@/types/api'

const TARGET_OUT_OF_RANGE = 'Meta deve ser um número inteiro de 0% a 100%'
const SUM_NOT_100 = 'As metas devem somar 100%'

/** Texto digitado → percentual inteiro de 0 a 100 (AC-053). */
const targetPercent = z.string().transform((text, ctx) => {
  const value = /^\d{1,3}$/.test(text.trim()) ? Number(text) : Number.NaN
  if (!(value <= 100)) {
    ctx.addIssue({ code: 'custom', message: TARGET_OUT_OF_RANGE })
    return z.NEVER
  }
  return value
})

const classTargetsSchema = z
  .object({
    BR_STOCKS: targetPercent,
    US_STOCKS: targetPercent,
    FIXED_INCOME: targetPercent,
    BITCOIN: targetPercent,
  })
  .superRefine((targets, ctx) => {
    const percents = Object.values(targets)
    if (!percents.every(Number.isInteger)) return
    if (percents.reduce((sum, percent) => sum + percent, 0) !== 100) {
      ctx.addIssue({ code: 'custom', path: ['root'], message: SUM_NOT_100 })
    }
  })

type ClassTargetsInput = z.input<typeof classTargetsSchema>
type ClassTargetsOutput = z.output<typeof classTargetsSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  targets: ClassTarget[]
}

export function ClassTargetsDialog({ open, onOpenChange, targets }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Remonta a cada abertura para começar das metas salvas. */}
        {open && <ClassTargetsForm targets={targets} onSaved={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ClassTargetsForm({ targets, onSaved }: { targets: ClassTarget[]; onSaved: () => void }) {
  const updateTargets = useUpdateClassTargets()
  const form = useForm<ClassTargetsInput, unknown, ClassTargetsOutput>({
    resolver: zodResolver(classTargetsSchema),
    mode: 'onChange',
    defaultValues: Object.fromEntries(
      ASSET_CLASSES.map((info) => [
        info.id,
        String(targets.find((t) => t.assetClass === info.id)?.targetPercent ?? 0),
      ]),
    ) as ClassTargetsInput,
  })

  // A soma depende das quatro metas: cada mudança valida o formulário inteiro (AC-052).
  useEffect(() => {
    form.trigger()
    const subscription = form.watch(() => form.trigger())
    return () => subscription.unsubscribe()
  }, [form])

  const values = useWatch({ control: form.control })
  const sum = ASSET_CLASSES.reduce((acc, info) => {
    const parsed = targetPercent.safeParse(values[info.id] ?? '')
    return acc + (parsed.success ? parsed.data : 0)
  }, 0)
  const { errors, isValid } = form.formState
  const hasFieldError = ASSET_CLASSES.some((info) => errors[info.id])

  let saveError: string | null = null
  if (updateTargets.error) {
    saveError =
      updateTargets.error instanceof ApiError && updateTargets.error.status === 400
        ? updateTargets.error.message
        : 'Não foi possível salvar. Tente novamente.'
  }

  return (
    <form
      noValidate
      className="grid gap-6"
      onSubmit={form.handleSubmit((saved) => {
        const payload = ASSET_CLASSES.map((info) => ({
          assetClass: info.id,
          targetPercent: saved[info.id as AssetClass],
        }))
        updateTargets.mutate(payload, { onSuccess: onSaved })
      })}
    >
      <DialogHeader>
        <DialogTitle>Metas por classe</DialogTitle>
        <DialogDescription>Percentual do patrimônio que cada classe deve ter.</DialogDescription>
      </DialogHeader>

      <FieldGroup className="gap-4">
        {ASSET_CLASSES.map((info) => (
          <Controller
            key={info.id}
            name={info.id}
            control={form.control}
            render={({ field, fieldState }) => {
              const id = `target-${info.id}`
              return (
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={id} className="flex-1">
                    <AssetClassMarker assetClass={info.id} />
                    {info.label}
                  </FieldLabel>
                  <div className="relative w-24">
                    <Input
                      {...field}
                      id={id}
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                      className="pr-7 text-right tabular-nums"
                    />
                    <span className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </Field>
              )
            }}
          />
        ))}
      </FieldGroup>

      <div className="grid gap-2">
        <p
          className={cn(
            'text-sm tabular-nums',
            isValid ? 'text-muted-foreground' : 'font-medium text-destructive',
          )}
        >
          Soma: {sum}%{sum < 100 && ` · faltam ${100 - sum}%`}
          {sum > 100 && ` · sobram ${sum - 100}%`}
        </p>
        {hasFieldError && <FieldError>{TARGET_OUT_OF_RANGE}</FieldError>}
        {!hasFieldError && errors.root && <FieldError>{errors.root.message}</FieldError>}
        {saveError && <FieldError>{saveError}</FieldError>}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" size="lg">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" size="lg" disabled={!isValid || updateTargets.isPending}>
          Salvar metas
        </Button>
      </DialogFooter>
    </form>
  )
}
