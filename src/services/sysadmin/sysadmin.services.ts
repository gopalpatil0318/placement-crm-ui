import api from "../../lib/api";

export const SysAdminService = {
    getCollegesData: async () => {
        const response = await api.get("/sysadmin/colleges");
        return response.data.data;
    },

    createCollege: async (data: {
        collegeName: string;
        collegeSubdomain: string;
        adminName: string;
        adminEmail: string;
        adminPassword: string;
    }) => {
        const response = await api.post("/sysadmin/create-college", {
            college_name: data.collegeName,
            college_subdomain: data.collegeSubdomain,
            admin_name: data.adminName,
            admin_email: data.adminEmail,
            admin_password: data.adminPassword,
        });
        return response.data;
    },

    updateCollege: async (id: string, payload: any) => {
        const response = await api.put(`/sysadmin/update-college/${id}`, payload);
        return response.data;
    },

    getCollegeProfile: async (id: string) => {
        const response = await api.get(`/sysadmin/colleges/${id}`);
        return response.data.data;
    },

};
