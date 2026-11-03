import { Calculator } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { formatCents, MAX_CONTRIBUTION_CENTS, parseCents } from '@/lib/money'

const CONTRIBUTION_OUT_OF_RANGE = 'Valor do aporte deve ser maior que R$ 0,00 e até R$ 1.000.000,00'

type Props = {
  portfolioCents: number
  /** Sem ativos não dá para calcular (AC-021). */
  disabled: boolean
  isCalculating: boolean
  onCalculate: (contributionCents: number) => void
}

export function ContributionForm({ portfolioCents, disabled, isCalculating, onCalculate }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const cents = parseCents(text)
  const isValid = cents !== null && cents > 0 && cents <= MAX_CONTRIBUTION_CENTS

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <form
          noValidate
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
          onSubmit={(event) => {
            event.preventDefault()
            if (!isValid) {
              setError(CONTRIBUTION_OUT_OF_RANGE)
              return
            }
            setError(null)
            onCalculate(cents)
          }}
        >
          <Field data-invalid={error !== null} className="sm:w-80">
            <FieldLabel htmlFor="contribution">Quanto você vai aportar?</FieldLabel>
            <div className="relative">
              <span className="-translate-y-1/2 absolute top-1/2 left-3.5 text-lg text-muted-foreground">
                R$
              </span>
              <Input
                id="contribution"
                inputMode="decimal"
                placeholder="0,00"
                autoComplete="off"
                value={text}
                disabled={disabled}
                aria-invalid={error !== null}
                className="h-12 pl-11 font-semibold text-lg tabular-nums md:text-lg"
                onChange={(event) => setText(event.target.value)}
              />
            </div>
            {disabled && <FieldDescription>Cadastre seus ativos para calcular o aporte</FieldDescription>}
            <FieldError>{error}</FieldError>
          </Field>
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
              {formatCents(portfolioCents + (isValid ? cents : 0))}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
