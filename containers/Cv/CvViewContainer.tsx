"use client"
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useCvById } from "@/lib/hooks/useCv";
import { useAllSteps } from "@/lib/hooks/useStep";
import { ChevronLeft, ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Img from "@/public/e3621e34e4a0882c12006eec736ef02dc11ff861.png"
import CvInfoModal from "./pages/CvInfoModal";
import { useTranslations } from "next-intl";
// Step Card Component
function StepCard({
  step,
  stepIndex,
  isOpen,
  onToggle,
  cvData,
  t
}: {
  step: any;
  stepIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  cvData: any;
  t: any;
}) {
  // Get step data from CV data instead of fetching separately
  const stepData = cvData?.steps?.find((cvStep: any) => cvStep.id === step.id);
  const isLoading = false; // No separate loading since data comes from cvData

  const renderAttributeValue = (attribute: any) => {
    if (!attribute.values || attribute.values.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    const value = attribute.values[0];

    // Check if value and sets exist
    if (!value || !value.sets || !Array.isArray(value.sets) || value.sets.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    const azValue = value.sets.find((set: any) => set.language === 'az') || value.sets[0];

    switch (attribute.valueType) {
      case 6: // MultiSelect
        // For multiselect, we might have multiple values in the values array
        const multiValues = attribute.values.flatMap((v: any) => 
          v.sets?.map((s: any) => s.stringValue || s.decimalValue || s.boolValue) || []
        ).filter(Boolean);
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
              <div className={`w-6 h-6 rounded flex items-center justify-center ${isOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
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
                      const label = attribute.name || `Attribute ${attribute.attributeId}`;
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

export default function CvViewContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("cvView");

  // Get CV ID and step ID from URL parameters using useSearchParams (like CvCreateContainer)
  const id = searchParams.get('id') ? parseInt(searchParams.get('id')!) : undefined;
  const stepId = searchParams.get('stepId') ? parseInt(searchParams.get('stepId')!) : undefined;

  // Debug logging
  console.log('CvViewContainer - current id:', id);
  console.log('CvViewContainer - current stepId:', stepId);

  // Fetch CV data using the same approach as CvCreateContainer
  const { data: cvData, isLoading, isError } = useCvById(id, stepId);

  const { data: allStepsRaw = [], isLoading: stepsLoading } = useAllSteps('cv', 1)

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
          <h3 className="text-lg font-medium mb-2">{t("cvNotFound")}</h3>
          <p className="text-sm text-gray-600 mb-4">{t("cvNotFoundDesc")}</p>
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

  if (isError || !cvData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Eye className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("cvDeleted")}</h3>
          <p className="text-sm text-gray-600 mb-4">{t("cvDeletedDesc")}</p>
          <Button onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">

      <div
        className="bg-white border-b z-50 shadow-sm"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <div className=" mx-auto px-6 py-6">
          {/* CV Header Card - Screenshot style */}


          {/* Action Buttons Row */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <div>
              <Button onClick={() => setInfoModalOpen(!infoModalOpen)}>
                {infoModalOpen ? 'CV-yə qayıt' : 'Məlumat'}
              </Button>
            </div>
            {!stepId && (
              <Button
                onClick={toggleAllAccordions}
                variant="outline"
                size="sm"
              >
                {allOpen ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Hamısını bağla
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Hamısını aç
                  </>
                )}
              </Button>
            )}
            <Button onClick={() => router.back()} size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Geri qayıt
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white from-purple-50 to-blue-50 rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between ">
            {/* Left side - Name, Description, Rating */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '2rem' }}>
                  Babək Ağamuradlı Rəhman oğlu
                </h1>
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1">
                  CV
                </Badge>
              </div>
              <p className="text-gray-700 text-base mb-3">
                Biznes proseslərinin inkişafı və avtomatlaşdırılması Proqramçı
              </p>
            </div>

            {/* Right side - Photo */}
            <div className="ml-6">
              <div className="w-32 h-40 rounded-lg border-4 border-blue-500 overflow-hidden bg-gray-100 shadow-lg">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                  <Image src={Img} alt="CV" width={100} height={100} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Scrollable content below sticky header */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {infoModalOpen ? (
          <Card className="border">
            <CardContent className="p-6">
              <CvInfoModal 
                open={true} 
                onClose={() => setInfoModalOpen(false)} 
                cvData={cvData}
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
                    onToggle={() => { }} // Disable toggle for single step view
                    cvData={cvData}
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
                cvData={cvData}
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
