"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    vacancyService,
    type VacancyStepData,
    type VacancyListPage,
    type VacancyParams,
    type VacancyItem
} from "@/lib/services/vacancyServices"
import { toast } from "@/hooks/use-toast"
import { stepKeys } from "@/lib/hooks/useStep"

export const vacancyKeys = {
    all: ['vacancy'] as const,
    lists: () => [...vacancyKeys.all, 'list'] as const,
    list: (filters: unknown) => [...vacancyKeys.lists(), { filters }] as const,
    details: () => [...vacancyKeys.all, 'detail'] as const,
    detail: (id: number) => [...vacancyKeys.details(), id] as const,
}

export function useVacancyData(stepId?: number) {
    return useQuery<VacancyStepData, Error>({
        queryKey: [...vacancyKeys.all, 'data', stepId],
        queryFn: () => vacancyService.getVacancyData(stepId!),
        enabled: stepId != null,
    })
}

export function useVacancyList(params: VacancyParams = {}) {
    return useQuery<VacancyListPage, Error>({
        queryKey: [...vacancyKeys.lists(), params],
        queryFn: () => vacancyService.getAllVacancies(params),
    })
}

export function useVacancyById(id?: number, stepId?: number) {
    return useQuery<VacancyItem | null, Error>({
        queryKey: id != null ? [...vacancyKeys.detail(id), stepId ?? 'all'] : [...vacancyKeys.details(), 'placeholder'],
        queryFn: () => vacancyService.getVacancyById(id!, stepId),
        enabled: id != null,
    })
}

export function useDeleteVacancy() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (id: number) => vacancyService.deleteVacancy(id),
        onSuccess: () => {
            // Invalidate all vacancy lists to refresh the data
            queryClient.invalidateQueries({ queryKey: vacancyKeys.lists() })
            toast({
                title: "Uğurlu",
                description: "Vakansiya silindi",
            })
        },
        onError: (error: any) => {
            console.error('Delete vacancy error:', error)
            toast({
                title: "Xəta",
                description: error?.response?.data?.message || "Vakansiya silinə bilmədi",
                variant: "destructive"
            })
        }
    })
}
