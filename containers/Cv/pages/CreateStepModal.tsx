"use client"
import React, { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/Dropdown"
import { useCreateStep, useEditStep } from "@/lib/hooks/useStep"
import { stepService } from '@/lib/services/stepService'

interface CreateStepModalProps {
    onClose?: () => void
    onSaved?: (name: string) => void
    id?: number
}

const CreateStepModal: React.FC<CreateStepModalProps> = ({ onClose, onSaved, id }) => {
    const isEdit = typeof id === 'number'
    const [name, setName] = useState("")
    const [contextValue, setContextValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)  
    const createStep = useCreateStep()
    const editStep = useEditStep()
    const t = useTranslations("step")
    const tc = useTranslations("common")

    useEffect(() => {
        let ignore = false
        if (isEdit && id) {
            setIsLoading(true) 
            stepService.getIdSteps(id).then(data => {
                if (ignore) return
                const response = data?.response
                setName(response?.name || '')
                setContextValue(response?.context ? String(response.context) : '')
            }).catch(err => {
                console.error('Load step failed', err)
            }).finally(() => {
                setIsLoading(false) 
            })
        } else {
            setName('')
            setContextValue('')
        }
        return () => { ignore = true }
    }, [isEdit, id])

    const handleSave = async () => {
        if (!name.trim() || !contextValue) return
        const payload = { name: name.trim(), context: Number(contextValue), isActive: true }
        try {
            if (isEdit && id) {
                await editStep.mutateAsync({ id, data: payload })
            } else {
                await createStep.mutateAsync(payload)
            }
            onSaved?.(name.trim())
            onClose?.()
        } catch (e) {
            console.error('Save step failed', e)
        }
    }
    return (
        <div className="w-xl space-y-4 p-6 bg-white rounded-lg shadow-lg" style={{ width: "30vw", maxWidth: "700px" }}>
            <h3 className="text-lg font-semibold">{isEdit ? t('editStep') : t("newStep")}</h3>
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t("stepNameLabel")}</label>
                    <Input placeholder={t("stepNamePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-black" htmlFor="cv-type">{t("typeLabel")}</label>
                    <Dropdown
                        value={contextValue}
                        onChange={(val) => setContextValue(val)}
                        options={[
                            { value: "1", label: "Cv" },
                            { value: "2", label: "Vakansiya" },

                        ]}
                        placeholder={tc("selectPlaceholder")}
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2" style={{ justifyContent: "flex-end" }}>
                <Button
                    variant="outline"
                    className="bg-blue-500 text-white"
                    onClick={() => { onClose?.() }}
                >{tc("cancel")}</Button>
                <Button
                    disabled={(createStep.isPending || editStep.isPending) || !name.trim() || !contextValue}
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
