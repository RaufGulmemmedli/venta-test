"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useVacancyData, useVacancyById } from "@/lib/hooks/useVacancy";
import { useAllSteps } from "@/lib/hooks/useStep";
import { vacancyService } from "@/lib/services/vacancyServices";
import { ChevronLeft, ChevronRight, Circle, CheckCircle, Plus, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { X, Check } from "lucide-react";
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Toaster } from "@/components/ui/toaster"
import AttributeValuesModal from "@/containers/settings/pages/AttributeValuesModal"
import { useTranslations } from "next-intl"

interface FormData {
  [key: string]: any;
}

export default function VacancyCreateContainer() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("vacancyCreate");
  
  // Get editId from URL parameters using useSearchParams
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId') ? parseInt(searchParams.get('editId')!) : undefined;
  const isEditMode = !!editId;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [allStepsData, setAllStepsData] = useState<Record<number, any>>({});
  const [sectionInstances, setSectionInstances] = useState<Record<string, number>>({});
  const [attributeValuesModalOpen, setAttributeValuesModalOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<number | null>(null);

  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Fetch Vacancy data for editing
  const { data: editVacancyData, isLoading: editDataLoading } = useVacancyById(editId);

  // Debug logging for edit mode
  React.useEffect(() => {
    console.log('Edit mode state changed:', {
      isEditMode,
      editId,
      editDataLoading,
      editVacancyData: editVacancyData ? 'Data loaded' : 'No data'
    });
  }, [isEditMode, editId, editDataLoading, editVacancyData]);

  useEffect(() => {
    setVisitedSteps(prev => {
      if (prev.has(currentStepIndex)) return prev;
      const next = new Set(prev);
      next.add(currentStepIndex);
      return next;
    });
  }, [currentStepIndex]);

  const { data: allStepsRaw = [], isLoading: stepsLoading } = useAllSteps('vakansiya', 2);
  
  // Filter out inactive steps
  const allSteps = allStepsRaw.filter(step => step.isActive === true);
  
  // Debug logging for steps
  console.log('VacancyCreateContainer - allStepsRaw:', allStepsRaw);
  console.log('VacancyCreateContainer - allSteps (filtered):', allSteps);
  console.log('VacancyCreateContainer - stepsLoading:', stepsLoading);
  console.log('VacancyCreateContainer - isEditMode:', isEditMode);
  
  const currentStepId = allSteps[currentStepIndex]?.id;
  
  const { data: currentStepData, isLoading: dataLoading } = useVacancyData(currentStepId);

  // Store step data when it's loaded
  useEffect(() => {
    if (currentStepData && currentStepId) {
      setAllStepsData(prev => ({
        ...prev,
        [currentStepId]: currentStepData
      }));
    }
  }, [currentStepData, currentStepId]);

  // Edit modunda bütün step-lərin datasını yüklə
  useEffect(() => {
    const loadAllStepsData = async () => {
      if (isEditMode && allSteps.length > 0 && editVacancyData) {
        try {
          // Load structure for all steps
          const allStepsDataPromises = allSteps.map(step => 
            vacancyService.getVacancyData(step.id)
          );
          const results = await Promise.all(allStepsDataPromises);
          
          const newAllStepsData: Record<number, any> = {};
          
          // Combine structure with Vacancy data
          results.forEach((stepStructure: any, index: number) => {
            const stepId = allSteps[index].id;
            const vacancyStep = editVacancyData.steps.find((s: any) => s.id === stepId);
            
            if (stepStructure && vacancyStep) {
              // Merge structure with actual Vacancy data
              newAllStepsData[stepId] = {
                ...stepStructure,
                sections: stepStructure.sections.map((section: any) => {
                  const vacancySection = vacancyStep.sections.find((s: any) => s.id === section.sectionId);
                  if (vacancySection) {
                    return {
                      ...section,
                      attributes: section.attributes.map((attr: any) => {
                        const vacancyAttr = vacancySection.attributes.find((a: any) => a.attributeId === attr.attributeId);
                        if (vacancyAttr) {
                          return {
                            ...attr,
                            values: vacancyAttr.values || attr.values
                          };
                        }
                        return attr;
                      })
                    };
                  }
                  return section;
                })
              };
            } else if (stepStructure) {
              newAllStepsData[stepId] = stepStructure;
            }
          });
          
          console.log('Loaded all steps data for edit mode:', newAllStepsData);
          setAllStepsData(newAllStepsData);
        } catch (error) {
          console.error('Error loading all steps data:', error);
        }
      }
    };
    
    loadAllStepsData();
  }, [isEditMode, allSteps.length, editVacancyData]);

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && editVacancyData && !editDataLoading) {
      const newFormData: FormData = {};
      
      console.log('Edit Vacancy Data received:', editVacancyData);
      
      editVacancyData.steps.forEach(step => {
        step.sections.forEach(section => {
          section.attributes.forEach(attribute => {
            console.log('Processing attribute:', attribute.attributeId, 'with values:', attribute.values);
            
            if (attribute.values && attribute.values.length > 0) {
              const value = attribute.values[0];
              const azValue = value.sets.find(set => set.language === 'az');
              
              console.log('AZ value found:', azValue);
              
              if (azValue) {
                let formValue: any;
                
                switch (attribute.valueType) {
                  case 6: // MultiSelect
                    formValue = [azValue.stringValue || azValue.decimalValue || azValue.boolValue];
                    break;
                  case 5: // Select
                    formValue = value.display || azValue.stringValue || azValue.decimalValue || azValue.boolValue;
                    break;
                  case 8: // DateRange
                    formValue = azValue.stringValue;
                    break;
                  case 7: // Date
                  case 13: // Datetime
                    formValue = azValue.dateTimeValue;
                    break;
                  case 9: // Checkbox
                    formValue = azValue.boolValue;
                    break;
                  case 2: // Number
                    formValue = azValue.decimalValue;
                    break;
                  default:
                    formValue = azValue.stringValue || azValue.decimalValue || azValue.boolValue;
                    break;
                }
                
                console.log(`Setting form value for attribute ${attribute.attributeId}:`, formValue);
                
                if (formValue !== null && formValue !== undefined) {
                  newFormData[attribute.attributeId] = formValue;
                }
              }
            }
          });
        });
      });
      
      console.log('Final populated form data:', newFormData);
      setFormData(newFormData);
    }
  }, [isEditMode, editVacancyData, editDataLoading]);

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
      const fieldName = field.attributeSets?.[0]?.name || field.name || `Field ${field.attributeId}`
      if (isValueEmpty(field, value)) {
          toast({
            variant: "destructive",
            description: `${t("requiredField")} ${fieldName}`,
          })
          return false
      }
    }
    return true
  };

  const validateAllSteps = () => {
    // Validate all active steps that have been visited
    for (const step of allSteps) {
      const stepData = allStepsData[step.id];
      if (stepData) {
        const requiredFields = stepData.sections
          .flatMap((section: any) => section.attributes)
          .filter((attr: any) => attr.isImportant || attr.isInportant);

        for (const field of requiredFields) {
          const value = formData[field.attributeId];
          const fieldName = field.attributeSets?.[0]?.name || field.name || `Field ${field.attributeId}`;
          if (isValueEmpty(field, value)) {
            toast({
              variant: "destructive",
              description: `${t("requiredField")} ${fieldName}`,
            });
            return false;
          }
        }
      }
    }
    return true;
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      // Birinci step-dədirsə geri qayıt
      router.back();
    }
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

  const createVacancyData = () => {
    if (!allSteps || allSteps.length === 0) return null;

    // Collect all sections from all active steps
    const allSections: any[] = [];
    
    // Iterate through all active steps and collect their sections
    allSteps.forEach(step => {
      const stepData = allStepsData[step.id];
      if (stepData && stepData.sections) {
        allSections.push(...stepData.sections);
      }
    });

    if (allSections.length === 0) return null;

    const sectionDtos = allSections.map(section => ({
      sectionId: section.sectionId,
      attributes: section.attributes.map((attribute: any) => {
        const formValue = formData[attribute.attributeId];
        
        const attributeValueIds: number[] = [];
        const inputValue: { value: string; language: string }[] = [];
        
        if (formValue !== undefined && formValue !== null && formValue !== "") {
          // Handle different value types based on attribute.valueType
          switch (attribute.valueType) {
            case 6: // MultiSelect
              if (Array.isArray(formValue)) {
                formValue.forEach(val => {
                  const existingValue = attribute.values.find((v: any) => 
                    v.languages.some((lang: any) => lang.value === String(val))
                  );
                  
                  if (existingValue) {
                    attributeValueIds.push(existingValue.attributeValueId);
                  } else {
                    ['az', 'en', 'ru'].forEach(lang => {
                      inputValue.push({
                        value: String(val),
                        language: lang
                      });
                    });
                  }
                });
              }
              break;
            case 3: // Radio
            case 5: // Select
              const existingValue = attribute.values.find((v: any) => 
                v.languages.some((lang: any) => lang.value === String(formValue))
              );
              
              if (existingValue) {
                attributeValueIds.push(existingValue.attributeValueId);
              } else {
                ['az', 'en', 'ru'].forEach(lang => {
                  inputValue.push({
                    value: String(formValue),
                    language: lang
                  });
                });
              }
              break;
            case 8: // DateRange
              if (typeof formValue === "object" && formValue.start && formValue.end) {
                const rangeValue = `${formValue.start} - ${formValue.end}`;
                ['az', 'en', 'ru'].forEach(lang => {
                  inputValue.push({
                    value: rangeValue,
                    language: lang
                  });
                });
              }
              break;
            case 7: // Date
            case 13: // Datetime
              if (formValue) {
                ['az', 'en', 'ru'].forEach(lang => {
                  inputValue.push({
                    value: String(formValue),
                    language: lang
                  });
                });
              }
              break;
            case 9: // Checkbox
              if (formValue === true) {
                ['az', 'en', 'ru'].forEach(lang => {
                  inputValue.push({
                    value: "true",
                    language: lang
                  });
                });
              }
              break;
            default:
              ['az', 'en', 'ru'].forEach(lang => {
                inputValue.push({
                  value: String(formValue),
                  language: lang
                });
              });
              break;
          }
        }

        return {
          attributeId: attribute.attributeId,
          attributeValueIds: attributeValueIds,
          inputValue: inputValue
        };
      })
    }));

    return { sectionDtos };
  };

  const buildUpdateData = () => {
    const vacancyData = createVacancyData();
    if (!vacancyData) return null;

    return {
      id: editId,
      sectionDtos: vacancyData.sectionDtos
    };
  };

  const updateFormData = (attributeId: number, value: any, instanceIndex?: number) => {
    const key = instanceIndex !== undefined ? `${attributeId}_${instanceIndex}` : attributeId;
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addSectionInstance = (sectionId: number) => {
    const key = `section_${sectionId}`;
    setSectionInstances(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  const removeSectionInstance = (sectionId: number) => {
    const key = `section_${sectionId}`;
    setSectionInstances(prev => {
      const current = prev[key] || 0;
      if (current > 0) {
        // Remove form data for this instance
        const newFormData = { ...formData };
        Object.keys(newFormData).forEach(formKey => {
          if (formKey.endsWith(`_${current}`)) {
            delete newFormData[formKey];
          }
        });
        setFormData(newFormData);
        
        return {
          ...prev,
          [key]: current - 1
        };
      }
      return prev;
    });
  };

  const getSectionInstanceCount = (sectionId: number) => {
    return sectionInstances[`section_${sectionId}`] || 0;
  };

  const openAttributeValuesModal = (attributeId: number) => {
    setSelectedAttributeId(attributeId);
    setAttributeValuesModalOpen(true);
  };

  const closeAttributeValuesModal = (updated?: boolean) => {
    setAttributeValuesModalOpen(false);
    setSelectedAttributeId(null);
    
    // If values were updated, refresh the current step data
    if (updated) {
      // Force re-fetch of current step data to get updated values
      const currentStepId = allSteps[currentStepIndex]?.id;
      if (currentStepId) {
        vacancyService.getVacancyData(currentStepId).then(stepData => {
          setAllStepsData(prev => ({
            ...prev,
            [currentStepId]: stepData
          }));
        }).catch(console.error);
      }
    }
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
                {t("clear")}
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
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div className="max-h-48 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  {t("noResults")}
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
    // Try display first (from API), then languages array
    if (v.display && !seen.has(v.display)) {
      seen.add(v.display)
      opts.push({ label: v.display, value: v.display })
    } else {
      // Fallback to languages array
      (v.languages || []).forEach((l: any) => {
        const val = l.value || l.name
        if (val && !seen.has(val)) {
          seen.add(val)
          opts.push({ label: val, value: val })
        }
      })
    }
  })
  return opts
}

  const renderAttributeInput = (attribute: any, instanceIndex?: number) => {
    const { attributeId, valueType, attributeSets, values } = attribute;
    const key = instanceIndex !== undefined ? `${attributeId}_${instanceIndex}` : attributeId;
    const rawValue = formData[key];
    const currentValue = rawValue ?? "";

    // Debug logging for edit mode
    if (isEditMode) {
      console.log(`Rendering input for attribute ${attributeId}:`, {
        rawValue,
        currentValue,
        formDataValue: formData[attributeId]
      });
    }

    const options = extractOptions(values)

    const attributeSet = attributeSets?.[0];
    const label = attributeSet?.name || attribute.name || `Attribute ${attributeId}`;
    const placeholder = attributeSet?.name || attribute.name || "Dəyər daxil edin";

    const commonProps = {
      value: normalizeInputValue(rawValue),
      onChange: (e: any) => {
        const val = getEventValue(e)
        updateFormData(attributeId, val, instanceIndex)
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {isEditMode ? t("editTitle") : t("title")}
            </h1>
            
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                {stepsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">{t("stepsLoading")}</p>
                  </div>
                ) : allSteps.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-red-600">{t("noActiveSteps")}</p>
                  </div>
                ) : (
                  <>
                    {allSteps.map((step, index) => {
                      const isCurrent = index === currentStepIndex;
                      const isCompleted = completedSteps.has(index);
                      const isPrevious = index < currentStepIndex; 
                      return (
                        <div key={step.id} className="flex items-center">
                          <button
                            disabled
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-default ${
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
                          {index < allSteps.length - 1 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
                        </div>
                      );  
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stepsLoading || dataLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {stepsLoading ? t("stepsLoading") : t("dataLoading")}
              </p>
            </div>
          </div>
        ) : allSteps.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">{t("noActiveSteps")}</h3>
            <p className="text-sm text-gray-600 mb-4">{t("noActiveStepsDesc")}</p>
          </div>
        ) : currentStepData ? (
          <div className="space-y-8">

            {currentStepData.sections.map((section, idx) => {
              const isChangeable = section.isChangeable;
              const instanceCount = getSectionInstanceCount(section.sectionId);
              const totalInstances = instanceCount + 1; // +1 for the original instance
              
              return (
                <React.Fragment key={section.sectionId}>
                  <Card className="border-0 shadow-none bg-transparent p-0">
                    <CardHeader className="px-0 pt-0 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          {section.title || `Section ${section.sectionId}`}
                        </CardTitle>
                        {isChangeable && (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addSectionInstance(section.sectionId)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              {t("addSection")}
                            </Button>
                            {instanceCount > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSectionInstance(section.sectionId)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                                {t("removeSection")}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 px-0 pb-0">
                      {/* Render all instances of this section */}
                      {Array.from({ length: totalInstances }, (_, instanceIndex) => (
                        <div key={instanceIndex} className="space-y-4">
                          {instanceIndex > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <div className="h-px bg-gray-300 flex-1"></div>
                              {/* <span>Nüsxə {instanceIndex + 1}</span> */}
                              {/* <div className="h-px bg-gray-300 flex-1"></div> */}
                            </div>
                          )}
                          
                          {section.attributes.reduce((rows: any[][], attribute, index) => {
                            const rowIndex = Math.floor(index / 4);
                            if (!rows[rowIndex]) rows[rowIndex] = [];
                            rows[rowIndex].push(attribute);
                            return rows;
                          }, []).map((row, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {row.map((attribute) => {
                                const attributeSet = attribute.attributeSets?.[0];
                                const label = attributeSet?.name || attribute.name || `Attribute ${attribute.attributeId}`;
                                const isRequired = Boolean(attribute.isImportant || attribute.isInportant);
                                return (
                                  <div key={`${attribute.attributeId}_${instanceIndex}`} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="block text-sm font-medium text-gray-700">
                                        {label}
                                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                                      </label>
                                      {attribute.isValuable && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openAttributeValuesModal(attribute.attributeId)}
                                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                        >
                                          <Settings className="w-3 h-3" />
                                          {t("values")}
                                        </Button>
                                      )}
                                    </div>
                                    <div>
                                      {renderAttributeInput(attribute, instanceIndex)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  {idx < currentStepData.sections.length - 1 && (
                    <hr className="my-8 border-t border-gray-200 mb-4" />
                  )}
                </React.Fragment>
              );
            })}

            <div className="flex justify-between items-center pt-6">
            
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{currentStepIndex === 0 ? t("cancel") : t("previous")}</span>
              </Button>
              
              <div className="flex space-x-2">
                {currentStepIndex === allSteps.length - 1 ? (
                  <Button
                    onClick={async () => {
                      if (validateAllSteps()) {
                        try {
                          setIsLoading(true);
                          
                          if (isEditMode) {
                            // Update existing Vacancy
                            const updateData = buildUpdateData();
                            if (updateData) {
                              console.log("Update Data being sent:", JSON.stringify(updateData, null, 2));
                              console.log("Form data:", formData);
                              console.log("All steps data:", allStepsData);
                              await vacancyService.updateVacancy(updateData);
                              toast({ description: t("vacancyUpdated") });
                              router.push("/vacancy");
                            }
                          } else {
                            // Create new Vacancy
                            const vacancyData = createVacancyData();
                            if (vacancyData) {
                              console.log("Vacancy Data being sent:", JSON.stringify(vacancyData, null, 2));
                              console.log("Form data:", formData);
                              console.log("All steps data:", allStepsData);
                              await vacancyService.createVacancyData(vacancyData);
                              toast({ description: t("vacancyCreated") });
                              router.push("/vacancy");
                            }
                          }
                        } catch (error) {
                          console.error("Vacancy operation error:", error);
                          toast({ 
                            variant: "destructive",
                            description: isEditMode ? t("vacancyUpdateError") : t("vacancyCreateError") 
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      }
                    }}
                    disabled={isLoading}
                    style={{backgroundColor:"green"}}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (isEditMode ? t("updating") : t("creating")) : (isEditMode ? t("update") : t("complete"))}
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextStep}
                    disabled={currentStepIndex === allSteps.length - 1}
                    className="flex items-center space-x-2"
                  >
                    <span>{t("next")}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">{t("noData")}</p>
          </div>
        )}
      </div>
      
      {/* Attribute Values Modal */}
      <AttributeValuesModal
        open={attributeValuesModalOpen}
        attributeId={selectedAttributeId}
        onClose={closeAttributeValuesModal}
      />
      
      <Toaster />
    </div>
  );
}