"use client"
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAllSteps, useEditStepsQueue } from '@/lib/hooks/useStep'
import { GripVertical } from 'lucide-react'
import { useTranslations } from "next-intl"
interface StepsReorderDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
}


interface DraggableStep { id: number; name: string; context: number }
const contextLabel = (c: number) => c === 1 ? 'Cv' : c === 2 ? 'Vakansiya' : '-'

export default function StepsReorderDialog({ open, onOpenChange }: StepsReorderDialogProps) {
    const t = useTranslations("StepReorder")
    const [contextFilter, setContextFilter] = useState<number>(1)
    const { data, isLoading } = useAllSteps(contextFilter)   // <= əvvəl: data: all = []
    const mutation = useEditStepsQueue()
    const [items, setItems] = useState<DraggableStep[]>([])
    const [hasChanged, setHasChanged] = useState(false)

    // Stabil data massivı
    const steps = data ?? []

    useEffect(() => {
        // Açıq deyilsə və ya data hələ gəlməyibsə heç nə etmirik
        if (!open || !data) return

        // Eyni sıralama/eyni elementlərdirsə state yeniləmə (loop-un qarşısı)
        const mapped: DraggableStep[] = data.map((s: any) => ({ id: s.id, name: s.name, context: s.context }))
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
    }, [open, data]) // <= əvvəl dependency `all` idi və hər render yeni [] yaranırdı

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
        mutation.mutate({ steps: items }, { onSuccess: () => onOpenChange(false) })
    }

    return (
        <div style={{ width: "80vw", maxWidth: "700px" }}>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="w-[90vw] max-w-[1200px] h-[80vh] overflow-y-auto flex flex-col"
                >
                    <DialogHeader>
                        <DialogTitle>{t("title")}</DialogTitle>
                    </DialogHeader>

                    <div className="mb-4 flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            {t("context")}
                        </label>
                        <select
                            className="border rounded px-3 h-9 text-sm bg-white dark:bg-background w-48"
                            value={contextFilter}
                            onChange={(e) => setContextFilter(Number(e.target.value))}
                            disabled={mutation.isPending}
                        >
                            <option value={1}>Cv</option>
                            <option value={2}>Vakansiya</option>
                        </select>
                    </div>

                    {isLoading ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">{t("loading") || "Yüklənir..."}</div>
                    ) : (
                        <div className="grid grid-cols-4 max-h-[50vh] overflow-y-auto pr-2 gap-2">
                            {items.map((it, idx) => (
                                <div
                                    key={it.id}
                                    className="border rounded-md p-3 flex flex-col bg-white cursor-move select-none hover:shadow-sm transition-shadow relative"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, idx)}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, idx)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <GripVertical className="text-muted-foreground w-4 h-4 flex-shrink-0" />
                                        <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">#{idx + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm line-clamp-2 break-words">{it.name}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {it.context === 1 ? 'Cv' : it.context === 2 ? 'Vakansiya' : '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="col-span-4 py-8 text-center text-sm text-muted-foreground">
                                    {t("empty") || "Məlumat yoxdur"}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button
                            className="bg-blue-500 text-white"
                            variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                            {t("cancel") || "Bağla"}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanged || mutation.isPending || items.length === 0}
                            className="text-white"
                            style={{ backgroundColor: "#5BE244" }}                    >
                            {mutation.isPending ? (t("confirm") || 'Yadda saxlanır...') : (t("confirm") || 'Yadda saxla')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}