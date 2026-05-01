import { createFileRoute } from '@tanstack/react-router'
import ManageSchools from '../pages/ManageSchools'

export const Route = createFileRoute('/manage-schools')({
  component: ManageSchools,
})
