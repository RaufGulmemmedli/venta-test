"use client"
import React, { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/Dropdown"
import { usecreateStep, useeditStep } from "@/lib/hooks/useStep"
import { stepService } from '@/lib/services/stepService'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface CreateStepModalProps {
    onClose?: () => void
    onSaved?: (name: string) => void
    id?: number
}

const CreateStepModal: React.FC<CreateStepModalProps> = ({ onClose, onSaved, id }) => {
    const isEdit = typeof id === 'number'
    const [contextValue, setContextValue] = useState("")
    const [activeLang, setActiveLang] = useState<'az' | 'en' | 'ru'>("az")
    const [titles, setTitles] = useState<Record<'az' | 'en' | 'ru', string>>({ az: '', en: '', ru: '' })
    const [descriptions, setDescriptions] = useState<Record<'az' | 'en' | 'ru', string>>({ az: '', en: '', ru: '' })
    const [isLoading, setIsLoading] = useState(false)
    const createStep = usecreateStep()
    const editStep = useeditStep()
    const t = useTranslations("step")
    const tc = useTranslations("common")

    useEffect(() => {
        let ignore = false
        if (isEdit && id) {
            setIsLoading(true)
            stepService.getIdSteps(id)
                .then(data => {
                    if (ignore) return
                    // get-by-id yeni cavab: data.responseValue
                    const step = data?.responseValue ?? data?.response?.step ?? data?.step ?? data
                    if (step?.type != null) {
                        setContextValue(String(step.type)) // "1" | "2"
                    }

                    if (Array.isArray(step?.translations)) {
                        const nextTitles: Record<'az' | 'en' | 'ru', string> = { az: '', en: '', ru: '' }
                        const nextDescriptions: Record<'az' | 'en' | 'ru', string> = { az: '', en: '', ru: '' }

                        for (const tr of step.translations) {
                            const langRaw = tr?.lang
                            const lang = typeof langRaw === 'string' ? langRaw.trim().toLowerCase() : ''
                            if (lang === 'az' || lang === 'en' || lang === 'ru') {
                                const key = lang as 'az' | 'en' | 'ru'
                                nextTitles[key] = tr?.title ?? ''
                                nextDescriptions[key] = tr?.description ?? ''
                            }
                        }
                        setTitles(nextTitles)
                        setDescriptions(nextDescriptions)
                    }
                })
                .catch(err => {
                    console.error('Load step failed', err)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        } else {
            setContextValue('')
            setTitles({ az: '', en: '', ru: '' })
            setDescriptions({ az: '', en: '', ru: '' })
        }
        return () => { ignore = true }
    }, [isEdit, id])

    const handleSave = async () => {
        if (!contextValue) return
        
        // Validate: Check if all languages have values
        const filledLanguages = (['az', 'en', 'ru'] as const).filter(lang => (titles[lang] || '').trim() !== '')
        if (filledLanguages.length > 0 && filledLanguages.length < 3) {
            const { toast } = await import("sonner")
            const missingLangs = (['az', 'en', 'ru'] as const).filter(lang => !(titles[lang] || '').trim())
            toast.error(`Xəta: Bütün dillərdə məlumat doldurulmalıdır!\nDoldurulmayan dillər: ${missingLangs.map(l => l.toUpperCase()).join(', ')}`, {
                duration: 5000
            })
            return
        }
        
        const translations = (["az", "en", "ru"] as const)
            .map(lang => ({
                lang,
                title: (titles[lang] || '').trim(),
                description: (descriptions[lang] || '').trim(),
            }))
            .filter(tr => tr.title || tr.description)

        if (translations.length === 0) return

        const payload = { type: Number(contextValue), isActive: true, translations }
        try {
            if (isEdit && id) {
                await editStep.mutateAsync({ id, data: payload })
            } else {
                await createStep.mutateAsync(payload)
            }
            onSaved?.(translations.find(t => t.lang === 'en')?.title || '')
            onClose?.()
        } catch (e) {
            console.error('Save step failed', e)
        }
    }
    return (
        <div className="w-xl space-y-4 p-6 bg-white rounded-lg shadow-lg" style={{ width: "30vw", maxWidth: "700px" }}>
            <h3 className="text-lg font-semibold">{isEdit ? t('editStep') : t("newStep")}</h3>
            <div className="flex items-start gap-4">
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-black" htmlFor="cv-type">{t("typeLabel")}</label>
                    <Dropdown
                        value={contextValue}
                        onChange={(val) => setContextValue(val)}
                        options={[
                            { value: "1", label: "Cv" },
                            { value: "2", label: "Vakansia" },
                        ]}
                        placeholder={tc("selectPlaceholder")}
                    />
                </div>
            </div>
            <hr />
            
            {/* Warning banner when language values don't match */}
            {(() => {
                const LANGS = ['az', 'en', 'ru'] as const
                const filledLanguages = LANGS.filter(lang => (titles[lang] || '').trim() !== '')
                const emptyLanguages = LANGS.filter(lang => !(titles[lang] || '').trim())
                const allMatch = filledLanguages.length === 0 || filledLanguages.length === 3
                
                if (!allMatch) {
                    return (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                            <div className="flex items-start gap-2">
                                <span className="text-red-600 font-semibold">⚠️</span>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-800">
                                        Diqqət: Bütün dillərdə məlumat doldurulmalıdır!
                                    </p>
                                    <p className="text-xs text-red-600 mt-1">
                                        Doldurulmuş: {filledLanguages.map(l => l.toUpperCase()).join(', ') || 'Heç biri'} | 
                                        Doldurulmamış: {emptyLanguages.map(l => l.toUpperCase()).join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
                return null
            })()}
            
            <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as any)}>
                <TabsList>
                    <TabsTrigger value="az">AZ</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                    <TabsTrigger value="ru">RU</TabsTrigger>
                </TabsList>
                {(["az", "en", "ru"] as const).map(lang => (
                    <TabsContent key={lang} value={lang} className="mt-4">
                        <div className="flex flex-col gap-3">
                            <Input
                                placeholder={`Enter title (${lang.toUpperCase()})`}
                                value={titles[lang]}
                                onChange={(e) => setTitles(prev => ({ ...prev, [lang]: e.target.value }))}
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
                    disabled={(createStep.isPending || editStep.isPending) || !contextValue}
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
                    style={{ backgroundColor: "#5BE244" }}
                >
                    {(createStep.isPending || editStep.isPending) ? '...' : (isEdit ? tc('save') : tc('save'))}
                </Button>
            </div>
        </div>
    )
}

export default CreateStepModal
