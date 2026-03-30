import { useState, useCallback, useRef, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface Skill {
    skill_id: string;
    skill_name: string;
    skill_category: string | null;
    student_count: number;
    created_at: string;
}

export interface SkillCategory {
    category: string;
    count: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ========================
// HOOK
// ========================

export const useViewSkills = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sortBy, setSortBy] = useState("skill_name");
    const [sortOrder, setSortOrder] = useState("asc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = useMemo(() => ({
        page,
        limit,
        search: debouncedSearch || undefined,
        skill_category: categoryFilter || undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    }), [page, limit, debouncedSearch, categoryFilter, sortBy, sortOrder]);

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.skills.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllSkills(queryFilters),
        placeholderData: keepPreviousData,
    });

    const skills: Skill[] = Array.isArray(data?.data?.skills) ? data.data.skills : [];
    const categories: SkillCategory[] = Array.isArray(data?.data?.categories) ? data.data.categories : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading;

    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to fetch skills";
    }

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    }, []);

    const handleCategoryFilterChange = useCallback((value: string) => {
        setCategoryFilter(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
            } else {
                setSortOrder("asc");
            }
            return field;
        });
        setPage(1);
    }, []);

    return {
        skills,
        categories,
        loading,
        isFetching,
        error,
        pagination,
        search,
        limit,
        categoryFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleCategoryFilterChange,
        handleSortChange,
        refetch,
    };
};
