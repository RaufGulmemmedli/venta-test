"use client"
import React, { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/Dropdown"
import { useCreateSection, useEditSection, } from "@/lib/hooks/useSection"
import { useAllSteps } from "@/lib/hooks/useStep"
import { sectionService } from '@/lib/services/sectionService'

interface CreateSectionModalProps {
    onClose?: () => void
    onSaved?: (name: string) => void
    id?: number
}

const CreateSectionModal: React.FC<CreateSectionModalProps> = ({ onClose, onSaved, id }) => {
    const isEdit = typeof id === 'number'
    const [name, setName] = useState("")
    const [contextValue, setContextValue] = useState("1")
    const [stepValue, setStepValue] = useState("")
    const [isLoading, setIsLoading] = useState(false) 
    const createSection = useCreateSection()
    const editSection = useEditSection()
    const { data: steps = [], isLoading: stepsLoading } = useAllSteps(Number(contextValue))
    const t = useTranslations("section")
    const tc = useTranslations("common")

    useEffect(() => {
        let ignore = false
        if (isEdit && id) {
            setIsLoading(true) 
            sectionService.getIdSections(id).then(data => {
                if (ignore) return
                const response = data?.response
                setName(response?.name || '')
                setContextValue(response?.context ? String(response.context) : '1')
                setStepValue(response?.stepId ? String(response.stepId) : '')
            }).catch(err => {
                console.error('Load section failed', err)
            }).finally(() => {
                setIsLoading(false)
            })
        } else {
            setName('')
            setContextValue('1')
            setStepValue('')
        }
        return () => { ignore = true }
    }, [isEdit, id])

    const handleSave = async () => {
        if (!name.trim() || !contextValue || !stepValue) return
        const payload = { name: name.trim(), context: Number(contextValue), stepId: Number(stepValue), isActive: true }
        try {
            if (isEdit && id) {
                await editSection.mutateAsync({ id, data: payload })
            } else {
                await createSection.mutateAsync(payload)
            }
            onSaved?.(name.trim())
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
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">{t("sectionNameLabel")}</label>
                            <Input
                                placeholder={t("sectionNamePlaceholder")}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="mb-1 text-sm font-medium text-black">{t("typeLabel")}</label>
                            <Dropdown
                                value={contextValue}
                                onChange={(val) => {
                                    setContextValue(val)
                                    setStepValue("") 
                                }}
                                options={[
                                    { value: "1", label: "Cv" },
                                    { value: "2", label: "Vakansiya" },
                                ]}
                                placeholder={t("selectPlaceholder")}
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="mb-1 text-sm font-medium text-black">{t("selectSectionsPlaceholder")}</label>
                            <Dropdown
                                value={stepValue}
                                onChange={(val) => setStepValue(val)}
                                options={steps.map((step) => ({
                                    value: String(step.id),
                                    label: step.name,
                                }))}
                                placeholder={stepsLoading ? t("loading") : t("selectSectionsPlaceholder")}
                                disabled={stepsLoading || steps.length === 0}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2" style={{ justifyContent: "flex-end" }}>
                        <Button
                            variant="outline"
                            className="bg-blue-500 text-white"
                            onClick={() => { onClose?.() }}
                        >{tc("cancel")}</Button>
                        {/* <Button
                    disabled={(createSection.isPending || editSection.isPending) || !name.trim() || !contextValue || !stepValue}
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
                >
                    {(createSection.isPending || editSection.isPending) ? '...' : (isEdit ? tc('save') : tc('save'))}
                </Button> */}
                        <Button
                            disabled={(createSection.isPending || editSection.isPending) || !name.trim() || !contextValue}
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
                            style={{ backgroundColor: "#5BE244" }}
                        >
                            {(createSection.isPending || editSection.isPending) ? '...' : (isEdit ? tc('save') : tc('save'))}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default CreateSectionModal
