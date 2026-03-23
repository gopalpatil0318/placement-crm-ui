import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { StudentCertificateService } from "@/services/student/certificate.service";
import type { CertificateData } from "@/services/student/certificate.service";
import { certificateSchema } from "@/validators/student/certificateSchema";

const emptyForm = {
    certificate_name: "",
    issuing_organization: "",
    certificate_description: "",
    certificate_type: "",
    issuing_platform: "",
    credential_id: "",
    credential_url: "",
    issue_date: "",
    expiry_date: "",
    does_not_expire: true,
    skills_covered: [] as string[],
    certificate_url: "",
};

type FormErrors = Partial<Record<string, string>>;

export const VALID_CERTIFICATE_TYPES = [
    "course", "training", "workshop", "seminar", "certification", "bootcamp",
] as const;

export const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
    course: "Course",
    training: "Training",
    workshop: "Workshop",
    seminar: "Seminar",
    certification: "Certification",
    bootcamp: "Bootcamp",
};

export const useCertificates = () => {
    const queryClient = useQueryClient();

    const { data: certificates = [], isLoading: loading } = useQuery({
        queryKey: queryKeys.studentPortal.certificates(),
        queryFn: async () => {
            const response = await StudentCertificateService.getAllCertificates();
            return (response.data?.certificates || response.certificates || []) as CertificateData[];
        },
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    const [skillInput, setSkillInput] = useState("");

    const maxCertificates = 15;

    const openAddForm = () => {
        setEditingId(null);
        setFormData({ ...emptyForm, skills_covered: [] });
        setErrors({});
        setSkillInput("");
        setIsFormOpen(true);
    };

    const openEditForm = (cert: CertificateData) => {
        setEditingId(cert.certificate_id || null);
        setFormData({
            certificate_name: cert.certificate_name || "",
            issuing_organization: cert.issuing_organization || "",
            certificate_description: cert.certificate_description || "",
            certificate_type: cert.certificate_type || "",
            issuing_platform: cert.issuing_platform || "",
            credential_id: cert.credential_id || "",
            credential_url: cert.credential_url || "",
            issue_date: cert.issue_date ? cert.issue_date.substring(0, 10) : "",
            expiry_date: cert.expiry_date ? cert.expiry_date.substring(0, 10) : "",
            does_not_expire: cert.does_not_expire ?? true,
            skills_covered: cert.skills_covered || [],
            certificate_url: cert.certificate_url || "",
        });
        setErrors({});
        setSkillInput("");
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

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !formData.skills_covered.includes(s) && formData.skills_covered.length < 20) {
            setFormData((prev) => ({ ...prev, skills_covered: [...prev.skills_covered, s] }));
            setSkillInput("");
        }
    };
    const removeSkill = (skill: string) => {
        setFormData((prev) => ({ ...prev, skills_covered: prev.skills_covered.filter((s) => s !== skill) }));
    };

    const saveMutation = useMutation({
        mutationFn: (payload: Omit<CertificateData, "certificate_id">) => {
            if (editingId) return StudentCertificateService.updateCertificate(editingId, payload);
            return StudentCertificateService.addCertificate(payload);
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
        const result = certificateSchema.safeParse(formData);
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
            certificate_name: formData.certificate_name,
            issuing_organization: formData.issuing_organization,
            certificate_description: formData.certificate_description || null,
            certificate_type: formData.certificate_type || null,
            issuing_platform: formData.issuing_platform || null,
            credential_id: formData.credential_id || null,
            credential_url: formData.credential_url || null,
            issue_date: formData.issue_date || null,
            expiry_date: formData.does_not_expire ? null : formData.expiry_date || null,
            does_not_expire: formData.does_not_expire,
            skills_covered: formData.skills_covered,
            certificate_url: formData.certificate_url || null,
        };

        const isEditing = !!editingId;
        saveMutation.mutate(payload, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.certificates() });
                queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
                closeForm();
                showToast({
                    type: "success",
                    title: isEditing ? "Updated" : "Added",
                    description: isEditing ? "Certificate updated successfully" : "Certificate added successfully",
                });
            },
        });
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => StudentCertificateService.deleteCertificate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.certificates() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
            showToast({ type: "success", title: "Deleted", description: "Certificate removed" });
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
        certificates, loading, saving: saveMutation.isPending,
        deleting: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
        isFormOpen, editingId, formData, errors,
        skillInput, setSkillInput,
        maxCertificates, openAddForm, openEditForm, closeForm,
        handleChange, addSkill, removeSkill, handleSubmit, handleDelete,
    };
};
