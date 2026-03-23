import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { StudentExperienceService } from "@/services/student/experience.service";
import type { ExperienceData } from "@/services/student/experience.service";
import { experienceSchema } from "@/validators/student/experienceSchema";

const emptyForm = {
    company_name: "",
    company_website: "",
    position_title: "",
    employment_type: "",
    job_description: "",
    responsibilities: [] as string[],
    technologies_used: [] as string[],
    work_location: "",
    work_mode: "",
    start_date: "",
    end_date: "",
    is_current: false,
    duration_months: "",
    stipend_amount: "",
    offer_letter_url: "",
    completion_certificate_url: "",
};

type FormErrors = Partial<Record<string, string>>;

export const useExperience = () => {
    const queryClient = useQueryClient();

    const { data: experiences = [], isLoading: loading } = useQuery({
        queryKey: queryKeys.studentPortal.experience(),
        queryFn: async () => {
            const response = await StudentExperienceService.getAllExperience();
            return (response.data?.experience || response.experience || []) as ExperienceData[];
        },
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    const [techInput, setTechInput] = useState("");
    const [respInput, setRespInput] = useState("");

    const maxExperience = 10;

    const openAddForm = () => {
        setEditingId(null);
        setFormData({ ...emptyForm });
        setErrors({});
        setTechInput("");
        setRespInput("");
        setIsFormOpen(true);
    };

    const openEditForm = (exp: ExperienceData) => {
        setEditingId(exp.experience_id || null);
        setFormData({
            company_name: exp.company_name || "",
            company_website: exp.company_website || "",
            position_title: exp.position_title || "",
            employment_type: exp.employment_type || "",
            job_description: exp.job_description || "",
            responsibilities: exp.responsibilities || [],
            technologies_used: exp.technologies_used || [],
            work_location: exp.work_location || "",
            work_mode: exp.work_mode || "",
            start_date: exp.start_date ? exp.start_date.substring(0, 10) : "",
            end_date: exp.end_date ? exp.end_date.substring(0, 10) : "",
            is_current: exp.is_current || false,
            duration_months: exp.duration_months ? String(exp.duration_months) : "",
            stipend_amount: exp.stipend_amount ? String(exp.stipend_amount) : "",
            offer_letter_url: exp.offer_letter_url || "",
            completion_certificate_url: exp.completion_certificate_url || "",
        });
        setErrors({});
        setTechInput("");
        setRespInput("");
        setIsFormOpen(true);
    };

    const closeForm = () => { setIsFormOpen(false); setEditingId(null); };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            return { ...prev, [name]: undefined };
        });
    }, []);

    const addTech = () => {
        const t = techInput.trim();
        if (t && !formData.technologies_used.includes(t)) {
            setFormData((prev) => ({ ...prev, technologies_used: [...prev.technologies_used, t] }));
            setTechInput("");
        }
    };
    const removeTech = (tech: string) => {
        setFormData((prev) => ({ ...prev, technologies_used: prev.technologies_used.filter((t) => t !== tech) }));
    };

    const addResp = () => {
        const r = respInput.trim();
        if (r) {
            setFormData((prev) => ({ ...prev, responsibilities: [...prev.responsibilities, r] }));
            setRespInput("");
        }
    };
    const removeResp = (resp: string) => {
        setFormData((prev) => ({ ...prev, responsibilities: prev.responsibilities.filter((r) => r !== resp) }));
    };

    const saveMutation = useMutation({
        mutationFn: (payload: Omit<ExperienceData, "experience_id">) => {
            if (editingId) return StudentExperienceService.updateExperience(editingId, payload);
            return StudentExperienceService.addExperience(payload);
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error",
                description: error instanceof ApiError ? error.message : "Something went wrong",
            });
        },
    });

    const handleSubmit = () => {
        const result = experienceSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            });
            setErrors(fieldErrors);
            showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
            return;
        }

        const payload = {
            company_name: formData.company_name,
            company_website: formData.company_website || null,
            position_title: formData.position_title,
            employment_type: formData.employment_type,
            job_description: formData.job_description,
            responsibilities: formData.responsibilities,
            technologies_used: formData.technologies_used,
            work_location: formData.work_location,
            work_mode: formData.work_mode,
            start_date: formData.start_date,
            end_date: formData.is_current ? null : formData.end_date || null,
            is_current: formData.is_current,
            duration_months: formData.duration_months ? Number(formData.duration_months) : undefined,
            stipend_amount: formData.stipend_amount ? Number(formData.stipend_amount) : undefined,
            offer_letter_url: formData.offer_letter_url || null,
            completion_certificate_url: formData.completion_certificate_url || null,
        };

        const isEditing = !!editingId;
        saveMutation.mutate(payload as Omit<ExperienceData, "experience_id">, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.experience() });
                queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
                closeForm();
                showToast({
                    type: "success",
                    title: isEditing ? "Updated" : "Added",
                    description: isEditing ? "Experience updated successfully" : "Experience added successfully",
                });
            },
        });
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => StudentExperienceService.deleteExperience(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.experience() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
            showToast({ type: "success", title: "Deleted", description: "Experience removed" });
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error",
                description: error instanceof ApiError ? error.message : "Failed to delete",
            });
        },
    });

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    return {
        experiences, loading, saving: saveMutation.isPending,
        deleting: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
        isFormOpen, editingId, formData, errors,
        techInput, setTechInput, respInput, setRespInput,
        maxExperience, openAddForm, openEditForm, closeForm,
        handleChange, addTech, removeTech, addResp, removeResp,
        handleSubmit, handleDelete,
    };
};
