"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    cvService,
    type CvStepData,
    type CvListPage,
    type CvParams,
    type CvItem
} from "@/lib/services/cvServices"
import { toast } from "@/hooks/use-toast"
import { stepKeys } from "@/lib/hooks/useStep"

export const cvKeys = {
    all: ['cv'] as const,
    lists: () => [...cvKeys.all, 'list'] as const,
    list: (filters: unknown) => [...cvKeys.lists(), { filters }] as const,
    details: () => [...cvKeys.all, 'detail'] as const,
    detail: (id: number) => [...cvKeys.details(), id] as const,
}

export function useCvData(stepId?: number) {
    return useQuery<CvStepData, Error>({
        queryKey: [...cvKeys.all, 'data', stepId ?? 'none'],
        queryFn: () => cvService.getCvData(stepId!),
        enabled: stepId != null,
    })
}

export function useCvList(params: CvParams = {}) {
    return useQuery<CvListPage, Error>({
        queryKey: cvKeys.list(params), // ['cv','list',{filters: params}]
        queryFn: () => cvService.getAllCv(params),
    })
}

export function useCvById(id?: number, stepId?: number) {
    return useQuery<CvItem | null, Error>({
        queryKey: id != null ? [...cvKeys.detail(id), stepId ?? 'all'] : [...cvKeys.details(), 'placeholder'],
        queryFn: () => cvService.getCvById(id!, stepId),
        enabled: id != null,
    })
}

export function useDeleteCv() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (id: number) => cvService.deleteCv(id),
        onSuccess: () => {
            // Invalidate all CV lists to refresh the data
            queryClient.invalidateQueries({ queryKey: cvKeys.lists() })
            toast({
                title: "Uğurlu",
                description: "CV silindi",
            })
        },
        onError: (error: any) => {
            console.error('Delete CV error:', error)
            toast({
                title: "Xəta",
                description: error?.response?.data?.message || "CV silinə bilmədi",
                variant: "destructive"
            })
        }
    })
}