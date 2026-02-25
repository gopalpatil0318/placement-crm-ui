import { useEffect, useState } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { departmentSchema } from "@/validators/DepartmentSchema";

interface UpdateDepartmentForm {
    deptName: string;
    deptCode: string;
    deptType: string;
    programDurationYears: number;
    totalSemesters: number;
}

type FormErrors = Partial<Record<keyof UpdateDepartmentForm, string>>;

export const useUpdateDepartment = (deptId: string) => {
    const [formData, setFormData] = useState<UpdateDepartmentForm>({
        deptName: "",
        deptCode: "",
        deptType: "",
        programDurationYears: 4,
        totalSemesters: 8,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // ==============================
    // FETCH DEPARTMENT (PRELOAD DATA)
    // ==============================
    useEffect(() => {
        if (!deptId) return;

        const fetchDepartment = async () => {
            setFetching(true);
            try {
                const dept = await CollegeAdminService.getDepartment(deptId);

                setFormData({
                    deptName: dept?.dept_name || "",
                    deptCode: dept?.dept_code || "",
                    deptType: dept?.dept_type || "",
                    programDurationYears: dept?.program_duration_years || 4,
                    totalSemesters: dept?.total_semesters || 8,
                });
            } catch (error: any) {
                showToast({
                    type: "error",
                    title: "Error",
                    description: error.message || "Failed to fetch department data",
                });
            } finally {
                setFetching(false);
            }
        };

        fetchDepartment();
    }, [deptId]);

    // ==============================
    // HANDLE INPUT CHANGE
    // ==============================
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "programDurationYears" || name === "totalSemesters"
                    ? Number(value)
                    : value,
        }));
    };

    // ==============================
    // HANDLE UPDATE SUBMIT
    // ==============================
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        // ZOD VALIDATION
        const result = departmentSchema.safeParse(formData);

        if (!result.success) {
            const firstErrorMessage = result.error.issues[0].message;

            showToast({
                type: "warning",
                title: "Validation Failed",
                description: firstErrorMessage,
            });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await CollegeAdminService.updateDepartment(deptId, {
                deptName: formData.deptName,
                deptCode: formData.deptCode,
                deptType: formData.deptType,
                programDurationYears: formData.programDurationYears,
                totalSemesters: formData.totalSemesters,
            });

            const successMessage =
                response?.message || "Department updated successfully";

            showToast({
                type: "success",
                title: "Success",
                description: successMessage,
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error Updating Department",
                description: error.message || "Something went wrong",
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        errors,
        loading,
        fetching,
        setErrors,
        handleChange,
        handleSubmit,
    };
};
