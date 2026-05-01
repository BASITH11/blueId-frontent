import { createFileRoute } from '@tanstack/react-router'
import ManageBatches from '../pages/ManageBatches'

export const Route = createFileRoute('/manage-batches')({
  component: ManageBatches,
})
