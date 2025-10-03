"use client"

import React, { useState, useEffect } from "react"
import { X, Search, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { attributService } from "@/lib/services/attributServices"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useTranslations } from "next-intl"

interface AttributeValue {
    attributeValueId: number
    stringValue: string | null
    dateTimeValue: string | null
    boolValue: boolean | null
    decimalValue: number | null
}

interface FilterAttribute {
    id: number
    name: string
    valueType: number
    isValuable: boolean
    attributeValues: AttributeValue[]
}

interface SectionGroup {
    sectionId: number
    sectionTitle: string
    attributes: FilterAttribute[]
}

interface CvFilterSidebarProps {
    open: boolean
    onClose: () => void
    onApplyFilter: (filters: { id: number; attributeValueIds: number[] }[]) => void
}

export default function CvFilterSidebar({ open, onClose, onApplyFilter }: CvFilterSidebarProps) {
    const t = useTranslations("cvFilter")
    const tc = useTranslations("cvCreate")
    const [searchInput, setSearchInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [sectionGroups, setSectionGroups] = useState<SectionGroup[]>([])
    const [selectedFilters, setSelectedFilters] = useState<Map<number, Set<number>>>(new Map())
    const [openSections, setOpenSections] = useState<Set<number>>(new Set())
    const [openAttributes, setOpenAttributes] = useState<Set<number>>(new Set())

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput.trim())
        }, 500)
        return () => clearTimeout(timer)
    }, [searchInput])

    // Fetch attributes when modal opens or search term changes
    useEffect(() => {
        if (open) {
            fetchAttributes(searchTerm)
        }
    }, [open, searchTerm])

    const fetchAttributes = async (search: string) => {
        setLoading(true)
        try {
            const response = await attributService.getAllAttributesFilter({
                Type: "1", // Always send Type=1 for CV
                SearchTerm: search || undefined // Send search term to API
            })

            const data = response?.responseValue || []
            groupAttributesBySection(data)
        } catch (error) {
            console.error("Error fetching attributes:", error)
            setSectionGroups([])
        } finally {
            setLoading(false)
        }
    }

    const groupAttributesBySection = (data: any[]) => {
        const grouped = data.reduce((acc: Record<number, SectionGroup>, attr: any) => {
            const sectionId = attr.sectionDto?.id
            const sectionTitle = attr.sectionDto?.title || "Unknown Section"

            if (!acc[sectionId]) {
                acc[sectionId] = {
                    sectionId,
                    sectionTitle,
                    attributes: []
                }
            }

            acc[sectionId].attributes.push({
                id: attr.id,
                name: attr.name,
                valueType: attr.valueType,
                isValuable: attr.isValuable,
                attributeValues: attr.attributeValues || []
            })

            return acc
        }, {} as Record<number, SectionGroup>)

        const sections: SectionGroup[] = Object.values(grouped)
        setSectionGroups(sections)
        
        // Don't auto-open any sections - user will manually open them
    }

    const toggleSection = (sectionId: number) => {
        setOpenSections(prev => {
            const newSet = new Set(prev)
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId)
            } else {
                newSet.add(sectionId)
            }
            return newSet
        })
    }

    const toggleAttribute = (attributeId: number) => {
        setOpenAttributes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(attributeId)) {
                newSet.delete(attributeId)
            } else {
                newSet.add(attributeId)
            }
            return newSet
        })
    }

    const handleValueToggle = (attributeId: number, valueId: number) => {
        setSelectedFilters(prev => {
            const newMap = new Map(prev)
            const currentValues = newMap.get(attributeId) || new Set()

            if (currentValues.has(valueId)) {
                currentValues.delete(valueId)
                if (currentValues.size === 0) {
                    newMap.delete(attributeId)
                } else {
                    newMap.set(attributeId, currentValues)
                }
            } else {
                currentValues.add(valueId)
                newMap.set(attributeId, currentValues)
            }

            return newMap
        })
    }

    const getDisplayValue = (value: AttributeValue): string => {
        if (value.stringValue !== null) return value.stringValue
        if (value.decimalValue !== null) return value.decimalValue.toString()
        if (value.dateTimeValue !== null) return new Date(value.dateTimeValue).toLocaleDateString()
        if (value.boolValue !== null) return value.boolValue ? tc("yes") : tc("no")
        return "-"
    }

    const handleApplyFilter = () => {
        const filterArray = Array.from(selectedFilters.entries()).map(([id, valueIds]) => ({
            id,
            attributeValueIds: Array.from(valueIds)
        }))
        onApplyFilter(filterArray)
        onClose()
    }

    const handleClearAll = () => {
        setSelectedFilters(new Map())
        onApplyFilter([])
    }

    const totalSelectedCount = Array.from(selectedFilters.values()).reduce(
        (sum, set) => sum + set.size,
        0
    )

    if (!open) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity  "
                style={{top: "2.5rem"}}
                onClick={onClose}

            />

            <div className="fixed right-0 top-0 h-full w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col" style={{top: "2.5rem" ,height: "calc(100vh - 3.5rem)",width: "400px"}}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">{t("title")}</h2>
                        {totalSelectedCount > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {totalSelectedCount} {t("selections")}
                            </p>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
                        <Input
                            placeholder={t("search")}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 px-4">
                    {loading ? (
                        <div className="py-8 text-center text-muted-foreground">
                            {t("loading")}
                        </div>
                    ) : sectionGroups.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            {t("notFound")}
                        </div>
                    ) : (
                        <div className="space-y-4 pt-16 pb-4">
                            {sectionGroups.map((section) => (
                                <Collapsible
                                    key={section.sectionId}
                                    open={openSections.has(section.sectionId)}
                                    onOpenChange={() => toggleSection(section.sectionId)}
                                >
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <span className="font-semibold text-sm">
                                                {section.sectionTitle}
                                            </span>
                                            {openSections.has(section.sectionId) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <div className="mt-2 space-y-2 pl-2">
                                            {section.attributes.map((attr) => (
                                                <Collapsible
                                                    key={attr.id}
                                                    open={openAttributes.has(attr.id)}
                                                    onOpenChange={() => toggleAttribute(attr.id)}
                                                >
                                                    <CollapsibleTrigger className="w-full">
                                                        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                                                                {attr.name}
                                                            </span>
                                                            {openAttributes.has(attr.id) ? (
                                                                <ChevronUp className="h-3 w-3" />
                                                            ) : (
                                                                <ChevronDown className="h-3 w-3" />
                                                            )}
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    
                                                    <CollapsibleContent>
                                                        {attr.attributeValues.length > 0 ? (
                                                            <div className="mt-1 space-y-1.5 pl-4">
                                                                {attr.attributeValues.map((value) => (
                                                                    <div
                                                                        key={value.attributeValueId}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Checkbox
                                                                            id={`value-${value.attributeValueId}`}
                                                                            checked={selectedFilters
                                                                                .get(attr.id)
                                                                                ?.has(value.attributeValueId) || false}
                                                                            onCheckedChange={() =>
                                                                                handleValueToggle(
                                                                                    attr.id,
                                                                                    value.attributeValueId
                                                                                )
                                                                            }
                                                                        />
                                                                        <label
                                                                            htmlFor={`value-${value.attributeValueId}`}
                                                                            className="text-sm cursor-pointer"
                                                                        >
                                                                            {getDisplayValue(value)}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-muted-foreground pl-4 mt-1">
                                                                {t("noValues")}
                                                            </div>
                                                        )}
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t space-y-2">
                    <Button
                        className="w-full"
                        onClick={handleApplyFilter}
                        disabled={totalSelectedCount === 0}
                    >
                        {t("apply")} ({totalSelectedCount})
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleClearAll}
                        disabled={totalSelectedCount === 0}
                    >
                        {t("clearAll")}
                    </Button>
                </div>
            </div>
        </>
    )
}

