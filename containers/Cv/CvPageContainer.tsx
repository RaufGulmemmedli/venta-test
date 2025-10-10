"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit, Trash, Eye, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCvList, useDeleteCv } from "@/lib/hooks/useCv"
import FinSearch from "./components/FinSearch"
import AlertDialogComponent from "@/components/AlertDiolog/AlertDiolog"
import CvFilterSidebar from "./components/CvFilterSidebar"

export default function CvPageContainer() {
    const t = useTranslations("cvPage")
    const tc = useTranslations("common")
    const router = useRouter()

    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [cvToDelete, setCvToDelete] = useState<number | null>(null)
    const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
    const [attributeFilters, setAttributeFilters] = useState<{ id: number; attributeValueIds: number[] }[]>([])

    // Sabit Actions sütun eni
    const ACTIONS_COL_WIDTH = "w-[132px] min-w-[132px] max-w-[132px]"

    React.useEffect(() => {
        const h = setTimeout(() => setSearch(searchInput.trim()), 500)
        return () => clearTimeout(h)
    }, [searchInput])

    const queryParams = {
        pageNumber,
        pageSize,
        search: search || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
        attributeDtos: attributeFilters.length > 0 ? attributeFilters : undefined,
    }

    const { data: cvData, isLoading, isError } = useCvList(queryParams)
    const deleteCv = useDeleteCv()

    const { data: nextPageCvData = { items: [] } } = useCvList(
        { ...queryParams, pageNumber: pageNumber + 1 }
    )

    const canGoNext = cvData?.items.length === pageSize && nextPageCvData.items.length > 0

    useEffect(() => {
        if (!isLoading && !isError && cvData?.items.length === 0 && pageNumber > 1) {
            setPageNumber(p => Math.max(1, p - 1))
        }
    }, [cvData?.items, isLoading, isError, pageNumber])

    // Get all unique attribute names from all CVs
    const getAllAttributeNames = (cvData: any) => {
        if (!cvData?.items) return []

        const attributeNames = new Set<string>()

        cvData.items.forEach((cv: any) => {
            cv.steps?.forEach((step: any) => {
                step.sections?.forEach((section: any) => {
                    section.attributes?.forEach((attr: any) => {
                        if (attr.name) {
                            attributeNames.add(attr.name)
                        }
                    })
                })
            })
        })

        return Array.from(attributeNames).sort()
    }

    // Get attribute value for a specific CV
    const getAttributeValue = (cv: any, attributeName: string) => {
        try {
            for (const step of cv.steps || []) {
                for (const section of step.sections || []) {
                    for (const attr of section.attributes || []) {
                        if (attr.name === attributeName && attr.values && attr.values.length > 0) {
                            const value = attr.values[0]

                            // Handle different API response structures
                            if (value?.set) {
                                const set = value.set
                                if (set.stringValue !== null && set.stringValue !== undefined) return set.stringValue
                                if (set.decimalValue !== null && set.decimalValue !== undefined) return set.decimalValue.toString()
                                if (set.dateTimeValue !== null && set.dateTimeValue !== undefined) return new Date(set.dateTimeValue).toLocaleDateString()
                                if (set.boolValue !== null && set.boolValue !== undefined) return set.boolValue ? 'Bəli' : 'Xeyr'
                            } else if (value?.sets && value.sets.length > 0) {
                                // Handle alternative structure with sets array
                                const set = value.sets[0]
                                if (set.stringValue !== null && set.stringValue !== undefined) return set.stringValue
                                if (set.decimalValue !== null && set.decimalValue !== undefined) return set.decimalValue.toString()
                                if (set.dateTimeValue !== null && set.dateTimeValue !== undefined) return new Date(set.dateTimeValue).toLocaleDateString()
                                if (set.boolValue !== null && set.boolValue !== undefined) return set.boolValue ? 'Bəli' : 'Xeyr'
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error getting attribute value:', error, { cv, attributeName })
        }
        return '-'
    }

    const getStepTitles = (steps: any[]) => {
        if (!steps || steps.length === 0) return "No steps"
        return steps.map(step => step.title || `Step ${step.id}`).join(", ")
    }

    const getSectionCount = (steps: any[]) => {
        if (!steps || steps.length === 0) return 0
        return steps.reduce((total, step) => total + (step.sections?.length || 0), 0)
    }

    const handleDeleteCv = (cvId: number) => {
        setCvToDelete(cvId)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (cvToDelete) {
            try {
                await deleteCv.mutateAsync(cvToDelete)
                setDeleteDialogOpen(false)
                setCvToDelete(null)
            } catch (error) {
                console.error('Delete failed:', error)
            }
        }
    }

    const cancelDelete = () => {
        setDeleteDialogOpen(false)
        setCvToDelete(null)
    }

    const handleApplyFilter = (filters: { id: number; attributeValueIds: number[] }[]) => {
        setAttributeFilters(filters)
        setPageNumber(1) // Reset to first page when filter changes
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("manage")}</p>
                </div>
                <Button onClick={() => router.push("/cv-create")}>
                    <Plus className="mr-2 h-4 w-4" /> {t("create")}
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-1/2 lg:w-1/3">
                    <Input
                        value={searchInput}
                        onChange={(e) => { setSearchInput(e.target.value); setPageNumber(1) }}
                        placeholder={t("search")}
                        className="bg-white dark:bg-background pl-3 h-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {searchInput.includes(',') && (
                        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
                            <div className="flex flex-wrap gap-1">
                                {searchInput.split(',').map((term, index) => {
                                    const trimmedTerm = term.trim()
                                    if (!trimmedTerm) return null
                                    return (
                                        <span key={index} className="bg-blue-100 px-2 py-1 rounded">
                                            {trimmedTerm}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                </div>
                <div className="flex gap-2 w-56" style={{ height: "40px" }}>
                    <select
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value as any); setPageNumber(1) }}
                    >
                        <option value="all">{t("all")}</option>
                        <option value="true">{t("active")}</option>
                        <option value="false">{t("passive")}</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setFilterSidebarOpen(true)}>
                        <Filter className="mr-2 h-4 w-4" />
                        {t("filter")}
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto relative" style={{ position: 'relative' }}>
                    <Table className="text-sm w-full min-w-max" style={{ position: 'relative' }}>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50 [isolation:isolate]">
                                <TableHead 
                                    className="px-3 py-2 text-lg sticky left-0 z-30 bg-gray-50 dark:bg-gray-900"
                                    style={{ 
                                        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.05)',
                                        position: 'sticky',
                                        left: 0
                                    }}
                                >
                                    ID
                                </TableHead>
                                {getAllAttributeNames(cvData).map((attrName) => (
                                    <TableHead key={attrName} className="px-3 py-2 text-lg whitespace-nowrap">
                                        {attrName}
                                    </TableHead>
                                ))}

                                <TableHead 
                                    className={`px-3 py-2 text-right sticky right-0 z-40 border-l bg-gray-50 dark:bg-gray-900 ${ACTIONS_COL_WIDTH}`}
                                    style={{ 
                                        boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)',
                                        position: 'sticky',
                                        right: 0
                                    }}
                                >
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={getAllAttributeNames(cvData).length + 5} className="px-3 py-6 text-center">{t("loading")}</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={getAllAttributeNames(cvData).length + 5} className="px-3 py-6 text-center text-red-600">{t("error")}</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && cvData?.items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={getAllAttributeNames(cvData).length + 5} className="px-3 py-6 text-center text-muted-foreground">{t("notFound")}</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && cvData?.items.map((cv: any) => (
                                <TableRow 
                                    key={cv.resumeId}
                                    className="group cursor-pointer hover:bg-gray-50 transition-colors [isolation:isolate]"
                                    onClick={() => router.push(`/cv/view?id=${cv.resumeId}`)}
                                >
                                    <TableCell 
                                        className="px-3 py-4 text-base sticky left-0 z-20 bg-white dark:bg-background group-hover:bg-gray-50 transition-colors"
                                        style={{ 
                                            boxShadow: '2px 0 4px rgba(0, 0, 0, 0.05)',
                                            position: 'sticky',
                                            left: 0
                                        }}
                                    >
                                        {cv.resumeId}
                                    </TableCell>
                                    {getAllAttributeNames(cvData).map((attrName) => (
                                        <TableCell key={attrName} className="px-3 py-4 text-base whitespace-nowrap">
                                            {getAttributeValue(cv, attrName)}
                                        </TableCell>
                                    ))}
                                    <TableCell 
                                        className={`px-3 py-2 text-right sticky right-0 bg-white dark:bg-background group-hover:bg-gray-50 border-l z-30 transition-colors ${ACTIONS_COL_WIDTH}`}
                                        style={{ 
                                            boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)',
                                            position: 'sticky',
                                            right: 0
                                        }}
                                    >
                                        <div className="inline-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Eye
                                                className="w-5 h-5 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
                                                onClick={() => router.push(`/cv/view?id=${cv.resumeId}`)}
                                            />
                                            <Edit
                                                className="w-5 h-5 cursor-pointer text-green-600 hover:text-green-800 transition-colors"
                                                onClick={() => router.push(`/cv-create?editId=${cv.resumeId}`)}
                                            />
                                            <Trash
                                                className={`w-5 h-5 cursor-pointer text-red-600 hover:text-red-800 transition-colors ${deleteCv.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => !deleteCv.isPending && handleDeleteCv(cv.resumeId)}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm">
                    <span>{t("pageSize")}</span>
                    <select
                        className="border rounded px-2 py-1 text-sm"
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1) }}
                    >
                        {[5, 10, 20, 50].map((sz) => (
                            <option key={sz} value={sz}>{sz}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pageNumber === 1 || isLoading}
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    >
                        <ChevronLeft />
                    </Button>
                    <span
                        className="text-sm"
                        style={{ width: "30px", alignItems: "center", display: "flex", justifyContent: "center" }}
                    >{pageNumber}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading || !canGoNext}
                        onClick={() => setPageNumber(p => p + 1)}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialogComponent
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                title={t("deleteCv")}
                description={t("deleteCvDescription")}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />

            {/* Filter Sidebar */}
            <CvFilterSidebar
                open={filterSidebarOpen}
                onClose={() => setFilterSidebarOpen(false)}
                onApplyFilter={handleApplyFilter}
            />

        </div>
    )
}
