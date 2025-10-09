"use client"
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { X, Check } from "lucide-react";

interface InputRendererProps {
  attribute: any;
  value: any;
  onChange: (value: any) => void;
  className?: string;
  id?: string;
}

// Searchable Select Component
function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Seçin...",
  className 
}: { 
  options: string[]; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectValue = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearchTerm("");
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full min-h-[44px] flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          className
        )}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={clearValue}
              className="text-xs text-red-500 hover:underline"
            >
              Təmizlə
            </button>
          )}
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b bg-gray-50">
            <Input
              type="text"
              placeholder="Axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                Nəticə tapılmadı
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt === value;
                return (
                  <div
                    key={index}
                    onClick={() => selectValue(opt)}
                    className={cn(
                      "flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer",
                      isSelected && 'bg-blue-50'
                    )}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                    <span className={cn(
                      "text-sm flex-1",
                      isSelected && 'font-medium text-blue-600'
                    )}>
                      {opt}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setOpen(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
}

// Searchable MultiSelect Component
function SearchableMultiSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Seçin..." 
}: { 
  options: string[]; 
  value: string[]; 
  onChange: (val: string[]) => void; 
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleValue = (val: string) => {
    const exists = value.includes(val);
    const newValues = exists ? value.filter(v => v !== val) : [...value, val];
    onChange(newValues);
    // Dropdown açıq qalsın
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full min-h-[56px] flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <div className="flex flex-wrap gap-2 pr-2">
            {value.length === 0 && (
              <span className="text-gray-400 text-base">{placeholder}</span>
            )}
            {value.map((v, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700"
              >
                {v}
                <X
                  className="w-4 h-4 cursor-pointer hover:text-blue-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleValue(v);
                  }}
                />
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {value.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-red-500 hover:underline font-medium"
              >
                Təmizlə
              </button>
            )}
            <svg
              className={`h-5 w-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        avoidCollisions
        collisionPadding={8}
        className="z-50 p-0 w-[var(--radix-popover-trigger-width)] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[role="option"]') || target.closest('.popover-content-area')) {
            e.preventDefault();
          }
        }}
      >
        <div className="p-2 border-b bg-gray-50 popover-content-area">
          <Input
            type="text"
            placeholder="Axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto popover-content-area" style={{ maxHeight: '200px' }}>
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Nəticə tapılmadı
            </div>
          ) : (
            filteredOptions.map((opt, index) => {
              const isSelected = value.includes(opt);
              return (
                <div
                  key={index}
                  role="option"
                  onClick={() => toggleValue(opt)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors",
                    isSelected && "bg-blue-50/50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded border-2 transition-all",
                    isSelected 
                      ? "bg-blue-500 border-blue-500" 
                      : "bg-white border-gray-300 hover:border-blue-400"
                  )}>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm flex-1",
                    isSelected && "font-medium text-gray-900"
                  )}>
                    {opt}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
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
      const selectOptions = values[0]?.languages?.map((lang: any) => lang.value || lang.name) || [];
      return (
        <SearchableSelect
          options={selectOptions}
          value={currentValue}
          onChange={onChange}
          placeholder="Seçin..."
          className={baseInputClass}
        />
      );

    case 6: // Multiselect
      const multiSelectOptions = values[0]?.languages?.map((lang: any) => lang.value || lang.name) || [];
      const multiSelectValue = Array.isArray(currentValue) ? currentValue : [];
      return (
        <SearchableMultiSelect
          options={multiSelectOptions}
          value={multiSelectValue}
          onChange={onChange}
          placeholder="Seçin..."
        />
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
