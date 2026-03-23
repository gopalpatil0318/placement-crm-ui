import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
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
    const queryClient = useQueryClient();

    const { data: achievements = [], isLoading: loading } = useQuery({
        queryKey: queryKeys.studentPortal.achievements(),
        queryFn: async () => {
            const response = await StudentAchievementService.getAllAchievements();
            return (response.data?.achievements || response.achievements || []) as AchievementData[];
        },
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    const maxAchievements = 10;

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

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            return { ...prev, [name]: undefined };
        });
    }, []);

    const saveMutation = useMutation({
        mutationFn: (payload: Omit<AchievementData, "achievement_id">) => {
            if (editingId) return StudentAchievementService.updateAchievement(editingId, payload);
            return StudentAchievementService.addAchievement(payload);
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

        const payload = {
            achievement_title: formData.achievement_title.trim(),
            achievement_description: formData.achievement_description.trim() || null,
            achievement_type: formData.achievement_type || null,
            issuing_organization: formData.issuing_organization.trim() || null,
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

        const isEditing = !!editingId;
        saveMutation.mutate(payload, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.achievements() });
                queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
                closeForm();
                showToast({
                    type: "success",
                    title: isEditing ? "Updated" : "Added",
                    description: isEditing ? "Achievement updated successfully" : "Achievement added successfully",
                });
            },
        });
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => StudentAchievementService.deleteAchievement(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.achievements() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
            showToast({ type: "success", title: "Deleted", description: "Achievement removed" });
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
        achievements, loading, saving: saveMutation.isPending,
        deleting: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
        isFormOpen, editingId, formData, errors,
        maxAchievements, openAddForm, openEditForm, closeForm,
        handleChange, handleSubmit, handleDelete,
    };
};
