"use client"
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, Save, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onSaveDraft?: () => void;
  canProceed?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function FloatingActions({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  onCancel,
  onSaveDraft,
  canProceed = true,
  isLoading = false,
  className
}: FloatingActionsProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className={cn(
      "fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-4",
      className
    )}>
      {/* Secondary Actions */}
      <div className="flex items-center space-x-3">
        {/* Save Draft */}
        {onSaveDraft && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={isLoading}
            className={cn(
              "bg-white/80 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl",
              "text-gray-700 hover:text-gray-900",
              "transition-all duration-300 hover:scale-105"
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            Qaralama
          </Button>
        )}

        {/* Cancel */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            "bg-white/80 backdrop-blur-xl border-red-200/50 shadow-lg hover:shadow-xl",
            "text-red-600 hover:text-red-700 hover:bg-red-50/80",
            "transition-all duration-300 hover:scale-105"
          )}
        >
          <X className="w-4 h-4 mr-2" />
          Ləğv et
        </Button>
      </div>

      {/* Primary Navigation */}
      <div className="flex items-center space-x-3">
        {/* Previous Button */}
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isLoading}
            className={cn(
              "w-14 h-14 rounded-2xl",
              "bg-white/90 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl",
              "text-gray-700 hover:text-gray-900",
              "transition-all duration-300 hover:scale-110 active:scale-95",
              "group"
            )}
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-200" />
          </Button>
        )}

        {/* Next/Complete Button */}
        <Button
          onClick={isLastStep ? onComplete : onNext}
          disabled={!canProceed || isLoading}
          className={cn(
            "h-14 px-8 rounded-2xl font-semibold text-lg",
            "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700",
            "text-white shadow-xl hover:shadow-2xl",
            "transition-all duration-300 hover:scale-105 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
            "group relative overflow-hidden"
          )}
        >
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-600 to-cyan-600">
              <RotateCcw className="w-5 h-5 animate-spin" />
            </div>
          )}
          
          {!isLoading && (
            <>
              <span className="relative z-10">
                {isLastStep ? "Tamamla" : "Növbəti"}
              </span>
              {isLastStep ? (
                <Check className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" />
              )}
            </>
          )}

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Button>
      </div>
    </div>
  );
}

interface QuickActionsMenuProps {
  onReset?: () => void;
  onPreview?: () => void;
  onExport?: () => void;
  className?: string;
}

export function QuickActionsMenu({
  onReset,
  onPreview,
  onExport,
  className
}: QuickActionsMenuProps) {
  return (
    <div className={cn(
      "fixed bottom-8 left-8 z-50 flex flex-col space-y-3",
      className
    )}>
      {onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className={cn(
            "w-12 h-12 rounded-xl",
            "bg-white/80 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl",
            "text-gray-600 hover:text-red-600",
            "transition-all duration-300 hover:scale-105"
          )}
          title="Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
