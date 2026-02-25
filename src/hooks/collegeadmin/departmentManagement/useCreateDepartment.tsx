import { useState } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { useNavigate } from "react-router-dom";
import { departmentSchema } from "@/validators/DepartmentSchema";

interface CreateDepartmentForm {
    deptName: string;
    deptCode: string;
    deptType: string;
    programDurationYears: number;
    totalSemesters: number;
}

type FormErrors = Partial<Record<keyof CreateDepartmentForm, string>>;

export const useCreateDepartment = () => {
    const [formData, setFormData] = useState<CreateDepartmentForm>({
        deptName: "",
        deptCode: "",
        deptType: "",
        programDurationYears: 4,
        totalSemesters: 8,
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

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
            const response = await CollegeAdminService.createDepartment({
                deptName: formData.deptName,
                deptCode: formData.deptCode,
                deptType: formData.deptType,
                programDurationYears: formData.programDurationYears,
                totalSemesters: formData.totalSemesters,
            });

            const successMessage =
                response?.message || "Department created successfully";

            showToast({
                type: "success",
                title: "Success",
                description: successMessage,
            });

            // Reset Form
            setFormData({
                deptName: "",
                deptCode: "",
                deptType: "",
                programDurationYears: 4,
                totalSemesters: 8,
            });

            navigate("/collegeadmin/departments");
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error Creating Department",
                description: error.message || "Something went wrong, please try again",
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        errors,
        loading,
        setErrors,
        handleChange,
        handleSubmit,
    };
};
