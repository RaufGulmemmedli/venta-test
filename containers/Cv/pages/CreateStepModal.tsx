"use client"
import React, { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/Dropdown"

interface CreateStepModalProps {
    onClose?: () => void
    onSaved?: (name: string) => void
}

const CreateStepModal: React.FC<CreateStepModalProps> = ({ onClose, onSaved }) => {
    const [name, setName] = useState("")
    const t = useTranslations("step")
    const tc = useTranslations("common")

    const handleSave = () => {
        if (!name.trim()) return
        onSaved?.(name.trim())
        setName("")
        onClose?.()
    }

    return (
        <div className="w-xl space-y-4" style={{width: "40vw", maxWidth: "700px"}}>
            <h3 className="text-lg font-semibold">{t("newStep")}</h3>
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t("stepNameLabel")}</label>
                    <Input placeholder={t("stepNamePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-black" htmlFor="cv-type">{t("typeLabel")}</label>
                    <Dropdown

                        options={[
                            { value: "op  tion1", label: "Cv" },
                            { value: "option2", label: "Vakansiya" },
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
                    disabled={!name.trim()}
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    style={{ backgroundColor: "#5BE244" }}
                >{tc("save")}</Button>
            </div>
        </div>
    )
}

export default CreateStepModal
