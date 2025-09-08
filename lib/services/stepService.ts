import { axiosInstance } from '@/lib/axios'

export interface CreateStepRequest {
    name: string
    context: number
    isActive: boolean
}
export interface UpdateStepRequest extends CreateStepRequest {
    id: number
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
}
export const stepService = {
    getSteps: async (params: StepsParams = {}): Promise<Step[]> => {
        const searchParams = new URLSearchParams()

        if (params.pageNumber != null) searchParams.set('PageNumber', String(params.pageNumber))
        if (params.pageSize != null) searchParams.set('PageSize', String(params.pageSize))
        if (params.value) searchParams.set('Value', params.value)
        if (typeof params.isActive === 'boolean') searchParams.set('isActive', String(params.isActive))

        const qs = searchParams.toString()
        const url = qs ? `Step?${qs}` : 'Step'

        const res = await axiosInstance.get<StepsListApiRaw>(url)
        return res.data.response || []
    },
    getAllSteps: async (context?: number): Promise<Step[]> => {
        const url = context != null ? `Step/allSteps?Context=${context}` : 'Step/allSteps'
        const res = await axiosInstance.get<StepsListApiRaw>(url)
        return res.data.response || []
    },
    getIdSteps: async (id: number): Promise<Step | any> => {
        const response = await axiosInstance.get(`Step/${id}`)
        return response.data
    },
    createStep: async (data: CreateStepRequest): Promise<Step | any> => {
        const response = await axiosInstance.post('Step/steps', data)
        return response.data
    },
    editStep: async (data: UpdateStepRequest): Promise<Step | any> => {
        const response = await axiosInstance.put('Step/steps', data)
        return response.data
    },
    editStepsQueue: async (data: CreateStepRequest[]): Promise<Step | any> => {
        const response = await axiosInstance.put('Step/stepsQueue', data)
        return response.data
    },
    editStepStatus: async (id: number, isActive: boolean): Promise<void> => {
        await axiosInstance.put(`Step/steps/${id}`, { isActive })
    },
    deleteStep: async (id: number): Promise<void> => {
        await axiosInstance.delete(`Step/steps/permanent/${id}`)
    }
}