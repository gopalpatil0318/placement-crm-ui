import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import { showToast } from "@/utils/ToastUtils";

export const useCollegeProfile = () => {
  const { collegeId } = useParams<{ collegeId: string }>();
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collegeId) return;

    const fetchCollege = async () => {
      try {
        setLoading(true);
        const data = await SysAdminService.getCollegeProfile(collegeId);
        setCollege(data);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to fetch colleges";
        setError(errorMessage);
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

    const newStatus =
      college.college_status === "active" ? "inactive" : "active";

    try {
      setToggling(true);
      setShowConfirmDialog(false);
      const res = await SysAdminService.toggleCollegeStatus(
        college.college_id,
        newStatus
      );

      if (res?.success) {
        setCollege((prev: any) => ({
          ...prev,
          college_status: newStatus,
        }));

        showToast({
          type: "success",
          title: "Status Updated",
          description: res.data?.message || `College is now ${newStatus}`,
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Failed to update status",
        description: err.message || "Something went wrong",
      });
    } finally {
      setToggling(false);
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
  };
};
