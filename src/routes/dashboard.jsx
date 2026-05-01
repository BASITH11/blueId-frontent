import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '../pages/Dashboard.jsx'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})


