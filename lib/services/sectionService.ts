import { axiosInstance } from '@/lib/axios'

export interface CreateSectionRequest {
    name: string
    context: number
    isActive: boolean
}
export interface UpdateSectionRequest extends CreateSectionRequest {
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

export interface Section {
    name: string
    context: number
    order: number
    sections: any[]
}

export interface SectionsListApiRaw {
    response: Section[]
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
}
export const sectionService = {
    getSections: async (params: SectionsParams = {}): Promise<Section[]> => {
        const searchParams = new URLSearchParams()

        if (params.pageNumber != null) searchParams.set('PageNumber', String(params.pageNumber))
        if (params.pageSize != null) searchParams.set('PageSize', String(params.pageSize))
        if (params.value) searchParams.set('Value', params.value)
        if (typeof params.isActive === 'boolean') searchParams.set('isActive', String(params.isActive))

        const qs = searchParams.toString()
        const url = qs ? `Section?${qs}` : 'Section'

        const res = await axiosInstance.get<SectionsListApiRaw>(url)
        return res.data.response || []
    },
    getAllSections: async (context?: number): Promise<Section[]> => {
        const url = context != null ? `Section/byContext?TargetContext=${context}` : 'Section/allSections'
        const res = await axiosInstance.get<SectionsListApiRaw>(url)
        return res.data.response || []
    },
    getIdSections: async (id: number): Promise<Section | any> => {
        const response = await axiosInstance.get(`Section/${id}`)
        return response.data
    },
    createSection: async (data: CreateSectionRequest): Promise<Section | any> => {
        const response = await axiosInstance.post('Section', data)
        return response.data
    },
    editSection: async (data: UpdateSectionRequest): Promise<Section | any> => {
        const response = await axiosInstance.put('Section/', data)
        return response.data
    },
    editSectionsQueue: async (data: CreateSectionRequest[]): Promise<Section | any> => {
        const response = await axiosInstance.put('Section/queue', data)
        return response.data
    },
    editSectionStatus: async (id: number, isActive: boolean): Promise<void> => {
        await axiosInstance.put(`Section/status?request=${id}`, { isActive })
    },
    deleteSection: async (id: number): Promise<void> => {
        await axiosInstance.delete(`Section/${id}`)
    }
}