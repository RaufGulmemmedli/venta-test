import { axiosInstance } from "@/lib/axios";

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

export interface CvAttributeValue {
    attributeValueId: number;
    languages: { id: number; name: string; language: string; value: string }[];
}

export interface CvAttribute {
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
    values: CvAttributeValue[];
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
    order: number;
    name: string;
    values: CvApiAttributeValue[];
}

export interface CvTransformedSection {
    sectionId: number;
    title: string;
    isActive: boolean;
    sortOrder: number;
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

export const cvService = {
    getCvData: async (stepId: number): Promise<CvStepData> => {
        const response = await axiosInstance.get<CvApiResponse>(`Sections/get-by-step-id?StepId=${stepId}`);
        
        // Transform the new API response format to the expected format
        const sections = response.data.responseValue.map(section => ({
            sectionId: section.id,
            title: section.title,
            isActive: section.isActive,
            sortOrder: section.sortOrder,
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
};
