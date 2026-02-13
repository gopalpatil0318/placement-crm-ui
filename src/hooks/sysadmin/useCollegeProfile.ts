import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import { showToast } from "@/utils/ToastUtils";


export const useCollegeProfile = () => {
  const { collegeId } = useParams<{ collegeId: string }>();
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collegeId) return;

    const fetchCollege = async () => {
      try {
        setLoading(true);
        const data = await SysAdminService.getCollegeProfile(collegeId);
        setCollege(data);
      }
      catch (error: any) {
        const errorMessage = error.message || "Failed to fetch colleges";
        setError(errorMessage);
        showToast({
          type: 'error',
          title: 'Fetch Error',
          description: errorMessage,
        });
      }
      finally {
        setLoading(false);
      }
    };

    fetchCollege();
  }, [collegeId]);

  return { college, loading };
};

