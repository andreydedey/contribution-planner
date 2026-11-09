import { Check, CircleAlert, RefreshCw, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { usePluggySync } from '@/hooks/use-pluggy-sync'
import { ApiError } from '@/lib/api-client'
import type { PluggySyncResult } from '@/types/api'

const SYNC_FAILED = 'Não foi possível consultar a Pluggy. Tente novamente.'

export function PluggySyncCard() {
  const sync = usePluggySync()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pluggy</CardTitle>
        <CardDescription>Busca o valor atual das ações e da renda fixa do Inter.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button variant="outline" onClick={() => sync.mutate()} disabled={sync.isPending}>
          {sync.isPending ? <Spinner /> : <RefreshCw />}
          {sync.isPending ? 'Sincronizando…' : 'Sincronizar com a Pluggy'}
        </Button>

        {sync.isError && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>{errorMessage(sync.error)}</AlertTitle>
          </Alert>
        )}
        {sync.isSuccess && <SyncResult result={sync.data} />}
      </CardContent>
    </Card>
  )
}

// Without credentials the server explains it; any other failure gets the generic retry message.
function errorMessage(error: Error) {
  return error instanceof ApiError && error.status === 503 ? error.message : SYNC_FAILED
}

function SyncResult({ result }: { result: PluggySyncResult }) {
  const changes = [
    count(result.updated.length, 'ativo atualizado', 'ativos atualizados'),
    count(result.created.length, 'ativo cadastrado', 'ativos cadastrados'),
  ].filter((text) => text !== null)
  const warnings = [
    ...result.missing.map((code) => `${code} não veio da Pluggy; o valor anterior foi mantido`),
    ...result.ignored.map((name) => `${name} foi ignorado: tipo de investimento não usado na carteira`),
  ]

  return (
    <>
      <Alert>
        <Check />
        <AlertTitle>
          {changes.length === 0 ? (
            'Nenhum ativo veio da Pluggy'
          ) : (
            <ul>
              {changes.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}
        </AlertTitle>
      </Alert>
      {warnings.length > 0 && (
        <Alert variant="warning">
          <TriangleAlert />
          <AlertDescription>
            <ul className="grid gap-1">
              {warnings.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

function count(n: number, singular: string, plural: string) {
  if (n === 0) return null
  return `${n} ${n === 1 ? singular : plural}`
}
