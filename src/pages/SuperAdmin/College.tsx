'use client'
import DashboardLayout from '@/components/sysadmin/DashboardLayout'

  import { useParams } from 'react-router-dom'

const College = () => {
  const { collegeId } = useParams<{ collegeId: string }>()
  return (

    <DashboardLayout>College{collegeId}</DashboardLayout>

  )
}

export default College
