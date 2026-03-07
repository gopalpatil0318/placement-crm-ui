import { useState, useEffect } from "react";
import { showToast } from "@/utils/ToastUtils";
import { personalInfoSchema } from "@/validators/student/personalInfoSchema";
import { StudentPersonalInfoService } from "@/services/student/personalInfo.service";
import type { PersonalInfoData } from "@/services/student/personalInfo.service";

const initialFormData: PersonalInfoData = {
    mobile_number: "",
    alternate_mobile: "",
    birth_date: "",
    gender: "",
    blood_group: "",
    aadhaar_number: "",
    caste: "",
    category: "",
    nationality: "Indian",
    father_name: "",
    father_mobile: "",
    father_occupation: "",
    father_annual_income: "",
    mother_name: "",
    mother_mobile: "",
    mother_occupation: "",
    mother_annual_income: "",
    guardian_name: "",
    guardian_mobile: "",
    permanent_address: "",
    permanent_city: "",
    permanent_district: "",
    permanent_state: "",
    permanent_pincode: "",
    same_as_permanent: false,
    current_address: "",
    current_city: "",
    current_district: "",
    current_state: "",
    current_pincode: "",
};

type FormErrors = Partial<Record<string, string>>;

export const usePersonalInfo = (
    profileData: any,
    _refreshProfile: () => Promise<void>,
    _nextStep: () => void
) => {
    const [formData, setFormData] = useState<PersonalInfoData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    // Prefill from profileData when available
    useEffect(() => {
        if (profileData) {
            const prefillData = { ...profileData };
            // Convert ISO date to YYYY-MM-DD for date input
            if (prefillData.birth_date) {
                prefillData.birth_date = prefillData.birth_date.split("T")[0];
            }
            setFormData((prev) => ({
                ...prev,
                ...prefillData,
            }));
        }
    }, [profileData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => {
            const updated = { ...prev, same_as_permanent: checked };
            if (checked) {
                updated.current_address = prev.permanent_address;
                updated.current_city = prev.permanent_city;
                updated.current_district = prev.permanent_district;
                updated.current_state = prev.permanent_state;
                updated.current_pincode = prev.permanent_pincode;
            } else {
                updated.current_address = "";
                updated.current_city = "";
                updated.current_district = "";
                updated.current_state = "";
                updated.current_pincode = "";
            }
            return updated;
        });
    };

    const handleSubmit = async (): Promise<void> => {

        const result = personalInfoSchema.safeParse(formData);

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
            const payload = {
                ...formData,
                father_annual_income: Number(formData.father_annual_income),
                mother_annual_income: Number(formData.mother_annual_income),
            };

            const response = await StudentPersonalInfoService.savePersonalInfo(payload);

            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Personal info saved successfully",
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error Saving Personal Info",
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
        handleChange,
        handleCheckboxChange,
        handleSubmit,
    };
};
