"use client"
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StepTransitionProps {
  children: React.ReactNode;
  stepIndex: number;
  direction?: 'forward' | 'backward';
  className?: string;
}

export function StepTransition({ 
  children, 
  stepIndex, 
  direction = 'forward',
  className 
}: StepTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(stepIndex);

  useEffect(() => {
    if (stepIndex !== currentStep) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [stepIndex, currentStep]);

  const slideClass = direction === 'forward' 
    ? 'translate-x-8 opacity-0' 
    : '-translate-x-8 opacity-0';

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "translate-x-0 opacity-100" : slideClass
      )}>
        {children}
      </div>
    </div>
  );
}

interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  className?: string;
}

export function FadeTransition({ 
  children, 
  show, 
  className 
}: FadeTransitionProps) {
  return (
    <div className={cn(
      "transition-all duration-300 ease-out",
      show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      className
    )}>
      {children}
    </div>
  );
}

interface ScaleTransitionProps {
  children: React.ReactNode;
  show: boolean;
  delay?: number;
  className?: string;
}

export function ScaleTransition({ 
  children, 
  show, 
  delay = 0,
  className 
}: ScaleTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, delay]);

  return (
    <div className={cn(
      "transition-all duration-300 ease-out",
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
      className
    )}>
      {children}
    </div>
  );
}

interface StaggeredAnimationProps {
  children: React.ReactNode[];
  show: boolean;
  staggerDelay?: number;
  className?: string;
}

export function StaggeredAnimation({ 
  children, 
  show, 
  staggerDelay = 100,
  className 
}: StaggeredAnimationProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ScaleTransition
          key={index}
          show={show}
          delay={index * staggerDelay}
        >
          {child}
        </ScaleTransition>
      ))}
    </div>
  );
}

interface ProgressAnimationProps {
  progress: number;
  className?: string;
}

export function ProgressAnimation({ 
  progress, 
  className 
}: ProgressAnimationProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div 
        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-1000 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        
        {/* Flowing particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full animate-bounce"
              style={{
                left: `${20 + i * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
