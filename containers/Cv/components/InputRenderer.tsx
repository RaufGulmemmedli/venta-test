"use client"
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface InputRendererProps {
  attribute: any;
  value: any;
  onChange: (value: any) => void;
  className?: string;
  id?: string;
}

export function InputRenderer({ 
  attribute, 
  value, 
  onChange, 
  className,
  id 
}: InputRendererProps) {
  const { attributeId, valueType, attributeSets, values } = attribute;
  const currentValue = value || '';
  
  const attributeSet = attributeSets?.[0];
  const placeholder = attributeSet?.name || "Dəyər daxil edin";

  const baseInputClass = cn(
    "w-full transition-all duration-200",
    "border-gray-300 rounded-lg",
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
    "focus:outline-none focus-visible:outline-none",
    "placeholder:text-gray-400",
    "disabled:bg-gray-50 disabled:text-gray-500",
    className
  );

  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = '44px';
    el.style.height = Math.max(44, el.scrollHeight) + 'px';
  };

  const handleChange = (e: any) => {
    onChange(e.target?.value || e);
  };

  switch (valueType) {
    case 1: // String
      return (
        <Input
          id={id}
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={baseInputClass}
        />
      );

    case 2: // Number
      return (
        <Input
          id={id}
          type="number"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={baseInputClass}
        />
      );

    case 3: // Radio
      return (
        <div className="space-y-3" role="radiogroup">
          {values[0]?.languages?.map((lang: any, index: number) => {
            const optionValue = lang.value || lang.name;
            const isSelected = currentValue === optionValue;
            const optionId = `${id}-option-${index}`;
            
            return (
              <label 
                key={index} 
                htmlFor={optionId}
                className={cn(
                  "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200",
                  "hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500/20",
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={`attr_${attributeId}`}
                  value={optionValue}
                  checked={isSelected}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className={cn(
                  "text-sm font-medium flex-1",
                  isSelected ? 'text-blue-700' : 'text-gray-700'
                )}>
                  {optionValue}
                </span>
              </label>
            );
          })}
        </div>
      );

    case 4: // TextArea
      return (
        <Textarea
          id={id}
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          rows={1}
          style={{
            height: '44px',
            minHeight: '44px',
            resize: 'vertical',
            overflow: 'hidden'
          }}
          onInput={autoResize}
          className={cn(baseInputClass, "min-h-[44px]")}
        />
      );

    case 5: // Select
      return (
        <Select value={currentValue} onValueChange={onChange}>
          <SelectTrigger id={id} className={baseInputClass}>
            <SelectValue placeholder="Seçin..." />
          </SelectTrigger>
          <SelectContent>
            {values[0]?.languages?.map((lang: any, index: number) => (
              <SelectItem key={index} value={lang.value || lang.name}>
                {lang.value || lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 6: // Multiselect
      return (
        <div className="space-y-3">
          {values[0]?.languages?.map((lang: any, index: number) => {
            const optionValue = lang.value || lang.name;
            const isChecked = Array.isArray(currentValue) && currentValue.includes(optionValue);
            const optionId = `${id}-checkbox-${index}`;
            
            return (
              <label 
                key={index} 
                htmlFor={optionId}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-500/20"
              >
                <Checkbox
                  id={optionId}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
                    if (checked) {
                      newValue.push(optionValue);
                    } else {
                      const i = newValue.indexOf(optionValue);
                      if (i > -1) newValue.splice(i, 1);
                    }
                    onChange(newValue);
                  }}
                />
                <span className="text-sm font-medium text-gray-700 flex-1">
                  {optionValue}
                </span>
              </label>
            );
          })}
        </div>
      );

    case 7: // Date
      return (
        <Input
          id={id}
          type="date"
          value={currentValue}
          onChange={handleChange}
          className={baseInputClass}
        />
      );

    case 8: // DateRange
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-medium">Başlama tarixi</label>
            <Input
              type="date"
              value={currentValue?.start || ''}
              onChange={(e) => onChange({ ...currentValue, start: e.target.value })}
              className={baseInputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-medium">Bitmə tarixi</label>
            <Input
              type="date"
              value={currentValue?.end || ''}
              onChange={(e) => onChange({ ...currentValue, end: e.target.value })}
              className={baseInputClass}
            />
          </div>
        </div>
      );

    case 9: // Checkbox
      return (
        <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500/20">
          <Checkbox
            id={id}
            checked={currentValue}
            onCheckedChange={onChange}
          />
          <label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer">
            Bəli
          </label>
        </div>
      );

    case 10: // Range
      return (
        <div className="space-y-2">
          <Input
            id={id}
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${currentValue || 0}%, #e5e7eb ${currentValue || 0}%, #e5e7eb 100%)`
            }}
          />
          <div className="text-center text-sm font-medium text-gray-700">
            {currentValue || 0}%
          </div>
        </div>
      );

    case 11: // Color
      return (
        <Input
          id={id}
          type="color"
          value={currentValue}
          onChange={handleChange}
          className="h-12 w-full cursor-pointer"
        />
      );

    case 12: // Phone
      return (
        <Input
          id={id}
          type="tel"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={baseInputClass}
        />
      );

    case 13: // Datetime
      return (
        <Input
          id={id}
          type="datetime-local"
          value={currentValue}
          onChange={handleChange}
          className={baseInputClass}
        />
      );

    case 14: // Email
      return (
        <Input
          id={id}
          type="email"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={baseInputClass}
        />
      );

    case 15: // Price
      return (
        <Input
          id={id}
          type="number"
          step="0.01"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={baseInputClass}
        />
      );

    default:
      return (
        <Input
          id={id}
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={baseInputClass}
        />
      );
  }
}
