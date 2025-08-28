"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { useRouter } from "next/navigation"
import { SelectDialog } from "../components/SelectDialog"
import { useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"

type CreateAttributeModalProps = {
    onClose?: () => void
}
const CreateAttributeModal: React.FC<CreateAttributeModalProps> = ({ onClose }) => {
    const router = useRouter()
    const t = useTranslations("attribute")
    const tc = useTranslations("common")

    const [newOrExisting, setNewOrExisting] = useState("")
    const [titleInput, setTitleInput] = useState("")
    const [selectedTitle, setSelectedTitle] = useState("")
    const [attributeType, setAttributeType] = useState("")
    const [attributeValue, setAttributeValue] = useState("")
    const [inputType, setInputType] = useState("text")
    const [attributeList, setAttributeList] = useState<any[]>([])
    const [optionDialogOpen, setOptionDialogOpen] = useState(false)
    const [dropdownOptions, setDropdownOptions] = useState<Record<number, string[]>>({}) // form.id -> options
    const [flags, setFlags] = useState({
        showInTable: false,
        required: false,
        showInPrint: false,
        addable: false,
    });

    const openOptionDialog = () => {
        setActiveFormForOptions(-1)
        setOptionDialogOpen(true)
    }
    const [activeFormForOptions, setActiveFormForOptions] = useState<number | null>(-1)

    const addSingleOption = (value: string) => {
        if (activeFormForOptions == null) return
        setDropdownOptions(prev => ({
            ...prev,
            [activeFormForOptions]: [...(prev[activeFormForOptions] || []), value]
        }))
    }

    const removeOptionByIndex = (idx: number) => {
        if (activeFormForOptions == null) return
        setDropdownOptions(prev => ({
            ...prev,
            [activeFormForOptions]: (prev[activeFormForOptions] || []).filter((_, i) => i !== idx)
        }))
    }

    const bulkAddOptions = (values: string[]) => {
        if (activeFormForOptions == null || !values.length) return
        setDropdownOptions(prev => ({
            ...prev,
            [activeFormForOptions]: [...(prev[activeFormForOptions] || []), ...values]
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onClose) onClose(); else router.back()
    }

    const resetForm = () => {
        setNewOrExisting("")
        setTitleInput("")
        setSelectedTitle("")
        setAttributeType("")
        setAttributeValue("")
        setInputType("text")
    }

    return (
        <div className="max-w-ml mx-auto p-6" style={{ width: "50vw", maxWidth: "880px" }}>
            <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col flex-1">
                        <label className="mb-1 text-sm font-medium text-black" htmlFor="cv-type">
                            {t("type")}
                        </label>
                        <Dropdown

                            options={[
                                { value: "option1", label: "Cv" },
                                { value: "option2", label: "Vakansiya" },
                            ]}
                            placeholder={tc("selectPlaceholder")}
                        />
                    </div>
                    <div className="flex flex-col flex-1">
                        <label className="mb-2 text-sm font-medium">{t("headerSelectPlaceholder")}</label>
                        <Dropdown
                            options={[
                                { value: "1", label: "Əsas səhifə" },
                                { value: "2", label: "Təhsil" },
                            ]}
                            placeholder={t("headerSelectPlaceholder")}
                        />
                    </div>
                </div>

                <hr className="border-t border-gray-300" />


                <div className="space-y-4 mt-2">
                    <div className="flex items-end gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="mb-2 text-sm font-medium">{t("attributeTypeLabel")}</label>
                            <Dropdown
                                value={attributeType}
                                onChange={(val: string) => setAttributeType(val)}
                                options={[
                                    { value: "string", label: "String" },
                                    { value: "number", label: "Number" },
                                    { value: "radio", label: "Radio" },
                                    { value: "textarea", label: "TextArea" },
                                    { value: "dropdown", label: "Select" },
                                    { value: "multiselect", label: "Multiselect" },
                                    { value: "date", label: "Date" },
                                    { value: "daterange", label: "DateRange" },
                                    { value: "checkbox", label: "Checkbox" },
                                    { value: "range", label: "Range" },
                                    { value: "color", label: "Color" },
                                    { value: "phone", label: "Phone" },
                                    { value: "datetime", label: "Datetime" },
                                    { value: "email", label: "Email" },
                                    { value: "price", label: "Price" },
                                ]}
                                placeholder={t("attributeTypeLabel")}
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="mb-2 text-sm font-medium">{t("inputTitleLabel")}</label>
                            <Input placeholder={t("inputTitlePlaceholder")} value={attributeValue} onChange={(e) => setAttributeValue(e.target.value)} />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="mb-2 text-sm font-medium invisible">.</label>
                            {(attributeType === "dropdown" || attributeType === "multiselect") ? (
                                <Button
                                    type="button"
                                    className="text-white w-full"
                                    style={{ backgroundColor: "#f3c940ff", transition: "background-color 0.3s" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffdd6cff")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3c940ff")}
                                    onClick={() => openOptionDialog()}
                                >
                                    {t("addValue")}
                                </Button>
                            ) : (
                                <div className="h-10" />
                            )}
                        </div>
                    </div>
                    <div className="pt-4">
                        {/* Bütün seçimlər horizontal tək sırada */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="space-y-3">
                                <label className="block text-lg  text-gray-800">{t("showInTable")}</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox style={{ borderColor: '#dc2626' }} />
                                        <span className="text-base font-medium">{t("yes")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox style={{ borderColor: '#dc2626' }} />
                                        <span className="text-base font-medium">{t("no")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-lg   text-gray-800">{t("showInPrint")}</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox style={{ borderColor: '#dc2626' }} />
                                        <span className="text-base font-medium">{t("yes")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox style={{ borderColor: '#dc2626' }} />
                                        <span className="text-base font-medium">{t("no")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-lg   text-gray-800">{t("addable")}</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox style={{ borderColor: '#dc2626' }} />
                                        <span className="text-base font-medium">{t("yes")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox style={{ borderColor: '#dc2626' }} />
                                        <span className="text-base font-medium">{t("no")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-lg   text-gray-800">{t("required")}</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox style={{ borderColor: '#dc2626' }} />
                                        <span className="text-base font-medium">{t("yes")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox style={{ borderColor: '#dc2626' }} />
                                        <span className="text-base font-medium">{t("no")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* {attributeType === "input" && (
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="mb-2 text-sm font-medium">Input növü</label>
                            <Dropdown
                                value={inputType}
                                onChange={setInputType}
                                options={[
                                    { value: "text", label: "Text" },
                                    { value: "number", label: "Number" },
                                    { value: "email", label: "Email" },
                                    { value: "date", label: "Date" },
                                    { value: "password", label: "Password" },
                                ]}
                                placeholder="Input növünü seçin"
                            />
                        </div>
                        {(attributeType === "dropdown" || attributeType === "multiselect") && (
                            <div className="flex flex-col flex-1">
                                <label className="mb-2 text-sm font-medium invisible">.</label>
                                <Button
                                    type="button"
                                    className="text-white"
                                    style={{ backgroundColor: "#f34040ff", transition: "background-color 0.3s" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fd6060cc")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f34040ff")}
                                    onClick={() => openOptionDialog()}
                                >
                                    Atribut Yarat
                                </Button>
                            </div>
                        )}
                    </div>
                )} */}

                <div className="flex justify-end gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
                    <Button
                        type="button"
                        variant="outline"
                        className="bg-blue-500 text-white"
                        onClick={() => {
                            resetForm()
                            if (onClose) onClose(); else router.back()
                        }}
                    >{tc("cancel")}</Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" style={{ backgroundColor: "#5BE244" }}>
                        {tc("save")}
                    </Button>
                </div>
            </form>

            <SelectDialog
                open={optionDialogOpen}
                onOpenChange={setOptionDialogOpen}
                options={activeFormForOptions != null ? (dropdownOptions[activeFormForOptions] || []) : []}
                onAdd={addSingleOption}
                onRemove={removeOptionByIndex}
                onBulkAdd={bulkAddOptions}
            />
        </div>
    )
}

export default CreateAttributeModal


