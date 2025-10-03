"use client"
import React from "react";
import { cn } from "@/lib/utils";

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  noValidate?: boolean;
}

export function FormWrapper({ 
  children, 
  onSubmit, 
  className,
  noValidate = true 
}: FormWrapperProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      noValidate={noValidate}
      className={cn("space-y-6", className)}
      role="form"
    >
      {children}
    </form>
  );
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className 
}: FormSectionProps) {
  const sectionId = `section-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <section 
      className={cn("space-y-6", className)}
      aria-labelledby={title ? `${sectionId}-title` : undefined}
      aria-describedby={description ? `${sectionId}-description` : undefined}
    >
      {title && (
        <div className="space-y-2">
          <h3 
            id={`${sectionId}-title`}
            className="text-xl font-semibold text-gray-900 leading-7"
          >
            {title}
          </h3>
          {description && (
            <p 
              id={`${sectionId}-description`}
              className="text-sm text-gray-600 leading-5"
            >
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGrid({ 
  children, 
  columns = 2, 
  className 
}: FormGridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }[columns];

  return (
    <div className={cn("grid gap-6", gridClass, className)}>
      {children}
    </div>
  );
}
