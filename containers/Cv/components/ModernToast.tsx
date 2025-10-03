"use client"
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, X, Zap } from "lucide-react";

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  visible: boolean;
  onClose?: () => void;
  className?: string;
}

export function ModernToast({ 
  message, 
  type = 'info', 
  duration = 5000,
  visible,
  onClose,
  className 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsLeaving(false);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: "bg-gradient-to-r from-green-500/90 to-emerald-500/90",
      border: "border-green-400/30",
      icon: CheckCircle2,
      iconColor: "text-white"
    },
    error: {
      bg: "bg-gradient-to-r from-red-500/90 to-rose-500/90",
      border: "border-red-400/30",
      icon: AlertCircle,
      iconColor: "text-white"
    },
    warning: {
      bg: "bg-gradient-to-r from-yellow-500/90 to-orange-500/90",
      border: "border-yellow-400/30",
      icon: AlertCircle,
      iconColor: "text-white"
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500/90 to-cyan-500/90",
      border: "border-blue-400/30",
      icon: Info,
      iconColor: "text-white"
    }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={cn(
      "fixed top-6 right-6 z-50 max-w-sm",
      "backdrop-blur-xl border shadow-2xl rounded-2xl p-4",
      "text-white transition-all duration-300 ease-out",
      style.bg,
      style.border,
      isLeaving 
        ? "opacity-0 translate-x-full scale-95" 
        : "opacity-100 translate-x-0 scale-100",
      "animate-in slide-in-from-top-2 fade-in-0",
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={cn("w-5 h-5", style.iconColor)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar for timed toasts */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white/50 transition-all ease-linear"
            style={{ 
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

interface ToastManagerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  }>;
  onRemove: (id: string) => void;
  className?: string;
}

export function ToastManager({ 
  toasts, 
  onRemove, 
  className 
}: ToastManagerProps) {
  return (
    <div className={cn("fixed top-6 right-6 z-50 space-y-3", className)}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index 
          }}
        >
          <ModernToast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            visible={true}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToastManager() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  }>>([]);

  const addToast = (
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
  };
}

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  className?: string;
}

export function SuccessAnimation({ 
  show, 
  onComplete,
  className 
}: SuccessAnimationProps) {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-black/20 backdrop-blur-sm",
      "animate-in fade-in-0 duration-300",
      className
    )}>
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-50 duration-500">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-400 rounded-full animate-ping opacity-30" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">Uğurlu!</h3>
            <p className="text-gray-600">CV-niz uğurla yaradıldı</p>
          </div>

          {/* Confetti animation */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
