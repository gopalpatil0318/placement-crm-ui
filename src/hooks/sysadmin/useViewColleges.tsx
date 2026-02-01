import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { showToast } from "@/utils/ToastUtils";

export interface College {
  college_id: string;
  college_name: string;
  college_subdomain: string;
  college_status: string;
  created_at: string;
}

export const useViewColleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/sysadmin/colleges");
      setColleges(response.data.data || []);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch colleges";
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Fetch Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  return {
    colleges,
    loading,
    error,
    refresh: fetchColleges,
  };
};