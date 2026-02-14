import api from "@/lib/api";

export const CollegeAdminService = {
    createUser: async (data: {
        userName: string;
        userEmail: string;
        userPassword: string;
    }) => {
        const response = await api.post("/college/create-user", {
            user_name: data.userName,
            user_email: data.userEmail,
            user_password: data.userPassword,
        });
        return response.data;
    },

    getUser: async (id: string) => {
        const response = await api.get(`/college/user/${id}`);
        return response.data.data;
    },

    updateUser: async (id: string, data: {
        userName: string;
        userEmail: string;
    }) => {
        const response = await api.put(`/college/update-user/${id}`, {
            user_name: data.userName,
            user_email: data.userEmail,
        });
        return response.data;
    },

    getUsers: async () => {
        const response = await api.get("/college/users");
        return response.data.data;
    },
};
