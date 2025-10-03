"use client"
import React, { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/Dropdown"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useCreateSection, useEditSection } from "@/lib/hooks/useSection"
import { useQuery } from "@tanstack/react-query"
import { sectionService } from '@/lib/services/sectionService'
import { stepService } from '@/lib/services/stepService'

interface CreateSectionModalProps {
    onClose?: () => void
    onSaved?: (title: string) => void
    id?: number
}

const CreateSectionModal: React.FC<CreateSectionModalProps> = ({ onClose, onSaved, id }) => {
    const isEdit = typeof id === 'number'

    const [stepValue, setStepValue] = useState("")
    const [pendingStepId, setPendingStepId] = useState<string | null>(null) // NEW: keep step id until options load
    // accept both spellings but normalize to 'vakansia'
    const [typeValue, setTypeValue] = useState<'' | 'cv' | 'vakansia' | 'vakansiya'>('')
    const [isChangeable, setIsChangeable] = useState<boolean>(true)

    const [activelanguage, setActivelanguage] = useState<'az' | 'en' | 'ru'>("az")
    const [titles, setTitles] = useState<Record<'az'|'en'|'ru', string>>({ az: '', en: '', ru: '' })
    const [descriptions, setDescriptions] = useState<Record<'az'|'en'|'ru', string>>({ az: '', en: '', ru: '' })

    const [isLoading, setIsLoading] = useState(false)
    const createSection = useCreateSection()
    const editSection = useEditSection()

    const { data: steps = [], isLoading: stepsLoading } = useQuery({
        queryKey: ['steps', 'all', (typeValue === 'vakansia' || typeValue === 'vakansiya') ? 'vakansia' : (typeValue || 'none')],
        queryFn: () => stepService.getAllSteps(
            typeValue
                ? (typeValue === 'cv'
                    ? 'cv'
                    : 'vakansiya')
                : undefined as any
        ),
        enabled: !!typeValue,
        staleTime: 60_000,
    })

    const t = useTranslations("section")
    const tc = useTranslations("common")

    useEffect(() => {
        let ignore = false
        if (isEdit && id) {
            setIsLoading(true)
            sectionService.getIdSections(id)
                .then(data => {
                    if (ignore) return
                    const section = data?.responseValue ?? data

                    // Map step.type (1/2) -> UI typeValue
                    const stepTypeNum = Number(section?.step?.type)
                    if (stepTypeNum === 1) setTypeValue('cv')
                    else if (stepTypeNum === 2) setTypeValue('vakansia')
                    else setTypeValue('')

                    // Store step id; set directly if steps already loaded, else keep pending
                    const sid = section?.step?.id != null ? String(section.step.id) : ''
                    if (sid) {
                        // if current steps list already contains it, assign immediately
                        const exists = Array.isArray(steps) && (steps as any[]).some(s => String(s.id) === sid)
                        if (exists) setStepValue(sid)
                        else {
                            setPendingStepId(sid)
                            setStepValue(sid) // still show selected value even if option not yet in list
                        }
                    }

                    if (typeof section?.isChangeable === 'boolean') {
                        setIsChangeable(section.isChangeable)
                    }

                    // Handle new translation format - translation is an array
                    const trList = Array.isArray(section?.translation)
                        ? section.translation
                        : Array.isArray(section?.translations)
                            ? section.translations
                            : []

                    const nextTitles: Record<'az'|'en'|'ru', string> = { az: '', en: '', ru: '' }
                    const nextDescriptions: Record<'az'|'en'|'ru', string> = { az: '', en: '', ru: '' }
                    for (const tr of trList) {
                        const langRaw = tr?.lang ?? tr?.language
                        const lang = typeof langRaw === 'string' ? langRaw.trim().toLowerCase() : ''
                        if (lang === 'az' || lang === 'en' || lang === 'ru') {
                            nextTitles[lang] = tr?.title ?? ''
                            nextDescriptions[lang] = tr?.description ?? ''
                        }
                    }
                    setTitles(nextTitles)
                    setDescriptions(nextDescriptions)
                })
                .catch(err => console.error('Load section failed', err))
                .finally(() => setIsLoading(false))
        } else {
            setStepValue('')
            setPendingStepId(null)
            setTitles({ az: '', en: '', ru: '' })
            setDescriptions({ az: '', en: '', ru: '' })
            setIsChangeable(true)
            setTypeValue('')
        }
        return () => { ignore = true }
    }, [isEdit, id])

    // When steps finish loading, if we had a pendingStepId ensure the option list now contains it
    useEffect(() => {
        if (pendingStepId && Array.isArray(steps) && steps.length) {
            const exists = (steps as any[]).some(s => String(s.id) === pendingStepId)
            if (exists) {
                setStepValue(pendingStepId)
                setPendingStepId(null)
            }
        }
    }, [steps, pendingStepId])

    const handleSave = async () => {
        if (!stepValue) return

        const translations = (["az","en","ru"] as const)
            .map(language => ({
                language,
                title: (titles[language] || '').trim(),
                description: (descriptions[language] || '').trim(),
            }))
            .filter(tr => tr.title || tr.description)

        if (translations.length === 0) return

        // Create payload (POST hələ də translations qəbul edir)
        const createPayload = { stepId: Number(stepValue), isActive: true, isChangeable, translations }

        try {
            if (isEdit && id) {
                // Edit üçün service içində sectionSets formatına çevriləcək
                await editSection.mutateAsync({ id, data: { ...createPayload } })
            } else {
                await createSection.mutateAsync(createPayload)
            }
            onSaved?.(translations.find(t => t.language === 'en')?.title || '')
            onClose?.()
        } catch (e) {
            console.error('Save section failed', e)
        }
    }

    return (
        <div className="w-xl space-y-4 p-6 bg-white rounded-lg shadow-lg" style={{ width: "40vw", maxWidth: "700px" }}>
            <h3 className="text-lg font-semibold">{isEdit ? t('editSection') : t("newSection")}</h3>
            {isLoading ? (
                <div className="text-center text-gray-500">{t("loading") || "Yüklənir..."}</div>
            ) : (
                <>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="mb-1 text-sm font-medium text-black" htmlFor="cv-type">
                                {t("type")}
                            </label>
                            <Dropdown
                                value={typeValue === 'vakansiya' ? 'vakansia' : typeValue}
                                onChange={(val) => {
                                    setTypeValue(val as any)
                                    // reset step when type changes (only if not in edit with same type)
                                    if (!isEdit) {
                                        setStepValue('')
                                        setPendingStepId(null)
                                    }
                                }}
                                options={[
                                    { value: "cv", label: "Cv" },
                                    { value: "vakansia", label: "Vakansiya" },
                                ]}
                                placeholder={tc("selectPlaceholder")}
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="mb-1 text-sm font-medium text-black">{t("selectSectionsPlaceholder")}</label>
                            <Dropdown
                                value={stepValue}
                                onChange={(val) => setStepValue(val)}
                                options={(() => {
                                    const list = Array.isArray(steps) ? steps as any[] : []
                                    const opts = list.map((step: any) => {
                                        const trs = Array.isArray(step?.translations) ? step.translations : []
                                        const az = trs.find((x: any) => String(x?.lang ?? x?.language ?? '').toLowerCase() === 'az')
                                        const en = trs.find((x: any) => String(x?.lang ?? x?.language ?? '').toLowerCase() === 'en')
                                        const label = (az?.title || en?.title || trs[0]?.title || step?.moduleName || step?.name || `#${step?.id}`) as string
                                        return { value: String(step.id), label }
                                    })
                                    // Ensure selected value present
                                    if (stepValue && !opts.find(o => o.value === stepValue)) {
                                        opts.push({ value: stepValue, label: `#${stepValue}` })
                                    }
                                    return opts
                                })()}
                                placeholder={
                                    !typeValue
                                        ? t("type")
                                        : stepsLoading
                                            ? t("loading")
                                            : t("selectSectionsPlaceholder")
                                }
                                disabled={!typeValue || stepsLoading}
                            />
                        </div>
                    </div>

                    {/* NEW isChangeable checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            id="isChangeable"
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer"
                            checked={isChangeable}
                            onChange={(e) => setIsChangeable(e.target.checked)}
                        />
                        <label htmlFor="isChangeable" className="text-sm font-medium cursor-pointer">
                            {t('isChangeable') || 'Is Changeable'}
                        </label>
                    </div>

                    <hr />

                    <Tabs value={activelanguage} onValueChange={(v) => setActivelanguage(v as any)}>
                        <TabsList>
                            <TabsTrigger value="az">AZ</TabsTrigger>
                            <TabsTrigger value="en">EN</TabsTrigger>
                            <TabsTrigger value="ru">RU</TabsTrigger>
                        </TabsList>

                        {(["az","en","ru"] as const).map(language => (
                            <TabsContent key={language} value={language} className="mt-4">
                                <div className="flex flex-col gap-3">
                                    <Input
                                        placeholder={`Title (${language.toUpperCase()})`}
                                        value={titles[language]}
                                        onChange={(e) => setTitles(prev => ({ ...prev, [language]: e.target.value }))}
                                    />
                                    
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <div className="flex justify-end gap-2 pt-2" style={{ justifyContent: "flex-end" }}>
                        <Button
                            variant="outline"
                            className="bg-blue-500 text-white"
                            onClick={() => { onClose?.() }}
                        >{tc("cancel")}</Button>
                        <Button
                            disabled={(createSection.isPending || editSection.isPending) || !stepValue}
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
                            style={{ backgroundColor: "#5BE244" }}
                        >
                            {(createSection.isPending || editSection.isPending) ? '...' : tc('save')}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default CreateSectionModal
