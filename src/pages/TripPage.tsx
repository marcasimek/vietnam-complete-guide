import { EmptyState } from '@/components/ui'

export function TripPage() {
  return (
    <div className="page">
      <EmptyState icon="info" title="Trip">
        <p>Tahle část se právě staví.</p>
      </EmptyState>
    </div>
  )
}
