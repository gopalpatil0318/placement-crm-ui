import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { useYearFilter } from "@/context/YearFilterContext";

export const useDepartmentCards = () => {
    const { selectedYear } = useYearFilter();

    const departmentsQuery = useQuery({
        queryKey: queryKeys.students.departments(selectedYear),
        queryFn: async () => {
            const [apiData, studentData] = await Promise.allSettled([
                CollegeAdminService.getDepartments({ passout_year: selectedYear }),
                CollegeAdminService.getAllStudents({ page: 1, limit: 1, student_passout_year: selectedYear }),
            ]);
            const deptRaw = apiData.status === "fulfilled" ? apiData.value : null;
            const studentRaw = studentData.status === "fulfilled" ? studentData.value : null;
            let deptList: { dept_id: string; dept_name: string; dept_code?: string }[] = [];
            if (Array.isArray(deptRaw)) {
                deptList = deptRaw;
            } else if (Array.isArray(deptRaw?.data)) {
                deptList = deptRaw.data;
            } else if (Array.isArray(deptRaw?.departments)) {
                deptList = deptRaw.departments;
            }
            return {
                departments: deptList,
                totalStudents: studentRaw?.pagination?.total || 0,
            };
        },
    });

    const errorMessage = departmentsQuery.error instanceof Error ? departmentsQuery.error.message : "Failed to load departments";

    return {
        departments: departmentsQuery.data?.departments ?? [],
        loading: departmentsQuery.isLoading,
        error: departmentsQuery.error ? errorMessage : null,
        totalStudents: departmentsQuery.data?.totalStudents ?? 0,
        refresh: departmentsQuery.refetch,
    };
};
