import { useState, useEffect, useCallback } from "react";
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
    const [certificates, setCertificates] = useState<CertificateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    const [skillInput, setSkillInput] = useState("");

    const maxCertificates = 15;

    const fetchData = useCallback(async () => {
        try {
            const response = await StudentCertificateService.getAllCertificates();
            setCertificates(response.data?.certificates || response.certificates || []);
        } catch {
            console.log("Error loading certificates");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

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

    const handleSubmit = async () => {
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

        setSaving(true);
        try {
            const payload: any = {
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

            if (editingId) {
                await StudentCertificateService.updateCertificate(editingId, payload);
                showToast({ type: "success", title: "Updated", description: "Certificate updated successfully" });
            } else {
                await StudentCertificateService.addCertificate(payload);
                showToast({ type: "success", title: "Added", description: "Certificate added successfully" });
            }
            closeForm();
            fetchData();
        } catch (error: any) {
            showToast({ type: "error", title: "Error", description: error.message || "Something went wrong" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            await StudentCertificateService.deleteCertificate(id);
            setCertificates((prev) => prev.filter((c) => c.certificate_id !== id));
            showToast({ type: "success", title: "Deleted", description: "Certificate removed" });
        } catch (error: any) {
            showToast({ type: "error", title: "Error", description: error.message || "Failed to delete" });
        } finally {
            setDeleting(null);
        }
    };

    return {
        certificates, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        skillInput, setSkillInput,
        maxCertificates, openAddForm, openEditForm, closeForm,
        handleChange, addSkill, removeSkill, handleSubmit, handleDelete,
    };
};
