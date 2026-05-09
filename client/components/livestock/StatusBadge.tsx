import { Badge } from '../ui/Badge'
import type { LivestockStatus } from '../../../src/types'

const config: Record<LivestockStatus, { label: string; variant: 'green' | 'yellow' | 'red' | 'gray' }> = {
  available: { label: 'Tersedia', variant: 'green' },
  booking: { label: 'Booking/DP', variant: 'yellow' },
  sold: { label: 'Terjual', variant: 'red' },
  dead: { label: 'Mati', variant: 'gray' },
}

export function StatusBadge({ status }: { status: LivestockStatus }) {
  const { label, variant } = config[status] ?? { label: status, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}
