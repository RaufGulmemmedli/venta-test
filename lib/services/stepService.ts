import { axiosInstance } from '@/lib/axios'

export interface CreateStepRequest {
    name: string
    context: number
    isActive: boolean
}
export interface createStepRequest {
    type: number
    isActive: boolean
    translations: {
        lang: string
        title: string
        description: string
    }[]
}
export interface UpdateStepRequest extends CreateStepRequest {
    id: number
}
export interface UpdateStepI18nRequest extends createStepRequest {
    id: number
}
// API-nin update üçün gözlədiyi payload
interface UpdateStepApiPayload {
    id: number
    type: number
    isActive: boolean
    stepSets: {
        title: string
        description: string | null
        language: string
    }[]
}

export interface StepResponse {
    id: number
    name: string
    context: number
}

export interface ApiResponse<T> {
    responseValue: T
    statusCode: number
    message: string
}

export interface Step {
    id: number
    name: string
    context: number
    order: number
    sections: any[]
}

export interface StepI18n {
    id: number
    type: number
    moduleName: string | null
    isActive: boolean
    sortOrder: number
    translations: {
        lang: string
        title: string
        description: string
    }[]
}
export interface StepsFilterResponse {
    response: {
        steps: StepI18n[]
    }
    statusCode: number
    description: string
    errorList: any
}

export interface StepsListApiRaw {
    response: Step[]
    statusCode: number
    errorCode: number
    description: string
    errorList: any
}
export interface StepsParams {
    pageNumber?: number
    pageSize?: number
    value?: string    
    isActive?: boolean
    type?: string
}
export interface EditStatus {
  StepId: number
}
export interface StepQueueItem { stepId: number; type: number }

export const stepService = {
    getSteps: async (params: StepsParams = {}): Promise<StepsFilterResponse> => {
        const searchParams = new URLSearchParams()

        if (params.pageNumber != null) searchParams.set('PageNumber', String(params.pageNumber))
        if (params.pageSize != null) searchParams.set('PageSize', String(params.pageSize))
        if (params.value) searchParams.set('SearchTerm', params.value)
        if (typeof params.isActive === 'boolean') searchParams.set('IsActive', String(params.isActive))
        if (params.type != null) searchParams.set('Type', String(params.type))
        const qs = searchParams.toString()
        const url = qs ? `Steps/get-all-with-pagination?${qs}` : 'Steps/get-all-with-pagination'
        const res = await axiosInstance.get<StepsFilterResponse>(url)
        return res.data
    },
    getAllSteps: async (type?: 'cv' | 'vakansiya' | '1' | '2'): Promise<StepI18n[]> => {
        const sp = new URLSearchParams()
        if (type) {
            const t = type === 'cv' ? '1' : type === 'vakansiya' ? '2' : String(type)
            sp.set('Type', t)
        }
        // bütün stepləri almaq üçün böyük page size
        sp.set('PageSize', '1000')
        const url = `Steps/get-all-with-pagination?${sp.toString()}`
        const res = await axiosInstance.get<ApiResponse<{ items: StepI18n[] }>>(url)
        
        // Handle new API response format
        if (res.data?.responseValue?.items) {
            return res.data.responseValue.items.map((item: any) => ({
                id: item.id,
                type: item.type,
                moduleName: null,
                isActive: item.isActive,
                sortOrder: item.sortOrder,
                translations: Array.isArray(item.translations) ? item.translations.map((tr: any) => ({
                    lang: tr.lang || '',
                    title: tr.title || '',
                    description: tr.description || ''
                })) : []
            }))
        }
        
        // Fallback for old format
        const arr = Array.isArray(res.data?.responseValue?.items) ? res.data.responseValue.items : []
        return arr
    },
    getIdSteps: async (id: number): Promise<Step | any> => {
        const response = await axiosInstance.get(`Steps/get-by-id?Id=${id}`)
        return response.data
    },
    createStep: async (data: createStepRequest): Promise<any> => {
        // expects:
        // {
        //   type: number,
        //   isActive: boolean,
        //   translations: [{ lang, title, description }]
        // }
        const response = await axiosInstance.post('Steps/create', data)
        return response.data
    },
    editStep: async (data: UpdateStepI18nRequest): Promise<any> => {
        // UI-dan gələn translations → API üçün stepSets çevrilir
        const apiPayload: UpdateStepApiPayload = {
            id: data.id,
            type: data.type,
            isActive: data.isActive,
            stepSets: (data.translations ?? []).map(t => ({
                title: t.title ?? '',
                description: t.description ?? null,
                language: t.lang ?? ''
            }))
        }
        const response = await axiosInstance.put('Steps/update', apiPayload)
        return response.data
    },
    editStepsQueue: async (data: StepQueueItem[]): Promise<void> => {
        // Server array sıradakı ardıcıllığa görə sortOrder müəyyən edə bilər
        await axiosInstance.put('Steps/update-queue', data)
    },
    editStepStatus: async (StepId: number, IsActive: boolean): Promise<void> => {
        await axiosInstance.put(`Steps/change-status?StepId=${StepId}`, IsActive)
    },
    deleteStep: async (id: number): Promise<void> => {
        await axiosInstance.delete(`Steps/delete?Id=${id}`)
    }
}