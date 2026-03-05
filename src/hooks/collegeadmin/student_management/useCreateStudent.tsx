import { useState } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { useNavigate } from "react-router-dom";
import { studentSchema } from "@/validators/StudentSchema";
export const useCreateStudent = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        student_email: "",
        student_password: "",
        dept_name: "",
        student_passout_year: new Date().getFullYear(),
        current_year: 1,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "student_passout_year" || name === "current_year"
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        // 🔍 ZOD VALIDATION
        const result = studentSchema.safeParse(formData);
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
            const response = await CollegeAdminService.createStudent(formData);

            showToast({
                type: "success",
                title: "Success",
                description:
                    response?.message || "Student created successfully",
            });

            // 🔄 Reset form
            setFormData({
                first_name: "",
                middle_name: "",
                last_name: "",
                student_email: "",
                student_password: "",
                dept_name: "",
                student_passout_year: new Date().getFullYear(),
                current_year: 1,
            });

            navigate("/collegeadmin/students");
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error Creating Student",
                description:
                    error.message || "Something went wrong, please try again",
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

