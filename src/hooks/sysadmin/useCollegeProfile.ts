import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../lib/api";
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
        const res = await api.get(`/sysadmin/colleges/${collegeId}`);
        setCollege(res.data.data);
      } 
      catch (error : any) {
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

