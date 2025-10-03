"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    attributService,
    type AttributI18n,
    type AttributsParams,
    type CreateAttributRequest,
    type UpdateAttributRequest,
    type CreateAttributI18nRequest,
    type UpdateAttributI18nRequest,
    type UpdateAttributOrderPayload,
    type CreateAttributeValueLanguagesRequest
} from "@/lib/services/attributServices"
import { toast } from "@/hooks/use-toast"
import { stepKeys } from "@/lib/hooks/useStep"

export const attributKeys = {
    all: ['attributs'] as const,
    lists: () => [...attributKeys.all, 'list'] as const,
    list: (filters: unknown) => [...attributKeys.lists(), { filters }] as const,
    details: () => [...attributKeys.all, 'detail'] as const,
    detail: (id: number) => [...attributKeys.details(), id] as const,
}

export function useAttributs(params?: AttributsParams, options?: any) {
    return useQuery<AttributI18n[], Error>({
        queryKey: attributKeys.list(params ?? {}),
        queryFn: () => attributService.getAttributs(params ?? {}),
        ...options,
    })
}

export function useAllAttributs(stepId?: number) {
    return useQuery<AttributI18n[], Error>({
        queryKey: [...attributKeys.all, 'all', stepId],
        queryFn: () => attributService.getAllAttributs(stepId),
        enabled: stepId != null,
    })
}

export function useAttributeValues(attributeId?: number) {
    return useQuery<any[], Error>({
        queryKey: [...attributKeys.all, 'values', attributeId],
        queryFn: () => attributService.getAttributeValues(attributeId!),
        enabled: attributeId != null,
    })
}

export type CreateAttributVars = Omit<CreateAttributRequest, 'isActive'> & { isActive?: boolean }
export interface EditAttributVars { id: number; data: CreateAttributVars }

export function useCreateAttribut() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, CreateAttributI18nRequest>({
        mutationFn: (payload) => attributService.createAttribut(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attributKeys.all, refetchType: 'active' })
        },
    })
}
export function useCreateAttributValue() {
  const queryClient = useQueryClient()
  return useMutation<any, unknown, CreateAttributeValueLanguagesRequest>({
    mutationFn: (payload) => attributService.createAttributeValueBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributKeys.all, refetchType: 'active' })
    }
  })
}

export function useEditAttribut() {
    const queryClient = useQueryClient()
    return useMutation<any, unknown, { id: number; data: Omit<UpdateAttributI18nRequest, 'id'> }>({
        mutationFn: ({ id, data }) => attributService.editAttribut({ id, ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attributKeys.all, refetchType: 'active' })
        },
    })
}

export function useDeleteAttribut() {
    const queryClient = useQueryClient()
    return useMutation<{ id: number }, unknown, number>({
        mutationFn: (id) => attributService.deleteAttribut(id).then(() => ({ id })),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attributKeys.all })
            toast({ title: 'Success', description: 'Attribut silindi.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Attribut silinmədi.',
                variant: 'destructive',
            })
        },
    })
}

export interface AttributsQueueVars { ids: number[]; stepId?: number }

export function useEditAttributsQueue() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: UpdateAttributOrderPayload) =>
            attributService.editAttributsQueue(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['attributs'] })
        }
    })
}

export interface AttributStatusVars { id: number; isActive: boolean }
export function useEditAttributStatus() {
    const queryClient = useQueryClient()
    return useMutation<void, unknown, AttributStatusVars>({
        mutationFn: ({ id, isActive }) => attributService.editAttributStatus({ id, isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attributKeys.all })
            toast({ title: 'Success', description: 'Attribut status updated.' })
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Attribut status not updated.',
                variant: 'destructive',
            })
        },
    })
}
