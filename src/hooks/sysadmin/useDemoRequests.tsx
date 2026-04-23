import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { SubmissionsService } from "@/services/sysadmin/submissions.services"
import type { DemoRequest, SubmissionListParams } from "@/services/sysadmin/submissions.services"
import { queryKeys } from "@/lib/queryKeys"

function getErrorMessage(error: unknown): string | null {
    if (error instanceof ApiError) return error.message
    if (error) return "Failed to fetch demo requests"
    return null
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export const useDemoRequests = () => {
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    const navigate = useNavigate()
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => () => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }, [])

    const queryFilters = useMemo(() => {
        const f: Record<string, unknown> = { page, limit }
        if (debouncedSearch) f.search = debouncedSearch
        if (statusFilter) f.status = statusFilter
        if (typeFilter) f.college_type = typeFilter
        return f
    }, [page, limit, debouncedSearch, statusFilter, typeFilter])

    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: queryKeys.demoRequests.all(queryFilters),
        queryFn: () => {
            const params: SubmissionListParams = { page, limit }
            if (debouncedSearch) params.search = debouncedSearch
            if (statusFilter) params.status = statusFilter
            if (typeFilter) params.college_type = typeFilter
            return SubmissionsService.getDemoRequests(params)
        },
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

    const demoRequests: DemoRequest[] = data?.data || []
    const pagination: Pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value)
            setPage(1)
        }, 300)
    }, [])

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit)
        setPage(1)
    }, [])

    const handleStatusFilterChange = useCallback((status: string) => {
        setStatusFilter(status)
        setPage(1)
    }, [])

    const handleTypeFilterChange = useCallback((type: string) => {
        setTypeFilter(type)
        setPage(1)
    }, [])

    const handleNavigateToDetail = useCallback((id: string) => {
        navigate(`/sysadmin/demo-requests/${id}`)
    }, [navigate])

    return {
        demoRequests,
        loading: isLoading,
        isFetching,
        error: getErrorMessage(error),
        refresh: refetch,
        search,
        page,
        limit,
        pagination,
        statusFilter,
        typeFilter,
        handleSearchChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handleNavigateToDetail,
        setPage,
    }
}
