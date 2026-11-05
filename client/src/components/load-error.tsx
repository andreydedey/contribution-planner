import { CircleAlert, RotateCw } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type Props = {
  title: string
  description?: string
  onRetry?: () => void
}

export function LoadError({ title, description, onRetry }: Props) {
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {onRetry && (
        <AlertAction>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw />
            Tentar novamente
          </Button>
        </AlertAction>
      )}
    </Alert>
  )
}
