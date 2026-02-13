import { useState, useEffect } from "react";
import { useCollegeProfile } from "./useCollegeProfile";
import { showToast } from "@/utils/ToastUtils";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";


export const useEditCollege = () => {
  const { college, loading } = useCollegeProfile();

  const [formData, setFormData] = useState({
    college_id: "",
    college_name: "",
    college_subdomain: "",
    college_status: "",
  });

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync formData with college data when loaded
  useEffect(() => {
    if (college) {
      setFormData({
        college_id: college.college_id || "",
        college_name: college.college_name || "",
        college_subdomain: college.college_subdomain || college.subdomain || "",
        college_status: college.college_status || "active",
      });
    }
  }, [college]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      college_status: prev.college_status === "active" ? "inactive" : "active",
    }));
  };

  const handleUpdate = async () => {
    const id = formData.college_id;

    if (!id) {
      console.error("Cannot update: Missing College ID");
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const res = await SysAdminService.updateCollege(id, formData);

      if (res?.success) {
        showToast({
          type: 'success',
          title: 'Updated College Successfully',
          description: res.data.message,
        });
      }
      return res;

    } catch (err: any) {
      console.error(err);
      setError("Failed to update college");

    } finally {
      setUpdating(false);
    }
  };

  return {
    college,
    loading,
    updating,
    error,
    formData,
    handleChange,
    handleStatusToggle,
    handleUpdate,
  };
};