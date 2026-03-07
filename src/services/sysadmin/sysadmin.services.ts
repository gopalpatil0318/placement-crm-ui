import api from "../../lib/api";

export interface CollegeListParams {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
}

interface CreateCollegePayload {
    collegeName: string;
    collegeSubdomain: string;
    collegeType: string;
    collegeAddress: string;
    collegeCity: string;
    collegeTaluka: string;
    collegeDistrict: string;
    collegeState: string;
    collegePincode: string;
    defaultAcademicYear: number;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
}

interface UpdateCollegePayload {
    college_name?: string;
    college_subdomain?: string;
    college_type?: string;
    college_address?: string;
    college_city?: string;
    college_taluka?: string;
    college_district?: string;
    college_state?: string;
    college_pincode?: string;
}

export const SysAdminService = {
    getCollegesData: async (params?: CollegeListParams) => {
        const response = await api.get("/sysadmin/get_all_colleges", { params });
        return response.data;
    },

    createCollege: async (data: CreateCollegePayload) => {
        const response = await api.post("/sysadmin/create_new_college", {
            college_name: data.collegeName,
            college_subdomain: data.collegeSubdomain,
            college_type: data.collegeType,
            college_address: data.collegeAddress,
            college_city: data.collegeCity,
            college_taluka: data.collegeTaluka,
            college_district: data.collegeDistrict,
            college_state: data.collegeState,
            college_pincode: data.collegePincode,
            default_academic_year: data.defaultAcademicYear,
            admin_name: data.adminName,
            admin_email: data.adminEmail,
            admin_password: data.adminPassword,
        });

        return response.data;
    },

    updateCollege: async (id: string, payload: UpdateCollegePayload) => {
        const response = await api.put(`/sysadmin/update_college/${id}`, payload);
        return response.data;
    },

    getCollegeProfile: async (id: string) => {
        const response = await api.get(`/sysadmin/get_college/${id}`);
        return response.data.data;
    },

    toggleCollegeStatus: async (id: string, status: "active" | "inactive") => {
        const response = await api.patch(
            `/sysadmin/toggle_college_status/${id}`,
            { college_status: status }
        );
        return response.data;
    },

    updateCollegeFeatures: async (id: string, features: string[]) => {
        const response = await api.patch(
            `/sysadmin/update_college_features/${id}`,
            { enabled_features: features }
        );
        return response.data;
    },

    updateAcademicYear: async (id: string, year: number) => {
        const response = await api.patch(
            `/sysadmin/update_academic_year/${id}`,
            { default_academic_year: year }
        );
        return response.data;
    },
};
