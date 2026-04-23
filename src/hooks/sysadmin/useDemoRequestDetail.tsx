import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { SubmissionsService } from "@/services/sysadmin/submissions.services"
import type { DemoRequest } from "@/services/sysadmin/submissions.services"
import { queryKeys } from "@/lib/queryKeys"

function getErrorMessage(error: unknown): string | null {
    if (error instanceof ApiError) return error.message
    if (error) return "Failed to fetch demo request"
    return null
}

export const useDemoRequestDetail = (id: string) => {
    const queryClient = useQueryClient()
    const [noteText, setNoteText] = useState("")

    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.demoRequests.detail(id),
        queryFn: () => SubmissionsService.getDemoRequestDetail(id),
        enabled: !!id,
    })

    const demoRequest: DemoRequest | null = data?.data || null

    const statusMutation = useMutation({
        mutationFn: (payload: { status: string; converted_college_id?: string | null; assigned_to?: string }) =>
            SubmissionsService.updateDemoRequestStatus(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.demoRequests.detail(id) })
            queryClient.invalidateQueries({ queryKey: ["demoRequests"] })
        },
    })

    const noteMutation = useMutation({
        mutationFn: (note: string) => SubmissionsService.addDemoRequestNote(id, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.demoRequests.detail(id) })
            setNoteText("")
        },
    })

    const handleStatusChange = useCallback((status: string, extra?: { converted_college_id?: string | null; assigned_to?: string }) => {
        statusMutation.mutate({ status, ...extra })
    }, [statusMutation])

    const handleAddNote = useCallback(() => {
        if (!noteText.trim()) return
        noteMutation.mutate(noteText.trim())
    }, [noteText, noteMutation])

    return {
        demoRequest,
        loading: isLoading,
        error: getErrorMessage(error),
        noteText,
        setNoteText,
        handleStatusChange,
        handleAddNote,
        isUpdatingStatus: statusMutation.isPending,
        isAddingNote: noteMutation.isPending,
        statusError: getErrorMessage(statusMutation.error),
        noteError: getErrorMessage(noteMutation.error),
    }
}
