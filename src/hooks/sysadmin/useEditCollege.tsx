import { useState, useEffect, useRef } from "react";
import { useCollegeProfile } from "./useCollegeProfile";
import { showToast } from "@/utils/ToastUtils";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import { useNavigate } from "react-router-dom";

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

  // Store original data to compare changes
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Auto-lowercase subdomain
    if (name === "college_subdomain") {
      const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof EditCollegeForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const getChangedFields = (): Partial<EditCollegeForm> => {
    if (!originalData.current) return formData;

    const changes: Partial<EditCollegeForm> = {};
    for (const key of Object.keys(formData) as (keyof EditCollegeForm)[]) {
      if (formData[key] !== originalData.current[key]) {
        changes[key] = formData[key];
      }
    }
    return changes;
  };

  const handleUpdate = async () => {
    const id = college?.college_id;
    if (!id) return;

    const changedFields = getChangedFields();

    if (Object.keys(changedFields).length === 0) {
      showToast({
        type: "info",
        title: "No Changes",
        description: "No changes were made to update.",
      });
      return;
    }

    // Basic validation on changed fields
    if (changedFields.college_name !== undefined && changedFields.college_name.length < 2) {
      setErrors({ college_name: "College name must be at least 2 characters" });
      return;
    }
    if (changedFields.college_subdomain !== undefined && changedFields.college_subdomain.length < 2) {
      setErrors({ college_subdomain: "Subdomain must be at least 2 characters" });
      return;
    }
    if (changedFields.college_pincode && !/^(\d{6})?$/.test(changedFields.college_pincode)) {
      setErrors({ college_pincode: "Pincode must be exactly 6 digits" });
      return;
    }

    setErrors({});

    try {
      setUpdating(true);
      setError(null);

      const res = await SysAdminService.updateCollege(id, changedFields);

      if (res?.success) {
        showToast({
          type: "success",
          title: "College Updated",
          description: res.message || "College updated successfully",
        });
        navigate(`/sysadmin/colleges/${id}`);
      }

      return res;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update college";
      setError(msg);
      showToast({
        type: "error",
        title: "Update Failed",
        description: msg,
      });
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges = (): boolean => {
    return Object.keys(getChangedFields()).length > 0;
  };

  return {
    loading,
    updating,
    error,
    errors,
    formData,
    handleChange,
    handleUpdate,
    hasChanges,
    collegeId: college?.college_id,
  };
};