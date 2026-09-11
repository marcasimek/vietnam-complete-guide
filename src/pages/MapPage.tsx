import { EmptyState } from '@/components/ui'

export function MapPage() {
  return (
    <div className="page">
      <EmptyState icon="info" title="Map">
        <p>Tahle část se právě staví.</p>
      </EmptyState>
    </div>
  )
}
