"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { attributService } from "@/lib/services/attributServices"
import { ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react"

const LANGS = ['az','en','ru'] as const
type Lang = typeof LANGS[number]

interface GroupLanguage {
  id: number
  attributeValueId: number
  name: string
  language: string
}
interface AttributeValueGroup {
  attributeId: number
  languages: GroupLanguage[]
}

type AttributeValuesModalProps = {
  open: boolean
  attributeId: number | null
  onClose: (updated?: boolean) => void
}

const AttributeValuesModal: React.FC<AttributeValuesModalProps> = ({ open, attributeId, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Lang>('az')
  const [groups, setGroups] = useState<AttributeValueGroup[]>([])
  const [languageValues, setLanguageValues] = useState<Record<string,string[]>>({})
  const [langValueRecords, setLangValueRecords] = useState<Record<string,{ id?: number; attributeValueId?: number; name: string }[]>>({})
  const [valueInput, setValueInput] = useState("")
  const [editingValueId, setEditingValueId] = useState<number | null>(null)
  const [editingContext, setEditingContext] = useState<{ attributeValueId?: number; id?: number; language: string; originalIndex: number } | null>(null)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [loading, setLoading] = useState(false)

  // Yükləmə
  useEffect(()=>{
    if (!open || !attributeId) return
    let active = true
    setLoading(true)
    attributService.getAttributValues({ attributeId })
      .then(res=>{
        if (!active) return
        setGroups(res)
        const byLang: Record<string,string[]> = {}
        const recs: Record<string,{ id?: number; attributeValueId?: number; name: string }[]> = {}
        res.forEach(g =>
          (g.languages||[]).forEach(l=>{
            const lg = l.language.toLowerCase()
            byLang[lg] = byLang[lg] || []
            recs[lg] = recs[lg] || []
            byLang[lg].push(l.name)
            recs[lg].push({ id: l.id, attributeValueId: l.attributeValueId, name: l.name })
          })
        )
        setLanguageValues(byLang)
        setLangValueRecords(recs)
      })
      .finally(()=>active && setLoading(false))
    return ()=>{ active=false }
  },[open, attributeId])

  const addValueToLanguage = () => {
    const val = valueInput.trim()
    if (!val) return
    setLanguageValues(p=>({...p,[selectedLanguage]:[...(p[selectedLanguage]||[]), val]}))
    setLangValueRecords(p=>({...p,[selectedLanguage]:[...(p[selectedLanguage]||[]), { name: val }]}))
    setValueInput("")
  }

  const removeValueFromLanguage = (lang:string, idx:number) => {
    setLanguageValues(p=>({...p,[lang]:(p[lang]||[]).filter((_,i)=>i!==idx)}))
    setLangValueRecords(p=>({...p,[lang]:(p[lang]||[]).filter((_,i)=>i!==idx)}))
  }

  const handleStartEditValue = (lang:string, index:number) => {
    const rec = (langValueRecords[lang]||[])[index]
    if (!rec) return
    removeValueFromLanguage(lang,index)
    setEditingValueId(rec.attributeValueId || rec.id || null)
    setEditingContext({
      attributeValueId: rec.attributeValueId,
      id: rec.id,
      language: lang,
      originalIndex: index
    })
    setValueInput(rec.name)
  }

  const cancelEditValue = () => {
    if (editingContext) {
      const { attributeValueId, id, language, originalIndex } = editingContext
      const unique = attributeValueId ?? id
      let restoreName = valueInput
      LANGS.forEach(l=>{
        if (l===language) return
        const other = (langValueRecords[l]||[]).find(r =>
          (r.attributeValueId ?? r.id) === unique
        )
        if (other) restoreName = other.name
      })
      setLangValueRecords(prev=>{
        const next = {...prev}
        const arr = [...(next[language]||[])]
        arr.splice(Math.min(originalIndex, arr.length), 0, { attributeValueId, id, name: restoreName })
        next[language] = arr
        setLanguageValues(vals=>({...vals,[language]:arr.map(r=>r.name)}))
        return next
      })
    }
    setEditingValueId(null)
    setEditingContext(null)
    setValueInput("")
  }

  const saveEditedValueLocal = () => {
    const val = valueInput.trim()
    if (!val) return
    if (!editingContext) {
      addValueToLanguage()
      return
    }
    const { language, originalIndex, attributeValueId, id } = editingContext
    setLangValueRecords(prev=>{
      const next={...prev}
      const arr=[...(next[language]||[])]
      arr.splice(Math.min(originalIndex, arr.length),0,{ attributeValueId, id, name: val })
      next[language]=arr
      setLanguageValues(vals=>({...vals,[language]:arr.map(r=>r.name)}))
      return next
    })
    setEditingValueId(null)
    setEditingContext(null)
    setValueInput("")
  }

  const handleDeleteValue = async (lang:string, index:number) => {
    const rec = (langValueRecords[lang]||[])[index]
    if (!rec) return
    // DƏYİŞİKLİK: Artıq yalnız rec.id göndəririk
    const deleteKey = rec.id
    if (!deleteKey) { 
      removeValueFromLanguage(lang,index) 
      return 
    }
    if (deletingIds.has(deleteKey)) return
    setDeletingIds(p=>new Set(p).add(deleteKey))
    try {
      await attributService.deleteAttributValue(deleteKey) // yalnız id
      // Lokal state-dən həmin id-li bütün dilləri çıxarırıq
      setLangValueRecords(prev=>{
        const next: typeof prev = {}
        Object.keys(prev).forEach(l=>{
          next[l] = prev[l].filter(r => r.id !== deleteKey)
        })
        const nv: Record<string,string[]> = {}
        Object.keys(next).forEach(l => nv[l]=next[l].map(r=>r.name))
        setLanguageValues(nv)
        return next
      })
      if (editingValueId === deleteKey) cancelEditValue()
    } finally {
      setDeletingIds(p=>{ const n=new Set(p); n.delete(deleteKey); return n })
    }
  }

  const filteredValues = (languageValues[selectedLanguage]||[])
    .filter(v=>v.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filteredValues.length / itemsPerPage))
  const startIdx = (currentPage-1)*itemsPerPage
  const paginatedValues = filteredValues.slice(startIdx, startIdx+itemsPerPage)

  // YENİ UPDATE: bütün dilləri bir payload-da göndəririk
  const persistChanges = async () => {
    if (!attributeId) { onClose(); return }
    // Only send { value, language } as required by new API
    const allLangItems = LANGS.flatMap(l =>
      (langValueRecords[l] || []).map(r => ({
        value: r.name,   // name -> value
        language: l
      }))
    )
    if (allLangItems.length) {
      try {
        await attributService.editAttributValue({
          attributeId,
          languages: allLangItems
        })
      } catch (e) {
        console.error(e)
      }
    }
    onClose(true)
  }

  return (
    <Dialog open={open} onOpenChange={(o)=> !o && onClose()}>
      <DialogContent className="overflow-y-auto" style={{ minWidth:"460px", maxWidth:"48vw", height:"82vh" }}>
        <DialogHeader>
          <DialogTitle>
            {loading ? "Loading..." : `Values`}
          </DialogTitle>
        </DialogHeader>

        {!attributeId && <div className="text-sm text-muted-foreground">AttributeId yoxdur.</div>}
        {attributeId && (
          <div className="space-y-6">
            <Tabs value={selectedLanguage} onValueChange={v=>{ setSelectedLanguage(v as Lang); setCurrentPage(1) }}>
              <TabsList>
                <TabsTrigger value="az">AZ</TabsTrigger>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="ru">RU</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="mb-2 text-sm font-medium">Value</label>
                <Input
                  value={valueInput}
                  placeholder="Enter value"
                  onChange={e=>setValueInput(e.target.value)}
                  onKeyDown={e=>{
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      editingValueId ? saveEditedValueLocal() : addValueToLanguage()
                    }
                  }}
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="invisible mb-2 text-sm font-medium">.</label>
                <Button
                  type="button"
                  className="text-white w-full"
                  style={{ background:"#1f2937" }}
                  onClick={()=> editingValueId ? saveEditedValueLocal() : addValueToLanguage()}
                >
                  {editingValueId ? "Save" : "Add"}
                </Button>
              </div>
            </div>
            {editingValueId && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditValue}
              >Cancel</Button>
            )}

            <div>
              <label className="mb-2 text-sm font-medium">Search</label>
              <Input
                value={searchTerm}
                placeholder="Search values..."
                onChange={e=>{ setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>

            <div className="space-y-2">
              {paginatedValues.map(v => {
                const originalIndex = (languageValues[selectedLanguage]||[]).indexOf(v)
                if (originalIndex < 0) return null
                const rec = (langValueRecords[selectedLanguage]||[])[originalIndex]
                const uniqueId = rec?.attributeValueId ?? rec?.id
                const isDeleting = uniqueId ? deletingIds.has(uniqueId) : false
                return (
                  <div
                    key={v + originalIndex}
                    className="border rounded p-2 flex items-center justify-between"
                  >
                    <span className="text-sm">{v}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={()=>handleStartEditValue(selectedLanguage, originalIndex)}
                        disabled={isDeleting}
                      ><Edit className="h-4 w-4" /></Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={()=>handleDeleteValue(selectedLanguage, originalIndex)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Trash className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
              {paginatedValues.length === 0 && (
                <div className="text-sm text-muted-foreground">No values</div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage===1}
                  onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}
                ><ChevronLeft /></Button>
                <span className="text-ml ml-2 mr-2">{/*Page*/} {currentPage} {/*/{totalPages}*/}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage===totalPages}
                  onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}
                ><ChevronRight /></Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={()=>onClose()}
          >Close</Button>
          <Button
          style={{ backgroundColor:"green" }}
            type="button"
            className="bg-green-600 text-white"
            onClick={persistChanges}
            disabled={!attributeId}
          >Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AttributeValuesModal