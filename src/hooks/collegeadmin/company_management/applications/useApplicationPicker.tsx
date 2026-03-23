import { useState, useCallback, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface PickerApplication {
    application_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    enrollment_number: string;
    dept_name: string;
    position_name: string | null;
    application_status: string;
}

// ========================
// HOOK
// ========================

/**
 * Shared picker for selecting applications by job.
 * Supports multi-status filter and debounced search.
 * Used by Round Results (Add Result) and Placement creation flows.
 */
export const useApplicationPicker = (
    jobId: string,
    statusFilters: string[],
    excludeIds?: Set<string>,
) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: applications = [], isLoading, refetch } = useQuery({
        queryKey: queryKeys.jobs.applications(jobId, {
            statuses: statusFilters,
            search: debouncedSearch || undefined,
            picker: true,
        }),
        queryFn: async () => {
            // Fetch for each status filter and merge results
            const requests = statusFilters.map((status) =>
                CollegeAdminService.getJobApplications(jobId, {
                    application_status: status,
                    search: debouncedSearch || undefined,
                    limit: 200,
                }),
            );

            const responses = await Promise.all(requests);

            // Merge and deduplicate
            const seen = new Set<string>();
            const merged: PickerApplication[] = [];

            for (const response of responses) {
                const items = response?.data?.applications ?? [];
                for (const app of items) {
                    if (!seen.has(app.application_id)) {
                        seen.add(app.application_id);
                        merged.push({
                            application_id: app.application_id,
                            student_id: app.student_id,
                            student_name: app.student_name,
                            student_email: app.student_email,
                            enrollment_number: app.prn_no || app.roll_no || "—",
                            dept_name: app.dept_name || "—",
                            position_name: app.position_name || null,
                            application_status: app.application_status,
                        });
                    }
                }
            }

            merged.sort((a, b) => a.student_name.localeCompare(b.student_name));
            return merged;
        },
        enabled: !!jobId && statusFilters.length > 0,
    });

    // Debounced search
    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    }, []);

    // Filter out excluded application IDs
    const filteredApplications = useMemo(
        () => excludeIds ? applications.filter((a) => !excludeIds.has(a.application_id)) : applications,
        [applications, excludeIds],
    );

    return {
        applications: filteredApplications,
        allApplications: applications,
        search,
        setSearch: handleSearchChange,
        loading: isLoading,
        refresh: () => refetch(),
    };
};
