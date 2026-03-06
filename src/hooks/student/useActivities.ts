import { useState, useEffect, useCallback } from "react";
import { showToast } from "@/utils/ToastUtils";
import { StudentActivityService } from "@/services/student/activity.service";
import type { ActivityData } from "@/services/student/activity.service";
import { activitySchema } from "@/validators/student/activitySchema";

const emptyForm = {
    activity_name: "",
    activity_description: "",
    activity_type: "",
    organizing_body: "",
    role_position: "",
    start_date: "",
    end_date: "",
    is_ongoing: false,
    hours_contributed: "",
    certificate_url: "",
    proof_urls: [] as string[],
};

type FormErrors = Partial<Record<string, string>>;

export const VALID_ACTIVITY_TYPES = [
    "sports", "cultural", "technical", "social", "volunteer", "arts", "nss", "ncc",
] as const;

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
    sports: "Sports",
    cultural: "Cultural",
    technical: "Technical",
    social: "Social",
    volunteer: "Volunteer",
    arts: "Arts",
    nss: "NSS",
    ncc: "NCC",
};

export const useActivities = () => {
    const [activities, setActivities] = useState<ActivityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    const [proofInput, setProofInput] = useState("");

    const maxActivities = 10;

    const fetchData = useCallback(async () => {
        try {
            const response = await StudentActivityService.getAllActivities();
            setActivities(response.data?.activities || response.activities || []);
        } catch {
            console.log("Error loading activities");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openAddForm = () => {
        setEditingId(null);
        setFormData({ ...emptyForm, proof_urls: [] });
        setErrors({});
        setProofInput("");
        setIsFormOpen(true);
    };

    const openEditForm = (act: ActivityData) => {
        setEditingId(act.activity_id || null);
        setFormData({
            activity_name: act.activity_name || "",
            activity_description: act.activity_description || "",
            activity_type: act.activity_type || "",
            organizing_body: act.organizing_body || "",
            role_position: act.role_position || "",
            start_date: act.start_date ? act.start_date.substring(0, 10) : "",
            end_date: act.end_date ? act.end_date.substring(0, 10) : "",
            is_ongoing: act.is_ongoing || false,
            hours_contributed: act.hours_contributed ? String(act.hours_contributed) : "",
            certificate_url: act.certificate_url || "",
            proof_urls: act.proof_urls || [],
        });
        setErrors({});
        setProofInput("");
        setIsFormOpen(true);
    };

    const closeForm = () => { setIsFormOpen(false); setEditingId(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const addProofUrl = () => {
        const u = proofInput.trim();
        if (u && !formData.proof_urls.includes(u) && formData.proof_urls.length < 5) {
            setFormData((prev) => ({ ...prev, proof_urls: [...prev.proof_urls, u] }));
            setProofInput("");
        }
    };
    const removeProofUrl = (url: string) => {
        setFormData((prev) => ({ ...prev, proof_urls: prev.proof_urls.filter((u) => u !== url) }));
    };

    const handleSubmit = async () => {
        const result = activitySchema.safeParse(formData);
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
                activity_name: formData.activity_name,
                activity_description: formData.activity_description || null,
                activity_type: formData.activity_type || null,
                organizing_body: formData.organizing_body || null,
                role_position: formData.role_position || null,
                start_date: formData.start_date || null,
                end_date: formData.is_ongoing ? null : formData.end_date || null,
                is_ongoing: formData.is_ongoing,
                hours_contributed: formData.hours_contributed ? Number(formData.hours_contributed) : undefined,
                certificate_url: formData.certificate_url || null,
                proof_urls: formData.proof_urls,
            };

            if (editingId) {
                await StudentActivityService.updateActivity(editingId, payload);
                showToast({ type: "success", title: "Updated", description: "Activity updated successfully" });
            } else {
                await StudentActivityService.addActivity(payload);
                showToast({ type: "success", title: "Added", description: "Activity added successfully" });
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
            await StudentActivityService.deleteActivity(id);
            setActivities((prev) => prev.filter((a) => a.activity_id !== id));
            showToast({ type: "success", title: "Deleted", description: "Activity removed" });
        } catch (error: any) {
            showToast({ type: "error", title: "Error", description: error.message || "Failed to delete" });
        } finally {
            setDeleting(null);
        }
    };

    return {
        activities, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        proofInput, setProofInput,
        maxActivities, openAddForm, openEditForm, closeForm,
        handleChange, addProofUrl, removeProofUrl, handleSubmit, handleDelete,
    };
};
