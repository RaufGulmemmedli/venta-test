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
import { useCvData, useCvById } from "@/lib/hooks/useCv";
import { useAllSteps } from "@/lib/hooks/useStep";
import { cvService } from "@/lib/services/cvServices";
import { ChevronLeft, ChevronRight, Circle, CheckCircle, Plus, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { X, Check } from "lucide-react";
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Toaster } from "@/components/ui/toaster"
import AttributeValuesModal from "@/containers/settings/pages/AttributeValuesModal"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface FormData {
  [key: string]: any;
}

export default function CvCreateContainer() {
  const router = useRouter();
  const { toast } = useToast();

  const t = useTranslations("cvCreate");

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
  const [errorFields, setErrorFields] = useState<Set<string>>(new Set());

  const [dropdownOpenMap, setDropdownOpenMap] = useState<Record<string, boolean>>({});
  const ddKeyFor = (attributeId: number, instanceIndex?: number) =>
    instanceIndex && instanceIndex > 0 ? `${attributeId}_${instanceIndex}` : String(attributeId);
  const setDropdownOpen = (key: string, open: boolean) =>
    setDropdownOpenMap(prev => ({ ...prev, [key]: open }));

  const { data: editCvData, isLoading: editDataLoading } = useCvById(editId);


  useEffect(() => {
    setVisitedSteps(prev => {
      if (prev.has(currentStepIndex)) return prev;
      const next = new Set(prev);
      next.add(currentStepIndex);
      return next;
    });
  }, [currentStepIndex]);

  const { data: allStepsRaw = [], isLoading: stepsLoading } = useAllSteps('cv', 1);

  const allSteps = allStepsRaw.filter(step => step.isActive === true);

  const currentStepId = allSteps[currentStepIndex]?.id;

  const { data: currentStepData, isLoading: dataLoading } = useCvData(currentStepId);

  useEffect(() => {
    if (currentStepData && currentStepId) {
      setAllStepsData(prev => ({
        ...prev,
        [currentStepId]: currentStepData
      }));
    }
  }, [currentStepData, currentStepId]);

  useEffect(() => {
    const loadAllStepsData = async () => {
      if (isEditMode && allSteps.length > 0 && editCvData) {
        try {
          const allStepsDataPromises = allSteps.map(step =>
            cvService.getCvData(step.id)
          );
          const results = await Promise.all(allStepsDataPromises);

          const newAllStepsData: Record<number, any> = {};

          results.forEach((stepStructure: any, index: number) => {
            const stepId = allSteps[index].id;
            const cvStep = editCvData.steps.find((s: any) => s.id === stepId);

            if (stepStructure && cvStep) {
              newAllStepsData[stepId] = {
                ...stepStructure,
                sections: stepStructure.sections.map((section: any) => {
                  const cvSection = cvStep.sections.find((s: any) => s.id === section.sectionId);
                  if (cvSection) {
                    return {
                      ...section,
                      attributes: section.attributes.map((attr: any) => {
                        const cvAttr = cvSection.attributes.find((a: any) => a.attributeId === attr.attributeId);
                        if (cvAttr) {
                          return {
                            ...attr,
                            values: cvAttr.values || attr.values
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

          setAllStepsData(newAllStepsData);
        } catch (error) {
          console.error('Error loading all steps data:', error);
        }
      }
    };

    loadAllStepsData();
  }, [isEditMode, allSteps.length, editCvData]);

  useEffect(() => {
    if (isEditMode && editCvData && !editDataLoading) {
      const newFormData: FormData = {};

      editCvData.steps.forEach(step => {
        step.sections.forEach(section => {
          section.attributes.forEach(attribute => {

            if (attribute.values && attribute.values.length > 0) {
              let formValue: any;

              switch (attribute.valueType) {
                case 6:
                  formValue = attribute.values.map((v: any) => {
                    return v.display || v.set?.stringValue || v.set?.decimalValue || v.sets?.[0]?.stringValue;
                  }).filter(Boolean);
                  break;
                  
                case 5:
                  const selectValue = attribute.values[0];
                  formValue = selectValue.display || selectValue.set?.stringValue || selectValue.set?.decimalValue || selectValue.sets?.[0]?.stringValue;
                  break;
                  
                case 8:
                  const rangeValue = attribute.values[0];
                  const rangeStr = rangeValue.set?.stringValue || rangeValue.sets?.[0]?.stringValue || rangeValue.display;
                  if (rangeStr && rangeStr.includes(' - ')) {
                    const [start, end] = rangeStr.split(' - ');
                    formValue = { start: start.trim(), end: end.trim() };
                  } else {
                    formValue = rangeStr;
                  }
                  break;
                  
                case 7:
                case 13:
                  const dateValue = attribute.values[0];
                  formValue = dateValue.set?.dateTimeValue || dateValue.sets?.[0]?.dateTimeValue || dateValue.display;
                  break;
                  
                case 9:
                  const checkboxValue = attribute.values[0];
                  formValue = checkboxValue.set?.boolValue ?? checkboxValue.sets?.[0]?.boolValue ?? (checkboxValue.display === 'true');
                  break;
                  
                case 2:
                case 15:
                  const numberValue = attribute.values[0];
                  const numVal = numberValue.set?.decimalValue ?? numberValue.sets?.[0]?.decimalValue ?? numberValue.display;
                  formValue = numVal !== null && numVal !== undefined ? Number(numVal) : null;
                  break;
                  
                default:
                  const defaultValue = attribute.values[0];
                  formValue = defaultValue.set?.stringValue || defaultValue.sets?.[0]?.stringValue || defaultValue.display;
                  break;
              }

              if (formValue !== null && formValue !== undefined && formValue !== "") {
                newFormData[attribute.attributeId] = formValue;
              }
            }
          });
        });
      });

      setFormData(newFormData);
    }
  }, [isEditMode, editCvData, editDataLoading]);

  const isValueEmpty = (attribute: any, value: any) => {
    const vt = attribute.valueType
    switch (vt) {
      case 6:
        return !Array.isArray(value) || value.length === 0
      case 8:
        return !value || !value.start || !value.end
      case 9:
        return value !== true
      case 7:
      case 13:
        return !value || isNaN(new Date(value).getTime())
      case 2:
      case 10:
      case 15:
        return value === undefined || value === null || value === ""
      default:
        return value === undefined || value === null || (typeof value === "string" && value.trim() === "")
    }
  }

  const validateCurrentStep = () => {
    if (!currentStepData) return true
    if (!currentStepData.sections || !Array.isArray(currentStepData.sections)) return true

    const newErrorFields = new Set<string>();

    for (const section of currentStepData.sections) {
      if (!section.attributes || !Array.isArray(section.attributes)) {
        continue;
      }

      const instanceCount = getSectionInstanceCount(section.sectionId);
      const totalInstances = instanceCount + 1;

      for (let instanceIndex = 0; instanceIndex < totalInstances; instanceIndex++) {
        const requiredFields = section.attributes.filter(
          (attr: any) => attr.isImportant || attr.isInportant
        );

        for (const field of requiredFields) {
          const key = instanceIndex === 0 ? field.attributeId : `${field.attributeId}_${instanceIndex}`;
          const value = formData[key];

          if (isValueEmpty(field, value)) {
            newErrorFields.add(String(key));
          }
        }
      }
    }

    if (newErrorFields.size > 0) {
      setErrorFields(newErrorFields);
      return false;
    }

    setErrorFields(new Set());
    return true;
  };

  const validateAllSteps = () => {
    const newErrorFields = new Set<string>();

    for (const step of allSteps) {
      const stepData = allStepsData[step.id];
      if (stepData && stepData.sections && Array.isArray(stepData.sections)) {
        for (const section of stepData.sections) {
          if (!section.attributes || !Array.isArray(section.attributes)) {
            continue;
          }

          const instanceCount = getSectionInstanceCount(section.sectionId);
          const totalInstances = instanceCount + 1;

          for (let instanceIndex = 0; instanceIndex < totalInstances; instanceIndex++) {
            const requiredFields = section.attributes.filter(
              (attr: any) => attr.isImportant || attr.isInportant
            );

            for (const field of requiredFields) {
              const key = instanceIndex === 0 ? field.attributeId : `${field.attributeId}_${instanceIndex}`;
              const value = formData[key];

              if (isValueEmpty(field, value)) {
                newErrorFields.add(String(key));
              }
            }
          }
        }
      }
    }

    if (newErrorFields.size > 0) {
      setErrorFields(newErrorFields);
      return false;
    }

    setErrorFields(new Set());
    return true;
  };



  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      router.push('/cv');
    }
  };

  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      toast({
        variant: "destructive",
        description: t("fillRequiredFields") || "Zəhmət olmasa tələb olunan sahələri doldurun"
      });
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
    const params = new URLSearchParams();
    params.set('fromStep', String(currentStepIndex));
    if (editId) {
      params.set('resumeId', String(editId));
    }
    router.push(`/cv/static-step?${params.toString()}`);
  };

  const createCvData = () => {
    if (!allSteps || allSteps.length === 0) return null;

    const allSections: any[] = [];

    allSteps.forEach(step => {
      const stepData = allStepsData[step.id];
      if (stepData && stepData.sections && Array.isArray(stepData.sections)) {
        allSections.push(...stepData.sections);
      }
    });

    if (allSections.length === 0) return null;

    const sectionDtos = allSections.map(section => {
      if (!section.attributes || !Array.isArray(section.attributes)) {
        return [];
      }

      const instanceCount = getSectionInstanceCount(section.sectionId);
      const totalInstances = instanceCount + 1;

      const sectionInstances = [];

      for (let instanceIndex = 0; instanceIndex < totalInstances; instanceIndex++) {
        const instanceAttributes = section.attributes.map((attribute: any) => {
          const key = instanceIndex === 0 ? attribute.attributeId : `${attribute.attributeId}_${instanceIndex}`;
          const formValue = formData[key];

          const attributeValueIds: number[] = [];
          const inputValue: { value: string; language: string }[] = [];

          if (formValue !== undefined && formValue !== null && formValue !== "") {
            switch (attribute.valueType) {
              case 6:
                if (Array.isArray(formValue)) {
                  formValue.forEach(val => {
                    const existingValue = Array.isArray(attribute.values) 
                      ? attribute.values.find((v: any) =>
                          Array.isArray(v.languages) && v.languages.some((lang: any) => lang.value === String(val))
                        )
                      : undefined;

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
              case 3:
              case 5:
                const existingValue = Array.isArray(attribute.values)
                  ? attribute.values.find((v: any) =>
                      Array.isArray(v.languages) && v.languages.some((lang: any) => lang.value === String(formValue))
                    )
                  : undefined;

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
              case 8:
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
              case 7:
              case 13:
                if (formValue) {
                  ['az', 'en', 'ru'].forEach(lang => {
                    inputValue.push({
                      value: String(formValue),
                      language: lang
                    });
                  });
                }
                break;
              case 9:
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
        });

        sectionInstances.push({
          sectionId: section.sectionId,
          attributes: instanceAttributes
        });
      }

      return sectionInstances;
    }).flat();

    return { sectionDtos };
  };

  const buildUpdateData = () => {
    const cvData = createCvData();
    if (!cvData) return null;

    return {
      id: editId,
      sectionDtos: cvData.sectionDtos
    };
  };

  const updateFormData = (attributeId: number, value: any, instanceIndex?: number) => {
    const key = (instanceIndex !== undefined && instanceIndex > 0) ? `${attributeId}_${instanceIndex}` : attributeId;
    setFormData(prev => {
      const updated = {
        ...prev,
        [key]: value
      };
      return updated;
    });

    setErrorFields(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(String(key));
      return newErrors;
    });
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

    if (updated) {
      const currentStepId = allSteps[currentStepIndex]?.id;
      if (currentStepId) {
        cvService.getCvData(currentStepId).then(stepData => {
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

  const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder = "Seçin...",
    hasError = false
  }: {
    options: { label: string; value: string }[];
    value: string | undefined;
    onChange: (val: string) => void;
    placeholder?: string;
    hasError?: boolean;
  }) => {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredOptions = options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    const selectValue = (val: string) => {
      onChange(val);
      setOpen(false);
      setSearchTerm("");
    };

    const clearValue = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
    };

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setSearchTerm("");
      }
    };

    const buttonClassName = cn(
      "w-full min-h-[40px] flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2 text-left text-sm focus:outline-none focus:ring-2",
      hasError
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-blue-500"
    );

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={buttonClassName}
          >
            <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center gap-2">
              {selectedOption && (
                <button
                  type="button"
                  onClick={clearValue}
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
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={6}
          avoidCollisions
          collisionPadding={8}
          className="z-50 p-0 w-[var(--radix-popover-trigger-width)] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2 border-b bg-gray-50">
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {t("noResults")}
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => selectValue(opt.value)}
                    className={`flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''
                      }`}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                    <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-blue-600' : ''}`}>
                      {opt.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const MultiSelectDropdown = React.memo(({
    options,
    value,
    onChange,
    placeholder = "Seçin...",
    hasError = false,
    open,
    onOpenChange,
  }: {
    options: { label: string; value: string }[];
    value: string[] | undefined;
    onChange: (val: string[]) => void;
    placeholder?: string;
    hasError?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => {
    const [searchTerm, setSearchTerm] = React.useState("");
    const selected = Array.isArray(value) ? value : [];
  
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  
    const filteredOptions = React.useMemo(
      () => options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      [options, searchTerm]
    );
  
    const toggleValue = (val: string) => {
      const exists = selected.includes(val);
      const newValues = exists ? selected.filter(v => v !== val) : [...selected, val];
      onChange(newValues);
    };
  
    const clearAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
    };
  
    const buttonClassName = cn(
      "w-full min-h-[40px] flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2 text-left text-sm focus:outline-none focus:ring-2",
      hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
    );
  
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => onOpenChange(!open)}
            className={buttonClassName}
          >
            <div className="flex items-center gap-1 pr-2 min-w-0">
              {selected.length === 0 ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : (
                <span className="text-gray-900 text-sm truncate">
                  {selected.length} seçildi
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
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
        </PopoverTrigger>
  
        <PopoverContent
          forceMount
          side="bottom"
          align="start"
          sideOffset={6}
          avoidCollisions
          collisionPadding={8}
          className="z-50 p-0 w-[var(--radix-popover-trigger-width)] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={() => onOpenChange(false)}
          onPointerDownOutside={(e) => {
            const target = e.target as Node;
            if (triggerRef.current && triggerRef.current.contains(target)) return;
            onOpenChange(false);
          }}
        >
          <div className="p-2 border-b bg-gray-50">
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm"
              autoFocus
            />
          </div>
  
          <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {t("noResults")}
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selected.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => toggleValue(opt.value)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left"
                  >
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                      style={{ width: 16, height: 16 }}
                    />
                    <span className="text-sm flex-1">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  });
  

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

  const renderAttributeInput = (attribute: any, instanceIndex?: number) => {
    const { attributeId, valueType, attributeSets, values } = attribute;
    const key = (instanceIndex !== undefined && instanceIndex > 0) ? `${attributeId}_${instanceIndex}` : attributeId;
    const rawValue = formData[key];
    const currentValue = rawValue ?? "";
    const hasError = errorFields.has(String(key));

    const options = extractOptions(values)

    const attributeSet = attributeSets?.[0];
    const label = attributeSet?.name || attribute.name || `Attribute ${attributeId}`;
    const placeholder = attributeSet?.name || attribute.name || "Dəyər daxil edin";

    const baseClassName = "w-full bg-gray-50 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2";
    const errorClassName = hasError
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const commonClassName = `${baseClassName} ${errorClassName}`;

    const commonProps = {
      value: normalizeInputValue(rawValue),
      onChange: (e: any) => {
        const val = getEventValue(e)
        updateFormData(attributeId, val, instanceIndex)
      },
      className: commonClassName
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
                <label key={index} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${hasError
                    ? 'border-red-500 bg-red-50'
                    : isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <input
                    type="radio"
                    name={`attr_${attributeId}`}
                    value={optionValue}
                    checked={isSelected}
                    onChange={(e) => {
                      updateFormData(attributeId, e.target.value, instanceIndex);
                    }}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className={`text-sm font-medium flex-1 ${isSelected ? 'text-blue-700' : 'text-gray-700'
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
          />
        );
      case 5:
        return (
          <SearchableSelect
            options={options}
            value={currentValue}
            onChange={(val) => updateFormData(attributeId, val, instanceIndex)}
            placeholder="Seçin..."
            hasError={hasError}
          />
        );
      case 6: {
        const ddKey = ddKeyFor(attributeId, instanceIndex);
        return (
          <MultiSelectDropdown
            options={options}
            value={Array.isArray(currentValue) ? currentValue : []}
            onChange={(val) => updateFormData(attributeId, val, instanceIndex)}
            placeholder="Seçin..."
            hasError={hasError}
            open={!!dropdownOpenMap[ddKey]}
            onOpenChange={(v) => setDropdownOpen(ddKey, v)}
          />
        );
      }
      case 7:
        return (
          <StyledDatePicker
            value={currentValue}
            onChange={(val) => updateFormData(attributeId, val, instanceIndex)}
            placeholder="Tarix seçin"
            hasError={hasError}
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
                  },
                  instanceIndex
                )
              }
              className={commonClassName}
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
                  },
                  instanceIndex
                )
              }
              className={commonClassName}
            />
          </div>
        );
      case 9:
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={currentValue}
              onCheckedChange={(checked) => updateFormData(attributeId, checked, instanceIndex)}
            />

          </div>
        );
      case 10:
        return <Input {...commonProps} type="range" min="0" max="100" />;
      case 11:
        return <Input {...commonProps} type="color" />;
      case 12:
        return <Input {...commonProps} type="tel" placeholder="+994XX XXX XX XX" />;
      case 13:
        return (
          <StyledDateTimePicker
            value={currentValue}
            onChange={(val) => updateFormData(attributeId, val, instanceIndex)}
            hasError={hasError}
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

  const tryParseDate = (text: string): Date | null => {
    const parsePatterns = ["dd.MM.yyyy", "dd/MM/yyyy", "yyyy-MM-dd"];
    for (const pattern of parsePatterns) {
      const parsed = parse(text.trim(), pattern, new Date());
      if (isValid(parsed)) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
    }
    const nat = new Date(text);
    if (isValid(nat)) {
      return new Date(nat.getFullYear(), nat.getMonth(), nat.getDate());
    }
    return null;
  };

  const StyledDatePicker = ({
    value,
    onChange,
    placeholder = "Tarix seçin",
    hasError = false
  }: { value?: string; onChange: (val: string) => void; placeholder?: string; hasError?: boolean }) => {
    const fmtOut = "dd.MM.yyyy";
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState("");
    const [invalid, setInvalid] = React.useState(false);
    const dateObj = value ? new Date(value) : undefined;

    const [displayDate, setDisplayDate] = React.useState<Date>(() => dateObj || new Date());

    React.useEffect(() => {
      if (value) {
        const d = new Date(value);
        if (isValid(d)) {
          setText(format(d, fmtOut));
          setDisplayDate(d);
          setInvalid(false);
        }
      } else {
        setText("");
        setInvalid(false);
      }
    }, [value]);

    const currentYear = new Date().getFullYear();
    const years = React.useMemo(
      () => Array.from({ length: 101 }, (_, i) => currentYear - 70 + i),
      [currentYear]
    );
    const months = [
      "Yan", "Fev", "Mar", "Apr", "May", "İyn",
      "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"
    ];

    const setMonth = (m: number) => {
      setDisplayDate(d => new Date(d.getFullYear(), m, 1));
    };
    const setYear = (y: number) => {
      setDisplayDate(d => new Date(y, d.getMonth(), 1));
    };

    const applyDate = (d?: Date) => {
      if (!d) return;
      const pure = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      onChange(pure.toISOString());
      setText(format(pure, fmtOut));
      setInvalid(false);
      setOpen(false);
    };

    const handleParse = () => {
      if (!text.trim()) {
        onChange("");
        setInvalid(false);
        return;
      }
      const parsed = tryParseDate(text);
      if (parsed) {
        onChange(parsed.toISOString());
        setText(format(parsed, fmtOut));
        setInvalid(false);
      } else {
        setInvalid(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleParse();
      } else if (e.key === "ArrowDown" || (e.altKey && e.key === "ArrowDown")) {
        e.preventDefault();
        setOpen(true);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setText("");
      onChange("");
      setInvalid(false);
    };

    const inputClassName = cn(
      "w-full flex-1 rounded-md border bg-gray-50 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2",
      invalid || hasError
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    );

    return (
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleParse}
            placeholder={placeholder}
            className={inputClassName}
          />
          {text && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-3 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <CalendarIcon className="w-4 h-4 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={6}
            avoidCollisions
            collisionPadding={8}
            className="z-50 p-0 w-[320px] bg-white border border-gray-200 rounded-md shadow-lg"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
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
                  {t("thisMonth")}
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
                    const now = new Date();
                    applyDate(now);
                  }}
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  {t("today")}
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setText("");
                      setInvalid(false);
                      setOpen(false);
                    }}
                    className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    {t("clear")}
                  </button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const StyledDateTimePicker = ({
    value,
    onChange,
    placeholder = "Tarix və saat",
    hasError = false
  }: { value?: string; onChange: (val: string) => void; placeholder?: string; hasError?: boolean }) => {
    const fmtOut = "dd.MM.yyyy HH:mm";
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState("");
    const [invalid, setInvalid] = React.useState(false);
    const dateObj = value ? new Date(value) : undefined;

    const [tempDate, setTempDate] = React.useState<Date | undefined>(dateObj);
    const [displayDate, setDisplayDate] = React.useState<Date>(() => dateObj || new Date());
    const [hour, setHour] = React.useState(dateObj ? String(dateObj.getHours()).padStart(2, "0") : "00");
    const [minute, setMinute] = React.useState(dateObj ? String(dateObj.getMinutes()).padStart(2, "0") : "00");

    React.useEffect(() => {
      if (value) {
        const d = new Date(value);
        if (isValid(d)) {
          setText(format(d, fmtOut));
          setTempDate(d);
          setDisplayDate(new Date(d.getFullYear(), d.getMonth(), 1));
          setHour(String(d.getHours()).padStart(2, "0"));
          setMinute(String(d.getMinutes()).padStart(2, "0"));
          setInvalid(false);
        }
      } else {
        setText("");
        setInvalid(false);
      }
    }, [value]);

    const currentYear = new Date().getFullYear();
    const years = React.useMemo(
      () => Array.from({ length: 101 }, (_, i) => currentYear - 70 + i),
      [currentYear]
    );
    const months = [
      "Yan", "Fev", "Mar", "Apr", "May", "İyn",
      "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"
    ];

    const setMonth = (m: number) => {
      setDisplayDate(d => new Date(d.getFullYear(), m, 1));
    };
    const setYear = (y: number) => {
      setDisplayDate(d => new Date(y, d.getMonth(), 1));
    };

    const apply = () => {
      if (!tempDate) return;
      const d = new Date(tempDate);
      d.setHours(parseInt(hour || "0"), parseInt(minute || "0"), 0, 0);
      onChange(d.toISOString());
      setText(format(d, fmtOut));
      setInvalid(false);
      setOpen(false);
    };

    const quickNow = () => {
      const now = new Date();
      setTempDate(now);
      setHour(String(now.getHours()).padStart(2, "0"));
      setMinute(String(now.getMinutes()).padStart(2, "0"));
      setDisplayDate(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    const handleParse = () => {
      if (!text.trim()) {
        onChange("");
        setInvalid(false);
        return;
      }

      let dateTime: Date | null = null;

      const match1 = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2})$/);
      if (match1) {
        const [, day, month, year, hh, mm] = match1;
        dateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hh), parseInt(mm));
      }

      if (!dateTime) {
        const iso = new Date(text);
        if (isValid(iso)) dateTime = iso;
      }

      if (!dateTime) {
        const datePart = tryParseDate(text);
        if (datePart) {
          dateTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), 0, 0);
        }
      }

      if (dateTime && isValid(dateTime)) {
        onChange(dateTime.toISOString());
        setText(format(dateTime, fmtOut));
        setInvalid(false);
      } else {
        setInvalid(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleParse();
      } else if (e.key === "ArrowDown" || (e.altKey && e.key === "ArrowDown")) {
        e.preventDefault();
        setOpen(true);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setText("");
      onChange("");
      setInvalid(false);
    };

    const inputClassName = cn(
      "w-full flex-1 rounded-md border bg-gray-50 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2",
      invalid || hasError
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    );

    return (
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleParse}
            placeholder={placeholder}
            className={inputClassName}
          />
          {text && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-3 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Clock className="w-4 h-4 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={6}
            avoidCollisions
            collisionPadding={8}
            className="w-[340px] p-3 space-y-3 z-50"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
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
                {t("thisMonth")}
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
                onChange={(e) => setHour(e.target.value.slice(0, 2))}
                className="w-16 border rounded px-2 py-1 text-sm"
              />
              <span className="text-gray-500">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => setMinute(e.target.value.slice(0, 2))}
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
                    onChange("");
                    setText("");
                    setInvalid(false);
                    setOpen(false);
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
                    setHour("00");
                    setMinute("00");
                  }
                }}
                className="ml-auto text-xs text-gray-500 hover:underline"
              >
                Saatı sıfırla
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

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
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-default ${isCurrent
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
                            className={`ml-2 text-sm font-medium ${isCurrent ? 'text-red-600' : isPrevious ? 'text-red-600' : 'text-gray-600'
                              }`}
                          >
                            {step.translations?.[0]?.title || `Step ${index + 1}`}
                          </span>
                          <div className="w-8 h-0.5 bg-gray-300 mx-4" />
                        </div>
                      );
                    })}

                    {/* Static Step Button - Without Number */}
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          if (!validateCurrentStep()) {
                            toast({
                              variant: "destructive",
                              description: t("fillRequiredFields") || "Zəhmət olmasa tələb olunan sahələri doldurun"
                            });
                            return;
                          }
                          setCompletedSteps(prev => {
                            const next = new Set(prev);
                            next.add(currentStepIndex);
                            return next;
                          });
                          createStaticStep();
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-gray-400 text-gray-500 hover:border-red-500 hover:text-red-500 transition-all duration-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <span className="ml-2 text-sm font-medium text-gray-500">
                        {t("mediaStep")}
                      </span>
                    </div>
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
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Plus className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t("noActiveSteps")}</h3>
            <p className="text-sm text-gray-600 mb-4">{t("noActiveStepsDesc")}</p>
          </div>
        ) : currentStepData ? (
          <div className="space-y-8">

            {currentStepData.sections.map((section, idx) => {
              if (!section.attributes || !Array.isArray(section.attributes)) {
                return null;
              }

              const isChangeable = section.isChangeable;
              const instanceCount = getSectionInstanceCount(section.sectionId);
              const totalInstances = instanceCount + 1;

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
                              <div className="h-px bg-gray-300 flex-1"></div>
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
                                        <Settings
                                          className="w-4 h-4 text-blue-600 hover:text-blue-700 cursor-pointer"
                                          onClick={() => openAttributeValuesModal(attribute.attributeId)}
                                        />
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
                      if (!validateAllSteps()) {
                        toast({
                          variant: "destructive",
                          description: t("fillRequiredFields") || "Zəhmət olmasa bütün tələb olunan sahələri doldurun"
                        });
                        return;
                      }

                      try {
                        setIsLoading(true);

                        if (isEditMode) {
                          const updateData = buildUpdateData();
                          if (updateData) {
                            await cvService.updateCv(updateData);
                            toast({ description: t("cvUpdated") || "CV uğurla yeniləndi!" });
                            router.push(`/cv/static-step?resumeId=${editId}&fromStep=${currentStepIndex}`);
                          }
                        } else {
                          const cvData = createCvData();
                          if (cvData) {
                            const response = await cvService.createCvData(cvData);
                            
                            const resumeId = response?.responseValue?.resumeId || response?.resumeId;
                            
                            if (resumeId) {
                              toast({ description: t("cvCreated") || "CV uğurla yaradıldı!" });
                              router.push(`/cv/static-step?resumeId=${resumeId}&fromStep=${currentStepIndex}`);
                            } else {
                              console.error("Resume ID not found in response:", response);
                              toast({ 
                                variant: "destructive",
                                description: "CV yaradıldı, lakin media yükləmə üçün ID tapılmadı. Siyahıya yönləndirilirsiniz." 
                              });
                              router.push("/cv");
                            }
                          }
                        }
                      } catch (error) {
                        console.error("CV operation error:", error);
                        toast({
                          variant: "destructive",
                          description: isEditMode ? t("cvUpdateError") : t("cvCreateError")
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    style={{ backgroundColor: "green" }}
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

