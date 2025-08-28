"use client"
import React, { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Upload, X } from "lucide-react"

interface SelectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    options: string[]
    onAdd: (value: string) => void
    onRemove: (index: number) => void
    onBulkAdd: (values: string[]) => void
}

export const SelectDialog: React.FC<SelectDialogProps> = ({ open, onOpenChange, options, onAdd, onRemove, onBulkAdd }) => {
    const [value, setValue] = useState("")
    const t = useTranslations("selectDialog")
    const fileRef = useRef<HTMLInputElement | null>(null)

    const handleAdd = () => {
        if (!value.trim()) return
        // Allow comma separated batch in single input
        const parts = value.split(',').map(p => p.trim()).filter(Boolean)
        if (parts.length > 1) {
            parts.forEach(p => onAdd(p))
        } else {
            onAdd(value.trim())
        }
        setValue("")
    }

    const triggerFile = () => fileRef.current?.click()

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = evt => {
            const text = String(evt.target?.result || "")
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
            if (lines.length) onBulkAdd(lines)
        }
        reader.readAsText(file)
        e.target.value = ""
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogContent className="w-[90vw] sm:max-w-[850px] " style={{width: "40vw", maxWidth: "650px"}}>
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                    <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    placeholder={t("valueInputPlaceholder")}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                                />
                                <Button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={!value.trim()}
                                    style={{ backgroundColor: '#5BE244' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22c55e')}
                                    className="text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={triggerFile}
                                    className="px-3"  style={{backgroundColor:"#3b82f6"}}
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".txt,.csv,.xls,.xlsx"
                                    onChange={handleFile}
                                    hidden
                                  
                                />
                            </div>
                            <div className="min-h-[80px] border rounded-md p-3 flex flex-wrap gap-2 bg-white">
                                {options.length ? options.map((opt, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 border border-green-300 bg-green-50 text-green-800 text-xs font-medium px-2.5 py-1.5 rounded-md">
                                        {opt}
                                        <button
                                            type="button"
                                            onClick={() => onRemove(i)}
                                            className="hover:text-red-600"
                                            aria-label="Sil"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )) : <span className="text-xs text-muted-foreground">{t("noValues")}</span>}
                            </div>
                        </div>
                    </div>
                           <div className="flex justify-end gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
                             <Button
                               type="button"
                               variant="outline"
                               className="bg-blue-500 text-white"
                             >
                               Bağla
                             </Button>
                             <Button
                               type="submit"
                               className="bg-green-600 hover:bg-green-700 text-white"
                               style={{ backgroundColor: "#5BE244" }}
                             >
                               Yadda saxla
                             </Button>
                           </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
