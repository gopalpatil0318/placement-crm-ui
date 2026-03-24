import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { departmentCreateSchema } from "@/validators/DepartmentSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

interface CreateDepartmentForm {
    deptName: string;
    deptCode: string;
    deptType: string;
    programDurationYears: number;
    totalSemesters: number;
}

type FormErrors = Partial<Record<keyof CreateDepartmentForm, string>>;

// ========================
// HOOK
// ========================

export const useCreateDepartment = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateDepartmentForm>({
        deptName: "",
        deptCode: "",
        deptType: "",
        programDurationYears: 4,
        totalSemesters: 8,
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: {
            dept_name: string;
            dept_code: string;
            dept_type: string;
            program_duration_years: number;
            total_semesters: number;
        }) => CollegeAdminService.createDepartment(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Department created successfully",
            });
            navigate("/college/departments");
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ deptName: message });
            }

            showToast({ type: "error", title: "Error Creating Department", description: message });
        },
    });

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
                if (!prev[name as keyof CreateDepartmentForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            // Zod validation
            const result = departmentCreateSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof CreateDepartmentForm;
                    if (!fieldErrors[field]) {
                        fieldErrors[field] = issue.message;
                    }
                }
                setErrors(fieldErrors);
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: result.error.issues[0].message,
                });
                return;
            }

            setErrors({});
            mutation.mutate({
                dept_name: formData.deptName.trim(),
                dept_code: formData.deptCode.trim(),
                dept_type: formData.deptType,
                program_duration_years: formData.programDurationYears,
                total_semesters: formData.totalSemesters,
            });
        },
        [formData, mutation]
    );

    const handleCancel = useCallback(() => {
        navigate("/college/departments");
    }, [navigate]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
