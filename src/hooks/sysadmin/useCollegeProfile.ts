import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../lib/api";

export const useCollegeProfile = () => {
  const { collegeId } = useParams<{ collegeId: string }>();
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collegeId) return;

    const fetchCollege = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sysadmin/colleges/${collegeId}`);
        setCollege(res.data.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollege();
  }, [collegeId]);

  return { college, loading };
};