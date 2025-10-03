"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationButtonsProps {
  currentStepIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onComplete: () => void;
  isLoading?: boolean;
  canProceed?: boolean;
  className?: string;
}

export function NavigationButtons({
  currentStepIndex,
  totalSteps,
  onPrevious,
  onNext,
  onCancel,
  onComplete,
  isLoading = false,
  canProceed = true,
  className
}: NavigationButtonsProps) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className={cn(
      "sticky bottom-0 bg-white border-t border-gray-200 shadow-lg",
      "px-4 sm:px-6 lg:px-8 py-4",
      className
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Cancel button */}
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Ləğv et</span>
          </Button>

          {/* Navigation buttons */}
          <div className="flex items-center space-x-3">
            {/* Previous button */}
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isFirstStep || isLoading}
              className={cn(
                "flex items-center space-x-2 transition-all duration-200",
                "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Əvvəlki</span>
            </Button>

            {/* Next/Complete button */}
            {isLastStep ? (
              <Button
                onClick={onComplete}
                disabled={!canProceed || isLoading}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-200",
                  "bg-green-600 hover:bg-green-700 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                )}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Tamamla</span>
              </Button>
            ) : (
              <Button
                onClick={onNext}
                disabled={!canProceed || isLoading}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-200",
                  "bg-blue-600 hover:bg-blue-700 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                )}
              >
                <span>Növbəti</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress indicator for mobile */}
        <div className="mt-3 sm:hidden">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Addım {currentStepIndex + 1}</span>
            <span>{totalSteps} addımdan</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionsProps {
  onSaveDraft?: () => void;
  onReset?: () => void;
  className?: string;
}

export function QuickActions({ 
  onSaveDraft, 
  onReset, 
  className 
}: QuickActionsProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {onSaveDraft && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveDraft}
          className="text-gray-600 hover:text-gray-800 text-xs"
        >
          Qaralama olaraq saxla
        </Button>
      )}
      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-red-600 hover:text-red-800 text-xs"
        >
          Sıfırla
        </Button>
      )}
    </div>
  );
}
