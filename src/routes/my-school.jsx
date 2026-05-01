import { createFileRoute } from '@tanstack/react-router'
import MySchool from '../pages/MySchool'

export const Route = createFileRoute('/my-school')({
  component: MySchool
})
