import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { formatCents, MAX_CONTRIBUTION_CENTS, parseCents } from '@/lib/money'

const CONTRIBUTION_OUT_OF_RANGE = 'Valor do aporte deve ser maior que R$ 0,00 e até R$ 1.000.000,00'

/** Texto digitado → centavos; recusa zero, negativo e acima de R$ 1.000.000,00 (AC-020). */
const contributionCents = z.string().transform((text, ctx) => {
  const cents = parseCents(text)
  if (cents === null || cents <= 0 || cents > MAX_CONTRIBUTION_CENTS) {
    ctx.addIssue({ code: 'custom', message: CONTRIBUTION_OUT_OF_RANGE })
    return z.NEVER
  }
  return cents
})

const contributionSchema = z.object({ contribution: contributionCents })

type ContributionInput = z.input<typeof contributionSchema>
type ContributionOutput = z.output<typeof contributionSchema>

type Props = {
  portfolioCents: number
  /** Sem ativos não dá para calcular (AC-021). */
  disabled: boolean
  isCalculating: boolean
  onCalculate: (contributionCents: number) => void
}

export function ContributionForm({ portfolioCents, disabled, isCalculating, onCalculate }: Props) {
  const form = useForm<ContributionInput, unknown, ContributionOutput>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { contribution: '' },
  })
  const typed = contributionCents.safeParse(useWatch({ control: form.control, name: 'contribution' }))

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <form
          noValidate
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
          onSubmit={form.handleSubmit((values) => onCalculate(values.contribution))}
        >
          <Controller
            name="contribution"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:w-80">
                <FieldLabel htmlFor="contribution">Quanto você vai aportar?</FieldLabel>
                <div className="relative">
                  <span className="-translate-y-1/2 absolute top-1/2 left-3.5 text-lg text-muted-foreground">
                    R$
                  </span>
                  <Input
                    {...field}
                    id="contribution"
                    inputMode="decimal"
                    placeholder="0,00"
                    autoComplete="off"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    className="h-12 pl-11 font-semibold text-lg tabular-nums md:text-lg"
                  />
                </div>
                {disabled && <FieldDescription>Cadastre seus ativos para calcular o aporte</FieldDescription>}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Button type="submit" className="h-12 px-5 sm:mt-[1.625rem]" disabled={disabled || isCalculating}>
            {isCalculating ? <Spinner /> : <Calculator />}
            {isCalculating ? 'Calculando…' : 'Calcular aporte'}
          </Button>
        </form>

        <dl className="flex gap-10 sm:text-right">
          <div className="grid gap-1">
            <dt className="text-muted-foreground text-sm">Carteira atual</dt>
            <dd className="font-semibold text-lg tabular-nums">{formatCents(portfolioCents)}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground text-sm">Patrimônio com o aporte</dt>
            <dd className="font-semibold text-lg tabular-nums">
              {formatCents(portfolioCents + (typed.success ? typed.data : 0))}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
