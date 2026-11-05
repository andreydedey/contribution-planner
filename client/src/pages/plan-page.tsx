import { ArrowRight, Calculator, TriangleAlert, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { ContributionForm } from '@/components/contribution-form'
import { LoadError } from '@/components/load-error'
import { PlanAllocations } from '@/components/plan-allocations'
import { PlanClassProgress } from '@/components/plan-class-progress'
import { PlanClassTable } from '@/components/plan-class-table'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/config/paths'
import { useAssets } from '@/hooks/use-assets'
import { useClassTargets } from '@/hooks/use-class-targets'
import { useCreatePlan } from '@/hooks/use-create-plan'
import { ApiError } from '@/lib/api-client'

export function PlanPage() {
  const assets = useAssets()
  const targets = useClassTargets()
  const createPlan = useCreatePlan()
  const [contributionCents, setContributionCents] = useState(0)

  const header = (
    <header className="grid gap-2">
      <h1 className="font-semibold text-3xl tracking-tight">Plano de aporte</h1>
      <p className="text-muted-foreground">
        Primeiro a classe mais abaixo do alvo; dentro dela, as duas ações mais atrasadas, meio a meio.
      </p>
    </header>
  )

  if (assets.isError || targets.isError) {
    return (
      <div className="grid gap-6">
        {header}
        <LoadError
          title="Não foi possível carregar a carteira."
          description="Confira se o servidor está rodando."
          onRetry={() => {
            assets.refetch()
            targets.refetch()
          }}
        />
      </div>
    )
  }

  if (!assets.data || !targets.data) {
    return (
      <div className="grid gap-6" role="status" aria-busy aria-label="Carregando a carteira">
        {header}
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    )
  }

  const portfolioCents = assets.data.reduce((sum, asset) => sum + asset.valueCents, 0)
  const hasAssets = assets.data.length > 0
  const plan = createPlan.data

  function calculate(cents: number) {
    setContributionCents(cents)
    createPlan.mutate(cents)
  }

  let result: React.ReactNode
  if (!hasAssets) {
    result = <NoAssets />
  } else if (createPlan.isPending) {
    result = <PlanResultsSkeleton />
  } else if (createPlan.isError) {
    const isValidation = createPlan.error instanceof ApiError && createPlan.error.status === 400
    result = isValidation ? (
      <LoadError title={createPlan.error.message} />
    ) : (
      <LoadError title="Não foi possível calcular o aporte." onRetry={() => calculate(contributionCents)} />
    )
  } else if (plan) {
    result = (
      <>
        {plan.warnings.map((warning) => (
          <Alert key={warning} variant="warning">
            <TriangleAlert />
            <AlertTitle>{warning}</AlertTitle>
          </Alert>
        ))}
        <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_400px]">
          <PlanAllocations plan={plan} contributionCents={contributionCents} />
          <PlanClassProgress plan={plan} />
        </div>
        <PlanClassTable plan={plan} targets={targets.data} />
      </>
    )
  } else {
    result = <BeforeCalculating />
  }

  return (
    <div className="grid gap-6">
      {header}
      <ContributionForm
        portfolioCents={portfolioCents}
        disabled={!hasAssets}
        isCalculating={createPlan.isPending}
        onCalculate={calculate}
      />
      {result}
    </div>
  )
}

function NoAssets() {
  return (
    <Card>
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wallet />
          </EmptyMedia>
          <EmptyTitle>Nenhum ativo na carteira</EmptyTitle>
          <EmptyDescription>
            Cadastre seus ativos na Carteira para calcular onde vai o aporte deste mês.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" asChild>
            <Link to={paths.portfolio}>
              Ir para a Carteira
              <ArrowRight />
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
  )
}

function BeforeCalculating() {
  return (
    <Card>
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-accent text-accent-foreground">
            <Calculator />
          </EmptyMedia>
          <EmptyTitle>Digite quanto vai aportar</EmptyTitle>
          <EmptyDescription>
            O plano mostra o que comprar em cada classe, sem passar do alvo de nenhuma ação.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  )
}

function PlanResultsSkeleton() {
  return (
    <div className="grid gap-6" role="status" aria-busy aria-label="Calculando o aporte">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="gap-0 pb-0">
          <CardHeader className="gap-2 border-b px-6">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-60" />
          </CardHeader>
          {[0, 1].map((row) => (
            <div key={row} className="flex items-center gap-4 border-b px-6 py-5">
              <Skeleton className="h-10 w-1" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-8 w-36" />
            </div>
          ))}
          <div className="flex justify-between bg-muted px-6 py-4">
            <Skeleton className="h-3 w-20 bg-border" />
            <Skeleton className="h-3 w-16 bg-border" />
          </div>
        </Card>
        <Card>
          <CardContent className="grid gap-5 px-6">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-56" />
            </div>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="grid gap-2.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
