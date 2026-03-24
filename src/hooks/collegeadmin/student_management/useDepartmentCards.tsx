import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

export const useDepartmentCards = () => {
    const departmentsQuery = useQuery({
        queryKey: queryKeys.students.departments(),
        queryFn: async () => {
            const [apiData, studentData] = await Promise.allSettled([
                CollegeAdminService.getDepartments(),
                CollegeAdminService.getAllStudents({ page: 1, limit: 1 }),
            ]);
            const deptRaw = apiData.status === "fulfilled" ? apiData.value : null;
            const studentRaw = studentData.status === "fulfilled" ? studentData.value : null;
            const deptList = Array.isArray(deptRaw)
                ? deptRaw
                : Array.isArray(deptRaw?.data)
                    ? deptRaw.data
                    : Array.isArray(deptRaw?.departments)
                        ? deptRaw.departments
                        : [];
            return {
                departments: deptList,
                totalStudents: studentRaw?.pagination?.total || 0,
            };
        },
    });

    return {
        departments: departmentsQuery.data?.departments ?? [],
        loading: departmentsQuery.isLoading,
        error: departmentsQuery.error
            ? (departmentsQuery.error instanceof Error ? departmentsQuery.error.message : "Failed to load departments")
            : null,
        totalStudents: departmentsQuery.data?.totalStudents ?? 0,
        refresh: departmentsQuery.refetch,
    };
};
