"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    cvService,
    type CvStepData
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
        queryKey: [...cvKeys.all, 'data', stepId],
        queryFn: () => cvService.getCvData(stepId!),
        enabled: stepId != null,
    })
}