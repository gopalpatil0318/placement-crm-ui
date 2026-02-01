// hooks/useCreateCollege.ts
import { useState } from "react";
import api from "../lib/api"; // Adjust path if your api file is elsewhere
import { showToast } from "@/utils/ToastUtils"; // Adjust path to your ToastUtils
import { collegeSchema } from "@/validators/collegeSchema";

interface CreateCollegeForm {
  collegeName: string;
  collegeSubdomain: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

type FormErrors = Partial<CreateCollegeForm>;

export const useCreateCollege = () => {
  const [formData, setFormData] = useState<CreateCollegeForm>({
    collegeName: "",
    collegeSubdomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // 1. ZOD VALIDATION
    const result = collegeSchema.safeParse(formData);

    if (!result.success) {
      // Show the first validation error as a toast warning
      const firstErrorMessage = result.error.issues[0].message;
      
      showToast({
        type: 'warning',
        title: 'Validation Failed',
        description: firstErrorMessage,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 2. API CALL
      // Using 'api' instance. Note: '/api' is already in baseURL, so we just use the endpoint.
      const response = await api.post("/sysadmin/create-college", {
        college_name: formData.collegeName,
        college_subdomain: formData.collegeSubdomain,
        admin_name: formData.adminName,
        admin_email: formData.adminEmail,
        admin_password: formData.adminPassword,
      });

      // 3. SUCCESS TOAST
      // Use the message from the backend response if available
      const successMessage = response.data?.message || "College created successfully";

      showToast({
        type: 'success',
        title: 'Success',
        description: successMessage,
      });

      // Reset Form
      setFormData({
        collegeName: "",
        collegeSubdomain: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });

    } catch (error: any) {
      // 4. ERROR TOAST
      // Your api interceptor already extracts the message into 'error.message'
      showToast({
        type: 'error',
        title: 'Error Creating College',
        description: error.message || "Something went wrong, please try again",
      });
      
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    setErrors,
    handleChange,
    handleSubmit,
  };
};