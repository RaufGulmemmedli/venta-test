import { axiosInstance } from '@/lib/axios'

export interface CreateAttributRequest {
    name: string
    context: number
    isActive: boolean
}
export interface UpdateAttributRequest extends CreateAttributRequest {
    id: number
}

export interface CreateAttributI18nRequest {
    id?: number
    sectionId?: number
    sectionIds?: number[]
    valueType?: number
    isValuable?: boolean
    isVisible?: boolean
    isPrinted?: boolean
    isIncluded?: boolean
    isImportant?: boolean
    isActive?: boolean
    attributeSets?: { id?: number; name: string; language: string }[]
}

export interface UpdateAttributI18nRequest {
    id: number
    valueType?: number
    isValuable?: boolean
    isVisible?: boolean
    isPrinted?: boolean
    isIncluded?: boolean
    isImportant?: boolean
    isActive?: boolean
    sectionIds?: number[]
    attributeSets?: { id?: number; name: string; language: string }[]
}

export interface AttributResponse {
    id: number
    name: string
    context: number
}

export interface ApiResponse<T> {
    responseValue: T
    statusCode: number
    message: string
}

export interface AttributI18n {
    id: number
    sectionId: number
    type?: string
    stepName?: string | null
    isActive: boolean
    order?: number
    sortOrder: number
    translations?: { lang: string; title: string; description: string }[]

    sectionName?: string
    sectionDtos?: { sectionId: number; title: string }[] // NEW: Array of sections with titles
    valueType?: number
    isValuable?: boolean
    isVisible?: boolean
    isPrinted?: boolean
    isIncluded?: boolean
    isImportant?: boolean
    name?: string


    attributeSets?: { id?: number; name: string; language: string }[]
}

export interface AttributsListApiRaw {
    response: AttributI18n[] | { attributs: AttributI18n[] }
    statusCode: number
    errorCode: number
    description: string
    errorList: any
}
export interface AttributsParams {
    pageNumber?: number
    pageSize?: number
    value?: string
    isActive?: boolean
    sectionId?: number
    type?: string
    valueType?: number
    isValuable?: boolean
    isVisible?: boolean
    isImportant?: boolean
}
export interface AttributsValueParams {
    PageNumber?: number
    PageSize?: number
    attributeId?: number
    SearchTerm?: string
}
export interface AtributQueueItem { stepId: number; moduleId: number }
export interface UpdateAttributOrderPayload {
    sectionId: number
    attributeIdsInOrder: number[]
}

export interface CreateAttributeValueLanguagesRequest {
    attributeId: number
    languages?: { name: string; language: string }[]
    attributeValueDtos?: {
        value: { value: string; language: string }[]
    }[]
}
export interface UpdateAttributeValueItem {
    attributeId: number
    value: string
    language: string
}
export interface UpdateAttributeValueRequest {
    attributeValueId: number
    setUpdateAttributeValueRequest: UpdateAttributeValueItem[]
}

export interface AttributeValueLanguage {
    id: number
    attributeValueId: number
    name: string
    language: string
}
export interface AttributeValueGroup {
    attributeId: number
    languages: AttributeValueLanguage[]
}

export interface UpdateAttributeValuesGroupRequest {
    attributeId: number
    languages?: {
        id?: number
        value: string
        language: string
    }[]
    attributeValue?: {
        id?: number
        attributeValueSets: {
            value: string
            language: string
        }[]
    }[]
}

export const attributService = {
    getAttributs: async (params: AttributsParams = {}): Promise<AttributI18n[]> => {
        const searchParams = new URLSearchParams()

        if (params.pageNumber != null) searchParams.set('PageNumber', String(params.pageNumber))
        if (params.pageSize != null) searchParams.set('PageSize', String(params.pageSize))
        if (params.value) searchParams.set('Search', params.value)
        if (typeof params.isActive === 'boolean') searchParams.set('IsActive', String(params.isActive))
        if (typeof params.isValuable === 'boolean') searchParams.set('IsValuable', String(params.isValuable))
        if (typeof params.isVisible === 'boolean') searchParams.set('IsVisible', String(params.isVisible))
        if (typeof params.isImportant === 'boolean') searchParams.set('IsImportant', String(params.isImportant))
        if (params.sectionId != null) searchParams.set('SectionId', String(params.sectionId))
        if (params.valueType != null) searchParams.set('ValueType', String(params.valueType))

        const qs = searchParams.toString()
        const url = qs ? `Attributes/get-all-with-pagination?${qs}` : 'Attributes/get-all-with-pagination'

        const res = await axiosInstance.get(url)
        const data: any = res.data
        if (Array.isArray(data?.responseValue?.items)) {
            const items = data.responseValue.items as any[]
            return items.map((it) => {
                // Extract section names from sectionDtos array
                const sectionDtos = Array.isArray(it.sectionDtos) ? it.sectionDtos : []
                const sectionNames = sectionDtos.map((dto: any) => dto.title).filter(Boolean).join(', ')
                
                return {
                    id: it.id,
                    sectionId: it.sectionId ?? 0,
                    sectionName: sectionNames || it.sectionName || '',
                    sectionDtos: sectionDtos, // Keep original array for reference
                    isActive: it.isActive,
                    sortOrder: it.sortOrder ?? 0,
                    valueType: it.valueType,
                    isValuable: it.isValuable,
                    isVisible: it.isVisible,
                    isPrinted: it.isPrinted,
                    isIncluded: it.isIncluded,
                    isImportant: it.isImportant,
                    name: it.name,
                    isVisiable: it.isVisible,
                    isImportand: it.isImportant,
                    setCreateAttributeRequest: it.name
                        ? [{ name: it.name, language: 'az' }]
                        : undefined,
                }
            })
        }

        const arr: AttributI18n[] =
            Array.isArray(data?.response)
                ? data.response
                : Array.isArray(data?.response?.attributs)
                    ? data.response.attributs
                    : []

        return arr
    },
    getAttributValues: async (params: AttributsValueParams = {}): Promise<any> => {
        const searchParams = new URLSearchParams()
        if (params.attributeId != null) searchParams.set('attributeId', String(params.attributeId))
        if (params.PageNumber != null) searchParams.set('PageNumber', String(params.PageNumber))
        if (params.PageSize != null) searchParams.set('PageSize', String(params.PageSize))
        if (params.SearchTerm != null) searchParams.set('SearchTerm', String(params.SearchTerm))

        const qs = searchParams.toString()
        const url = qs ? `AttributeValues/get-by-attribute-id?${qs}` : 'AttributeValue/get-by-attribute-id'
        const res = await axiosInstance.get(url)
        return res.data
    },
    getAllAttributs: async (sectionId?: number, type?: string): Promise<AttributI18n[]> => {
        const params = new URLSearchParams()
        if (sectionId != null) params.set('SectionId', String(sectionId))
        if (type) params.set('Type', type) // was mistakenly 'Type=' before

        let url: string
        if (params.has('SectionId')) {
            url = `Attributes/get-by-section-id?${params.toString()}`
        } else if (params.has('Type')) {
            url = `Attributes/get-by-filter?${params.toString()}`
        } else {
            url = 'Attributes/get-all-with-pagination?PageNumber=1&PageSize=1000'
        }

        const res = await axiosInstance.get(url)
        const data: any = res.data

        if (Array.isArray(data?.responseValue)) {
            return data.responseValue.map((item: any) => ({
                id: item.id,
                sectionId: item.sectionDto?.id ?? item.sectionId ?? 0,
                isActive: item.isActive,
                order: item.order ?? item.sortOrder ?? 0,
                sortOrder: item.order ?? item.sortOrder ?? 0,
                valueType: item.valueType,
                isValuable: item.isValuable,
                isVisible: item.isVisible,
                isPrinted: item.isPrinted,
                isIncluded: item.isIncluded,
                isImportant: item.isImportant,
                name: item.name,
                sectionName: item.sectionDto?.title ?? null,
                
               
                isVisiable: item.isVisible,
                isImportand: item.isImportant,
                setCreateAttributeRequest: item.name ? [{ name: item.name, language: 'az' }] : undefined,
            }))
        }

        if (Array.isArray(data?.responseValue?.items)) {
            return (data.responseValue.items as any[]).map(it => ({
                id: it.id,
                sectionId: it.sectionId,
                isActive: it.isActive,
                order: it.order ?? it.sortOrder ?? 0,
                sortOrder: it.order ?? it.sortOrder ?? 0,
                valueType: it.valueType,
                isValuable: it.isValuable,
                isVisible: it.isVisible,
                isPrinted: it.isPrinted,
                isIncluded: it.isIncluded,
                isImportant: it.isImportant,
                name: it.name,
                isVisiable: it.isVisible,
                isImportand: it.isImportant,
                setCreateAttributeRequest: it.name ? [{ name: it.name, language: 'az' }] : undefined,
            }))
        }

        const arr: AttributI18n[] =
            Array.isArray(data?.response)
                ? data.response
                : Array.isArray(data?.response?.attributs)
                    ? data.response.attributs
                    : []

        return arr
    },
    getIdAttributs: async (id: number): Promise<AttributI18n | any> => {
        const response = await axiosInstance.get(`Attributes/get-by-id?Id=${id}`)
        const data: any = response.data
        const v = data?.responseValue
        if (v && typeof v === 'object') {
            // Handle translations (new format)
            const translations = Array.isArray(v.translations)
                ? v.translations.map((tr: any) => ({
                    id: tr?.id,
                    name: tr?.name ?? '',
                    language: tr?.language ?? ''
                }))
                : []

            // Handle attributeSets (old format fallback)
            const attributeSets = Array.isArray(v.attributeSets)
                ? v.attributeSets.map((set: any) => ({
                    id: set?.id,
                    name: set?.name ?? '',
                    language: set?.language ?? ''
                }))
                : []

            return {
                id: v.id,
                sectionId: v.sectionId,
                valueType: v.valueType,
                isValuable: v.isValuable,
                isPrinted: v.isPrinted,
                isIncluded: v.isIncluded,
                isVisible: v.isVisible,
                isImportant: v.isImportant,
                isActive: v.isActive,
                name: v.name,
                attributeValueDtos: v.attributeValueDtos || [],
                // Return both translations and sectionIds in new format
                translations: translations,
                attributeSets: attributeSets.length > 0 ? attributeSets : translations,
                sectionIds: v.sectionIds || [], // Keep the new format with moduleType
                isVisiable: v.isVisible,
                isImportand: v.isImportant,
                setCreateAttributeRequest: translations.length > 0 ? translations : attributeSets,
            }
        }
        return data
    },
    getAllAttributesFilter: async (params: { SearchTerm?: string; Type?: string } = {}): Promise<any> => {
        const searchParams = new URLSearchParams()
        
        if (params.SearchTerm) searchParams.set('SearchTerm', params.SearchTerm)
        if (params.Type) searchParams.set('Type', params.Type)
        
        const qs = searchParams.toString()
        const url = qs ? `Attributes/get-all?${qs}` : 'Attributes/get-all'
        
        const response = await axiosInstance.get(url)
        const data: any = response.data
        
        // Return the full response structure
        return data
    },
    createAttribut: async (data: CreateAttributI18nRequest): Promise<any> => {
        const response = await axiosInstance.post('Attributes/create', data)
        return response.data
    },
    createAttributevalue: async (data: { attributId: number; value: string; language: string }): Promise<any> => {
        const response = await axiosInstance.post('AttributeValues/create', data)
        return response.data
    },
    createAttributeValueBulk: async (data: CreateAttributeValueLanguagesRequest): Promise<any> => {
        const response = await axiosInstance.post('AttributeValues/create', data)
        return response.data
    },
    editAttribut: async (data: UpdateAttributI18nRequest): Promise<any> => {
        const response = await axiosInstance.put('Attributes/update', data)
        return response.data
    },
    editAttributsQueue: async (data: UpdateAttributOrderPayload): Promise<void> => {
        await axiosInstance.put('Attributes/update-queue', data)
    },
    editAttributStatus: async (payload: { id: number; isActive: boolean }): Promise<void> => {
        const { id, isActive } = payload
        const qs = `Id=${id}&IsActive=${isActive}`
        try {
            await axiosInstance.put(`Attributes/change-status?${qs}`)
        } catch {
            await axiosInstance.put(`Attributes/chage-status?${qs}`)
        }
    },
    editAttributValue: async (data: UpdateAttributeValuesGroupRequest): Promise<any> => {
        const response = await axiosInstance.put("AttributeValues/update", data)
        return response.data
    },
    editAttributeValueItem: async (data: UpdateAttributeValueRequest): Promise<any> => {
        const response = await axiosInstance.put("AttributeValues/update-item", data)
        return response.data
    },
    deleteAttribut: async (id: number): Promise<void> => {
        await axiosInstance.delete(`Attributes/delete?Id=${id}`)
    },
    deleteAttributValue: async (id: number): Promise<void> => {
        await axiosInstance.delete(`AttributeValues/delete?Id=${id}`)
    },
    getAttributeValues: async (attributeId: number): Promise<any[]> => {
        const response = await axiosInstance.get(`AttributeValue/get-by-attribute/${attributeId}`)
        return response.data?.response || response.data || []
    }
}