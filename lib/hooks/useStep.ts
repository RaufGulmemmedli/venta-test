"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { stepService, type Step, type StepsParams, type CreateStepRequest, type UpdateStepRequest } from "@/lib/services/stepService"
import { toast } from "@/hooks/use-toast"

export const stepKeys = {
    all: ['steps'] as const,
    lists: () => [...stepKeys.all, 'list'] as const,
    list: (filters: unknown) => [...stepKeys.lists(), { filters }] as const,
    details: () => [...stepKeys.all, 'detail'] as const,
    detail: (id: number) => [...stepKeys.details(), id] as const,
}

export function useSteps(params?: StepsParams, options?: any) {
    return useQuery<Step[], Error>({
        queryKey: stepKeys.list(params ?? {}),
        queryFn: () => stepService.getSteps(params ?? {}),
        ...options,
    })
}
export function useAllSteps(context?: number) {
    return useQuery<Step[], Error>({
        queryKey: [...stepKeys.all, 'all', context],
        queryFn: () => stepService.getAllSteps(context),
        enabled: context != null,
    })
}
export type CreateStepVars = Omit<CreateStepRequest, 'isActive'> & { isActive?: boolean }
export interface EditStepVars { id: number; data: CreateStepVars }

export function useCreateStep() {
    const queryClient = useQueryClient()
    return useMutation<Step | any, unknown, CreateStepVars>({
        mutationFn: (vars) => stepService.createStep({ ...vars, isActive: true }),
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

export function useEditStep() {
    const queryClient = useQueryClient()
    return useMutation<Step | any, unknown, EditStepVars>({
        mutationFn: (vars) => {
            const body: UpdateStepRequest = { id: vars.id, ...vars.data, isActive: vars.data.isActive ?? true }
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
export interface StepsQueueVars { steps: { id: number; name: string; context: number }[] }
export function useEditStepsQueue() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, StepsQueueVars>({
        mutationFn: (vars) => {
            const payload: CreateStepRequest[] = vars.steps.map(s => ({ name: s.name, context: s.context, isActive: true }))
            return stepService.editStepsQueue(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stepKeys.all })
            toast({ title: 'Success', description: 'Sıra yeniləndi.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Sıra yenilənmədi.',
                variant: 'destructive',
            })
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
