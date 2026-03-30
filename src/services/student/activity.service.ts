import api from "@/lib/api";

export interface ActivityData {
    activity_id?: string;
    activity_name: string;
    activity_description?: string | null;
    activity_type?: string | null;
    organizing_body?: string | null;
    role_position?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    is_ongoing?: boolean;
    hours_contributed?: number | null;
    certificate_url?: string | null;
    proof_urls?: string[];
    created_at?: string | null;
    updated_at?: string | null;
}

export const StudentActivityService = {
    getAllActivities: async () => {
        const response = await api.get("/student/get_all_activities");
        return response.data;
    },

    addActivity: async (data: Omit<ActivityData, "activity_id">) => {
        const response = await api.post("/student/add_activity", data);
        return response.data;
    },

    updateActivity: async (activityId: string, data: Partial<ActivityData>) => {
        const response = await api.put(`/student/update_activity/${activityId}`, data);
        return response.data;
    },

    deleteActivity: async (activityId: string) => {
        const response = await api.delete(`/student/delete_activity/${activityId}`);
        return response.data;
    },
};
