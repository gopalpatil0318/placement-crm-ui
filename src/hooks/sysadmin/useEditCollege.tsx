import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCollegeProfile } from "./useCollegeProfile";
import { showToast } from "@/utils/ToastUtils";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import { collegeSchemaUpdate } from "@/validators/CollegeSchemaUpdate";

interface EditCollegeForm {
  college_name: string;
  college_subdomain: string;
  college_type: string;
  college_address: string;
  college_city: string;
  college_taluka: string;
  college_district: string;
  college_state: string;
  college_pincode: string;
}

type FormErrors = Partial<Record<keyof EditCollegeForm, string>>;

export const useEditCollege = () => {
  const { college, loading } = useCollegeProfile();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EditCollegeForm>({
    college_name: "",
    college_subdomain: "",
    college_type: "",
    college_address: "",
    college_city: "",
    college_taluka: "",
    college_district: "",
    college_state: "",
    college_pincode: "",
  });

  // Store original values to compare for partial updates
  const originalData = useRef<EditCollegeForm | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (college) {
      const data: EditCollegeForm = {
        college_name: college.college_name || "",
        college_subdomain: college.college_subdomain || "",
        college_type: college.college_type || "",
        college_address: college.college_address || "",
        college_city: college.college_city || "",
        college_taluka: college.college_taluka || "",
        college_district: college.college_district || "",
        college_state: college.college_state || "",
        college_pincode: college.college_pincode || "",
      };
      setFormData(data);
      originalData.current = { ...data };
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
    const collegeId = college?.college_id;
    if (!collegeId) return;

    const result = collegeSchemaUpdate.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof EditCollegeForm;
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

    // Only send changed fields
    const changedFields: Partial<EditCollegeForm> = {};
    if (originalData.current) {
      for (const key of Object.keys(formData) as (keyof EditCollegeForm)[]) {
        if (formData[key] !== originalData.current[key]) {
          changedFields[key] = formData[key];
        }
      }
    }

    if (Object.keys(changedFields).length === 0) {
      showToast({
        type: "info",
        title: "No Changes",
        description: "No fields have been modified.",
      });
      return;
    }

    setErrors({});

    try {
      setUpdating(true);
      setError(null);

      const res = await SysAdminService.updateCollege(collegeId, changedFields);

      if (res?.success) {
        showToast({
          type: "success",
          title: "Updated College Successfully",
          description: res.message || "College updated.",
        });
        navigate(`/sysadmin/colleges/${collegeId}`);
      }

      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update college";
      setError(message);
      showToast({
        type: "error",
        title: "Update Failed",
        description: message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    const collegeId = college?.college_id;
    if (collegeId) {
      navigate(`/sysadmin/colleges/${collegeId}`);
    } else {
      navigate("/sysadmin/colleges");
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
    handleCancel,
  };
};