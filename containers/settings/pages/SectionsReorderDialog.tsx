"use client"
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAllSections, useEditSectionsQueue } from '@/lib/hooks/useSection'
import { GripVertical, FileText, Briefcase, Loader2, ArrowUpDown } from 'lucide-react'
import { useTranslations } from "next-intl"
import { useAllSteps } from "@/lib/hooks/useStep"

interface SectionsReorderDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
}

interface DraggableSection { id: number; name: string; context: number }
const contextLabel = (c: number) => c === 1 ? 'Cv' : c === 2 ? 'Vakansia' : '-'
const contextIcon = (c: number) => c === 1 ? <FileText className="w-4 h-4" /> : c === 2 ? <Briefcase className="w-4 h-4" /> : null
const contextColor = (c: number) => c === 1 ? 'bg-blue-100 text-blue-700 border-blue-200' : c === 2 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'

export default function SectionsReorderDialog({ open, onOpenChange }: SectionsReorderDialogProps) {
    const t = useTranslations("SectionReorder")

    const { data: steps = [], isLoading: stepsLoading } = useAllSteps(undefined)
    const stepTypeMap = React.useMemo(() => {
        const m = new Map<number, number>()
        if (Array.isArray(steps)) {
            (steps as any[]).forEach(s => {
                if (s?.id != null) m.set(Number(s.id), Number(s.type))
            })
        }
        return m
    }, [steps])

    const [stepValue, setStepValue] = useState<string>('') 
    const stepId = stepValue ? Number(stepValue) : undefined

    const { data, isLoading } = useAllSections(stepId)
    const sectionsRaw: any[] = React.useMemo(() => {
        if (Array.isArray(data)) return data as any[]
        return []
    }, [data])

    const mutation = useEditSectionsQueue()

    const [items, setItems] = useState<DraggableSection[]>([])
    const [hasChanged, setHasChanged] = useState(false)

    const sections = Array.isArray(data) ? data : []

    useEffect(() => {
        if (!open) return
        if (!stepId) {
            setItems(prev => (prev.length ? [] : prev))
            setHasChanged(prev => (prev ? false : prev))
            return
        }
        const sorted = [...sectionsRaw]
            .filter(s => !stepId || Number(s.stepId) === stepId)
            .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))

        const mapped: DraggableSection[] = sorted.map((s: any) => {
            let trArray: any[] = []
            if (Array.isArray(s.translations)) {
                trArray = s.translations
            } else if (s.translations && typeof s.translations === 'object') {
                trArray = [s.translations]
            }

            const az = trArray.find(tr => String(tr?.language ?? '').toLowerCase() === 'az')
            const en = trArray.find(tr => String(tr?.language ?? '').toLowerCase() === 'en')
            const title = (az?.title || en?.title || trArray[0]?.title || `#${s?.id}`) as string

            const stepType = stepTypeMap.get(Number(s.stepId)) ?? 0
            return {
                id: s.id,
                name: title,
                context: stepType 
            }
        })

        const sameItem = (a: DraggableSection, b: DraggableSection) =>
            a?.id === b?.id && a?.name === b?.name && a?.context === b?.context
        const sameList = (a: DraggableSection[], b: DraggableSection[]) =>
            a.length === b.length && a.every((x, i) => sameItem(x, b[i]))

        setItems(prev => (sameList(prev, mapped) ? prev : mapped))
        setHasChanged(false)
    }, [open, sectionsRaw, stepId, stepTypeMap])

    const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString())
    }
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault() }
    const onDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault()
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return
        setItems(prev => {
            const clone = [...prev]
            const [moved] = clone.splice(sourceIndex, 1)
            clone.splice(targetIndex, 0, moved)
            return clone
        })
        setHasChanged(true)
    }

    const handleSave = () => {
        if (!stepId) return
        const sectionIdsInOrder = items.map(s => s.id)
        mutation.mutate({ stepId, sectionIdsInOrder }, { onSuccess: () => onOpenChange(false) })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-6xl h-[85vh] flex flex-col p-6">
                <DialogHeader className="py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <DialogTitle className="text-xl font-semibold">
                        {t("title") || "Bölmələri Yenidən Sırala"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 border-b bg-gray-50">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{t("contextLabel") || "Step"}:</label>
                            <Select value={stepValue} onValueChange={(value) => { setStepValue(value); setHasChanged(false) }}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder={stepsLoading ? t("loading") : t("selectSectionsPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(steps as any[]).map(step => {
                                        const trs = Array.isArray(step?.translations) ? step.translations : []
                                        const az = trs.find((x: any) => String(x?.lang ?? x?.language ?? '').toLowerCase() === 'az')
                                        const en = trs.find((x: any) => String(x?.lang ?? x?.language ?? '').toLowerCase() === 'en')
                                        const title = (az?.title || en?.title || trs[0]?.title || step?.moduleName || `#${step?.id}`) as string
                                        const tType = Number(step?.type)
                                        return (
                                            <SelectItem key={step.id} value={String(step.id)}>
                                                <div className="flex items-center gap-2">
                                                    {contextIcon(tType)}
                                                    {title}
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        {hasChanged && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                                {t("hasChanges") || "Dəyişikliklər var"}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("loading") || "Yüklənir..."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            {items.length > 0 ? (
                                <div className="grid grid-cols-4 gap-4">
                                    {items.map((it, idx) => (
                                        <Card
                                            key={it.id}
                                            className="group cursor-move select-none hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-blue-300 cursor-pointer"
                                            draggable
                                            onDragStart={(e) => onDragStart(e, idx)}
                                            onDragOver={onDragOver}
                                            onDrop={(e) => onDrop(e, idx)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <GripVertical className="text-gray-400 group-hover:text-blue-500 transition-colors w-5 h-5" />
                                                    </div>
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-md font-mono">
                                                        #{idx + 1}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-medium text-sm line-clamp-2">{it.name}</h3>
                                                    <div className="text-xs text-gray-500">ID: {it.id}</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                            <ArrowUpDown className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">
                                            {t("empty") || "Məlumat yoxdur"}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Seçilmiş step üçün bölmə tapılmadı
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="py-4 border-t bg-gray-50/50">
                    <div className="ml-auto flex items-center gap-4">
                        <Button
                            className="bg-blue-500 text-white"
                            variant="outline"
                            disabled={mutation.isPending}
                            onClick={() => onOpenChange(false)}
                        >
                            {t("cancel") || "Bağla"}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!stepId || !hasChanged || mutation.isPending || items.length === 0}
                            className="text-white"
                            style={{ backgroundColor: "#5BE244" }}
                        >
                            {mutation.isPending
                                ? (t("confirmSaving") || "Yadda saxlanır...")
                                : (t("confirm") || "Yadda saxla")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}