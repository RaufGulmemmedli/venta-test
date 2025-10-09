import { axiosInstance } from "@/lib/axios";
import { create } from "domain";
import { get } from "http";

export interface CvApiAttributeValue {
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
export interface CreateCvRequest {
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

export interface CreateCvMediaRequest {
    resumeId: number;
    files: {
        file: string | File | Blob;
        fileType: number; // 1 = image, 2 = video, etc.
    }[];
}
export interface CvApiSection {
    id: number;
    isActive: boolean;
    sortOrder: number;
    isChangeable: boolean;
    title: string;
    description: string | null;
    attributes: CvApiAttribute[];
}

export interface CvApiAttribute {
    attributeId: number;
    valueType: number;
    isValuable: boolean;
    isPrinted: boolean;
    isVisible: boolean;
    isImportant: boolean;
    isActive: boolean;
    isIncluded: boolean;
    order: number;
    name: string;
    values: CvApiAttributeValue[];
}

export interface CvTransformedSection {
    sectionId: number;
    title: string;
    isActive: boolean;
    sortOrder: number;
    isChangeable: boolean;
    attributes: CvAttribute[];
}

export interface CvStepData {
    stepId: number;
    stepName: string;
    sections: CvTransformedSection[];
}

export interface CvApiResponse {
    responseValue: CvApiSection[];
    statusCode: number;
    message: string;
}

export interface CvParams {
    pageNumber?: number
    pageSize?: number
    search?: string
    isActive?: boolean
    attributeDtos?: {
        id: number
        attributeValueIds: number[]
    }[]
}

export interface CvStep {
    id: number
    type: number
    sortOrder: number
    isActive: boolean
    title: string
    description: string | null
    sections: CvSection[]
}

export interface CvAttributeValueSet {
    language: string
    stringValue: string | null
    decimalValue: number | null
    dateTimeValue: string | null
    boolValue: boolean | null
}

export interface CvAttributeValue {
    attributeValueId: number
    display: string
    set?: CvAttributeValueSet  // Single set object from API
    sets: CvAttributeValueSet[] // Array of sets for compatibility
    languages?: { id: number; name: string; language: string; value: string }[] // For backwards compatibility
}

export interface CvAttribute {
    attributeId: number
    valueType: number
    isValuable: boolean
    isPrinted: boolean
    isVisible: boolean
    isImportant: boolean
    isActive: boolean
    isIncluded: boolean
    order: number
    name: string
    attributeSets?: { name: string }[]
    values: CvAttributeValue[]
}

export interface CvSection {
    id: number
    isActive: boolean
    sortOrder: number
    isChangeable: boolean
    title: string
    description: string | null
    attributes: CvAttribute[]
}

export interface CvItem {
    resumeId: number
    steps: CvStep[]
}

export interface CvListPage {
    items: CvItem[]
    pageNumber: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
}

export const cvService = {
    getCvData: async (stepId: number): Promise<CvStepData> => {
        const response = await axiosInstance.get<CvApiResponse>(`Sections/get-by-step-id?StepId=${stepId}`);
        
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
                isIncluded: attr.isIncluded,
                isVisible: attr.isVisible,
                isImportant: attr.isImportant,
                isActive: attr.isActive,
                order: attr.order,
                name: attr.name,
                attributeSets: [{ name: attr.name }], // Transform name to attributeSets format
                values: attr.values.map(value => ({
                    attributeValueId: value.attributeValueId,
                    display: value.display,
                    set: value.set,
                    sets: value.set ? [{
                        language: value.set.language,
                        stringValue: value.set.stringValue,
                        decimalValue: value.set.decimalValue,
                        dateTimeValue: value.set.dateTimeValue,
                        boolValue: value.set.boolValue
                    }] : [],
                    languages: [{
                        id: value.attributeValueId,
                        name: value.display,
                        language: value.set.language,
                        value: value.display
                    }]
                }))
            }))
        }));

        return {
            stepId: stepId,
            stepName: `Step ${stepId}`,
            sections: sections
        };
    },
    createCvData: async (data: CreateCvRequest): Promise<any> => {
        const response = await axiosInstance.post<any>('Resumes/create', data);
        return response.data;
    },
    getCvMedia: async (resumeId: number): Promise<any> => {
        const response = await axiosInstance.get<any>(`resumefile/get-by-resume-id?ResumeId=${resumeId}`);
        return response.data;
    },
    createCvMedia: async (resumeId: number, files: { file: File | Blob; fileType: number }[]): Promise<any> => {
        const formData = new FormData();
        formData.append('ResumeId', String(resumeId));
        
        // Add files to FormData according to API specification
        files.forEach((fileObj, index) => {
            // Generate a proper filename
            let filename = 'file';
            if (fileObj.file instanceof File) {
                filename = fileObj.file.name;
            } else {
                // For Blob, generate filename based on type
                const extension = fileObj.fileType === 1 ? 'jpg' : fileObj.fileType === 2 ? 'webm' : 'file';
                filename = `upload-${Date.now()}-${index}.${extension}`;
            }
            
            formData.append(`Files[${index}].file`, fileObj.file, filename);
            formData.append(`Files[${index}].fileType`, String(fileObj.fileType));
        });
        
        const response = await axiosInstance.post<any>('resumefile/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getAllCv: async (params: CvParams = {}): Promise<CvListPage> => {
        const searchParams = new URLSearchParams()
        searchParams.set('PageNumber', String(params.pageNumber ?? 1))
        searchParams.set('PageSize', String(params.pageSize ?? 10))
        
        if (params.search) {
            const searchTerms = params.search.split(',').map(term => term.trim()).filter(term => term.length > 0)
            if (searchTerms.length > 0) {
                searchParams.set('SearchTerm', searchTerms.join(','))
            }
        } else {
            searchParams.set('SearchTerm', '')
        }
        
        if (typeof params.isActive === 'boolean') searchParams.set('IsActive', String(params.isActive))

        if (params.attributeDtos && params.attributeDtos.length > 0) {
            params.attributeDtos.forEach((attrDto, index) => {
                searchParams.set(`AttributeDtos[${index}].id`, String(attrDto.id))
                attrDto.attributeValueIds.forEach((valueId, valueIndex) => {
                    searchParams.set(`AttributeDtos[${index}].attributeValueIds[${valueIndex}]`, String(valueId))
                })
            })
        }

        const url = `Resumes/get-all-with-pagination?${searchParams.toString()}`
        const res = await axiosInstance.get<any>(url)
        const rv = res.data?.responseValue

        const items: CvItem[] = Array.isArray(rv?.items)
            ? rv.items.map((item: any) => ({
                resumeId: item.resumeId,
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
    getCvById: async (id: number, stepId?: number): Promise<CvItem | null> => {
        let url = `Resumes/get-by-id?ResumeId=${id}`;
        if (stepId) {
            url += `&StepId=${stepId}`;
        }
        
        
        const res = await axiosInstance.get<any>(url)
        const rv = res.data?.responseValue

        if (!rv) return null

       
        const item: CvItem = {
            resumeId: rv.resumeId,
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
                        isIncluded: attr.isIncluded,
                        isVisible: attr.isVisible,
                        isImportant: attr.isImportant,
                        isActive: attr.isActive,
                        order: attr.order,
                        name: attr.name,
                        attributeSets: [{ name: attr.name }], 
                        values: (attr.values || []).map((value: any) => ({
                            attributeValueId: value.attributeValueId,
                            display: value.display,
                            set: value.set ? {
                                language: value.set.language,
                                stringValue: value.set.stringValue,
                                decimalValue: value.set.decimalValue,
                                dateTimeValue: value.set.dateTimeValue,
                                boolValue: value.set.boolValue
                            } : undefined,
                            sets: value.set ? [{
                                language: value.set.language,
                                stringValue: value.set.stringValue,
                                decimalValue: value.set.decimalValue,
                                dateTimeValue: value.set.dateTimeValue,
                                boolValue: value.set.boolValue
                            }] : []
                        }))
                    }))
                }))
            }))
        }

        return item
    },
        updateCv: async (data: any): Promise<any> => {
        const response = await axiosInstance.put<any>(`Resumes/update`, data);
        return response.data;
    },
    deleteCv: async (id: number): Promise<any> => {
        const response = await axiosInstance.delete<any>(`Resumes/delete?ResumeId=${id}`);
        return response.data;
    },
    deleteResumeFile: async (id: number): Promise<any> => {
        const response = await axiosInstance.delete<any>(`resumefile/delete?Id=${id}`);
        return response.data;
    }
};
