"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    stepService,
    type StepsParams,
    type createStepRequest,
    type UpdateStepI18nRequest,
    type StepsFilterResponse,
    type StepI18n,
    type StepQueueItem as ServiceStepQueueItem, // ADD: reuse service type
} from "@/lib/services/stepService"
import { toast } from "@/hooks/use-toast"

export const stepKeys = {
    all: ['steps'] as const,
    lists: () => [...stepKeys.all, 'list'] as const,
    list: (filters: unknown) => [...stepKeys.lists(), { filters }] as const,
    details: () => [...stepKeys.all, 'detail'] as const,
    detail: (id: number) => [...stepKeys.details(), id] as const,
}

export function useSteps(params?: StepsParams, options?: any) {
    return useQuery<StepsFilterResponse, Error>({
        queryKey: stepKeys.list(params ?? {}),
        queryFn: () => stepService.getSteps(params ?? {}),
        ...options,
    })
}

export function useAllSteps(type?: 'cv' | 'vakansiya', stepType?: number) {
    return useQuery({
        queryKey: [...stepKeys.lists(), 'all', type, stepType],
        queryFn: () => stepService.getAllSteps(type, stepType),
    })
}

export type createStepVars = Omit<createStepRequest, 'isActive'> & { isActive?: boolean }
export interface editStepVars { id: number; data: createStepVars }

export function useCreateStep() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, createStepVars>({
        mutationFn: (vars) => stepService.createStep({ ...vars, isActive: vars.isActive ?? true } as createStepRequest),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stepKeys.all })
            toast({ title: 'Success', description: 'Step yaradıldı.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Step yaradılmadı.',
                variant: 'destructive',
            })
        },
    })
}

export function usecreateStep() {
    return useCreateStep()
}

export function useEditStep() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, { id: number; data: createStepVars }>({
        mutationFn: (vars) => {
            const body: UpdateStepI18nRequest = { id: vars.id, ...vars.data, isActive: vars.data.isActive ?? true }
            return stepService.editStep(body)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stepKeys.all })
            toast({ title: 'Success', description: 'Step yeniləndi.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Step yenilənmədi.',
                variant: 'destructive',
            })
        },
    })
}

export function useeditStep() {
    return useEditStep()
}

export function useDeleteStep() {
    const queryClient = useQueryClient()
    return useMutation<{ id: number }, unknown, number>({
        mutationFn: (id) => stepService.deleteStep(id).then(() => ({ id })),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stepKeys.all })
            toast({ title: 'Success', description: 'Step silindi.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Step silinmədi.',
                variant: 'destructive',
            })
        },
    })
}

// Accept both old/new shapes and map to service shape
type StepQueueInput = { stepId: number; type: number } | { stepId: number; moduleId: number }

export function useEditStepsQueue() {
    const queryClient = useQueryClient()
    return useMutation<void, unknown, StepQueueInput[]>({
        mutationFn: (payload) => {
            const normalized: ServiceStepQueueItem[] = payload.map((p: any) => ({
                stepId: p.stepId,
                type: p.type ?? p.moduleId, // map moduleId -> type if needed
            }))
            return stepService.editStepsQueue(normalized)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stepKeys.all })
        },
    })
}

export interface StepStatusVars { id: number; isActive: boolean }
export function useEditStepStatus() {
    const queryClient = useQueryClient()
    return useMutation<void, unknown, StepStatusVars>({
        mutationFn: ({ id, isActive }) => stepService.editStepStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stepKeys.all })
            toast({ title: 'Success', description: 'Step status updated.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Step status not updated.',
                variant: 'destructive',
            })
        },
    })
}
