import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { departmentCreateSchema } from "@/validators/DepartmentSchema";

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
    const [formData, setFormData] = useState<CreateDepartmentForm>({
        deptName: "",
        deptCode: "",
        deptType: "",
        programDurationYears: 4,
        totalSemesters: 8,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]:
                    name === "programDurationYears" || name === "totalSemesters"
                        ? Number(value)
                        : name === "deptCode"
                            ? value.toUpperCase() // Auto-uppercase dept code
                            : value,
            }));

            // Clear field-level error on change
            if (errors[name as keyof CreateDepartmentForm]) {
                setErrors((prev) => ({ ...prev, [name]: undefined }));
            }
        },
        [errors]
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
            setLoading(true);

            try {
                // Convert camelCase → snake_case for API
                const response = await CollegeAdminService.createDepartment({
                    dept_name: formData.deptName,
                    dept_code: formData.deptCode || undefined!,
                    dept_type: formData.deptType || undefined!,
                    program_duration_years: formData.programDurationYears,
                    total_semesters: formData.totalSemesters,
                });

                showToast({
                    type: "success",
                    title: "Success",
                    description:
                        response?.message || "Department created successfully",
                });

                navigate("/college/departments");
            } catch (error: unknown) {
                const axiosErr = error as AxiosError<{
                    error?: string;
                    message?: string;
                }>;
                const status = axiosErr?.response?.status;
                const errorMsg =
                    axiosErr?.response?.data?.error ||
                    axiosErr?.response?.data?.message ||
                    "Something went wrong, please try again";

                // 409 — duplicate name → highlight field
                if (status === 409) {
                    setErrors({ deptName: errorMsg });
                }

                showToast({
                    type: "error",
                    title: "Error Creating Department",
                    description: errorMsg,
                });
            } finally {
                setLoading(false);
            }
        },
        [formData, navigate]
    );

    const handleCancel = useCallback(() => {
        navigate("/college/departments");
    }, [navigate]);

    return {
        formData,
        errors,
        loading,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
