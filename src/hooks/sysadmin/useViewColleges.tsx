import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
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
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SysAdminService.getCollegesData();
      setColleges(data || []);      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch colleges";
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
    fetchColleges();
  }, [fetchColleges]);

  const filteredData = useMemo(() => {
    return colleges.filter(
      (college) =>
        college.college_name.toLowerCase().includes(search.toLowerCase()) ||
        college.college_subdomain.toLowerCase().includes(search.toLowerCase())
    );
  }, [colleges, search]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(0, entriesPerPage);
  }, [filteredData, entriesPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEntriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntriesPerPage(Number(e.target.value));
  };

  const handleNavigateToAddCollege = () => {
    navigate("/sysadmin/create-college");
  };

  const handleNavigateToViewCollege = (id: string) => {
    navigate(`/sysadmin/view-colleges/${id}`);
  };

  const handleNavigateToEditCollege = (id: string) => {
    navigate(`/sysadmin/edit-college/${id}`);
  };

  return {
    colleges,
    filteredData,
    paginatedData,
    loading,
    error,
    search,
    entriesPerPage,
    setSearch,
    setEntriesPerPage,
    handleSearchChange,
    handleEntriesChange,
    handleNavigateToAddCollege,
    handleNavigateToViewCollege,
    handleNavigateToEditCollege,
    refresh: fetchColleges,
  };
};