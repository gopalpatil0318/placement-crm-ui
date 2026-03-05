import { useParams, useSearchParams } from 'react-router-dom'
import StudentListView from '@/components/collegeadmin/student_management/StudentListView'
import DashboardLayout from '@/components/collegeadmin/DashboardLayout'

const StudentList = () => {
    const { deptId } = useParams<{ deptId?: string }>();
    const [searchParams] = useSearchParams();

    const initialPassoutYear = searchParams.get("year")
        ? Number(searchParams.get("year"))
        : undefined;
    const initialStatus = searchParams.get("status") || undefined;

    return (
        <DashboardLayout>
            <StudentListView
                deptId={deptId}
                initialPassoutYear={initialPassoutYear}
                initialStatus={initialStatus}
            />
        </DashboardLayout>
    )
}

export default StudentList
