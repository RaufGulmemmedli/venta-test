"use client"
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GripVertical, FileText, Briefcase, Loader2, ArrowUpDown } from 'lucide-react'
import { useTranslations } from "next-intl"
import { useSections } from "@/lib/hooks/useSection"
import { useEditAttributsQueue, useCreateAttribut } from '@/lib/hooks/useAttribut'
import { useQuery } from '@tanstack/react-query'
import { attributService } from '@/lib/services/attributServices'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'

interface AttributsReorderDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

interface DraggableAttribut { id: number; name: string; context: number }

const contextLabel = (c: number) =>
  c === 1 ? 'CV' : c === 2 ? 'vakansia' : 'Section'
const contextIcon = (c: number) =>
  c === 1 ? <FileText className="w-4 h-4" /> : c === 2 ? <Briefcase className="w-4 h-4" /> : null
const contextColor = (c: number) =>
  c === 1
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : c === 2
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200'

export default function AttributsReorderDialog({ open, onOpenChange }: AttributsReorderDialogProps) {
  const t = useTranslations("AttributReorder")
  const { toast } = useToast?.() || { toast: () => {} }
  const router = useRouter()

  const [typeValue, setTypeValue] = useState<'' | 'cv' | 'vakansia'>('') 
  const [sectionValue, setSectionValue] = useState<string>('')
  const [attributeType, setAttributeType] = useState<string>('')
  const [attributeName, setAttributeName] = useState<string>('')
  const sectionId = sectionValue ? Number(sectionValue) : undefined
  const typeParam = typeValue ? (typeValue === 'cv' ? '1' : '2') : undefined

  const { data: sections = [], isLoading: sectionsLoading } = useSections(
    {
      pageNumber: 1,
      pageSize: 1000,
      isActive: true,
      type: typeParam, 
    } as any,
    { enabled: !!typeParam, keepPreviousData: true, staleTime: 60000 } 
  )

  const {
    data: attributs = [],
    isLoading: attributsLoading,
    isFetching: attributsFetching
  } = useQuery({
    queryKey: ['attributs', 'reorder', { sectionId: sectionId || 0, type: typeParam || '' }], 
    queryFn: () => attributService.getAllAttributs(sectionId, typeParam),
    enabled: !!sectionId && !!typeParam, 
    staleTime: 30000,
  })

  const mutation = useEditAttributsQueue()
  const createAttribut = useCreateAttribut()

  const [items, setItems] = useState<DraggableAttribut[]>([])
  const [hasChanged, setHasChanged] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const loading = attributsLoading || attributsFetching

  useEffect(() => {
    setSectionValue('')
    setItems([])
    setHasChanged(false)
    setAttributeType('')
    setAttributeName('')
  }, [typeValue])

  useEffect(() => {
    if (!open) return
    if (!sectionId) {
      if (items.length) {
        setItems([])
        setHasChanged(false)
      }
      return
    }
    if (!Array.isArray(attributs)) return

    const mapped: DraggableAttribut[] = attributs
      .slice()
      .map((a: any) => {
        let display = a.name || ''
        
        if (!display) {
          const transArr = Array.isArray(a?.setCreateAttributeRequest) ? a.setCreateAttributeRequest : []
          const pick =
            transArr.find((x: any) => (x?.language ?? '').toLowerCase() === 'az') ||
            transArr.find((x: any) => (x?.language ?? '').toLowerCase() === 'en') ||
            transArr[0]
          display = pick?.name || ''
        }
        
        if (!display) {
          display = `#${a.id}`
        }

        const translationOrder = a.sortOrder ?? 0

        return {
          id: a.id,
          name: display,
          context: a.sectionId,
          _order: translationOrder
        }
      })
      .sort((a: any, b: any) => {
        if (a._order !== b._order) return a._order - b._order
        return a.id - b.id
      })
      .map(({ id, name, context }) => ({ id, name, context }))

    const same = mapped.length === items.length && mapped.every((m, i) =>
      m.id === items[i].id && m.name === items[i].name && m.context === items[i].context
    )
    if (!same) {
      setItems(mapped)
      setHasChanged(false)
    }
  }, [open, attributs, sectionId])

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
  }
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()
  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'))
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
    if (!sectionId || !items.length || !hasChanged) return
    const ids = items.map(i => i.id)
    mutation.mutate(
      { sectionId, attributeIdsInOrder: ids },
      {
        onSuccess: () => {
          toast({ description: t("saved") || "Yeniləndi" })
          setHasChanged(false)
          onOpenChange(false)
        },
        onError: () => {
          toast({ description: t("saveError") || "Xəta baş verdi" })
        }
      }
    )
  }

  const handleCreateAttribute = async () => {
    if (!sectionId || !attributeType || !attributeName.trim()) {
      toast({ description: "Bütün sahələri doldurun" })
      return
    }

    const isSelectOrMultiselect = attributeType === "5" || attributeType === "6"
    
    if (!isSelectOrMultiselect) {
      toast({ description: "Yalnız Select və ya Multiselect üçün Next düyməsi mövcuddur" })
      return
    }

    setIsCreating(true)
    
    try {
      const payload = {
        sectionId,
        valueType: Number(attributeType),
        isChangeable: true,
        isMultiple: attributeType === "6",
        isValuable: false,
        isVisiable: true,
        isActive: true,
        setCreateAttributeRequest: [
          {
            name: attributeName.trim(),
            language: "az"
          }
        ]
      }

      const response = await createAttribut.mutateAsync(payload)
      const attributeId = response?.response?.atributeId || response?.atributeId
      
      if (attributeId) {
        router.push(`/settings/attribute-values?attributeId=${attributeId}&type=${attributeType}`)
        onOpenChange(false)
      } else {
        toast({ description: "Attribute yaradıldı amma ID alına bilmədi" })
      }
    } catch (error) {
      console.error("Create attribute failed:", error)
      toast({ description: "Attribute yaradılmadı" })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl h-[85vh] flex flex-col p-6">
        <DialogHeader className="py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-xl font-semibold">
            {t("title") || "Atributları Yenidən Sırala"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 border-b bg-gray-50">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("type") || "Tip"}:</label>
              <Select value={typeValue} onValueChange={(val) => setTypeValue(val as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("selectType") || "Tip seçin"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cv">CV</SelectItem>
                  <SelectItem value="vakansia">vakansia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("contextLabel") || "Section"}:</label>
              <Select
                value={sectionValue}
                onValueChange={(v) => { setSectionValue(v); setHasChanged(false) }}
                disabled={!typeValue || sectionsLoading}
              >
                <SelectTrigger className="w-64">
                  <SelectValue
                    placeholder={
                      !typeValue
                        ? (t("selectTypeFirst") || "Əvvəl tip seçin")
                        : sectionsLoading
                          ? (t("loading") || "Yüklənir...")
                          : (t("selectAttributsPlaceholder") || "Section seçin")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(sections as any[]).map(section => {
                    const trs = Array.isArray(section?.translations) ? section.translations : []
                    const az = trs.find((x: any) => (x?.lang ?? '').toLowerCase() === 'az')
                    const en = trs.find((x: any) => (x?.lang ?? '').toLowerCase() === 'en')
                    const label = az?.title || en?.title || trs[0]?.title || section?.stepName || `#${section?.id}`
                    return (
                      <SelectItem key={section.id} value={String(section.id)}>
                        {label}
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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600">{t("loading") || "Yüklənir..."}</p>
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
                            {/* <Badge
                              variant="outline"
                              className={`${contextColor(it.context)} flex items-center gap-1 text-xs`}
                            >
                              {contextIcon(it.context)}
                              {contextLabel(it.context)}
                            </Badge> */}
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
                      {sectionId
                        ? (t("noItemsForSection") || "Seçilmiş section üçün atribut yoxdur")
                        : (typeValue
                          ? (t("selectSectionPrompt") || "Section seçin")
                          : (t("selectTypeFirst") || "Əvvəl tip seçin"))}
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
              disabled={!sectionId || !hasChanged || mutation.isPending || items.length === 0}
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
