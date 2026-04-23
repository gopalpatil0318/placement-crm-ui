import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { SubmissionsService } from "@/services/sysadmin/submissions.services"
import type { ContactInquiry } from "@/services/sysadmin/submissions.services"
import { queryKeys } from "@/lib/queryKeys"

function getErrorMessage(error: unknown): string | null {
    if (error instanceof ApiError) return error.message
    if (error) return "Failed to fetch contact inquiry"
    return null
}

export const useContactInquiryDetail = (id: string) => {
    const queryClient = useQueryClient()
    const [noteText, setNoteText] = useState("")

    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.contactInquiries.detail(id),
        queryFn: () => SubmissionsService.getContactInquiryDetail(id),
        enabled: !!id,
    })

    const contactInquiry: ContactInquiry | null = data?.data || null

    const statusMutation = useMutation({
        mutationFn: (payload: { status: string }) =>
            SubmissionsService.updateContactInquiryStatus(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.contactInquiries.detail(id) })
            queryClient.invalidateQueries({ queryKey: ["contactInquiries"] })
        },
    })

    const noteMutation = useMutation({
        mutationFn: (note: string) => SubmissionsService.addContactInquiryNote(id, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.contactInquiries.detail(id) })
            setNoteText("")
        },
    })

    const handleStatusChange = useCallback((status: string) => {
        statusMutation.mutate({ status })
    }, [statusMutation])

    const handleAddNote = useCallback(() => {
        if (!noteText.trim()) return
        noteMutation.mutate(noteText.trim())
    }, [noteText, noteMutation])

    return {
        contactInquiry,
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
