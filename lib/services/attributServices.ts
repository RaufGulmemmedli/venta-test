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
    sectionId?: number
    valueType?: number
    isChangeable?: boolean
    isMultiple?: boolean
    isValuable?: boolean
    isVisible?: boolean
    isPrinted?: boolean
    attributeSets?: { id?: number; name: string; language: string }[]
    isActive?: boolean
    type?: string
}

export interface UpdateAttributI18nRequest extends CreateAttributI18nRequest {
    id: number
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
    sortOrder: number
    translations?: { lang: string; title: string; description: string }[]

    sectionName?: string 
    valueType?: number
    isValuable?: boolean
    isVisible?: boolean
    isPrinted?: boolean
    isImportant?: boolean
    name?: string

    // Back-compat alias-lar (UI hazırda bunları oxuyur)
    isVisiable?: boolean
    isImportand?: boolean
    setCreateAttributeRequest?: { id?: number; name: string; language: string }[]
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
    // New filters
    valueType?: number
    isValuable?: boolean
    isVisible?: boolean
    isImportant?: boolean
}
export interface AttributsValueParams {
    page?: number
    pageSize?: number
    attributeId?: number
    name?: string
}
export interface AtributQueueItem { stepId: number; moduleId: number }
export interface UpdateAttributOrderPayload {
    sectionId: number
    attributeIdsInOrder: number[]
}

export interface CreateAttributeValueLanguagesRequest {
    attributeId: number
    languages: { name: string; language: string }[]
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
    languages: {
        id?: number
        attributeValueId?: number
        value: string
        language: string
    }[]
}
// export interface AttributeStatusPayload {
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
            return items.map((it) => ({
                id: it.id,
                sectionId: it.sectionId ?? 0,
                sectionName: it.sectionName ?? '',            // ADDED: show in table
                isActive: it.isActive,
                sortOrder: it.sortOrder ?? 0,

                valueType: it.valueType,
                isValuable: it.isValuable,
                isVisible: it.isVisible,
                isPrinted: it.isPrinted,
                isImportant: it.isImportant,
                name: it.name,

                // aliases for existing UI
                isVisiable: it.isVisible,
                isImportand: it.isImportant,
                setCreateAttributeRequest: it.name
                    ? [{ name: it.name, language: 'az' }]
                    : undefined,
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
    getAttributValues: async (params: AttributsValueParams = {}): Promise<AttributeValueGroup[]> => {
        const searchParams = new URLSearchParams()
        if (params.page != null) searchParams.set('Page', String(params.page))
        if (params.pageSize != null) searchParams.set('PageSize', String(params.pageSize))
        if (params.attributeId != null) searchParams.set('AttributId', String(params.attributeId))
        if (params.name != null) searchParams.set('Name', String(params.name))

        const qs = searchParams.toString()
        const url = qs ? `AttributeValue/get-by-attribute-id?${qs}` : 'AttributeValue/get-by-attribute-id'
        const res = await axiosInstance.get(url)
        const data: any = res.data
        const arr: AttributeValueGroup[] = Array.isArray(data?.responseValue) ? data.response : []
        return arr
    },
    getAllAttributs: async (sectionId?: number, type?: string): Promise<AttributI18n[]> => {
        // Correct query construction: ?SectionId=29&Type=2 (no Type%3D)
        const params = new URLSearchParams()
        if (sectionId != null) params.set('SectionId', String(sectionId))
        if (type) params.set('Type', type) // was mistakenly 'Type=' before

        let url: string
        if (params.has('SectionId')) {
            // Desired form: Attributes/get-by-section-id?SectionId=29&Type=2
            url = `Attributes/get-by-section-id?${params.toString()}`
        } else if (params.has('Type')) {
            // Fallback when only type is provided
            url = `Attributes/get-by-filter?${params.toString()}`
        } else {
            // Generic fallback (adjust if backend has a different endpoint)
            url = 'Attributes/get-all-with-pagination?PageNumber=1&PageSize=1000'
        }

        const res = await axiosInstance.get(url)
        const data: any = res.data

        // Handle new API response format with responseValue array
        if (Array.isArray(data?.responseValue)) {
            return data.responseValue.map((item: any) => ({
                id: item.id,
                sectionId: item.sectionDto?.id ?? item.sectionId ?? 0,
                isActive: item.isActive,
                sortOrder: item.sortOrder ?? 0,
                valueType: item.valueType,
                isValuable: item.isValuable,
                isVisible: item.isVisible,
                isPrinted: item.isPrinted,
                isImportant: item.isImportant,
                name: item.name,
                sectionName: item.sectionDto?.title ?? null,
                
                // Aliases for existing UI
                isVisiable: item.isVisible,
                isImportand: item.isImportant,
                setCreateAttributeRequest: item.name ? [{ name: item.name, language: 'az' }] : undefined,
            }))
        }

        // If this endpoint also starts returning responseValue.items in future
        if (Array.isArray(data?.responseValue?.items)) {
            return (data.responseValue.items as any[]).map(it => ({
                id: it.id,
                sectionId: it.sectionId,
                isActive: it.isActive,
                sortOrder: it.sortOrder ?? 0,
                valueType: it.valueType,
                isValuable: it.isValuable,
                isVisible: it.isVisible,
                isPrinted: it.isPrinted,
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
            const setCreateAttributeRequest = Array.isArray(v.translations)
                ? v.translations.map((tr: any) => ({
                    id: tr?.id,
                    name: tr?.name ?? '',
                    language: tr?.language ?? ''
                }))
                : []

            return {
                id: v.id,
                sectionId: v.sectionId,
                valueType: v.valueType,
                isValuable: v.isValuable,
                isPrinted: v.isPrinted,
                isVisible: v.isVisible,
                isImportant: v.isImportant,
                isActive: v.isActive,
                name: v.name,
                attributeValueDtos: v.attributeValueDtos || [],

                // Aliases for existing UI
                isVisiable: v.isVisible,
                isImportand: v.isImportant,
                setCreateAttributeRequest,
            }
        }
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
        const response = await axiosInstance.post('AttributeValue/create', data)
        return response.data
    },
    editAttribut: async (data: UpdateAttributI18nRequest): Promise<any> => {
        const response = await axiosInstance.put('Attributes/update', data)
        return response.data
    },
    editAttributsQueue: async (data: UpdateAttributOrderPayload): Promise<void> => {
        await axiosInstance.put('Attribute/update-attribute-queue', data)
    },
    editAttributStatus: async (payload: {
        id: number
        valueType?: number
        isValuable?: boolean
        isPrinted?: boolean
        isVisible?: boolean
        isImportant?: boolean
        sectionId?: number
        isActive?: boolean
    }): Promise<void> => {
        const params = new URLSearchParams()
        params.set('Id', String(payload.id))
        if (payload.valueType != null) params.set('ValueType', String(payload.valueType))
        if (typeof payload.isValuable === 'boolean') params.set('IsValuable', String(payload.isValuable))
        if (typeof payload.isPrinted === 'boolean') params.set('IsPrinted', String(payload.isPrinted))
        if (typeof payload.isVisible === 'boolean') params.set('IsVisible', String(payload.isVisible))
        if (typeof payload.isImportant === 'boolean') params.set('IsImportant', String(payload.isImportant))
        if (payload.sectionId != null) params.set('SectionId', String(payload.sectionId))
        if (typeof payload.isActive === 'boolean') params.set('IsActive', String(payload.isActive))

        await axiosInstance.put(`Attributes/update?${params.toString()}`)
    },
    editAttributValue: async (data: UpdateAttributeValuesGroupRequest): Promise<any> => {
        const response = await axiosInstance.put("AttributeValues/update", data)
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