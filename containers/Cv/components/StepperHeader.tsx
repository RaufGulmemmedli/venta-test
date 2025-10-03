"use client"
import React from "react";
import { CheckCircle, Circle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  translations?: Array<{ title: string }>;
}

interface StepperHeaderProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  onBack?: () => void;
  title?: string;
  className?: string;
}

export function StepperHeader({ 
  steps, 
  currentStepIndex, 
  onStepClick, 
  onBack,
  title = "CV Yaratma",
  className 
}: StepperHeaderProps) {
  const isStepComplete = (index: number) => index < currentStepIndex;
  const isStepCurrent = (index: number) => index === currentStepIndex;
  const isStepClickable = (index: number) => index <= currentStepIndex;

  return (
    <div className={cn(
      "sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          {/* Header with back button and title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Geri qayıt"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {title}
              </h1>
            </div>
            
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">Addım</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                {currentStepIndex + 1}
              </span>
              <span>/{steps.length}</span>
            </div>
          </div>

          {/* Desktop Stepper */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => isStepClickable(index) && onStepClick(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        isStepClickable(index) && onStepClick(index);
                      }
                    }}
                    disabled={!isStepClickable(index)}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      isStepCurrent(index) && "bg-blue-600 border-blue-600 text-white focus:ring-blue-500",
                      isStepComplete(index) && "bg-green-600 border-green-600 text-white focus:ring-green-500",
                      !isStepCurrent(index) && !isStepComplete(index) && "bg-gray-100 border-gray-300 text-gray-400",
                      isStepClickable(index) && !isStepCurrent(index) && "hover:bg-gray-200 cursor-pointer",
                      !isStepClickable(index) && "cursor-not-allowed"
                    )}
                    aria-label={`Addım ${index + 1}${isStepComplete(index) ? ' (tamamlandı)' : isStepCurrent(index) ? ' (cari)' : ''}`}
                  >
                    {isStepComplete(index) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </button>
                  
                  <span className={cn(
                    "ml-3 text-sm font-medium transition-colors duration-200",
                    isStepCurrent(index) && "text-blue-600",
                    isStepComplete(index) && "text-green-600",
                    !isStepCurrent(index) && !isStepComplete(index) && "text-gray-500"
                  )}>
                    {step.translations?.[0]?.title || `Addım ${index + 1}`}
                  </span>
                  
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 mx-4 transition-colors duration-200",
                      index < currentStepIndex ? "bg-green-400" : "bg-gray-300"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Mobile Stepper */}
          <div className="lg:hidden">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                <span>Addım {currentStepIndex + 1}</span>
                <span>{steps.length} addımdan</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current step info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {steps[currentStepIndex]?.translations?.[0]?.title || `Addım ${currentStepIndex + 1}`}
                </h2>
              </div>
              
              {/* Step dots for touch navigation */}
              <div className="flex items-center space-x-1">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => isStepClickable(index) && onStepClick(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        isStepClickable(index) && onStepClick(index);
                      }
                    }}
                    disabled={!isStepClickable(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      isStepCurrent(index) && "bg-blue-600",
                      isStepComplete(index) && "bg-green-600",
                      !isStepCurrent(index) && !isStepComplete(index) && "bg-gray-300",
                      isStepClickable(index) && "cursor-pointer",
                      !isStepClickable(index) && "cursor-not-allowed"
                    )}
                    aria-label={`Addıma keç ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
