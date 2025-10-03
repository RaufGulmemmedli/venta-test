"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    sectionService,
    type SectionI18n,
    type SectionsParams,
    type CreateSectionRequest,
    type UpdateSectionRequest,
    type CreateSectionI18nRequest,
    type UpdateSectionI18nRequest
} from "@/lib/services/sectionService"
import { toast } from "@/hooks/use-toast"
import { stepKeys } from "@/lib/hooks/useStep"

export const sectionKeys = {
    all: ['sections'] as const,
    lists: () => [...sectionKeys.all, 'list'] as const,
    list: (filters: unknown) => [...sectionKeys.lists(), { filters }] as const,
    details: () => [...sectionKeys.all, 'detail'] as const,
    detail: (id: number) => [...sectionKeys.details(), id] as const,
}

export function useSections(params?: SectionsParams, options?: any) {
    return useQuery<SectionI18n[], Error>({
        queryKey: sectionKeys.list(params ?? {}),
        queryFn: () => sectionService.getSections(params ?? {}),
        ...options,
    })
}

export function useAllSections(stepId?: number) {
    return useQuery<SectionI18n[], Error>({
        queryKey: [...sectionKeys.all, 'all', stepId],
        queryFn: () => sectionService.getAllSections(stepId),
        enabled: stepId != null,
    })
}

export type CreateSectionVars = Omit<CreateSectionRequest, 'isActive'> & { isActive?: boolean }
export interface EditSectionVars { id: number; data: CreateSectionVars }

export function useCreateSection() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, CreateSectionI18nRequest>({
        mutationFn: (payload) => sectionService.createSection(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sectionKeys.all, refetchType: 'active' })
        },
    })
}

export function useEditSection() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, { id: number; data: Omit<UpdateSectionI18nRequest, 'id'> }>({
        mutationFn: ({ id, data }) => sectionService.editSection({ id, ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sectionKeys.all, refetchType: 'active' })
        },
    })
}

export function useDeleteSection() {
    const queryClient = useQueryClient()
    return useMutation<{ id: number }, unknown, number>({
        mutationFn: (id) => sectionService.deleteSection(id).then(() => ({ id })),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sectionKeys.all })
            toast({ title: 'Success', description: 'Section silindi.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Section silinmədi.',
                variant: 'destructive',
            })
        },
    })
}

export interface SectionsQueueVars { stepId: number; sectionIdsInOrder: number[] }

export function useEditSectionsQueue() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, SectionsQueueVars>({
        mutationFn: (vars) => sectionService.editSectionsQueue(vars.stepId, vars.sectionIdsInOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sectionKeys.all })
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

export interface SectionStatusVars { id: number; isActive: boolean }
export function useEditSectionStatus() {
    const queryClient = useQueryClient()
    return useMutation<void, unknown, SectionStatusVars>({
        mutationFn: ({ id, isActive }) => sectionService.editSectionStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sectionKeys.all })
            toast({ title: 'Success', description: 'Section status updated.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Section status not updated.',
                variant: 'destructive',
            })
        },
    })
}
