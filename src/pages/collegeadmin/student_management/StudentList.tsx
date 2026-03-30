import { useParams, useSearchParams } from 'react-router-dom'
import StudentListView from '@/components/collegeadmin/student_management/StudentListView'

const StudentList = () => {
    const { deptId } = useParams<{ deptId?: string }>();
    const [searchParams] = useSearchParams();

    const initialStatus = searchParams.get("status") || undefined;

    return (
            <StudentListView
                deptId={deptId}
                initialStatus={initialStatus}
            />
    )
}

export default StudentList
