import api from "../../lib/api";

export const SysAdminService = {
    getCollegesData: async () => {
        const response = await api.get("/sysadmin/get_all_colleges");
        return response.data.data;
    },


    createCollege: async (data: {
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
    }) => {
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

    updateCollege: async (id: string, payload: any) => {
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

};
