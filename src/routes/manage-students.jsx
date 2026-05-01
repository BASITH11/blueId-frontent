import { createFileRoute } from '@tanstack/react-router'
import ManageStudents from '../pages/ManageStudents'
import SchoolAdminManageStudents from '../pages/SchoolAdminManageStudents'
import { useAuthStore } from '../config/authStore'

export const Route = createFileRoute('/manage-students')({
  validateSearch: (search) => {
    return {
      add: search.add === 'true' || search.add === true || false,
    }
  },
  component: () => {
    const { role } = useAuthStore();
    const isSchoolAdmin = (role?.name || role)?.toString()?.toLowerCase() === 'school_admin';
    
    return isSchoolAdmin ? <SchoolAdminManageStudents /> : <ManageStudents />;
  }
})
