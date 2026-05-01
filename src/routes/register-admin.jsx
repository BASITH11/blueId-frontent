import { createFileRoute } from '@tanstack/react-router'
import RegisterAdmin from '../pages/RegisterAdmin'

export const Route = createFileRoute('/register-admin')({
  component: RegisterAdmin,
})
