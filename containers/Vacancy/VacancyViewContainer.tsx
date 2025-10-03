"use client"
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useVacancyById } from "@/lib/hooks/useVacancy";
import { useAllSteps } from "@/lib/hooks/useStep";
import { ChevronLeft, ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import VacancyInfoModal from "./pages/VacancyInfoModal";
import { useTranslations } from "next-intl";

// Step Card Component
function StepCard({ 
  step, 
  stepIndex, 
  isOpen, 
  onToggle,
  vacancyData,
  t
}: { 
  step: any; 
  stepIndex: number; 
  isOpen: boolean; 
  onToggle: () => void; 
  vacancyData: any;
  t: any;
}) {
  // Get step data from Vacancy data instead of fetching separately
  const stepData = vacancyData?.steps?.find((vacancyStep: any) => vacancyStep.id === step.id);
  const isLoading = false; // No separate loading since data comes from vacancyData

  const renderAttributeValue = (attribute: any) => {
    if (!attribute.values || attribute.values.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    const value = attribute.values[0];
    
    // Check if value and sets exist
    if (!value || !value.sets || !Array.isArray(value.sets)) {
      return <span className="text-gray-400">-</span>;
    }

    const azValue = value.sets.find((set: any) => set.language === 'az');
    
    if (!azValue) {
      return <span className="text-gray-400">-</span>;
    }

    switch (attribute.valueType) {
      case 6: // MultiSelect
        const multiValues = value.sets.map((set: any) => set.stringValue || set.decimalValue || set.boolValue);
        return (
          <div className="flex flex-wrap gap-1">
            {multiValues.map((val: any, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {String(val)}
              </Badge>
            ))}
          </div>
        );
      case 7: // Date
      case 13: // Datetime
        return <span>{azValue.dateTimeValue ? new Date(azValue.dateTimeValue).toLocaleDateString('az-AZ') : '-'}</span>;
      case 8: // DateRange
        return <span>{azValue.stringValue || '-'}</span>;
      case 9: // Checkbox
        return <span>{azValue.boolValue ? '✓' : '✗'}</span>;
      case 2: // Number
        return <span>{azValue.decimalValue !== null ? azValue.decimalValue : '-'}</span>;
      default:
        return <span>{azValue.stringValue || azValue.decimalValue || azValue.boolValue || '-'}</span>;
    }
  };

  return (
    <Card className="border">
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {stepIndex + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {step.translations?.[0]?.title || `Step ${stepIndex + 1}`}
                </h3>
                <p className="text-sm text-gray-600">{t("viewData")}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Eye className="w-3 h-3 mr-1" />
                {stepData?.sections?.length || 0} {t("sections")}
              </Badge>
              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                isOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t("stepDataLoading")}</p>
            </div>
          ) : stepData ? (
            <div className="space-y-6">
              {stepData.sections?.map((section: any, sectionIndex: number) => (
                <div key={section.sectionId} className="border rounded p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                      {sectionIndex + 1}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {section.title || `Bölmə ${sectionIndex + 1}`}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.attributes?.map((attribute: any) => {
                      const attributeSet = attribute.attributeSets?.[0];
                      const label = attributeSet?.name || `Attribute ${attribute.attributeId}`;
                      const isRequired = Boolean(attribute.isImportant);
                      
                      return (
                        <div key={attribute.attributeId}>
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-medium">
                              {label}
                            </label>
                            {isRequired && (
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </div>
                          <div className="bg-gray-50 p-3 rounded border min-h-[40px] flex items-center">
                            <div className="text-sm">
                              {renderAttributeValue(attribute)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600">{t("noStepData")}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function VacancyViewContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("vacancyView");
  
  // Get Vacancy ID and step ID from URL parameters using useSearchParams
  const id = searchParams.get('id') ? parseInt(searchParams.get('id')!) : undefined;
  const stepId = searchParams.get('stepId') ? parseInt(searchParams.get('stepId')!) : undefined;
  
  // Debug logging
  console.log('VacancyViewContainer - current id:', id);
  console.log('VacancyViewContainer - current stepId:', stepId);
  
  // Fetch Vacancy data using the same approach as VacancyCreateContainer
  const { data: vacancyData, isLoading, isError } = useVacancyById(id, stepId);
  
  const { data: allStepsRaw = [], isLoading: stepsLoading } = useAllSteps('vakansiya', 2)

  // NEW: memoized filtered list (stabilizes reference)
  const allSteps = useMemo(
    () => (Array.isArray(allStepsRaw) ? allStepsRaw.filter((s: any) => s.isActive === true) : []),
    [allStepsRaw]
  )

  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set())
  const [allOpen, setAllOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const initializedRef = useRef(false) // NEW

  // NEW: initialize only once
  useEffect(() => {
    if (!initializedRef.current && allSteps.length > 0) {
      // If stepId is provided, open only that step, otherwise open first step
      const initialStepId = stepId ? String(stepId) : String(allSteps[0].id)
      setOpenAccordions(new Set([initialStepId]))
      initializedRef.current = true
    }
  }, [allSteps, stepId])

  const toggleAccordion = (stepId: string) => {
    setOpenAccordions(prev => {
      const next = new Set(prev)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  const toggleAllAccordions = () => {
    setOpenAccordions(prev => {
      if (allOpen) {
        setAllOpen(false)
        return new Set()
      }
      const allIds = new Set(allSteps.map(s => String(s.id)))
      setAllOpen(true)
      return allIds
    })
  }

  // Show error if no ID provided
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Eye className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("vacancyNotFound")}</h3>
          <p className="text-sm text-gray-600 mb-4">{t("vacancyNotFoundDesc")}</p>
          <Button onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || stepsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (isError || !vacancyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Eye className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("vacancyDeleted")}</h3>
          <p className="text-sm text-gray-600 mb-4">{t("vacancyDeletedDesc")}</p>
          <Button onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                {stepId ? t("stepView") : t("title")}
              </h1>
              <p className="text-gray-600">
                {stepId ? t("viewStepData") : t("viewData")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setInfoModalOpen(!infoModalOpen)}>
                {infoModalOpen ? t("backToVacancy") : t("info")}
              </Button>
              {!stepId && (
                <Button
                  onClick={toggleAllAccordions}
                  variant="outline"
                  size="sm"
                >
                  {allOpen ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      {t("closeAll")}
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      {t("openAll")}
                    </>
                  )}
                </Button>
              )}
              <Button onClick={() => router.back()} size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("back")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {infoModalOpen ? (
          <Card className="border">
            <CardContent className="p-6">
              <VacancyInfoModal 
                open={true} 
                onClose={() => setInfoModalOpen(false)} 
                vacancyData={vacancyData}
                embedded={true}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stepId ? (
            // If stepId is provided, show only that specific step
            (() => {
              const targetStep = allSteps.find(step => step.id === stepId);
              if (targetStep) {
                const stepIndex = allSteps.findIndex(step => step.id === stepId);
                return (
                  <StepCard
                key={targetStep.id}
                step={targetStep}
                stepIndex={stepIndex}
                isOpen={true}
                onToggle={() => {}} // Disable toggle for single step view
                vacancyData={vacancyData}
                t={t}
              />
                );
              }
              return (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{t("stepNotFound")}</h3>
                  <p className="text-sm text-gray-600 mb-4">{t("stepNotFoundDesc")}</p>
                </div>
              );
            })()
          ) : (
            // If no stepId, show all steps with accordion functionality
            allSteps.map((step, stepIndex) => (
              <StepCard
                key={step.id}
                step={step}
                stepIndex={stepIndex}
                isOpen={openAccordions.has(step.id.toString())}
                onToggle={() => toggleAccordion(step.id.toString())}
                vacancyData={vacancyData}
                t={t}
              />
            ))
          )}
          </div>
        )}
      </div>
    </div>
  );
}
