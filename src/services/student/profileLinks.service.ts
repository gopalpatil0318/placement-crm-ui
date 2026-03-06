import api from "@/lib/api";

export interface ProfileLinksData {
    personal_portfolio_url?: string | null;
    resume_url?: string | null;
    profile_image_url?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
    leetcode_url?: string | null;
    codechef_url?: string | null;
    codeforces_url?: string | null;
    hackerrank_url?: string | null;
    geeksforgeeks_url?: string | null;
    medium_url?: string | null;
    bio?: string | null;
    area_of_interest?: string[];
}

export const StudentProfileLinksService = {
    getProfileLinks: async () => {
        const response = await api.get("/student/get_profile_links");
        return response.data;
    },

    saveProfileLinks: async (data: ProfileLinksData) => {
        const response = await api.put("/student/save_profile_links", data);
        return response.data;
    },
};
