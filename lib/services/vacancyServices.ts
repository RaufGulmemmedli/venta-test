import { axiosInstance } from "@/lib/axios";

export interface VacancyApiAttributeValue {
    attributeValueId: number;
    display: string;
    set: {
        language: string;
        stringValue: string | null;
        decimalValue: number | null;
        dateTimeValue: string | null;
        boolValue: boolean | null;
    };
}

export interface VacancyAttributeValue {
    attributeValueId: number;
    languages: { id: number; name: string; language: string; value: string }[];
}

export interface VacancyAttribute {
    attributeId: number;
    valueType: number;
    isValuable: boolean;
    isPrinted: boolean;
    isVisible: boolean;
    isImportant: boolean;
    isActive: boolean;
    order: number;
    name: string;
    attributeSets: { name: string }[];
    values: VacancyAttributeValue[];
}

export interface CreateVacancyRequest {
    sectionDtos: {
        sectionId: number;
        attributes: {
            attributeId: number;
            attributeValueIds: number[];
            inputValue: {
                value: string;
                language: string;
            }[];
        }[];
    }[];
}

export interface VacancyApiSection {
    id: number;
    isActive: boolean;
    sortOrder: number;
    isChangeable: boolean;
    title: string;
    description: string | null;
    attributes: VacancyApiAttribute[];
}

export interface VacancyApiAttribute {
    attributeId: number;
    valueType: number;
    isValuable: boolean;
    isPrinted: boolean;
    isVisible: boolean;
    isImportant: boolean;
    isActive: boolean;
    order: number;
    name: string;
    values: VacancyApiAttributeValue[];
}

export interface VacancyTransformedSection {
    sectionId: number;
    title: string;
    isActive: boolean;
    sortOrder: number;
    isChangeable: boolean;
    attributes: VacancyAttribute[];
}

export interface VacancyStepData {
    stepId: number;
    stepName: string;
    sections: VacancyTransformedSection[];
}

export interface VacancyApiResponse {
    responseValue: VacancyApiSection[];
    statusCode: number;
    message: string;
}

export interface VacancyParams {
    pageNumber?: number
    pageSize?: number
    search?: string
    isActive?: boolean
    attributeDtos?: {
        id: number
        attributeValueIds: number[]
    }[]
}

export interface VacancyStep {
    id: number
    type: number
    sortOrder: number
    isActive: boolean
    title: string
    description: string | null
    sections: VacancySection[]
}

export interface VacancyAttributeValueSet {
    language: string
    stringValue: string | null
    decimalValue: number | null
    dateTimeValue: string | null
    boolValue: boolean | null
}

export interface VacancyAttributeValue {
    attributeValueId: number
    display: string
    sets: VacancyAttributeValueSet[]
}

export interface VacancyAttribute {
    attributeId: number
    valueType: number
    isValuable: boolean
    isPrinted: boolean
    isVisible: boolean
    isImportant: boolean
    isActive: boolean
    order: number
    name: string
    values: VacancyAttributeValue[]
}

export interface VacancySection {
    id: number
    isActive: boolean
    sortOrder: number
    isChangeable: boolean
    title: string
    description: string | null
    attributes: VacancyAttribute[]
}

export interface VacancyItem {
    vacancyId: number
    steps: VacancyStep[]
}

export interface VacancyListPage {
    items: VacancyItem[]
    pageNumber: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
}

export const vacancyService = {
    getVacancyData: async (stepId: number): Promise<VacancyStepData> => {
        const response = await axiosInstance.get<VacancyApiResponse>(`Sections/get-by-step-id?StepId=${stepId}`);
        
        // Transform the new API response format to the expected format
        const sections = response.data.responseValue.map(section => ({
            sectionId: section.id,
            title: section.title,
            isActive: section.isActive,
            sortOrder: section.sortOrder,
            isChangeable: section.isChangeable,
            attributes: section.attributes.map(attr => ({
                attributeId: attr.attributeId,
                valueType: attr.valueType,
                isValuable: attr.isValuable,
                isPrinted: attr.isPrinted,
                isVisible: attr.isVisible,
                isImportant: attr.isImportant,
                isActive: attr.isActive,
                order: attr.order,
                name: attr.name,
                attributeSets: [{ name: attr.name }], // Transform name to attributeSets format
                values: attr.values.map(value => ({
                    attributeValueId: value.attributeValueId,
                    display: value.display,
                    languages: [{
                        id: value.attributeValueId,
                        name: value.display,
                        language: value.set.language,
                        value: value.display
                    }],
                    sets: [{
                        language: value.set.language,
                        stringValue: value.set.stringValue,
                        decimalValue: value.set.decimalValue,
                        dateTimeValue: value.set.dateTimeValue,
                        boolValue: value.set.boolValue
                    }]
                }))
            }))
        }));

        return {
            stepId: stepId,
            stepName: `Step ${stepId}`,
            sections: sections as VacancyTransformedSection[]
        };
    },
    createVacancyData: async (data: CreateVacancyRequest): Promise<any> => {
        const response = await axiosInstance.post<any>('Vacancies/create', data);
        return response.data;
    },
    getAllVacancies: async (params: VacancyParams = {}): Promise<VacancyListPage> => {
        const searchParams = new URLSearchParams()
        searchParams.set('PageNumber', String(params.pageNumber ?? 1))
        searchParams.set('PageSize', String(params.pageSize ?? 10))
       
        // Handle comma-separated search terms
        if (params.search) {
            const searchTerms = params.search.split(',').map(term => term.trim()).filter(term => term.length > 0)
            if (searchTerms.length > 0) {
                // Join multiple search terms with comma for API
                searchParams.set('SearchTerm', searchTerms.join(','))
            }
        } else {
            searchParams.set('SearchTerm', '')
        }
        
        if (typeof params.isActive === 'boolean') searchParams.set('IsActive', String(params.isActive))

        // Handle AttributeDtos parameter
        if (params.attributeDtos && params.attributeDtos.length > 0) {
            params.attributeDtos.forEach((attrDto, index) => {
                searchParams.set(`AttributeDtos[${index}].id`, String(attrDto.id))
                attrDto.attributeValueIds.forEach((valueId, valueIndex) => {
                    searchParams.set(`AttributeDtos[${index}].attributeValueIds[${valueIndex}]`, String(valueId))
                })
            })
        }

        const url = `Vacancies/get-all-with-pagination?${searchParams.toString()}`
        const res = await axiosInstance.get<any>(url)
        const rv = res.data?.responseValue

        // Handle the new API response format - keep the raw structure as it comes from API
        const items: VacancyItem[] = Array.isArray(rv?.items)
            ? rv.items.map((item: any) => ({
                vacancyId: item.vacancyId,
                steps: item.steps || []
              }))
            : []

        return {
            items,
            pageNumber: rv?.pageNumber ?? 1,
            totalPages: rv?.totalPages ?? 1,
            pageSize: rv?.pageSize ?? items.length,
            totalCount: rv?.totalCount ?? items.length,
            hasPreviousPage: rv?.hasPreviousPage ?? false,
            hasNextPage: rv?.hasNextPage ?? false,
        }
    },
    getVacancyById: async (id: number, stepId?: number): Promise<VacancyItem | null> => {
        let url = `Vacancies/get-by-id?VacancyId=${id}`;
        if (stepId) {
            url += `&StepId=${stepId}`;
        }
        
        const res = await axiosInstance.get<any>(url)
        const rv = res.data?.responseValue

        if (!rv) return null

        // Transform the response to VacancyItem format
        const item: VacancyItem = {
            vacancyId: rv.vacancyId,
            steps: (rv.steps || []).map((step: any) => ({
                id: step.id,
                type: step.type,
                sortOrder: step.sortOrder,
                isActive: step.isActive,
                title: step.title,
                description: step.description,
                sections: (step.sections || []).map((section: any) => ({
                    id: section.id,
                    isActive: section.isActive,
                    sortOrder: section.sortOrder,
                    isChangeable: section.isChangeable,
                    title: section.title,
                    description: section.description,
                    attributes: (section.attributes || []).map((attr: any) => ({
                        attributeId: attr.attributeId,
                        valueType: attr.valueType,
                        isValuable: attr.isValuable,
                        isPrinted: attr.isPrinted,
                        isVisible: attr.isVisible,
                        isImportant: attr.isImportant,
                        isActive: attr.isActive,
                        order: attr.order,
                        name: attr.name,
                        attributeSets: [{ name: attr.name }], // Add attributeSets for compatibility
                        values: (attr.values || []).map((value: any) => ({
                            attributeValueId: value.attributeValueId,
                            display: value.display,
                            sets: (value.sets || []).map((set: any) => ({
                                language: set.language,
                                stringValue: set.stringValue,
                                decimalValue: set.decimalValue,
                                dateTimeValue: set.dateTimeValue,
                                boolValue: set.boolValue
                            }))
                        }))
                    }))
                }))
            }))
        }

        return item
    },
    updateVacancy: async (data: any): Promise<any> => {
        const response = await axiosInstance.put<any>(`Vacancies/update`, data);
        return response.data;
    },
    deleteVacancy: async (id: number): Promise<any> => {
        const response = await axiosInstance.delete<any>(`Vacancies/delete?VacancyId=${id}`);
        return response.data;
    }
};
