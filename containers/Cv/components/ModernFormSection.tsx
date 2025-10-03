"use client"
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";

interface ModernFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isCompleted?: boolean;
  hasErrors?: boolean;
  className?: string;
}

export function ModernFormSection({ 
  title, 
  description, 
  children, 
  isCompleted = false,
  hasErrors = false,
  className 
}: ModernFormSectionProps) {
  return (
    <div className={cn(
      "group relative",
      "bg-white/60 backdrop-blur-xl border border-white/20",
      "rounded-3xl shadow-2xl shadow-black/5",
      "p-8 transition-all duration-500 hover:shadow-3xl hover:shadow-black/10",
      "hover:bg-white/70 hover:border-white/30",
      "animate-in slide-in-from-bottom-4 fade-in-0 duration-700",
      className
    )}>
      {/* Glassmorphism gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="relative mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                {title}
              </h3>
              
              {/* Status Indicator */}
              <div className={cn(
                "flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
                isCompleted && "bg-green-100 text-green-700 border border-green-200",
                hasErrors && "bg-red-100 text-red-700 border border-red-200",
                !isCompleted && !hasErrors && "bg-gray-100 text-gray-600 border border-gray-200"
              )}>
                {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                {hasErrors && <AlertCircle className="w-3 h-3" />}
                <span>
                  {isCompleted ? "Tamamlandı" : hasErrors ? "Diqqət tələb edir" : "Davam edir"}
                </span>
              </div>
            </div>
            
            {description && (
              <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          {/* Expand Indicator */}
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-all duration-300 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Bottom Border Accent */}
      <div className={cn(
        "absolute bottom-0 left-8 right-8 h-1 rounded-full transition-all duration-500",
        isCompleted && "bg-gradient-to-r from-green-400 to-emerald-500",
        hasErrors && "bg-gradient-to-r from-red-400 to-rose-500", 
        !isCompleted && !hasErrors && "bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-purple-400 group-hover:to-cyan-400"
      )} />
    </div>
  );
}

interface ModernFieldGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ModernFieldGroup({ 
  children, 
  columns = 2, 
  className 
}: ModernFieldGroupProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }[columns];

  return (
    <div className={cn("grid gap-6", gridClass, className)}>
      {children}
    </div>
  );
}

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlighted' | 'minimal';
}

export function ModernCard({ 
  children, 
  className,
  variant = 'default'
}: ModernCardProps) {
  const variants = {
    default: "bg-white/40 backdrop-blur-lg border border-white/20 shadow-lg hover:shadow-xl",
    highlighted: "bg-gradient-to-br from-purple-50/80 to-cyan-50/80 backdrop-blur-lg border border-purple-200/30 shadow-lg hover:shadow-xl",
    minimal: "bg-white/20 backdrop-blur-sm border border-white/10 shadow-sm hover:shadow-md"
  };

  return (
    <div className={cn(
      "rounded-2xl p-6 transition-all duration-300",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}
