import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { showToast } from "@/utils/ToastUtils";

export const useViewUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/college/users");

      // Backend response: response.data.data
      const apiData = response?.data?.data;

      setUsers(Array.isArray(apiData?.users) ? apiData.users : []);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch users";

      setError(errorMessage);

      showToast({
        type: "error",
        title: "Fetch Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
  };
};
