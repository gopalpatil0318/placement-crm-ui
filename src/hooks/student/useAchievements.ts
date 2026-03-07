import { useState, useEffect, useCallback } from "react";
import { showToast } from "@/utils/ToastUtils";
import { StudentAchievementService } from "@/services/student/achievement.service";
import type { AchievementData } from "@/services/student/achievement.service";
import { achievementSchema } from "@/validators/student/achievementSchema";

const emptyForm = {
    achievement_title: "",
    achievement_description: "",
    achievement_type: "",
    issuing_organization: "",
    event_name: "",
    achievement_level: "",
    position_rank: "",
    participants_count: "",
    achievement_date: "",
    certificate_url: "",
    proof_url: "",
    is_featured: false,
    display_order: "",
};

type FormErrors = Partial<Record<string, string>>;

export const VALID_ACHIEVEMENT_TYPES = [
    "competition", "hackathon", "award", "certification", "publication", "research", "sports", "cultural",
] as const;

export const ACHIEVEMENT_TYPE_LABELS: Record<string, string> = {
    competition: "Competition",
    hackathon: "Hackathon",
    award: "Award",
    certification: "Certification",
    publication: "Publication",
    research: "Research",
    sports: "Sports",
    cultural: "Cultural",
};

export const VALID_ACHIEVEMENT_LEVELS = [
    "international", "national", "state", "university", "college", "departmental",
] as const;

export const ACHIEVEMENT_LEVEL_LABELS: Record<string, string> = {
    international: "International",
    national: "National",
    state: "State",
    university: "University",
    college: "College",
    departmental: "Departmental",
};

export const useAchievements = () => {
    const [achievements, setAchievements] = useState<AchievementData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    const maxAchievements = 10;

    const fetchData = useCallback(async () => {
        try {
            const response = await StudentAchievementService.getAllAchievements();
            setAchievements(response.data?.achievements || response.achievements || []);
        } catch {
            console.log("Error loading achievements");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openAddForm = () => {
        setEditingId(null);
        setFormData({ ...emptyForm });
        setErrors({});
        setIsFormOpen(true);
    };

    const openEditForm = (ach: AchievementData) => {
        setEditingId(ach.achievement_id || null);
        setFormData({
            achievement_title: ach.achievement_title || "",
            achievement_description: ach.achievement_description || "",
            achievement_type: ach.achievement_type || "",
            issuing_organization: ach.issuing_organization || "",
            event_name: ach.event_name || "",
            achievement_level: ach.achievement_level || "",
            position_rank: ach.position_rank || "",
            participants_count: ach.participants_count ? String(ach.participants_count) : "",
            achievement_date: ach.achievement_date ? ach.achievement_date.substring(0, 10) : "",
            certificate_url: ach.certificate_url || "",
            proof_url: ach.proof_url || "",
            is_featured: ach.is_featured || false,
            display_order: ach.display_order ? String(ach.display_order) : "",
        });
        setErrors({});
        setIsFormOpen(true);
    };

    const closeForm = () => { setIsFormOpen(false); setEditingId(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async () => {
        const result = achievementSchema.safeParse(formData);
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
                achievement_title: formData.achievement_title,
                achievement_description: formData.achievement_description || null,
                achievement_type: formData.achievement_type || null,
                issuing_organization: formData.issuing_organization || null,
                event_name: formData.event_name || null,
                achievement_level: formData.achievement_level || null,
                position_rank: formData.position_rank || null,
                participants_count: formData.participants_count ? Number(formData.participants_count) : undefined,
                achievement_date: formData.achievement_date || null,
                certificate_url: formData.certificate_url || null,
                proof_url: formData.proof_url || null,
                is_featured: formData.is_featured,
                display_order: formData.display_order ? Number(formData.display_order) : undefined,
            };

            if (editingId) {
                await StudentAchievementService.updateAchievement(editingId, payload);
                showToast({ type: "success", title: "Updated", description: "Achievement updated successfully" });
            } else {
                await StudentAchievementService.addAchievement(payload);
                showToast({ type: "success", title: "Added", description: "Achievement added successfully" });
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
            await StudentAchievementService.deleteAchievement(id);
            setAchievements((prev) => prev.filter((a) => a.achievement_id !== id));
            showToast({ type: "success", title: "Deleted", description: "Achievement removed" });
        } catch (error: any) {
            showToast({ type: "error", title: "Error", description: error.message || "Failed to delete" });
        } finally {
            setDeleting(null);
        }
    };

    return {
        achievements, loading, saving, deleting,
        isFormOpen, editingId, formData, errors,
        maxAchievements, openAddForm, openEditForm, closeForm,
        handleChange, handleSubmit, handleDelete,
    };
};
