"use client"
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface ModernFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'multiselect' | 'date' | 'daterange' | 'color' | 'range';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function ModernField({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder,
  required = false,
  error,
  disabled = false,
  className
}: ModernFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value !== undefined && value !== '' && value !== null;
  const isFloating = isFocused || hasValue;

  const baseInputClass = cn(
    "w-full h-14 px-4 pt-6 pb-2 text-base",
    "bg-white/60 backdrop-blur-sm border border-gray-200/50",
    "rounded-2xl transition-all duration-300",
    "focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20",
    "focus:bg-white/80 focus:backdrop-blur-md",
    "hover:border-gray-300/70 hover:bg-white/70",
    "placeholder-transparent",
    error && "border-red-400 focus:border-red-400 focus:ring-red-400/20",
    disabled && "opacity-50 cursor-not-allowed"
  );

  const labelClass = cn(
    "absolute left-4 transition-all duration-300 pointer-events-none",
    "text-gray-600 font-medium",
    isFloating 
      ? "top-2 text-xs text-purple-600" 
      : "top-1/2 -translate-y-1/2 text-base",
    error && isFloating && "text-red-600",
    disabled && "text-gray-400"
  );

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <div className="relative">
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              className={cn(baseInputClass, "min-h-[120px] resize-none")}
              placeholder=" "
            />
            <label className={labelClass}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );

      case 'select':
        return (
          <div className="relative">
            <Select 
              value={value || ''} 
              onValueChange={onChange}
              disabled={disabled}
            >
              <SelectTrigger className={cn(baseInputClass, "justify-between")}>
                <div className="flex-1 text-left pt-2">
                  {value && (
                    <div className="text-base text-gray-900">
                      {options.find(opt => opt.value === value)?.label || value}
                    </div>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl">
                {options.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="hover:bg-purple-50 focus:bg-purple-50 rounded-lg mx-1"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className={cn(labelClass, (value || isFocused) && "top-2 text-xs text-purple-600")}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-3">
              {options.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-2xl cursor-pointer transition-all duration-300",
                    "bg-white/40 backdrop-blur-sm border border-gray-200/50 hover:border-purple-300/70",
                    "hover:bg-white/60 hover:shadow-md",
                    value === option.value && "border-purple-400 bg-purple-50/60 shadow-md"
                  )}
                >
                  <input
                    type="radio"
                    name={label}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-gray-800 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-3">
              {options.map((option) => {
                const isChecked = Array.isArray(value) && value.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-2xl cursor-pointer transition-all duration-300",
                      "bg-white/40 backdrop-blur-sm border border-gray-200/50 hover:border-purple-300/70",
                      "hover:bg-white/60 hover:shadow-md",
                      isChecked && "border-purple-400 bg-purple-50/60 shadow-md"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const newValue = Array.isArray(value) ? [...value] : [];
                        if (checked) {
                          newValue.push(option.value);
                        } else {
                          const index = newValue.indexOf(option.value);
                          if (index > -1) newValue.splice(index, 1);
                        }
                        onChange(newValue);
                      }}
                      disabled={disabled}
                    />
                    <span className="text-gray-800 font-medium flex-1">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <label className={cn(
            "flex items-center space-x-3 p-4 rounded-2xl cursor-pointer transition-all duration-300",
            "bg-white/40 backdrop-blur-sm border border-gray-200/50 hover:border-purple-300/70",
            "hover:bg-white/60 hover:shadow-md",
            value && "border-purple-400 bg-purple-50/60 shadow-md"
          )}>
            <Checkbox
              checked={value || false}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <span className="text-gray-800 font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </span>
          </label>
        );

      case 'daterange':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  type="date"
                  value={value?.start || ''}
                  onChange={(e) => onChange({ ...value, start: e.target.value })}
                  disabled={disabled}
                  className={baseInputClass}
                />
                <label className="absolute left-4 top-2 text-xs text-purple-600 font-medium">
                  Başlama tarixi
                </label>
              </div>
              <div className="relative">
                <Input
                  type="date"
                  value={value?.end || ''}
                  onChange={(e) => onChange({ ...value, end: e.target.value })}
                  disabled={disabled}
                  className={baseInputClass}
                />
                <label className="absolute left-4 top-2 text-xs text-purple-600 font-medium">
                  Bitmə tarixi
                </label>
              </div>
            </div>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="px-4">
              <input
                type="range"
                min="0"
                max="100"
                value={value || 0}
                onChange={(e) => onChange(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${value || 0}%, #E5E7EB ${value || 0}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0</span>
                <span className="font-semibold text-purple-600">{value || 0}%</span>
                <span>100</span>
              </div>
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="relative">
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
              />
              <Input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                disabled={disabled}
                className={baseInputClass}
              />
            </div>
            <label className={labelClass}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              className={cn(baseInputClass, "pr-12")}
              placeholder=" "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <label className={labelClass}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );

      default:
        return (
          <div className="relative">
            <Input
              type={type}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              className={baseInputClass}
              placeholder=" "
            />
            <label className={labelClass}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );
    }
  };

  return (
    <div className={cn("relative", className)}>
      {renderInput()}
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm animate-in slide-in-from-top-1 fade-in-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Indicator */}
      {!error && required && hasValue && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      )}
    </div>
  );
}
