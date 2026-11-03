import { useState } from 'react'
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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  targets: ClassTarget[]
}

function parsePercent(text: string): number | null {
  if (!/^\d{1,3}$/.test(text.trim())) return null
  const value = Number(text)
  return value <= 100 ? value : null
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
  const [values, setValues] = useState<Record<AssetClass, string>>(
    () =>
      Object.fromEntries(
        ASSET_CLASSES.map((info) => [
          info.id,
          String(targets.find((t) => t.assetClass === info.id)?.targetPercent ?? 0),
        ]),
      ) as Record<AssetClass, string>,
  )

  const parsed = ASSET_CLASSES.map((info) => ({
    assetClass: info.id,
    targetPercent: parsePercent(values[info.id]),
  }))
  const allValid = parsed.every((t) => t.targetPercent !== null)
  const sum = parsed.reduce((acc, t) => acc + (t.targetPercent ?? 0), 0)
  const canSave = allValid && sum === 100 && !updateTargets.isPending

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
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSave) return
        updateTargets.mutate(parsed as ClassTarget[], { onSuccess: onSaved })
      }}
    >
      <DialogHeader>
        <DialogTitle>Metas por classe</DialogTitle>
        <DialogDescription>Percentual do patrimônio que cada classe deve ter.</DialogDescription>
      </DialogHeader>

      <FieldGroup className="gap-4">
        {ASSET_CLASSES.map((info, index) => {
          const invalid = parsed[index].targetPercent === null
          const id = `target-${info.id}`
          return (
            <Field key={info.id} orientation="horizontal" data-invalid={invalid}>
              <FieldLabel htmlFor={id} className="flex-1">
                <AssetClassMarker assetClass={info.id} />
                {info.label}
              </FieldLabel>
              <div className="relative w-24">
                <Input
                  id={id}
                  inputMode="numeric"
                  value={values[info.id]}
                  aria-invalid={invalid}
                  className="pr-7 text-right tabular-nums"
                  onChange={(event) => setValues({ ...values, [info.id]: event.target.value })}
                />
                <span className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </Field>
          )
        })}
      </FieldGroup>

      <div className="grid gap-2">
        <p
          className={cn(
            'text-sm tabular-nums',
            allValid && sum === 100 ? 'text-muted-foreground' : 'font-medium text-destructive',
          )}
        >
          Soma: {sum}%{sum < 100 && ` · faltam ${100 - sum}%`}
          {sum > 100 && ` · sobram ${sum - 100}%`}
        </p>
        {!allValid && <FieldError>{TARGET_OUT_OF_RANGE}</FieldError>}
        {allValid && sum !== 100 && <FieldError>{SUM_NOT_100}</FieldError>}
        {saveError && <FieldError>{saveError}</FieldError>}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" size="lg">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" size="lg" disabled={!canSave}>
          Salvar metas
        </Button>
      </DialogFooter>
    </form>
  )
}
