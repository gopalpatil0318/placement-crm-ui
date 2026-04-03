import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { showToast } from "@/utils/ToastUtils";
import { useNavigate } from "react-router-dom";
import { studentSchema } from "@/validators/StudentSchema";

const INITIAL_FORM = {
    first_name: "",
    middle_name: "",
    last_name: "",
    student_email: "",
    student_password: "",
    dept_name: "",
    student_passout_year: new Date().getFullYear(),
};

export const useCreateStudent = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [errors, setErrors] = useState({});

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]:
                    name === "student_passout_year"
                        ? Number(value)
                        : value,
            }));
            setErrors((prev) => {
                if (!(prev as Record<string, unknown>)[name]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    const mutation = useMutation({
        mutationFn: (data: typeof formData) =>
            CollegeAdminService.createStudent(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all() });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Student created successfully",
            });
            setFormData({ ...INITIAL_FORM });
            navigate("/college/students");
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;
            if (status === 409) {
                setErrors({ student_email: message });
            }
            showToast({
                type: "error",
                title: "Error Creating Student",
                description: message,
            });
        },
    });

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        const result = studentSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
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
        mutation.mutate(formData);
    };

    return {
        formData,
        errors,
        loading: mutation.isPending,
        setErrors,
        handleChange,
        handleSubmit,
    };
};

