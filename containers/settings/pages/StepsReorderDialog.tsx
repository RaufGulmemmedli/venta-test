"use client"
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAllSteps, useEditStepsQueue } from '@/lib/hooks/useStep'
import { GripVertical, FileText, Briefcase, Loader2, ArrowUpDown, Save, X } from 'lucide-react'
import { useTranslations } from "next-intl"

interface StepsReorderDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
}

interface DraggableStep { id: number; name: string; context: number }
const contextLabel = (c: number) => c === 1 ? 'Cv' : c === 2 ? 'Vakansia' : '-'
const contextIcon = (c: number) => c === 1 ? <FileText className="w-4 h-4" /> : c === 2 ? <Briefcase className="w-4 h-4" /> : null
const contextColor = (c: number) => c === 1 ? 'bg-blue-100 text-blue-700 border-blue-200' : c === 2 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'

export default function StepsReorderDialog({ open, onOpenChange }: StepsReorderDialogProps) {
    const t = useTranslations("StepReorder")
    const [typeFilter, setTypeFilter] = useState<'cv' | 'vakansiya'>('cv')

    const { data, isLoading } = useAllSteps(typeFilter)
    const mutation = useEditStepsQueue()

    const [items, setItems] = useState<DraggableStep[]>([])
    const [hasChanged, setHasChanged] = useState(false)

    const steps = Array.isArray(data) ? data : []

    useEffect(() => {
        if (!open) return

        const sorted = [...steps].sort((a: any, b: any) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
        const mapped: DraggableStep[] = sorted.map((s: any) => {
            const translations = Array.isArray(s.translations) ? s.translations : []
            const primary = translations[0] || { title: "" }
            return {
                id: s.id,
                name: String(primary.title ?? '').trim() || `#${s.id}`,
                context: Number(s.type) || 0, 
            }
        })

        const same =
            items.length === mapped.length &&
            items.every((it, i) => {
                const m = mapped[i]
                return it.id === m.id && it.name === m.name && it.context === m.context
            })

        if (!same) {
            setItems(mapped)
            setHasChanged(false)
        }
    }, [open, steps]) 

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
        const payload = items.map(s => ({ stepId: s.id, type: s.context }))
        mutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-6xl h-[85vh] flex flex-col p-6">
                <DialogHeader className="py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <DialogTitle className="text-xl font-semibold">
                        {t("title") || "Stepləri Yenidən Sırala"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 border-b bg-gray-50">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Kontekst:</label>
                            <Select value={typeFilter} onValueChange={(value: 'cv' | 'vakansiya') => setTypeFilter(value)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cv">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            CV
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="vakansiya">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            Vakansiya
                                        </div>
                                    </SelectItem>
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
                                            Seçilmiş kontekst üçün addım tapılmadı
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
                            disabled={!hasChanged || mutation.isPending || items.length === 0}
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