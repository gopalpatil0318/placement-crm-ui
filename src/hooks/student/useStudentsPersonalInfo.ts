import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
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

export const usePersonalInfo = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<PersonalInfoData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const baselineRef = useRef<string>("");
    const [isDirty, setIsDirty] = useState(false);

    // Fetch existing personal info from API
    const { data: fetchedData, isLoading: fetching } = useQuery({
        queryKey: queryKeys.studentPortal.personalInfo(),
        queryFn: async () => {
            const response = await StudentPersonalInfoService.getPersonalInfo();
            return response.data ?? null;
        },
        staleTime: 2 * 60 * 1000,
    });

    // Prefill from fetched data
    useEffect(() => {
        if (fetchedData) {
            const prefill = { ...fetchedData };
            if (typeof prefill.birth_date === "string") {
                prefill.birth_date = prefill.birth_date.split("T")[0];
            }
            const filled = {
                ...initialFormData,
                ...prefill,
                father_annual_income: fetchedData.father_annual_income ?? "",
                mother_annual_income: fetchedData.mother_annual_income ?? "",
            };
            // eslint-disable-next-line react-hooks/set-state-in-effect -- data prefill from query
            setFormData(filled);
            baselineRef.current = JSON.stringify(filled);
        }
    }, [fetchedData]);

    // Track dirty state by comparing current form to baseline
    useEffect(() => {
        if (!baselineRef.current) return;
        setIsDirty(JSON.stringify(formData) !== baselineRef.current);
    }, [formData]);

    // Warn on browser close/refresh when form is dirty
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;
            e.preventDefault();
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            return { ...prev, [name]: undefined };
        });
    }, []);

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

    const saveMutation = useMutation({
        mutationFn: (payload: PersonalInfoData) =>
            StudentPersonalInfoService.savePersonalInfo(payload),
        onSuccess: (response) => {
            baselineRef.current = JSON.stringify(formData);
            setIsDirty(false);
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.personalInfo() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
            showToast({
                type: "success",
                title: "Success",
                description: response.message || "Personal info saved successfully",
            });
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error Saving Personal Info",
                description: error instanceof ApiError ? error.message : "Something went wrong, please try again",
            });
        },
    });

    const handleSubmit = () => {
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

        const payload = {
            ...formData,
            father_name: formData.father_name.trim(),
            mother_name: formData.mother_name.trim(),
            guardian_name: formData.guardian_name.trim(),
            father_occupation: formData.father_occupation.trim(),
            mother_occupation: formData.mother_occupation.trim(),
            caste: formData.caste.trim(),
            category: formData.category.trim(),
            nationality: formData.nationality.trim(),
            permanent_address: formData.permanent_address.trim(),
            permanent_city: formData.permanent_city.trim(),
            permanent_district: formData.permanent_district.trim(),
            permanent_state: formData.permanent_state.trim(),
            current_address: formData.current_address.trim(),
            current_city: formData.current_city.trim(),
            current_district: formData.current_district.trim(),
            current_state: formData.current_state.trim(),
            father_annual_income: Number(formData.father_annual_income),
            mother_annual_income: Number(formData.mother_annual_income),
        };

        saveMutation.mutate(payload);
    };

    return {
        formData,
        errors,
        loading: saveMutation.isPending,
        fetching,
        isDirty,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
    };
};
