import { useState, useEffect } from "react";
import { useCollegeProfile } from "./useCollegeProfile";
import { showToast } from "@/utils/ToastUtils";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import { collegeSchemaUpdate } from "@/validators/CollegeSchemaUpdate";

interface EditCollegeForm {
  college_id: string;
  college_name: string;
  college_subdomain: string;
  college_type: string;
  college_address: string;
  college_city: string;
  college_taluka: string;
  college_district: string;
  college_state: string;
  college_pincode: string;
  college_status: string;
}

type FormErrors = Partial<Record<keyof EditCollegeForm, string>>;

export const useEditCollege = () => {
  const { college, loading } = useCollegeProfile();

  const [formData, setFormData] = useState<EditCollegeForm>({
    college_id: "",
    college_name: "",
    college_subdomain: "",
    college_type: "",
    college_address: "",
    college_city: "",
    college_taluka: "",
    college_district: "",
    college_state: "",
    college_pincode: "",
    college_status: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (college) {
      setFormData({
        college_id: college.college_id || "",
        college_name: college.college_name || "",
        college_subdomain: college.college_subdomain || "",
        college_type: college.college_type || "",
        college_address: college.college_address || "",
        college_city: college.college_city || "",
        college_taluka: college.college_taluka || "",
        college_district: college.college_district || "",
        college_state: college.college_state || "",
        college_pincode: college.college_pincode || "",
        college_status: college.college_status || "active",
      });
    }
  }, [college]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name as keyof EditCollegeForm]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleUpdate = async () => {
    const id = formData.college_id;
    if (!id) return;

    
    const validationData = {
      college_name: formData.college_name,
      college_subdomain: formData.college_subdomain,
      college_type: formData.college_type,
      college_address: formData.college_address,
      college_city: formData.college_city,
      college_taluka: formData.college_taluka,
      college_district: formData.college_district,
      college_state: formData.college_state,
      college_pincode: formData.college_pincode,
    };

    const result = collegeSchemaUpdate.safeParse(validationData);

    if (!result.success) {
      
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof EditCollegeForm;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);

      
      const firstErrorMessage = result.error.issues[0].message;
      showToast({
        type: "warning",
        title: "Validation Failed",
        description: firstErrorMessage,
      });
      return;
    }

    
    setErrors({});

    try {
      setUpdating(true);
      setError(null);

      const payload = {
        college_name: formData.college_name,
        college_subdomain: formData.college_subdomain,
        college_type: formData.college_type,
        college_address: formData.college_address,
        college_city: formData.college_city,
        college_taluka: formData.college_taluka,
        college_district: formData.college_district,
        college_state: formData.college_state,
        college_pincode: formData.college_pincode,
        college_status: formData.college_status,
      };

      const res = await SysAdminService.updateCollege(id, payload);

      if (res?.success) {
        showToast({
          type: "success",
          title: "Updated College Successfully",
          description: res.data.message,
        });
      }

      return res;
    } catch (err) {
      setError("Failed to update college");
    } finally {
      setUpdating(false);
    }
  };

  return {
    loading,
    updating,
    error,
    errors,
    formData,
    handleChange,
    handleUpdate,
  };
};