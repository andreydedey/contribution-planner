import { assetClassInfo } from '@/config/asset-classes'
import { cn } from '@/lib/utils'
import type { AssetClass } from '@/types/api'

type Props = {
  assetClass: AssetClass
  /** "dot" nas legendas e no select; "bar" no cabeçalho das classes e nas compras. */
  shape?: 'dot' | 'bar'
  className?: string
}

// A cor da classe aparece sempre ao lado do nome, nunca sozinha.
export function AssetClassMarker({ assetClass, shape = 'dot', className }: Props) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0',
        shape === 'dot' ? 'size-2 rounded-full' : 'h-4 w-1 rounded-sm',
        assetClassInfo(assetClass).colorClass,
        className,
      )}
    />
  )
}
