"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Dropdown from "@/components/ui/Dropdown"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useSections } from "@/lib/hooks/useSection"
import { useCreateAttribut, useEditAttribut } from "@/lib/hooks/useAttribut"
import { attributService } from "@/lib/services/attributServices"
import { sectionService } from "@/lib/services/sectionService"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

type CreateAttributeModalProps = { onClose?: () => void; id?: number; onOpenValues?: (attributeId: number, isNewAttribute: boolean) => void }
const LANGS = ['az', 'en', 'ru'] as const
type Lang = typeof LANGS[number]

const CreateAttributeModal: React.FC<CreateAttributeModalProps> = ({ onClose, id, onOpenValues }) => {
    const router = useRouter()
    const t = useTranslations("attribute")
    const tc = useTranslations("common")

    const [cvSections, setCvSections] = useState<number[]>([])
    const [vacancySections, setVacancySections] = useState<number[]>([])
    const [attributeType, setAttributeType] = useState("")
    const [cvSectionsOpen, setCvSectionsOpen] = useState(false)
    const [vacancySectionsOpen, setVacancySectionsOpen] = useState(false)
    
    // Auto-disable addable flag when attribute type is not Select or Multiselect
    useEffect(() => {
        if (attributeType && attributeType !== "5" && attributeType !== "6") {
            setFlags(prev => ({ ...prev, addable: false }))
        }
    }, [attributeType])
    const [selectedLanguage, setSelectedLanguage] = useState<Lang>('az')
    const [flags, setFlags] = useState({ showInTable: false, required: false, showInPrint: false, addable: false, included: false })
    const [inputTitleLanguages, setInputTitleLanguages] = useState<Record<string, string>>({})
    const [titleIds, setTitleIds] = useState<Record<string, number | undefined>>({})
    const [loadingEdit, setLoadingEdit] = useState(false)

    const createAttribut = useCreateAttribut()
    const editAttribut = useEditAttribut()

    const isEdit = !!id
    const requiresValues = attributeType === "5" || attributeType === "6"

    // Fetch CV sections (Type 1)
    const { data: cvSectionsList = [], isLoading: cvSectionsLoading } = useSections(
        { pageNumber: 1, pageSize: 1000, isActive: true, type: '1' } as any,
        { keepPreviousData: true, staleTime: 60_000 }
    )

    // Fetch Vacancy sections (Type 2)
    const { data: vacancySectionsList = [], isLoading: vacancySectionsLoading } = useSections(
        { pageNumber: 1, pageSize: 1000, isActive: true, type: '2' } as any,
        { keepPreviousData: true, staleTime: 60_000 }
    )

    const cvSectionsOptions = (Array.isArray(cvSectionsList) ? cvSectionsList : []).map((sec: any) => {
        const trs = Array.isArray(sec?.translations) ? sec.translations : []
        const az = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').toLowerCase() === 'az')
        const en = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').toLowerCase() === 'en')
        return { id: sec.id, label: az?.title || en?.title || trs[0]?.title || sec?.stepName || `#${sec?.id}` }
    })

    const vacancySectionsOptions = (Array.isArray(vacancySectionsList) ? vacancySectionsList : []).map((sec: any) => {
        const trs = Array.isArray(sec?.translations) ? sec.translations : []
        const az = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').toLowerCase() === 'az')
        const en = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').toLowerCase() === 'en')
        return { id: sec.id, label: az?.title || en?.title || trs[0]?.title || sec?.stepName || `#${sec?.id}` }
    })

    // Load attribute when editing
    useEffect(() => {
        if (!id) return
        let active = true
        setLoadingEdit(true)

        // First, load the attribute data
        attributService.getIdAttributs(id).then((resp: any) => {
            if (!active) return
            console.log('Attribute API Response:', resp)
            const data = resp?.responseValue ?? resp?.response ?? resp?.attribute ?? resp
            console.log('Processed Attribute Data:', data)
            if (!data) return

            // Set attribute type
            if (data.valueType != null) setAttributeType(String(data.valueType))

            // Set flags - handle both old and new field names
            setFlags({
                addable: !!data.isValuable,
                showInTable: !!data.isVisible || !!data.isVisible,
                required: !!data.isImportant || !!data.isImportant,
                showInPrint: !!data.isPrinted,
                included: !!data.isIncluded,

            })

            // Handle translations from new API format
            const arr = Array.isArray(data.attributeSets) ? data.attributeSets : 
                       Array.isArray(data.setCreateAttributeRequest) ? data.setCreateAttributeRequest : []
            console.log('Translations array:', arr)
            const titles: Record<string, string> = {}
            const ids: Record<string, number | undefined> = {}

            arr.forEach((tr: any) => {
                const lang = String(tr?.language || '').toLowerCase()
                if (!lang) return
                titles[lang] = tr?.name || ''
                if (tr?.id != null) ids[lang] = tr.id
            })

            console.log('Processed titles:', titles)
            console.log('Processed ids:', ids)

            setInputTitleLanguages(titles)
            setTitleIds(ids)

            // Load sectionIds if available
            if (Array.isArray(data.sectionIds) && data.sectionIds.length > 0) {
                console.log('Section IDs:', data.sectionIds)
                // We need to determine which sections are CV (type 1) and which are Vacancy (type 2)
                // Fetch section details for each sectionId
                Promise.all(
                    data.sectionIds.map((sectionId: number) =>
                        sectionService.getIdSections(sectionId).catch(() => null)
                    )
                ).then(responses => {
                    if (!active) return
                    const cvSecs: number[] = []
                    const vacancySecs: number[] = []
                    
                    responses.forEach((resp, idx) => {
                        if (!resp) return
                        const sectionData = resp?.responseValue ?? resp?.response ?? resp
                        const stepType = Number(sectionData?.step?.type)
                        const sectionId = data.sectionIds[idx]
                        
                        if (stepType === 1) cvSecs.push(sectionId)
                        else if (stepType === 2) vacancySecs.push(sectionId)
                    })
                    
                    setCvSections(cvSecs)
                    setVacancySections(vacancySecs)
                    console.log('Loaded CV sections:', cvSecs)
                    console.log('Loaded Vacancy sections:', vacancySecs)
                }).catch(err => {
                    console.error('Failed to load section data:', err)
                })
            }
        }).finally(() => setLoadingEdit(false))
        return () => { active = false }
    }, [id])

    const buildTitleTranslations = () =>
        LANGS.map(lang => {
            const name = (inputTitleLanguages[lang] || '').trim()
            const obj: any = { name: name || '', language: lang }
            if (isEdit && titleIds[lang] != null) obj.id = titleIds[lang]
            return obj
        }) as { id?: number; name: string; language: string }[]

    const buildEditPayload = () => {
        const allSectionIds = [...cvSections, ...vacancySections]
        return Object.fromEntries(Object.entries({
            id,
            valueType: attributeType ? Number(attributeType) : undefined,
            isValuable: !!flags.addable,
            isVisible: !!flags.showInTable,
            isImportant: !!flags.required,
            isPrinted: !!flags.showInPrint,
            isIncluded: !!flags.included,
            isActive: true,
            sectionIds: allSectionIds.length > 0 ? allSectionIds : undefined,
            attributeSets: buildTitleTranslations()
        }).filter(([, v]) => v !== undefined))
    }

    const valueTypeMap: Record<string, number> = {
        string: 0, number: 1, radio: 2, textarea: 3, dropdown: 4, multiselect: 5,
        date: 6, daterange: 7, checkbox: 8, range: 9, color: 10, phone: 11,
        datetime: 12, email: 13, price: 14
    }

    const buildCreatePayload = () => {
        const trans = buildTitleTranslations()
        const vt = attributeType && /^\d+$/.test(attributeType)
            ? Number(attributeType)
            : valueTypeMap[attributeType] ?? undefined
        const allSectionIds = [...cvSections, ...vacancySections]
        return Object.fromEntries(Object.entries({
            valueType: vt,
            isValuable: !!flags.addable,
            isVisible: !!flags.showInTable,
            isImportant: !!flags.required,
            isPrinted: !!flags.showInPrint,
            isIncluded: !!flags.included,
            isActive: true,
            sectionIds: allSectionIds.length > 0 ? allSectionIds : undefined,
            attributeSets: trans.length ? trans : undefined
        }).filter(([, v]) => v !== undefined))
    }

    const extractCreatedAttributeId = (resp: any): number | null => {
        // First check responseValue.id (new API format)
        if (resp?.responseValue?.id && typeof resp.responseValue.id === 'number') {
            return resp.responseValue.id
        }
        // Fallback to old formats
        const r = resp?.response || resp
        const raw = r?.atributeId ?? r?.attributeId ?? r?.id ?? r?.responseId
        return (typeof raw === 'number' && raw > 0) ? raw : null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate: Check if all languages have values
        const filledLanguages = LANGS.filter(lang => (inputTitleLanguages[lang] || '').trim() !== '')
        if (filledLanguages.length > 0 && filledLanguages.length < 3) {
            const { toast } = await import("sonner")
            const missingLangs = LANGS.filter(lang => !(inputTitleLanguages[lang] || '').trim())
            toast.error(`Xəta: Bütün dillərdə məlumat doldurulmalıdır!\nDoldurulmayan dillər: ${missingLangs.map(l => l.toUpperCase()).join(', ')}`, {
                duration: 5000
            })
            return
        }
        
        // EDIT
        if (isEdit) {
            const body = buildEditPayload()
            const { id: attrId, ...data } = body
            if (attrId && typeof attrId === 'number') {
                await editAttribut.mutateAsync({ id: attrId, data })
                if (requiresValues) {
                    if (onOpenValues) {
                        onOpenValues(attrId, false) // false = not new, use update API
                        return
                    }
                }
            }
            onClose?.()
            return
        }

        // CREATE
        try {
            const resp: any = await createAttribut.mutateAsync(buildCreatePayload() as any)
            const newId = extractCreatedAttributeId(resp)
            if (newId && requiresValues) {
                if (onOpenValues) {
                    onOpenValues(newId, true) // true = new, use create API
                    return
                }
            }
        } catch (e) { console.error(e) }
        onClose?.()
    }

    return (
        <div>
            <div className="max-w-ml mx-auto p-6" style={{ width: "50vw", maxWidth: "850px" }}>
                <h1 className="text-2xl font-semibold mb-4">
                    {isEdit ? (t("editTitle") || "Edit Attribute") : t("title")}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {loadingEdit && isEdit && (
                        <div className="text-sm text-muted-foreground">{t("loading")}</div>
                    )}
                    
                    {/* CV and Vacancy Sections - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* CV Sections Multi-Select */}
                        <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium">{t("cvSections")}</label>
                        <Popover open={cvSectionsOpen} onOpenChange={setCvSectionsOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={cvSectionsOpen}
                                    className="w-full justify-between"
                                >
                                    {cvSections.length > 0
                                        ? `${cvSections.length} ${t("selected")}`
                                        : t("selectCvSections")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder={t("searchSections")} />
                                    <CommandEmpty>{t("noSectionFound")}</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {cvSectionsOptions.map((option) => (
                                            <CommandItem
                                                key={option.id}
                                                value={String(option.id)}
                                                onSelect={() => {
                                                    setCvSections(prev =>
                                                        prev.includes(option.id)
                                                            ? prev.filter(id => id !== option.id)
                                                            : [...prev, option.id]
                                                    )
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        cvSections.includes(option.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {option.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {cvSections.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {cvSections.map(sectionId => {
                                    const option = cvSectionsOptions.find(o => o.id === sectionId)
                                    return (
                                        <span
                                            key={sectionId}
                                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                        >
                                            {option?.label || sectionId}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => setCvSections(prev => prev.filter(id => id !== sectionId))}
                                            />
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                        </div>

                        {/* Vacancy Sections Multi-Select */}
                        <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium">{t("vacancySections")}</label>
                        <Popover open={vacancySectionsOpen} onOpenChange={setVacancySectionsOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={vacancySectionsOpen}
                                    className="w-full justify-between"
                                >
                                    {vacancySections.length > 0
                                        ? `${vacancySections.length} ${t("selected")}`
                                        : t("selectVacancySections")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder={t("searchSections")} />
                                    <CommandEmpty>{t("noSectionFound")}</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {vacancySectionsOptions.map((option) => (
                                            <CommandItem
                                                key={option.id}
                                                value={String(option.id)}
                                                onSelect={() => {
                                                    setVacancySections(prev =>
                                                        prev.includes(option.id)
                                                            ? prev.filter(id => id !== option.id)
                                                            : [...prev, option.id]
                                                    )
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        vacancySections.includes(option.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {option.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {vacancySections.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {vacancySections.map(sectionId => {
                                    const option = vacancySectionsOptions.find(o => o.id === sectionId)
                                    return (
                                        <span
                                            key={sectionId}
                                            className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                        >
                                            {option?.label || sectionId}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => setVacancySections(prev => prev.filter(id => id !== sectionId))}
                                            />
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                        </div>
                    </div>
                    
                    <hr className="border-gray-300" />

                    {/* Warning banner when language values don't match */}
                    {(() => {
                        const filledLanguages = LANGS.filter(lang => (inputTitleLanguages[lang] || '').trim() !== '')
                        const emptyLanguages = LANGS.filter(lang => !(inputTitleLanguages[lang] || '').trim())
                        const allMatch = filledLanguages.length === 0 || filledLanguages.length === 3
                        
                        if (!allMatch) {
                            return (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
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

                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="mb-2 text-sm font-medium">{t("attributeTypeLabel")}</label>
                            <Dropdown
                                value={attributeType}
                                onChange={(v: string) => setAttributeType(v)}
                                options={[
                                    { value: "1", label: "String" },
                                    { value: "2", label: "Number" },
                                    { value: "4", label: "TextArea" },
                                    { value: "5", label: "Select" },
                                    { value: "6", label: "Multiselect" },
                                    { value: "7", label: "Date" },
                                    { value: "9", label: "Checkbox" },
                                    { value: "12", label: "Phone" },
                                    { value: "13", label: "Datetime" },
                                    { value: "14", label: "Email" },
                                    { value: "15", label: "Price" },
                                ]}
                                placeholder={t("attributeTypeLabel")}
                            />
                        </div>
                        <div>
                            <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as Lang)}>
                                <TabsList>
                                    <TabsTrigger value="az">AZ</TabsTrigger>
                                    <TabsTrigger value="en">EN</TabsTrigger>
                                    <TabsTrigger value="ru">RU</TabsTrigger>
                                </TabsList>
                                <label className="block text-sm font-medium mt-2">{t("inputTitleLabel")}</label>
                                {LANGS.map(l => (
                                    <TabsContent key={l} value={l} className="mt-2">
                                        <Input
                                            placeholder={t("inputTitlePlaceholder")}
                                            value={inputTitleLanguages[l] || ''}
                                            onChange={e => setInputTitleLanguages(p => ({ ...p, [l]: e.target.value }))}
                                        />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>

                        <div className="grid grid-cols-4 gap-6 pt-4">
                            <FlagSwitch
                                label={t("showInTable")}
                                checked={flags.showInTable}
                                onChange={v => setFlags(p => ({ ...p, showInTable: v }))}
                                tYes={t("yes")} tNo={t("no")}
                            />
                            <FlagSwitch
                                label={t("addable")}
                                checked={flags.addable}
                                onChange={v => setFlags(p => ({ ...p, addable: v }))}
                                tYes={t("yes")} tNo={t("no")}
                                disabled={attributeType !== "5" && attributeType !== "6"}
                            />
                            <FlagSwitch
                                label={t("required")}
                                checked={flags.required}
                                onChange={v => setFlags(p => ({ ...p, required: v }))}
                                tYes={t("yes")} tNo={t("no")}
                            />
                           
                            <FlagSwitch
                                label={t("included")}
                                checked={flags.included}
                                onChange={v => setFlags(p => ({ ...p, included: v }))}
                                tYes={t("yes")} tNo={t("no")}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-blue-500 text-white "
                            onClick={() => onClose ? onClose() : router.back()}
                        >{tc("cancel")}</Button>

                        <Button
                            style={{ backgroundColor: requiresValues ? "#5BE244" : "green" }}
                            type="submit"
                            className="bg-green-600 text-white"
                            disabled={
                                createAttribut.isPending ||
                                editAttribut.isPending ||
                                (cvSections.length === 0 && vacancySections.length === 0) ||
                                !attributeType ||
                                LANGS.every(l => !(inputTitleLanguages[l]?.trim()))
                            }
                        >
                            {createAttribut.isPending || editAttribut.isPending
                                ? (isEdit ? tc("saving") || "Saving..." : tc("creating") || "Creating...")
                                : (requiresValues ? t("next") : tc("save"))}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const FlagSwitch = ({ label, checked, onChange, tYes, tNo, disabled = false }: {
    label: string; checked: boolean; onChange: (v: boolean) => void; tYes: string; tNo: string; disabled?: boolean
}) => (
    <div className="space-y-3">
        <label className={`block text-lg ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>{label}</label>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Checkbox 
                    checked={checked} 
                    onCheckedChange={v => onChange(!!v)} 
                    disabled={disabled}
                />
                <span className={`text-base font-medium ${disabled ? 'text-gray-400' : ''}`}>{tYes}</span>
            </div>
            <div className="flex items-center gap-2">
                <Checkbox 
                    checked={!checked} 
                    onCheckedChange={() => onChange(false)} 
                    disabled={disabled}
                />
                <span className={`text-base font-medium ${disabled ? 'text-gray-400' : ''}`}>{tNo}</span>
            </div>
        </div>
    </div>
)

export default CreateAttributeModal
