import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import { departmentUpdateSchema } from "@/validators/DepartmentSchema";

// ========================
// TYPES
// ========================

export interface UpdateDepartmentForm {
    deptName: string;
    deptCode: string;
    deptType: string;
    programDurationYears: number;
    totalSemesters: number;
}

export type DepartmentFormErrors = Partial<Record<keyof UpdateDepartmentForm, string>>;

// ========================
// HOOK
// ========================

export const useUpdateDepartment = (deptId: string) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateDepartmentForm>({
        deptName: "",
        deptCode: "",
        deptType: "",
        programDurationYears: 4,
        totalSemesters: 8,
    });
    const originalDataRef = useRef<UpdateDepartmentForm | null>(null);
    const [errors, setErrors] = useState<DepartmentFormErrors>({});
    const [fetchedDeptName, setFetchedDeptName] = useState("");

    // ── Fetch existing data via React Query ──
    const { data: queryData, isLoading: fetching, error: queryError } = useQuery({
        queryKey: queryKeys.departments.detail(deptId),
        queryFn: () => CollegeAdminService.getDepartment(deptId),
        enabled: !!deptId,
    });

    const fetchError = queryError
        ? (queryError instanceof Error ? queryError.message : "Failed to load department")
        : null;

    // Sync fetched data into form state (runs once when query resolves)
    useEffect(() => {
        const dept = queryData?.data ?? queryData;
        if (dept && !originalDataRef.current) {
            const loaded: UpdateDepartmentForm = {
                deptName: dept?.dept_name || "",
                deptCode: dept?.dept_code || "",
                deptType: dept?.dept_type || "",
                programDurationYears: dept?.program_duration_years ?? 4,
                totalSemesters: dept?.total_semesters ?? 8,
            };
            setFormData(loaded);
            originalDataRef.current = loaded;
            setFetchedDeptName(dept?.dept_name || "");
        }
    }, [queryData]);

    // ── Update mutation ──
    const mutation = useMutation({
        mutationFn: (payload: Record<string, string | number>) =>
            CollegeAdminService.updateDepartment(
                deptId,
                payload as Parameters<typeof CollegeAdminService.updateDepartment>[1]
            ),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(deptId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Department updated successfully",
            });
            navigate(`/college/department/${deptId}`);
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ deptName: message });
            }

            showToast({ type: "error", title: "Error Updating Department", description: message });
        },
    });

    // ── Handle input change (stable — [] deps) ──
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]:
                    name === "programDurationYears" || name === "totalSemesters"
                        ? Number(value)
                        : name === "deptCode"
                            ? value.toUpperCase()
                            : value,
            }));

            setErrors((prev) => {
                if (!prev[name as keyof UpdateDepartmentForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    // ── Handle update submit (diff-based partial payload) ──
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            if (!originalDataRef.current) return;

            const orig = originalDataRef.current;

            // Build changed-fields object for Zod validation
            const changed: Record<string, unknown> = {};
            if (formData.deptName.trim() !== orig.deptName.trim()) changed.deptName = formData.deptName.trim();
            if (formData.deptCode !== orig.deptCode) changed.deptCode = formData.deptCode;
            if (formData.deptType !== orig.deptType) changed.deptType = formData.deptType;
            if (formData.programDurationYears !== orig.programDurationYears) changed.programDurationYears = formData.programDurationYears;
            if (formData.totalSemesters !== orig.totalSemesters) changed.totalSemesters = formData.totalSemesters;

            if (Object.keys(changed).length === 0) {
                showToast({
                    type: "warning",
                    title: "No Changes",
                    description: "Nothing has been changed.",
                });
                return;
            }

            // Validate changed fields with Zod
            const result = departmentUpdateSchema.safeParse(changed);
            if (!result.success) {
                const fieldErrors: DepartmentFormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof UpdateDepartmentForm;
                    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
                }
                setErrors(fieldErrors);
                return;
            }

            // Build API payload from validated data
            const payload: Record<string, string | number> = {};
            if (changed.deptName !== undefined) payload.dept_name = changed.deptName as string;
            if (changed.deptCode !== undefined) payload.dept_code = changed.deptCode as string;
            if (changed.deptType !== undefined) payload.dept_type = changed.deptType as string;
            if (changed.programDurationYears !== undefined) payload.program_duration_years = changed.programDurationYears as number;
            if (changed.totalSemesters !== undefined) payload.total_semesters = changed.totalSemesters as number;

            setErrors({});
            mutation.mutate(payload);
        },
        [formData, mutation]
    );

    const handleCancel = useCallback(() => {
        navigate(`/college/department/${deptId}`);
    }, [navigate, deptId]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        fetching,
        fetchError,
        fetchedDeptName,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
