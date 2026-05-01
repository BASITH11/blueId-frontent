import { createFileRoute } from '@tanstack/react-router'
import NoAccess from '../pages/NoAccess'

export const Route = createFileRoute('/no-access')({
  component: NoAccess,
})


