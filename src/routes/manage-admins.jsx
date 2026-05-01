import { createFileRoute } from '@tanstack/react-router'
import ManageAdmins from '../pages/ManageAdmins'

export const Route = createFileRoute('/manage-admins')({
  component: ManageAdmins
})
