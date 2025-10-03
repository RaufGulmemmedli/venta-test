"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useCvData } from "@/lib/hooks/useCv";
import { useAllSteps } from "@/lib/hooks/useStep";
import { ChevronLeft, ChevronRight, Circle, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { X, Check } from "lucide-react";
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Toaster } from "@/components/ui/toaster"

interface FormData {
  [key: string]: any;
}

export default function CvCreateContainer() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);

  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    setVisitedSteps(prev => {
      if (prev.has(currentStepIndex)) return prev;
      const next = new Set(prev);
      next.add(currentStepIndex);
      return next;
    });
  }, [currentStepIndex]);

  const { data: allSteps = [], isLoading: stepsLoading } = useAllSteps('cv');
  
  const currentStepId = allSteps[currentStepIndex]?.id;
  
  const { data: currentStepData, isLoading: dataLoading } = useCvData(currentStepId);


  const isValueEmpty = (attribute: any, value: any) => {
    const vt = attribute.valueType
    switch (vt) {
      case 6: // MultiSelect
        return !Array.isArray(value) || value.length === 0
      case 8: // DateRange
        return !value || !value.start || !value.end
      case 9: // Checkbox (required => must be true)
        return value !== true
      case 7: // Date
      case 13: // Datetime
        return !value || isNaN(new Date(value).getTime())
      case 2:  // Number
      case 10: // Range
      case 15: // Price
        return value === undefined || value === null || value === ""
      default:
        // String, TextArea, Select, Email, Phone, Color, Radio...
        return value === undefined || value === null || (typeof value === "string" && value.trim() === "")
    }
  }

  const validateCurrentStep = () => {
    if (!currentStepData) return true

    const requiredFields = currentStepData.sections
      .flatMap((section: any) => section.attributes)
      .filter((attr: any) => attr.isImportant || attr.isInportant) 

    if (requiredFields.length === 0) return true

    for (const field of requiredFields) {
      const value = formData[field.attributeId]
      const fieldName = field.attributeSets?.[0]?.name || `Field ${field.attributeId}`
      if (isValueEmpty(field, value)) {
        toast({
          variant: "destructive",
          description: `Tələb olunan sahə doldurulmalıdır: ${fieldName}`,
        })
        return false
      }
    }
    return true
  };



  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index > currentStepIndex) {
      if (!validateCurrentStep()) {
        return; 
      }
    }
    setCurrentStepIndex(index);
  };

  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      return; 
    }
    
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(currentStepIndex);
      return next;
    });
    setCurrentStepIndex(prev => prev + 1);
  };

  const createStaticStep = () => {
    // Pass current step index as URL parameter
    router.push(`/cv/static-step?fromStep=${currentStepIndex}`);
  };

  const updateFormData = (attributeId: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const getEventValue = (eOrValue: any) => {
    return eOrValue && typeof eOrValue === "object" && "target" in eOrValue
      ? (eOrValue.target as HTMLInputElement).value
      : eOrValue
  }

  const normalizeInputValue = (val: any) => {
    if (val === undefined || val === null) return ""
    if (typeof val === "string" || typeof val === "number") return String(val)
    return "" 
  }

  const valueTypeMap: { [key: number]: string } = {
    1: "String",
    2: "Number", 
    3: "Radio",
    4: "TextArea",
    5: "Select",
    6: "Multiselect",
    7: "Date",
    8: "DateRange",
    9: "Checkbox",
    10: "Range",
    11: "Color",
    12: "Phone",
    13: "Datetime",
    14: "Email",
    15: "Price"
  };

  const MultiSelectDropdown = ({
    options,
    value,
    onChange,
    placeholder = "Seçin..."
  }: {
    options: { label: string; value: string }[];
    value: string[] | undefined;
    onChange: (val: string[]) => void;
    placeholder?: string;
  }) => {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const selected = Array.isArray(value) ? value : [];

    const toggleValue = (val: string) => {
      const exists = selected.includes(val);
      const newValues = exists ? selected.filter(v => v !== val) : [...selected, val];
      onChange(newValues);
    };

    const clearAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
    };

    const filteredOptions = options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full min-h-[40px] flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex flex-wrap gap-1 pr-2">
            {selected.length === 0 && (
              <span className="text-gray-500">{placeholder}</span>
            )}
            {selected.map(v => (
              <span
                key={v}
                className="flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
              >
                {v}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-blue-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleValue(v);
                  }}
                />
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
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
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b">
              <Input
                type="text"
                placeholder="Axtarış..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div className="max-h-48 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  Nəticə yoxdur
                </div>
              ) : (
                filteredOptions.map(opt => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={() => toggleValue(opt.value)}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <Checkbox style={{width: '26px', height: '16px'}}
                        checked={isSelected}
                        
                        className="pointer-events-none"
                      />
                      <span className="text-sm flex-1">{opt.label}</span>
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
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    );
  };

const extractOptions = (values: any[] = []) => {
  const seen = new Set<string>()
  const opts: { label: string; value: string }[] = []
  values.forEach(v => {
    (v.languages || []).forEach((l: any) => {
      const val = l.value || l.name
      if (val && !seen.has(val)) {
        seen.add(val)
        opts.push({ label: val, value: val })
      }
    })
  })
  return opts
}

  const renderAttributeInput = (attribute: any) => {
    const { attributeId, valueType, attributeSets, values } = attribute;
    const rawValue = formData[attributeId];
    const currentValue = rawValue ?? "";

    const options = extractOptions(values)

    const attributeSet = attributeSets?.[0];
    const label = attributeSet?.name || `Attribute ${attributeId}`;
    const placeholder = attributeSet?.name || "Dəyər daxil edin";

    const commonProps = {
      value: normalizeInputValue(rawValue),
      onChange: (e: any) => {
        const val = getEventValue(e)
        updateFormData(attributeId, val)
      },
      className: "w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    };

    const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      el.style.height = '20px';
      el.style.height = Math.max(20, el.scrollHeight) + 'px';
    };

    switch (valueType) {
      case 1:
        return <Input {...commonProps} />;
      case 2:
        return <Input {...commonProps} type="number" />;
      case 3:
        return (
          <div className="space-y-2">
            {values[0]?.languages?.map((lang: any, index: number) => {
              const optionValue = lang.value || lang.name;
              const isSelected = currentValue === optionValue;
              return (
                <label key={index} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name={`attr_${attributeId}`}
                    value={optionValue}
                    checked={isSelected}
                    onChange={(e) => {
                      console.log('Radio selected:', e.target.value);
                      updateFormData(attributeId, e.target.value);
                    }}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className={`text-sm font-medium flex-1 ${
                    isSelected ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {optionValue}
                  </span>
                </label>
              );
            })}
          </div>
        );
      case 4: 
        return (
          <Textarea
            {...commonProps}
            rows={1}
            placeholder={placeholder}
            style={{
              height: '40px',
              minHeight: '40px',
              resize: 'vertical',
              overflow: 'hidden'
            }}
            onInput={autoResize}
            className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 5: // Select
        return (
          <Select
            value={currentValue}
            onValueChange={(val) => updateFormData(attributeId, val)}
          >
            <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Seçin..." />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 6: // MultiSelect
        return (
          <MultiSelectDropdown
            options={options}
            value={Array.isArray(currentValue) ? currentValue : []}
            onChange={(val) => updateFormData(attributeId, val)}
            placeholder="Seçin..."
          />
        );
      case 7:
        return (
          <StyledDatePicker
            value={currentValue}
            onChange={(val) => updateFormData(attributeId, val)}
            placeholder="Tarix seçin"
          />
        );
      case 8:
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={(typeof currentValue === "object" && currentValue?.start) ? currentValue.start : ''}
              onChange={(e) =>
                updateFormData(
                  attributeId,
                  {
                    ...(typeof currentValue === "object" && currentValue ? currentValue : {}),
                    start: e.target.value
                  }
                )
              }
            />
            <Input
              type="date"
              value={(typeof currentValue === "object" && currentValue?.end) ? currentValue.end : ''}
              onChange={(e) =>
                updateFormData(
                  attributeId,
                  {
                    ...(typeof currentValue === "object" && currentValue ? currentValue : {}),
                    end: e.target.value
                  }
                )
              }
            />
          </div>
        );
      case 9:
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={currentValue}
              onCheckedChange={(checked) => updateFormData(attributeId, checked)}
            />
           
          </div>
        );
      case 10:
        return <Input {...commonProps} type="range" min="0" max="100" />;
      case 11:
        return <Input {...commonProps} type="color" />;
      case 12:
        return <Input {...commonProps} type="tel" placeholder="+994XX XXX XX XX"/>;
      case 13:
        return (
          <StyledDateTimePicker
            value={currentValue}
            onChange={(val) => updateFormData(attributeId, val)}
          />
        );
      case 14:
        return <Input {...commonProps} type="email" />;
      case 15:
        return <Input {...commonProps} type="number" step="0.01" />;
      default:
        return <Input {...commonProps} />;
    }
  };

  const StyledDatePicker = ({
    value,
    onChange,
    placeholder = "Tarix seçin"
  }: { value?: string; onChange: (val: string) => void; placeholder?: string }) => {
    const [open, setOpen] = React.useState(false)
    const dateObj = value ? new Date(value) : undefined

    const [displayDate, setDisplayDate] = React.useState<Date>(() => dateObj || new Date())
    React.useEffect(() => {
      if (dateObj) setDisplayDate(dateObj)
    }, [value])

    const currentYear = new Date().getFullYear()
    const years = React.useMemo(
      () => Array.from({ length: 101 }, (_, i) => currentYear - 70 + i), 
      [currentYear]
    )
    const months = [
      "Yan", "Fev", "Mar", "Apr", "May", "İyn",
      "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"
    ]

    const setMonth = (m: number) => {
      setDisplayDate(d => new Date(d.getFullYear(), m, 1))
    }
    const setYear = (y: number) => {
      setDisplayDate(d => new Date(y, d.getMonth(), 1))
    }

    const applyDate = (d?: Date) => {
      if (!d) return
      const pure = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      onChange(pure.toISOString())
      setOpen(false)
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className={dateObj ? "text-gray-900" : "text-gray-500"}>
              {dateObj ? format(dateObj, "dd.MM.yyyy") : placeholder}
            </span>
            <CalendarIcon className="w-4 h-4 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0">
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
              >&lt;</button>
              <select
                value={displayDate.getMonth()}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1 bg-white"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select
                value={displayDate.getFullYear()}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1 bg-white"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
              >&gt;</button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date()
                  setDisplayDate(new Date(now.getFullYear(), now.getMonth(), 1))
                }}
                className="ml-auto text-xs text-blue-600 hover:underline"
              >
                Bu ay
              </button>
            </div>

            <Calendar
              mode="single"
              month={displayDate}
              onMonthChange={(m) => setDisplayDate(m)}
              selected={dateObj}
              onSelect={(d) => applyDate(d)}
              initialFocus
            />

            <div className="flex justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  const now = new Date()
                  applyDate(now)
                }}
                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                Bugün
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("")
                    setOpen(false)
                  }}
                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Təmizlə
                </button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const StyledDateTimePicker = ({
    value,
    onChange,
    placeholder = "Tarix və saat"
  }: { value?: string; onChange: (val: string) => void; placeholder?: string }) => {
    const [open, setOpen] = React.useState(false)
    const dateObj = value ? new Date(value) : undefined

    const [tempDate, setTempDate] = React.useState<Date | undefined>(dateObj)
    const [displayDate, setDisplayDate] = React.useState<Date>(() => dateObj || new Date())
    React.useEffect(() => {
      if (dateObj) {
        setTempDate(dateObj)
        setDisplayDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1))
      }
    }, [value])

    const [hour, setHour] = React.useState(dateObj ? String(dateObj.getHours()).padStart(2, "0") : "00")
    const [minute, setMinute] = React.useState(dateObj ? String(dateObj.getMinutes()).padStart(2, "0") : "00")

    const currentYear = new Date().getFullYear()
    const years = React.useMemo(
      () => Array.from({ length: 101 }, (_, i) => currentYear - 70 + i),
      [currentYear]
    )
    const months = [
      "Yan", "Fev", "Mar", "Apr", "May", "İyn",
      "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"
    ]

    const setMonth = (m: number) => {
      setDisplayDate(d => new Date(d.getFullYear(), m, 1))
    }
    const setYear = (y: number) => {
      setDisplayDate(d => new Date(y, d.getMonth(), 1))
    }

    const apply = () => {
      if (!tempDate) return
      const d = new Date(tempDate)
      d.setHours(parseInt(hour || "0"), parseInt(minute || "0"), 0, 0)
      onChange(d.toISOString())
      setOpen(false)
    }

    const quickNow = () => {
      const now = new Date()
      setTempDate(now)
      setHour(String(now.getHours()).padStart(2, "0"))
      setMinute(String(now.getMinutes()).padStart(2, "0"))
      setDisplayDate(new Date(now.getFullYear(), now.getMonth(), 1))
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className={dateObj ? "text-gray-900" : "text-gray-500"}>
              {dateObj ? format(dateObj, "dd.MM.yyyy HH:mm") : placeholder}
            </span>
            <Clock className="w-4 h-4 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-3 space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
              >&lt;</button>
              <select
                value={displayDate.getMonth()}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1 bg-white"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select
                value={displayDate.getFullYear()}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="text-sm border rounded px-2 py-1 bg-white"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
              >&gt;</button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date()
                  setDisplayDate(new Date(now.getFullYear(), now.getMonth(), 1))
                }}
                className="ml-auto text-xs text-blue-600 hover:underline"
              >
                Bu ay
              </button>
            </div>

          <Calendar
            mode="single"
            month={displayDate}
            onMonthChange={(m) => setDisplayDate(m)}
            selected={tempDate}
            onSelect={(d) => setTempDate(d)}
            initialFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(e.target.value.slice(0,2))}
              className="w-16 border rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-500">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={minute}
              onChange={(e) => setMinute(e.target.value.slice(0,2))}
              className="w-16 border rounded px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={quickNow}
              className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              İndi
            </button>
            <button
              type="button"
              className="ml-auto px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={apply}
              disabled={!tempDate}
            >
              Təsdiq et
            </button>
          </div>
          <div className="flex justify-between">
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
                className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
              >
                Təmizlə
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (tempDate) {
                  setHour("00")
                  setMinute("00")
                }
              }}
              className="ml-auto text-xs text-gray-500 hover:underline"
            >
              Saatı sıfırla
            </button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">CV Yaratma</h1>
            
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                {allSteps.map((step, index) => {
                  const isCurrent = index === currentStepIndex;
                  const isCompleted = completedSteps.has(index);
                  const isPrevious = index < currentStepIndex; 
                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        onClick={() => goToStep(index)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          isCurrent
                            ? 'bg-red-500 border-red-500 text-white'
                            : isPrevious
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-gray-200 border-gray-300 text-gray-600'
                        }`}
                      >
                        {isPrevious ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </button>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          isCurrent ? 'text-red-600' : isPrevious ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {step.translations?.[0]?.title || `Step ${index + 1}`}
                      </span>
                      <div className="w-8 h-0.5 bg-gray-300 mx-4" />
                    </div>
                  );  
                })}
                
                {/* Static Step Button */}
                <div className="flex items-center">
                  <button
                    onClick={createStaticStep}
                    className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-gray-400 text-gray-500 hover:border-red-500 hover:text-red-500 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    Statik Step ({allSteps.length > 0 ? allSteps[allSteps.length - 1].sortOrder + 1 : 1})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dataLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Məlumatlar yüklənir...</p>
            </div>
          </div>
        ) : currentStepData ? (
          <div className="space-y-8">

            {currentStepData.sections.map((section, idx) => (
              <React.Fragment key={section.sectionId}>
                <Card
                  className="border-0 shadow-none bg-transparent p-0"
                >
                  <CardHeader className="px-0 pt-0 pb-2">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {section.title || `Section ${section.sectionId}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 px-0 pb-0">
                    {section.attributes.reduce((rows: any[][], attribute, index) => {
                      const rowIndex = Math.floor(index / 4);
                      if (!rows[rowIndex]) rows[rowIndex] = [];
                      rows[rowIndex].push(attribute);
                      return rows;
                    }, []).map((row, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {row.map((attribute) => {
                          const attributeSet = attribute.attributeSets?.[0];
                          const label = attributeSet?.name || `Attribute ${attribute.attributeId}`;
                          const isRequired = Boolean(attribute.isImportant || attribute.isInportant); // <-- Düzəliş
                          return (
                            <div key={attribute.attributeId} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                {label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <div>
                                {renderAttributeInput(attribute)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                {idx < currentStepData.sections.length - 1 && (
                  <hr className="my-8 border-t border-gray-200 mb-4" />
                )}
              </React.Fragment>
            ))}

            <div className="flex justify-between items-center pt-6">
            
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Ləğv et
              </Button>
              
              <div className="flex space-x-2">
              
                  <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Əvvəlki</span>
              </Button>
            
                
                {currentStepIndex === allSteps.length - 1 ? (
                  <Button
                    onClick={() => {
                      if (validateCurrentStep()) {
                        toast({ description: "CV uğurla yaradıldı!" });
                        router.push("/cv");
                      }
                    }}
                    style={{backgroundColor:"green"}}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Tamamla
                  </Button>
                ) : (
                  <Button
                      onClick={goToNextStep}
                      disabled={currentStepIndex === allSteps.length - 1}
                      className="flex items-center space-x-2"
                    >
                    <span>Növbəti</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Məlumat tapılmadı</p>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
