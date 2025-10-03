"use client"
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "./FormField";
import { InputRenderer } from "./InputRenderer";
import { FormGrid } from "./FormWrapper";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: {
    sectionId: number;
    title: string;
    attributes: Array<{
      attributeId: number;
      valueType: number;
      isInportant: boolean;
      attributeSets?: Array<{ name: string }>;
      values?: any[];
    }>;
  };
  formData: { [key: string]: any };
  onFieldChange: (attributeId: number, value: any) => void;
  errors?: { [key: string]: string };
  className?: string;
}

export function SectionCard({ 
  section, 
  formData, 
  onFieldChange, 
  errors = {},
  className 
}: SectionCardProps) {
  const getFieldError = (attributeId: number, isRequired: boolean) => {
    if (errors[attributeId]) return errors[attributeId];
    
    if (isRequired && !formData[attributeId]) {
      return "Bu sahə tələb olunur";
    }
    
    if (isRequired && Array.isArray(formData[attributeId]) && formData[attributeId].length === 0) {
      return "Bu sahə tələb olunur";
    }
    
    return undefined;
  };

  return (
    <Card className={cn(
      "border-0 shadow-lg bg-white rounded-xl overflow-hidden",
      "transition-all duration-200 hover:shadow-xl",
      className
    )}>
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
          <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
          {section.title || `Section ${section.sectionId}`}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <FormGrid columns={2}>
          {section.attributes.map((attribute) => {
            const attributeSet = attribute.attributeSets?.[0];
            const label = attributeSet?.name || `Attribute ${attribute.attributeId}`;
            const fieldError = getFieldError(attribute.attributeId, attribute.isInportant);
            
            return (
              <FormField
                key={attribute.attributeId}
                label={label}
                isRequired={attribute.isInportant}
                error={fieldError}
                className={cn(
                  // Full width for certain field types
                  (attribute.valueType === 4 || // TextArea
                   attribute.valueType === 3 || // Radio
                   attribute.valueType === 6 || // Multiselect
                   attribute.valueType === 8    // DateRange
                  ) && "md:col-span-2"
                )}
              >
                <InputRenderer
                  attribute={attribute}
                  value={formData[attribute.attributeId]}
                  onChange={(value) => onFieldChange(attribute.attributeId, value)}
                />
              </FormField>
            );
          })}
        </FormGrid>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title = "Məlumat tapılmadı",
  description = "Bu addım üçün məlumat mövcud deyil",
  icon,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 p-3 bg-gray-100 rounded-full">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 max-w-md">
        {description}
      </p>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ 
  message = "Məlumatlar yüklənir...",
  className 
}: LoadingStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      className
    )}>
      <div className="relative mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <p className="text-gray-600 font-medium">
        {message}
      </p>
    </div>
  );
}
