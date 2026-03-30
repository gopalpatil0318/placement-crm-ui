import api from "@/lib/api";

export interface AchievementData {
    achievement_id?: string;
    achievement_title: string;
    achievement_description?: string | null;
    achievement_type?: string | null;
    issuing_organization?: string | null;
    event_name?: string | null;
    achievement_level?: string | null;
    position_rank?: string | null;
    participants_count?: number | null;
    achievement_date?: string | null;
    certificate_url?: string | null;
    proof_url?: string | null;
    is_featured?: boolean;
    is_verified?: boolean;
    verification_status?: string;
    verified_by?: string | null;
    verified_at?: string | null;
    rejection_reason?: string | null;
    rejected_at?: string | null;
    display_order?: number | null;
    created_at?: string;
    updated_at?: string;
}

export const StudentAchievementService = {
    getAllAchievements: async () => {
        const response = await api.get("/student/get_all_achievements");
        return response.data;
    },

    addAchievement: async (data: Omit<AchievementData, "achievement_id">) => {
        const response = await api.post("/student/add_achievement", data);
        return response.data;
    },

    updateAchievement: async (achievementId: string, data: Partial<AchievementData>) => {
        const response = await api.put(`/student/update_achievement/${achievementId}`, data);
        return response.data;
    },

    deleteAchievement: async (achievementId: string) => {
        const response = await api.delete(`/student/delete_achievement/${achievementId}`);
        return response.data;
    },
};
