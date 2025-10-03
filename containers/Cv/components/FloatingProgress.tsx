"use client"
import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Zap } from "lucide-react";

interface FloatingProgressProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  className?: string;
}

export function FloatingProgress({ 
  currentStep, 
  totalSteps, 
  progress,
  className 
}: FloatingProgressProps) {
  return (
    <div className={cn(
      "fixed top-6 right-6 z-50",
      "bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl",
      "rounded-2xl p-4 min-w-[200px]",
      "animate-in slide-in-from-top-2 fade-in-0 duration-500",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Tərəqqi</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {currentStep}/{totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Tamamlanma</span>
          <span className="text-sm font-bold text-gray-800">{Math.round(progress)}%</span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Mini Steps Indicator */}
      <div className="flex items-center justify-center space-x-1 mt-3">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index < currentStep && "bg-green-500 scale-110",
              index === currentStep && "bg-gradient-to-r from-purple-500 to-cyan-500 scale-125 shadow-lg",
              index > currentStep && "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface FloatingNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  className?: string;
}

export function FloatingNotification({ 
  message, 
  type = 'info', 
  visible,
  className 
}: FloatingNotificationProps) {
  if (!visible) return null;

  const styles = {
    success: "bg-green-500/90 text-white border-green-400/30",
    error: "bg-red-500/90 text-white border-red-400/30", 
    info: "bg-blue-500/90 text-white border-blue-400/30"
  };

  const icons = {
    success: CheckCircle2,
    error: Circle,
    info: Circle
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      "fixed top-20 right-6 z-50",
      "backdrop-blur-xl border shadow-2xl",
      "rounded-xl p-4 max-w-sm",
      "animate-in slide-in-from-top-2 fade-in-0 duration-300",
      styles[type],
      className
    )}>
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
