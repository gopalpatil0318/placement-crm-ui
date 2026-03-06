import { useState } from "react";
import { showToast } from "@/utils/ToastUtils";
import { collegeSchema } from "@/validators/collegeSchema";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import { useNavigate } from "react-router-dom";

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

export const useCreateCollege = () => {
  const [formData, setFormData] = useState<CreateCollegeForm>({
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
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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

    setErrors({});
    setLoading(true);

    try {
      const response = await SysAdminService.createCollege({
        ...formData,
        defaultAcademicYear: Number(formData.defaultAcademicYear),
      });

      const successMessage =
        response?.message || "College created successfully";

      showToast({
        type: "success",
        title: "Success",
        description: successMessage,
      });

      setFormData({
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
      });

      navigate("/sysadmin/view-colleges");
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error Creating College",
        description:
          error.message || "Something went wrong, please try again",
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
    showPassword,
    togglePassword: () => setShowPassword((prev) => !prev),
  };
};