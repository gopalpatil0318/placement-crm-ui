import { useState, useEffect } from "react";
import { showToast } from "@/utils/ToastUtils";
import { academicInfoSchema } from "@/validators/student/academicInfoSchema";
import { StudentAcademicInfoService } from "@/services/student/academicInfo.service";

const initialFormData = {
    roll_number: "",
    enrollment_number: "",
    admission_year: "",
    admission_based_on: "",
    tenth_percentage: "",
    tenth_board: "",
    tenth_passing_year: "",
    twelfth_or_diploma: "12th",
    twelfth_percentage: "",
    twelfth_board: "",
    diploma_percentage: "",
    diploma_branch: "",
    higher_education_passing_year: "",
    overall_cgpa: "",
    total_live_kts: "0",
    total_dead_kts: "0",
    any_gap_during_education: false,
    gap_years: "",
    gap_reason: "",
};

type FormErrors = Partial<Record<string, string>>;

export const useAcademicInfo = (profileData: any) => {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Fetch existing data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await StudentAcademicInfoService.getAcademicInfo();
                if (response.data) {
                    const data = response.data;
                    setFormData((prev) => ({
                        ...prev,
                        ...data,
                        // Convert nulls to empty strings for form inputs
                        twelfth_percentage: data.twelfth_percentage ?? "",
                        twelfth_board: data.twelfth_board ?? "",
                        diploma_percentage: data.diploma_percentage ?? "",
                        diploma_branch: data.diploma_branch ?? "",
                        gap_years: data.gap_years ?? "",
                        gap_reason: data.gap_reason ?? "",
                        total_live_kts: String(data.total_live_kts ?? "0"),
                        total_dead_kts: String(data.total_dead_kts ?? "0"),
                    }));
                }
            } catch {
                console.log("No existing academic info found");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, []);

    // Prefill from profileData
    useEffect(() => {
        if (profileData) {
            setFormData((prev) => ({ ...prev, ...profileData }));
        }
    }, [profileData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (): Promise<void> => {
        const result = academicInfoSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as string;
                if (!fieldErrors[fieldName]) {
                    fieldErrors[fieldName] = issue.message;
                }
            });
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
            const is12th = formData.twelfth_or_diploma === "12th";
            const hasGap = formData.any_gap_during_education;

            const payload = {
                roll_number: formData.roll_number || undefined,
                enrollment_number: formData.enrollment_number || undefined,
                admission_year: Number(formData.admission_year),
                admission_based_on: formData.admission_based_on,
                tenth_percentage: Number(formData.tenth_percentage),
                tenth_board: formData.tenth_board,
                tenth_passing_year: Number(formData.tenth_passing_year),
                twelfth_or_diploma: formData.twelfth_or_diploma,
                twelfth_percentage: is12th ? Number(formData.twelfth_percentage) : null,
                twelfth_board: is12th ? formData.twelfth_board : null,
                diploma_percentage: !is12th ? Number(formData.diploma_percentage) : null,
                diploma_branch: !is12th ? formData.diploma_branch : null,
                higher_education_passing_year: Number(formData.higher_education_passing_year),
                overall_cgpa: Number(formData.overall_cgpa),
                total_live_kts: Number(formData.total_live_kts),
                total_dead_kts: Number(formData.total_dead_kts),
                any_gap_during_education: hasGap,
                gap_years: hasGap ? Number(formData.gap_years) : null,
                gap_reason: hasGap ? formData.gap_reason : null,
            };

            const response = await StudentAcademicInfoService.saveAcademicInfo(payload);
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Academic info saved successfully",
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error Saving Academic Info",
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
        fetching,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
    };
};
