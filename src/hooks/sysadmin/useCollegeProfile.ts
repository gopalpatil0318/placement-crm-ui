import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import { showToast } from "@/utils/ToastUtils";

interface CollegeData {
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
  enabled_features: string[];
  default_academic_year: number;
  admin_name: string;
  admin_email: string;
  created_at: string;
  updated_at: string;
}

export const useCollegeProfile = () => {
  const { collegeId } = useParams<{ collegeId: string }>();
  const [college, setCollege] = useState<CollegeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!collegeId) return;

    const fetchCollege = async () => {
      try {
        setLoading(true);
        const data = await SysAdminService.getCollegeProfile(collegeId);
        setCollege(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch college";
        showToast({
          type: "error",
          title: "Fetch Error",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCollege();
  }, [collegeId]);

  const requestStatusToggle = () => {
    if (!college?.college_id) return;
    setShowConfirmDialog(true);
  };

  const cancelStatusToggle = () => {
    setShowConfirmDialog(false);
  };

  const confirmStatusToggle = async () => {
    if (!college?.college_id) return;

    const newStatus = college.college_status === "active" ? "inactive" : "active";

    try {
      setToggling(true);
      setShowConfirmDialog(false);
      const res = await SysAdminService.toggleCollegeStatus(college.college_id, newStatus);

      if (res?.success) {
        setCollege((prev) =>
          prev ? { ...prev, college_status: newStatus } : prev
        );
        showToast({
          type: "success",
          title: "Status Updated",
          description: res.message || `College is now ${newStatus}`,
        });
      }
    } catch (err: unknown) {
      showToast({
        type: "error",
        title: "Failed to update status",
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setToggling(false);
    }
  };

  const updateFeatures = async (features: string[]) => {
    if (!college?.college_id) return;

    try {
      const res = await SysAdminService.updateCollegeFeatures(college.college_id, features);
      if (res?.success) {
        setCollege((prev) =>
          prev ? { ...prev, enabled_features: features } : prev
        );
        showToast({
          type: "success",
          title: "Features Updated",
          description: res.message || "College features updated successfully",
        });
      }
    } catch (err: unknown) {
      showToast({
        type: "error",
        title: "Failed to update features",
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
      throw err;
    }
  };

  const updateAcademicYear = async (year: number) => {
    if (!college?.college_id) return;

    try {
      const res = await SysAdminService.updateAcademicYear(college.college_id, year);
      if (res?.success) {
        setCollege((prev) =>
          prev ? { ...prev, default_academic_year: year } : prev
        );
        showToast({
          type: "success",
          title: "Academic Year Updated",
          description: res.message || "Academic year updated successfully",
        });
      }
    } catch (err: unknown) {
      showToast({
        type: "error",
        title: "Failed to update academic year",
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
      throw err;
    }
  };

  return {
    college,
    loading,
    toggling,
    showConfirmDialog,
    requestStatusToggle,
    confirmStatusToggle,
    cancelStatusToggle,
    updateFeatures,
    updateAcademicYear,
  };
};
