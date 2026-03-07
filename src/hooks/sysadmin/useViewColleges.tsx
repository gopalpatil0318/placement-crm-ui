import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SysAdminService } from "@/services/sysadmin/sysadmin.services";
import type { CollegeListParams } from "@/services/sysadmin/sysadmin.services";
import { showToast } from "@/utils/ToastUtils";

export interface College {
  college_id: string;
  college_name: string;
  college_subdomain: string;
  college_type: string;
  college_status: string;
  college_city: string;
  college_state: string;
  default_academic_year: number;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DEBOUNCE_MS = 300;

export const useViewColleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const navigate = useNavigate();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search]);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CollegeListParams = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await SysAdminService.getCollegesData(params);
      setColleges(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch colleges";
      setError(errorMessage);
      showToast({
        type: "error",
        title: "Fetch Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleNavigateToAddCollege = useCallback(() => {
    navigate("/sysadmin/colleges/create");
  }, [navigate]);

  const handleNavigateToViewCollege = useCallback((id: string) => {
    navigate(`/sysadmin/colleges/${id}`);
  }, [navigate]);

  const handleNavigateToEditCollege = useCallback((id: string) => {
    navigate(`/sysadmin/colleges/${id}/edit`);
  }, [navigate]);

  return {
    colleges,
    loading,
    error,
    search,
    page,
    limit,
    pagination,
    statusFilter,
    typeFilter,
    setSearch,
    setPage,
    handleSearchChange,
    handleLimitChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleNavigateToAddCollege,
    handleNavigateToViewCollege,
    handleNavigateToEditCollege,
    refresh: fetchColleges,
  };
};