import { useEffect, useState } from "react";
import api from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { userSchemaUpdate } from "@/validators/UserSchemaUpdate";

interface UpdateUserForm {
  userName: string;
  userEmail: string;
 
}

type FormErrors = Partial<UpdateUserForm>;

export const useUpdateUser = (userId: string) => {
  const [formData, setFormData] = useState<UpdateUserForm>({
    userName: "",
    userEmail: "",
  
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // ==============================
  // FETCH USER (PRELOAD DATA)
  // ==============================
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setFetching(true);
      try {
        const response = await api.get(`/college/user/${userId}`);

        const user = response.data?.data;

        setFormData({
          userName: user?.user_name || "",
          userEmail: user?.user_email || "",
          // usually keep password empty on edit
        });
      } catch (error: any) {
        showToast({
          type: "error",
          title: "Error",
          description: error.message || "Failed to fetch user data",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [userId]);

  // ==============================
  // HANDLE INPUT CHANGE
  // ==============================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==============================
  // HANDLE UPDATE SUBMIT
  // ==============================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // ZOD VALIDATION
    const result = userSchemaUpdate.safeParse(formData);

    if (!result.success) {
      const firstErrorMessage = result.error.issues[0].message;

      showToast({
        type: "warning",
        title: "Validation Failed",
        description: firstErrorMessage,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await api.put(
        `/college/update-user/${userId}`,
        {
          user_name: formData.userName,
          user_email: formData.userEmail,
          
        }
      );

      const successMessage =
        response.data?.message || "User updated successfully";

      showToast({
        type: "success",
        title: "Success",
        description: successMessage,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error Updating User",
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    fetching, // for preload spinner
    setErrors,
    handleChange,
    handleSubmit,
  };
};