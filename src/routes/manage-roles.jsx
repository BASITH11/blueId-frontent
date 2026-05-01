import { createFileRoute } from '@tanstack/react-router'
import ManageRoles from '../pages/ManageRoles'

export const Route = createFileRoute('/manage-roles')({
  component: ManageRoles,
})
