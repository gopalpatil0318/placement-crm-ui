import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showToast } from "@/utils/ToastUtils";
import { collegeSchema } from "@/validators/collegeSchema";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";

interface CreateCollegeForm {
  collegeName: string;
  collegeSubdomain: string;
  collegeType: string;
  collegeAddress: string;
  collegeCity: string;
  collegeTaluka: string;
  collegeDistrict: string;
  collegeState: string;
  collegePincode: string;
  defaultAcademicYear: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

type FormErrors = Partial<CreateCollegeForm>;

const INITIAL_FORM: CreateCollegeForm = {
  collegeName: "",
  collegeSubdomain: "",
  collegeType: "",
  collegeAddress: "",
  collegeCity: "",
  collegeTaluka: "",
  collegeDistrict: "",
  collegeState: "",
  collegePincode: "",
  defaultAcademicYear: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
};

export const useCreateCollege = () => {
  const [formData, setFormData] = useState<CreateCollegeForm>({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Auto-lowercase subdomain and strip invalid characters
    if (name === "collegeSubdomain") {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear field error on change
    if (errors[name as keyof CreateCollegeForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const result = collegeSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof CreateCollegeForm;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);

      showToast({
        type: "warning",
        title: "Validation Failed",
        description: result.error.issues[0].message,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const payload = {
        ...formData,
        defaultAcademicYear: Number(formData.defaultAcademicYear),
      };

      const response = await SysAdminService.createCollege(payload);

      if (response?.success === false) {
        showToast({
          type: "error",
          title: "Error Creating College",
          description: response.error || response.message || "Something went wrong",
        });
        return;
      }

      showToast({
        type: "success",
        title: "Success",
        description: response?.message || "College created successfully",
      });

      setFormData({ ...INITIAL_FORM });
      navigate("/sysadmin/colleges");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const backendMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Something went wrong";

        if (status === 429) {
          showToast({
            type: "error",
            title: "Rate Limited",
            description: "Too many requests. Please try again in a few minutes.",
          });
        } else if (status === 409) {
          // Highlight conflicting field
          if (backendMessage.toLowerCase().includes("subdomain")) {
            setErrors((prev) => ({ ...prev, collegeSubdomain: backendMessage }));
          } else if (backendMessage.toLowerCase().includes("email")) {
            setErrors((prev) => ({ ...prev, adminEmail: backendMessage }));
          }
          showToast({
            type: "error",
            title: "Conflict",
            description: backendMessage,
          });
        } else {
          showToast({
            type: "error",
            title: "Error Creating College",
            description: backendMessage,
          });
        }
      } else {
        const message = error instanceof Error ? error.message : "Something went wrong";
        showToast({
          type: "error",
          title: "Error Creating College",
          description: message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/sysadmin/colleges");
  };

  return {
    formData,
    errors,
    loading,
    setErrors,
    handleChange,
    handleSubmit,
    handleCancel,
    showPassword,
    togglePassword: () => setShowPassword((prev) => !prev),
  };
};