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

type CreateAttributeModalProps = { onClose?: () => void; id?: number; onOpenValues?: (attributeId: number) => void }
const LANGS = ['az', 'en', 'ru'] as const
type Lang = typeof LANGS[number]

const CreateAttributeModal: React.FC<CreateAttributeModalProps> = ({ onClose, id, onOpenValues }) => {
    const router = useRouter()
    const t = useTranslations("attribute")
    const tc = useTranslations("common")

    const [moduleType, setModuleType] = useState<'' | 'cv' | 'vakansiya'>('')
    const [headerStep, setHeaderStep] = useState('')
    const [attributeType, setAttributeType] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState<Lang>('az')
    const [flags, setFlags] = useState({ showInTable: false, required: false, showInPrint: false, addable: false })
    const [inputTitleLanguages, setInputTitleLanguages] = useState<Record<string, string>>({})
    const [titleIds, setTitleIds] = useState<Record<string, number | undefined>>({})
    const [loadingEdit, setLoadingEdit] = useState(false)

    const createAttribut = useCreateAttribut()
    const editAttribut = useEditAttribut()

    const isEdit = !!id
    const requiresValues = attributeType === "5" || attributeType === "6"

    // Map cv -> '1', vakansiya -> '2' for GET params
    const typeParam = moduleType ? (moduleType === 'cv' ? '1' : '2') : undefined

    const { data: headerSections = [], isLoading: headerLoading } = useSections(
        { pageNumber: 1, pageSize: 1000, isActive: true, type: typeParam } as any,
        { enabled: !!typeParam, keepPreviousData: true, staleTime: 60_000 }
    )

    const headerOptions = (Array.isArray(headerSections) ? headerSections : []).map((sec: any) => {
        const trs = Array.isArray(sec?.translations) ? sec.translations : []
        const az = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').toLowerCase() === 'az')
        const en = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').toLowerCase() === 'en')
        return { value: String(sec.id), label: az?.title || en?.title || trs[0]?.title || sec?.stepName || `#${sec?.id}` }
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

            // Set section ID
            if (data.sectionId != null) setHeaderStep(String(data.sectionId))

            // Set attribute type
            if (data.valueType != null) setAttributeType(String(data.valueType))

            // Set flags - handle both old and new field names
            setFlags({
                addable: !!data.isValuable,
                showInTable: !!data.isVisible || !!data.isVisiable,
                required: !!data.isImportant || !!data.isImportand,
                showInPrint: !!data.isPrinted
            })

            // Handle translations from new API format
            const arr = Array.isArray(data.setCreateAttributeRequest) ? data.setCreateAttributeRequest : []
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

            // Now we need to determine module type by fetching section data
            if (data.sectionId != null) {
                console.log('Loading section data for sectionId:', data.sectionId)
                // Fetch section data to get step type
                sectionService.getIdSections(data.sectionId).then((sectionResp: any) => {
                    if (!active) return
                    console.log('Section API Response:', sectionResp)
                    const sectionData = sectionResp?.responseValue ?? sectionResp?.response ?? sectionResp
                    console.log('Processed Section Data:', sectionData)
                    if (sectionData?.step?.type) {
                        const stepType = Number(sectionData.step.type)
                        console.log('Step Type:', stepType)
                        if (stepType === 1) setModuleType('cv')
                        else if (stepType === 2) setModuleType('vakansiya')
                    }
                }).catch(err => {
                    console.error('Failed to load section data:', err)
                })
            }
        }).finally(() => setLoadingEdit(false))
        return () => { active = false }
    }, [id])

    const normalizeType = (val: any): '' | 'cv' | 'vakansiya' => {
        const v = String(val ?? '').toLowerCase()
        if (!v) return ''
        if (v.startsWith('cv')) return 'cv'
        if (v.includes('vakans')) return 'vakansiya'
        return ''
    }

    const buildTitleTranslations = () =>
        LANGS.map(lang => {
            const name = (inputTitleLanguages[lang] || '').trim()
            if (!name) return null
            const obj: any = { name, language: lang }
            if (isEdit && titleIds[lang] != null) obj.id = titleIds[lang]
            return obj
        }).filter(Boolean) as { id?: number; name: string; language: string }[]

    const buildEditPayload = () =>
        Object.fromEntries(Object.entries({
            id,
            sectionId: headerStep ? Number(headerStep) : undefined,
            valueType: attributeType ? Number(attributeType) : undefined,
            isValuable: !!flags.addable,
            isVisiable: !!flags.showInTable,
            isImportant: !!flags.required,
            setCreateAttributeRequest: buildTitleTranslations()
        }).filter(([, v]) => v !== undefined))

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
        return Object.fromEntries(Object.entries({
            sectionId: headerStep ? Number(headerStep) : undefined,
            valueType: vt,
            isChangeable: true,
            isMultiple: (attributeType === '6' || vt === valueTypeMap.multiselect) ? true : undefined,
            isValuable: !!flags.addable,
            isVisiable: !!flags.showInTable,
            isImportant: !!flags.required,
            isPrinted: !!flags.showInPrint,
            isActive: true,
            setCreateAttributeRequest: trans.length ? trans : undefined
        }).filter(([, v]) => v !== undefined))
    }

    const extractCreatedAttributeId = (resp: any): number | null => {
        const r = resp?.response || resp
        const raw = r?.atributeId ?? r?.attributeId ?? r?.id ?? r?.responseId
        return (typeof raw === 'number' && raw > 0) ? raw : null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // EDIT
        if (isEdit) {
            const body = buildEditPayload()
            const { id: attrId, ...data } = body
            if (attrId && typeof attrId === 'number') {
                await editAttribut.mutateAsync({ id: attrId, data })
                if (requiresValues) {
                    if (onOpenValues) {
                        onOpenValues(attrId)
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
                    onOpenValues(newId)
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
                    <div className="flex gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="mb-1 text-sm font-medium">{t("type")}</label>
                            <Dropdown
                                value={moduleType}
                                onChange={(v: string) => setModuleType(v as any)}
                                options={[{ value: "cv", label: "CV" }, { value: "vakansiya", label: "Vakansiya" }]}
                                placeholder={tc("selectPlaceholder")}
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="mb-1 text-sm font-medium">{t("headerSelectPlaceholder")}</label>
                            <Dropdown
                                value={headerStep}
                                onChange={(v: string) => setHeaderStep(v)}
                                options={headerOptions}
                                placeholder={!moduleType ? t("type") : headerLoading ? t("loading") : t("headerSelectPlaceholder")}
                                disabled={!moduleType || headerLoading || headerOptions.length === 0}
                            />
                        </div>
                    </div>

                    <hr className="border-gray-300" />

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

                        <div className="grid grid-cols-3 gap-6 pt-4">
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
                            />
                            <FlagSwitch
                                label={t("required")}
                                checked={flags.required}
                                onChange={v => setFlags(p => ({ ...p, required: v }))}
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
                                !headerStep ||
                                !attributeType ||
                                LANGS.every(l => !(inputTitleLanguages[l]?.trim()))
                            }
                        >
                            {createAttribut.isPending || editAttribut.isPending
                                ? (isEdit ? "Saving..." : "Creating...")
                                : (requiresValues ? t("next") : tc("save"))}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const FlagSwitch = ({ label, checked, onChange, tYes, tNo }: {
    label: string; checked: boolean; onChange: (v: boolean) => void; tYes: string; tNo: string
}) => (
    <div className="space-y-3">
        <label className="block text-lg text-gray-800">{label}</label>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Checkbox checked={checked} onCheckedChange={v => onChange(!!v)} />
                <span className="text-base font-medium">{tYes}</span>
            </div>
            <div className="flex items-center gap-2">
                <Checkbox checked={!checked} onCheckedChange={() => onChange(false)} />
                <span className="text-base font-medium">{tNo}</span>
            </div>
        </div>
    </div>
)

export default CreateAttributeModal
