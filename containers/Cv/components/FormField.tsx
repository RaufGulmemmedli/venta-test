"use client"
import React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  isRequired?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormField({ 
  label, 
  isRequired = false, 
  error, 
  children, 
  className,
  id 
}: FormFieldProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-900 leading-5"
      >
        {label}
        {isRequired && (
          <span 
            className="text-red-500 ml-1" 
            aria-label="required field"
          >
            *
          </span>
        )}
      </label>
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, { 
          id: fieldId,
          "aria-invalid": error ? "true" : "false",
          "aria-describedby": error ? `${fieldId}-error` : undefined,
        })}
      </div>
      {error && (
        <p 
          id={`${fieldId}-error`}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
