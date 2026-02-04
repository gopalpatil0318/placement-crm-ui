import { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { showToast } from "@/utils/ToastUtils";

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export const useViewUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
    
      const response = await api.get("/api/college/users"); 
      setUsers(response.data.data || []);
    } 
    catch (err: any) {
      const errorMessage = err.message || "Failed to fetch users";
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