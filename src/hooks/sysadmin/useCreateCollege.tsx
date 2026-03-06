import { useState } from "react";
import { showToast } from "@/utils/ToastUtils";
import { collegeSchema } from "@/validators/collegeSchema";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

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

const initialFormState: CreateCollegeForm = {
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

function getPasswordStrength(password: string): "weak" | "medium" | "strong" | "" {
  if (!password) return "";
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLong = password.length >= 12;

  const score = [hasUpper, hasLower, hasNumber, hasSpecial, isLong].filter(Boolean).length;
  if (score >= 4) return "strong";
  if (score >= 2 && password.length >= 8) return "medium";
  return "weak";
}

export const useCreateCollege = () => {
  const [formData, setFormData] = useState<CreateCollegeForm>({ ...initialFormState });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(formData.adminPassword);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Auto-lowercase subdomain and strip invalid chars
    if (name === "collegeSubdomain") {
      const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const result = collegeSchema.safeParse(formData);

    if (!result.success) {
      const firstErrorMessage = result.error.issues[0].message;
      showToast({
        type: "warning",
        title: "Validation Failed",
        description: firstErrorMessage,
      });
      return;
    }

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

      setFormData({ ...initialFormState });
      navigate("/sysadmin/colleges");
    } catch (error: unknown) {
      // Handle 429 rate limit
      if (isAxiosError(error) && error.response?.status === 429) {
        showToast({
          type: "error",
          title: "Too Many Requests",
          description: "Too many attempts. Please try again in 15 minutes.",
        });
        return;
      }

      const backendMessage = isAxiosError(error)
        ? error.response?.data?.message ?? error.message
        : error instanceof Error
          ? error.message
          : "Something went wrong, please try again";

      showToast({
        type: "error",
        title: "Error Creating College",
        description: backendMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleChange,
    handleSubmit,
    showPassword,
    togglePassword: () => setShowPassword((prev) => !prev),
    passwordStrength,
  };
};