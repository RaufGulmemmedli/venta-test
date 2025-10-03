"use client"
import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ArrowLeft, User, Briefcase, GraduationCap, Award, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  id: number;
  translations?: Array<{ title: string }>;
}

interface ModernSidebarProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  onBack: () => void;
  progress: number;
  className?: string;
}

const stepIcons = [
  User,
  Briefcase, 
  GraduationCap,
  Award,
  Phone,
  MapPin
];

export function ModernSidebar({ 
  steps, 
  currentStepIndex, 
  onStepClick, 
  onBack,
  progress,
  className 
}: ModernSidebarProps) {
  
  return (
    <div className={cn(
      "w-80 h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 flex flex-col",
      "shadow-2xl border-r border-white/10",
      className
    )}>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 text-white/70 hover:text-white hover:bg-white/10 p-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            CV Yaradın
          </h1>
          <p className="text-white/60 text-sm">
            Peşəkar CV-nizi addım-addım yaradın
          </p>
        </div>
      </div>

      {/* Progress Circle */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="flex-1 space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isClickable = index <= currentStepIndex;
          const Icon = stepIcons[index] || Circle;
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={cn(
                "w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 text-left group",
                isCurrent && "bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-400/30 shadow-lg",
                isCompleted && !isCurrent && "bg-white/5 hover:bg-white/10 border border-white/10",
                !isCompleted && !isCurrent && "text-white/40 cursor-not-allowed",
                isClickable && !isCurrent && "hover:bg-white/5 cursor-pointer"
              )}
            >
              {/* Step Icon */}
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300",
                isCurrent && "bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg",
                isCompleted && !isCurrent && "bg-green-500",
                !isCompleted && !isCurrent && "bg-white/10"
              )}>
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={cn(
                    "w-5 h-5",
                    isCurrent && "text-white",
                    isCompleted && !isCurrent && "text-white",
                    !isCompleted && !isCurrent && "text-white/40"
                  )} />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium transition-colors duration-300",
                  isCurrent && "text-white",
                  isCompleted && !isCurrent && "text-white/90",
                  !isCompleted && !isCurrent && "text-white/40"
                )}>
                  {step.translations?.[0]?.title || `Addım ${index + 1}`}
                </div>
                <div className={cn(
                  "text-xs mt-1 transition-colors duration-300",
                  isCurrent && "text-purple-200",
                  isCompleted && !isCurrent && "text-green-300",
                  !isCompleted && !isCurrent && "text-white/30"
                )}>
                  {isCompleted && !isCurrent && "Tamamlandı"}
                  {isCurrent && "Cari addım"}
                  {!isCompleted && !isCurrent && "Gözləyir"}
                </div>
              </div>

              {/* Step Number */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                isCurrent && "bg-white/20 text-white",
                isCompleted && !isCurrent && "bg-green-500/20 text-green-300",
                !isCompleted && !isCurrent && "bg-white/5 text-white/30"
              )}>
                {index + 1}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Addım</span>
          <span className="text-white font-medium">
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>
        <div className="mt-2 w-full bg-white/10 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
