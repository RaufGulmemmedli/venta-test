"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sectionService, type Section, type SectionsParams, type CreateSectionRequest, type UpdateSectionRequest } from "@/lib/services/sectionService"
import { toast } from "@/hooks/use-toast"

export const sectionKeys = {
    all: ['sections'] as const,
    lists: () => [...sectionKeys.all, 'list'] as const,
    list: (filters: unknown) => [...sectionKeys.lists(), { filters }] as const,
    details: () => [...sectionKeys.all, 'detail'] as const,
    detail: (id: number) => [...sectionKeys.details(), id] as const,
}

export function useSections(params?: SectionsParams, options?: any) {
    return useQuery<Section[], Error>({
        queryKey: sectionKeys.list(params ?? {}),
        queryFn: () => sectionService.getSections(params ?? {}),
        ...options,
    })
}
export function useAllSections(context?: number) {
    return useQuery<Section[], Error>({
        queryKey: [...sectionKeys.all, 'all', context],
        queryFn: () => sectionService.getAllSections(context),
        enabled: context != null,
    })
}
export type CreateSectionVars = Omit<CreateSectionRequest, 'isActive'> & { isActive?: boolean }
export interface EditSectionVars { id: number; data: CreateSectionVars }

export function useCreateSection() {
    const queryClient = useQueryClient()
    return useMutation<Section | any, unknown, CreateSectionVars>({
        mutationFn: (vars) => sectionService.createSection({ ...vars, isActive: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sectionKeys.all })
            toast({ title: 'Success', description: 'Section yaradıldı.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Section yaradılmadı.',
                variant: 'destructive',
            })
        },
    })
}

export function useEditSection() {
    const queryClient = useQueryClient()
    return useMutation<Section | any, unknown, EditSectionVars>({
        mutationFn: (vars) => {
            const body: UpdateSectionRequest = { id: vars.id, ...vars.data, isActive: vars.data.isActive ?? true }
            return sectionService.editSection(body)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sectionKeys.all })
            toast({ title: 'Success', description: 'Section yeniləndi.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Section yenilənmədi.',
                variant: 'destructive',
            })
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
export interface SectionsQueueVars { sections: { id: number; name: string; context: number }[] }
export function useEditSectionsQueue() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, SectionsQueueVars>({
        mutationFn: (vars) => {
            const payload: CreateSectionRequest[] = vars.sections.map(s => ({ name: s.name, context: s.context, isActive: true }))
            return sectionService.editSectionsQueue(payload)
        },
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
