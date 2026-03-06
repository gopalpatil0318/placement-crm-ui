import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  SysAdminService,
  type CollegeListParams,
} from "@/services/sysadmin/sysadmin.services";
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
  enabled_features: string[];
  created_at: string;
  updated_at: string;
}

export const useViewColleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const navigate = useNavigate();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchColleges = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    try {
      const params: CollegeListParams = { page, limit };
      const currentSearch = searchTerm !== undefined ? searchTerm : search;
      if (currentSearch) params.search = currentSearch;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await SysAdminService.getCollegesData(params);
      setColleges(response.data ?? []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch colleges";
      showToast({
        type: "error",
        title: "Fetch Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, typeFilter]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // Debounce 300ms
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchColleges(value);
    }, 300);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleNavigateToAddCollege = () => {
    navigate("/sysadmin/colleges/create");
  };

  const handleNavigateToViewCollege = (id: string) => {
    navigate(`/sysadmin/colleges/${id}`);
  };

  const handleNavigateToEditCollege = (id: string) => {
    navigate(`/sysadmin/colleges/${id}/edit`);
  };

  return {
    colleges,
    loading,
    search,
    statusFilter,
    typeFilter,
    page,
    limit,
    pagination,
    handleSearchChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleLimitChange,
    handlePageChange,
    handleNavigateToAddCollege,
    handleNavigateToViewCollege,
    handleNavigateToEditCollege,
    refresh: fetchColleges,
  };
};