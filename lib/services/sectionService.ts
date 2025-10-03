import { axiosInstance } from '@/lib/axios'

export interface CreateSectionRequest {
    name: string
    context: number
    isActive: boolean
}
export interface UpdateSectionRequest extends CreateSectionRequest {
    modelId?: number
    id: number
}

export interface CreateSectionI18nRequest {
    stepId: number
    isActive: boolean
    sortOrder?: number
    isChangeable?: boolean
    translations: { language: string; title: string; description: string }[]
}
export interface UpdateSectionI18nRequest extends CreateSectionI18nRequest {
    id: number
}

export interface SectionResponse {
    id: number
    name: string
    context: number
}

export interface ApiResponse<T> {
    responseValue: T
    statusCode: number
    message: string
}

export interface SectionI18n {
    id: number
    stepId: number
    stepName?: string | null
    isActive: boolean
    sortOrder: number
    translations?: { language: string; title: string; description: string }[]
    // NEW (for get-by-id usage in UI)
    isChangeable?: boolean
    // Include step information
    step?: {
        id: number
        title: string
        description: string | null
        type: number
        sortOrder: number
        isActive: boolean
    }
}

export interface SectionsListApiRaw {
    response: SectionI18n[] | { sections: SectionI18n[] }
    statusCode: number
    errorCode: number
    description: string
    errorList: any
}
export interface SectionsParams {
    pageNumber?: number
    pageSize?: number
    value?: string
    isActive?: boolean
    stepId?: number
    type?:  number | string
}

export const sectionService = {
    getSections: async (params: SectionsParams = {}): Promise<SectionI18n[]> => {
        const searchParams = new URLSearchParams()

        if (params.pageNumber != null) searchParams.set('PageNumber', String(params.pageNumber))
        if (params.pageSize != null) searchParams.set('PageSize', String(params.pageSize))
        if (params.value) searchParams.set('SearchTerm', params.value)
        if (typeof params.isActive === 'boolean') searchParams.set('IsActive', String(params.isActive))
        if (params.stepId != null) searchParams.set('StepId', String(params.stepId))
        if (params.type) searchParams.set('Type', String(Number(params.type)))

        const qs = searchParams.toString()
        const url = qs ? `Sections/get-all-with-pagination?${qs}` : 'Sections/get-all-with-pagination'

        const res = await axiosInstance.get(url)
        const data: any = res.data

        // Handle new API response format with responseValue.items
        if (Array.isArray(data?.responseValue?.items)) {
            const items = data.responseValue.items as any[]
            return items.map((it) => ({
                id: it.id,
                stepId: it.step?.id ?? 0,
                stepName: it.step?.title ?? null,
                isActive: it.isActive,
                sortOrder: it.sortOrder ?? 0,
                isChangeable: it.isChangeable,
                translations: it.translation
                    ? [{
                        language: it.translation.language ?? '',
                        title: it.translation.title ?? '',
                        description: it.translation.description ?? '',
                    }]
                    : [],
                // Include step information
                step: it.step ? {
                    id: it.step.id,
                    title: it.step.title,
                    description: it.step.description,
                    type: it.step.type,
                    sortOrder: it.step.sortOrder,
                    isActive: it.step.isActive
                } : null
            }))
        }

        // Fallback for old shape
        const arr: SectionI18n[] =
            Array.isArray(data?.response)
                ? data.response
                : Array.isArray(data?.response?.sections)
                    ? data.response.sections
                    : []

        return arr
    },
    getAllSections: async (stepId?: number): Promise<SectionI18n[]> => {
        const url = stepId != null ? `Sections/get-all?StepId=${stepId}` : 'Section/allSections'
        const res = await axiosInstance.get<SectionsListApiRaw>(url)
        const data: any = res.data

        // Handle new API response format with responseValue array
        if (Array.isArray(data?.responseValue)) {
            return data.responseValue.map((item: any) => ({
                id: item.id,
                stepId: item.stepId,
                stepName: null,
                isActive: item.isActive,
                sortOrder: 0, // Default sort order
                isChangeable: item.isChangeable,
                translations: item.translations ? [{
                    language: item.translations.language || '',
                    title: item.translations.title || '',
                    description: item.translations.description || ''
                }] : []
            }))
        }

        // Fallback for old format
        const arr: SectionI18n[] =
            Array.isArray(data?.response)
                ? data.response
                : Array.isArray(data?.response?.sections)
                    ? data.response.sections
                    : []

        return arr
    },
    getIdSections: async (id: number): Promise<SectionI18n | any> => {
        const response = await axiosInstance.get(`Sections/get-by-id?Id=${id}`)
        const data: any = response.data
        const v = data?.responseValue
        if (v) {
            const trArr = Array.isArray(v.translation) ? v.translation : []
            return {
                id: v.id,
                stepId: v.step?.id,
                stepName: v.step?.title ?? null,
                isActive: v.isActive,
                sortOrder: v.sortOrder ?? 0,
                isChangeable: v.isChangeable,
                translations: trArr.map((tr: any) => ({
                    language: tr?.lang ?? tr?.language ?? '',
                    title: tr?.title ?? '',
                    description: tr?.description ?? ''
                })),
                // Include step information for modal
                step: v.step ? {
                    id: v.step.id,
                    title: v.step.title,
                    description: v.step.description,
                    type: v.step.type,
                    sortOrder: v.step.sortOrder,
                    isActive: v.step.isActive
                } : null
            }
        }
        return data
    },
    createSection: async (data: CreateSectionI18nRequest): Promise<any> => {
        const response = await axiosInstance.post('Sections/create', data)
        return response.data
    },
    editSection: async (data: UpdateSectionI18nRequest): Promise<any> => {
        // API yeni format gözləyir:
        // {
        //   id, isChangeable, stepId,
        //   sectionSets: [{ title, description, language }]
        // }
        const sectionSets = (data.translations ?? []).map(t => ({
            title: t.title,
            description: t.description,
            language: t.language
        }))
        const apiPayload = {
            id: data.id,
            isChangeable: data.isChangeable ?? true,
            stepId: data.stepId,
            sectionSets
        }
        const response = await axiosInstance.put('Sections/update', apiPayload)
        return response.data
    },
    editSectionsQueue: async (ids: number[], stepId?: number): Promise<any> => {
        const url = stepId != null ? `Section/update-queue/${stepId}` : 'Section/update-queue'
        const response = await axiosInstance.put(url, ids)
        return response.data
    },
    editSectionStatus: async (sectionId: number, isActive: boolean): Promise<void> => {
        await axiosInstance.put(`Sections/change-status?Id=${sectionId}`, { isActive })
    },
    deleteSection: async (id: number): Promise<void> => {
        await axiosInstance.delete(`Sections/delete?Id=${id}`)
    }
}