"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { attributService } from "@/lib/services/attributServices"
import { ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react"
import { toast } from "sonner"

const LANGS = ['az','en','ru'] as const
type Lang = typeof LANGS[number]

interface ValueSet {
  id: number
  language: string
  value: string
}

interface AttributeValueItem {
  id: number
  sets: ValueSet[]
}

interface AttributeValueResponse {
  responseValue: {
    attributeId: number
    page: {
      items: AttributeValueItem[]
      pageNumber: number
      totalPages: number
      pageSize: number
      totalCount: number
      hasPreviousPage: boolean
      hasNextPage: boolean
    }
  }
  statusCode: number
  message: string
}

type AttributeValuesModalProps = {
  open: boolean
  attributeId: number | null
  isNewAttribute?: boolean  // true = use create API, false/undefined = use update API
  onClose: (updated?: boolean) => void
}

const AttributeValuesModal: React.FC<AttributeValuesModalProps> = ({ open, attributeId, isNewAttribute = false, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Lang>('az')
  const [languageValues, setLanguageValues] = useState<Record<string,string[]>>({})
  const [langValueRecords, setLangValueRecords] = useState<Record<string,{ id?: number; attributeValueId?: number; name: string }[]>>({})
  const [valueInput, setValueInput] = useState("")
  const [editingValueId, setEditingValueId] = useState<number | null>(null)
  const [editingContext, setEditingContext] = useState<{ attributeValueId?: number; id?: number; language: string; originalIndex: number } | null>(null)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [localNewValues, setLocalNewValues] = useState<Record<string,{ name: string }[]>>({ az: [], en: [], ru: [] })

  // Reset states when modal is closed
  useEffect(() => {
    if (!open) {
      setLocalNewValues({ az: [], en: [], ru: [] })
      setSearchInput("")
      setSearchTerm("")
      setCurrentPage(1)
      setValueInput("")
      setEditingValueId(null)
      setEditingContext(null)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim())
      setCurrentPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Yükləmə with pagination and search
  useEffect(()=>{
    if (!open || !attributeId) return
    
    // If this is a new attribute, skip loading (no values exist yet)
    if (isNewAttribute) {
      setLanguageValues({ az: [], en: [], ru: [] })
      setLangValueRecords({ az: [], en: [], ru: [] })
      setTotalPages(1)
      setTotalCount(0)
      setLoading(false)
      return
    }
    
    let active = true
    setLoading(true)
    
    attributService.getAttributValues({ 
      attributeId,
      PageNumber: currentPage,
      PageSize: itemsPerPage,
      SearchTerm: searchTerm || undefined
    })
      .then((response: AttributeValueResponse)=>{
        if (!active) return
        const items = response.responseValue.page.items
        const pageInfo = response.responseValue.page
        
        // Update pagination info
        setTotalPages(pageInfo.totalPages || 1)
        setTotalCount(pageInfo.totalCount || 0)
        
        // Group by attributeValueId to ensure all languages of same value are together
        const byLang: Record<string,string[]> = { az: [], en: [], ru: [] }
        const recs: Record<string,{ id?: number; attributeValueId?: number; name: string }[]> = { az: [], en: [], ru: [] }
        
        items.forEach(item => {
          // For each item (attributeValue), add all its language sets
          item.sets.forEach(set => {
            const lg = set.language.toLowerCase()
            if (!byLang[lg]) byLang[lg] = []
            if (!recs[lg]) recs[lg] = []
            
            byLang[lg].push(set.value)
            recs[lg].push({ 
              id: set.id, 
              attributeValueId: item.id, 
              name: set.value 
            })
          })
        })
        
        // Just set the API values, don't merge with local yet
        setLangValueRecords(recs)
        setLanguageValues(byLang)
      })
      .finally(()=>active && setLoading(false))
    return ()=>{ active=false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[open, attributeId, isNewAttribute, currentPage, searchTerm])

  const addValueToLanguage = () => {
    const val = valueInput.trim()
    if (!val) return
    
    // Check if input contains comma-separated values (bulk add)
    const values = val.split(',').map(v => v.trim()).filter(v => v.length > 0)
    
    if (values.length === 0) return
    
    // ONLY add to local new values state
    setLocalNewValues(prev => ({
      ...prev,
      [selectedLanguage]: [...(prev[selectedLanguage] || []), ...values.map(v => ({ name: v }))]
    }))
    
    setValueInput("")
    
    // Show success message if multiple values added
    if (values.length > 1) {
      toast.success(`${values.length} dəyər əlavə edildi`)
    }
  }

  const removeValueFromLanguage = (lang:string, idx:number) => {
    // Calculate combined values to get the actual record
    const apiValues = langValueRecords[lang] || []
    const localVals = localNewValues[lang] || []
    const combinedLength = apiValues.length + localVals.length
    
    if (idx < apiValues.length) {
      // It's an API value - remove from langValueRecords
      setLangValueRecords(p => ({ 
        ...p, 
        [lang]: (p[lang] || []).filter((_, i) => i !== idx) 
      }))
      setLanguageValues(p => ({ 
        ...p, 
        [lang]: (p[lang] || []).filter((_, i) => i !== idx) 
      }))
    } else {
      // It's a local new value - remove from localNewValues
      const localIdx = idx - apiValues.length
      setLocalNewValues(prev => ({
        ...prev,
        [lang]: (prev[lang] || []).filter((_, i) => i !== localIdx)
      }))
    }
  }

  const handleStartEditValue = (lang:string, index:number) => {
    const apiValues = langValueRecords[lang] || []
    const localVals = localNewValues[lang] || []
    
    let rec: { attributeValueId?: number; id?: number; name: string } | undefined
    
    if (index < apiValues.length) {
      // API value
      rec = apiValues[index]
    } else {
      // Local value
      const localIdx = index - apiValues.length
      const localVal = localVals[localIdx]
      if (localVal) {
        rec = { name: localVal.name, attributeValueId: undefined }
      }
    }
    
    if (!rec) return
    
    removeValueFromLanguage(lang, index)
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
      const restoreName = valueInput
      
      const apiValues = langValueRecords[language] || []
      
      if (originalIndex < apiValues.length) {
        // It's an API value - restore in langValueRecords
        setLangValueRecords(prev => {
          const next = { ...prev }
          const arr = [...(next[language] || [])]
          arr.splice(Math.min(originalIndex, arr.length), 0, { attributeValueId, id, name: restoreName })
          next[language] = arr
          return next
        })
        
        setLanguageValues(prev => {
          const vals = { ...prev }
          const arr = [...(vals[language] || [])]
          arr.splice(Math.min(originalIndex, arr.length), 0, restoreName)
          vals[language] = arr
          return vals
        })
      } else {
        // It's a local value - restore in localNewValues
        const localIdx = originalIndex - apiValues.length
        setLocalNewValues(prev => {
          const updated = { ...prev }
          const arr = [...(updated[language] || [])]
          arr.splice(Math.min(localIdx, arr.length), 0, { name: restoreName })
          updated[language] = arr
          return updated
        })
      }
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
    
    const apiValues = langValueRecords[language] || []
    
    if (originalIndex < apiValues.length) {
      // It's an API value - update in langValueRecords
      setLangValueRecords(prev => {
        const next = { ...prev }
        const arr = [...(next[language] || [])]
        arr.splice(Math.min(originalIndex, arr.length), 0, { 
          attributeValueId, 
          id, 
          name: val
        })
        next[language] = arr
        return next
      })
      
      setLanguageValues(prev => {
        const vals = { ...prev }
        const arr = [...(vals[language] || [])]
        arr.splice(Math.min(originalIndex, arr.length), 0, val)
        vals[language] = arr
        return vals
      })
    } else {
      // It's a local value - update in localNewValues
      const localIdx = originalIndex - apiValues.length
      setLocalNewValues(prev => {
        const updated = { ...prev }
        const arr = [...(updated[language] || [])]
        arr.splice(Math.min(localIdx, arr.length), 0, { name: val })
        updated[language] = arr
        return updated
      })
    }
    
    setEditingValueId(null)
    setEditingContext(null)
    setValueInput("")
  }

  const handleDeleteValue = async (lang:string, index:number) => {
    const apiValues = langValueRecords[lang] || []
    
    if (index < apiValues.length) {
      // It's an API value
      const rec = apiValues[index]
      if (!rec) return
      
      const deleteKey = rec.id
      
      if (!deleteKey) { 
        removeValueFromLanguage(lang, index)
        return 
      }
      
      if (deletingIds.has(deleteKey)) return
      setDeletingIds(p => new Set(p).add(deleteKey))
      
      try {
        await attributService.deleteAttributValue(deleteKey)
        removeValueFromLanguage(lang, index)
        if (editingValueId === deleteKey) cancelEditValue()
      } finally {
        setDeletingIds(p => { const n = new Set(p); n.delete(deleteKey); return n })
      }
    } else {
      // It's a local new value, just remove it
      removeValueFromLanguage(lang, index)
    }
  }

  // Display values: combine API values with local new values
  const currentValues = React.useMemo(() => {
    const apiVals = languageValues[selectedLanguage] || []
    const localVals = (localNewValues[selectedLanguage] || []).map(v => v.name)
    return [...apiVals, ...localVals]
  }, [languageValues, localNewValues, selectedLanguage])

  // YENİ UPDATE: bütün dilləri bir payload-da göndəririk
  const persistChanges = async () => {
    if (!attributeId) { onClose(); return }
    
    // Validate: Check if all languages have equal number of NEW values (from localNewValues)
    const newValueCounts = {
      az: (localNewValues.az || []).length,
      en: (localNewValues.en || []).length,
      ru: (localNewValues.ru || []).length
    }
    
    if (newValueCounts.az !== newValueCounts.en || newValueCounts.en !== newValueCounts.ru) {
      toast.error(`Xəta: Bütün dillərdə eyni sayda yeni dəyər olmalıdır!\nAZ: ${newValueCounts.az}, EN: ${newValueCounts.en}, RU: ${newValueCounts.ru}`, {
        duration: 5000
      })
      return
    }
    
    if (isNewAttribute) {
      // CREATE MODE - Group by index position across all three languages
      // Structure: { attributeId, attributeValueDtos: [{ value: [{ value, language }, ...] }, ...] }
      
      const newValuesAz = localNewValues.az || []
      const newValuesEn = localNewValues.en || []
      const newValuesRu = localNewValues.ru || []
      
      const maxNewValues = Math.max(newValuesAz.length, newValuesEn.length, newValuesRu.length)
      
      const attributeValueDtos: { value: { value: string; language: string }[] }[] = []
      
      for (let i = 0; i < maxNewValues; i++) {
        const valueSet: { value: string; language: string }[] = []
        
        if (newValuesAz[i]) {
          valueSet.push({ value: newValuesAz[i].name, language: 'az' })
        }
        if (newValuesEn[i]) {
          valueSet.push({ value: newValuesEn[i].name, language: 'en' })
        }
        if (newValuesRu[i]) {
          valueSet.push({ value: newValuesRu[i].name, language: 'ru' })
        }
        
        if (valueSet.length > 0) {
          attributeValueDtos.push({ value: valueSet })
        }
      }
      
      try {
        await attributService.createAttributeValueBulk({
          attributeId: attributeId,
          attributeValueDtos: attributeValueDtos
        } as any)
      } catch (e) {
        console.error('Error creating attribute values:', e)
      }
    } else {
      // UPDATE MODE - Group by attributeValueId for existing values
      // New values are grouped by index position across all three languages
      // Structure: { attributeId, attributeValue: [{ id?, attributeValueSets: [...] }, ...] }
      
      const valueGroups = new Map<string, { id?: number; sets: { value: string; language: string }[] }>()
      
      // First pass: Group existing values by attributeValueId
      LANGS.forEach(lang => {
        (langValueRecords[lang] || []).forEach(record => {
          if (record.attributeValueId !== undefined) {
            // Existing value - group by attributeValueId
            const key = `existing_${record.attributeValueId}`
            
            if (!valueGroups.has(key)) {
              valueGroups.set(key, {
                id: record.attributeValueId,
                sets: []
              })
            }
            
            valueGroups.get(key)!.sets.push({
              value: record.name,
              language: lang
            })
          }
        })
      })
      
      // Second pass: Group new values by their index position
      // All new values at same index across languages belong together
      const newValuesAz = localNewValues.az || []
      const newValuesEn = localNewValues.en || []
      const newValuesRu = localNewValues.ru || []
      
      const maxNewValues = Math.max(newValuesAz.length, newValuesEn.length, newValuesRu.length)
      
      for (let i = 0; i < maxNewValues; i++) {
        const key = `new_index_${i}`
        const sets: { value: string; language: string }[] = []
        
        if (newValuesAz[i]) {
          sets.push({ value: newValuesAz[i].name, language: 'az' })
        }
        if (newValuesEn[i]) {
          sets.push({ value: newValuesEn[i].name, language: 'en' })
        }
        if (newValuesRu[i]) {
          sets.push({ value: newValuesRu[i].name, language: 'ru' })
        }
        
        if (sets.length > 0) {
          valueGroups.set(key, {
            id: undefined,
            sets: sets
          })
        }
      }
      
      // Build the payload array
      const attributeValues = Array.from(valueGroups.values()).map(group => {
        const result: any = {
          attributeValueSets: group.sets
        }
        
        // Include id only if it exists (for updates)
        // If id is undefined, it's a new value (will be created)
        if (group.id !== undefined) {
          result.id = group.id
        }
        
        return result
      })
      
      try {
        await attributService.editAttributValue({
          attributeId: attributeId,
          attributeValue: attributeValues
        } as any)
      } catch (e) {
        console.error('Error updating attribute values:', e)
      }
    }
    
    onClose(true)
  }

  return (
    <Dialog open={open} onOpenChange={(o)=> !o && onClose()}>
      <DialogContent className="overflow-y-auto" style={{ minWidth:"460px", maxWidth:"48vw", height:"82vh" }}>
        <DialogHeader>
          <DialogTitle>
            {loading ? "Loading..." : isNewAttribute ? "Create Attribute Values" : "Edit Attribute Values"}
          </DialogTitle>
        </DialogHeader>

        {!attributeId && <div className="text-sm text-muted-foreground">AttributeId yoxdur.</div>}
        {attributeId && (
          <div className="space-y-6">
            <Tabs value={selectedLanguage} onValueChange={v=>{ 
              // Save current language data before switching
              setSelectedLanguage(v as Lang)
              // Keep all data intact - just switch view
              // Don't reset page, search, or any other state
            }}>
              <TabsList>
                <TabsTrigger value="az">
                  AZ 
                  <span className="ml-1 text-xs text-gray-500">
                    ({(localNewValues.az || []).length} yeni)
                  </span>
                </TabsTrigger>
                <TabsTrigger value="en">
                  EN
                  <span className="ml-1 text-xs text-gray-500">
                    ({(localNewValues.en || []).length} yeni)
                  </span>
                </TabsTrigger>
                <TabsTrigger value="ru">
                  RU
                  <span className="ml-1 text-xs text-gray-500">
                    ({(localNewValues.ru || []).length} yeni)
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Info banner about bulk add */}
            {/* <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800">
                    Toplu əlavə funksiyası
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Birdən çox dəyəri vergüllə ayıraraq eyni anda əlavə edə bilərsiniz. Məsələn: <code className="bg-blue-100 px-1 rounded">Bakı, Gəncə, Sumqayıt</code>
                  </p>
                </div>
              </div>
            </div> */}

            {/* Warning banner when new value counts don't match */}
            {(() => {
              const newCounts = {
                az: (localNewValues.az || []).length,
                en: (localNewValues.en || []).length,
                ru: (localNewValues.ru || []).length
              }
              const countsMatch = newCounts.az === newCounts.en && newCounts.en === newCounts.ru
              
              if (!countsMatch) {
                return (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-semibold">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">
                          Diqqət: Bütün dillərdə eyni sayda yeni dəyər olmalıdır!
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          AZ: {newCounts.az} yeni, EN: {newCounts.en} yeni, RU: {newCounts.ru} yeni
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })()}

            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="mb-2 text-sm font-medium">
                  Value 
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Toplu əlavə vergüllə: dəyər1, dəyər2, dəyər3)
                  </span>
                </label>
                <Input
                  value={valueInput}
                  placeholder="Dəyər daxil edin və ya vergüllə ayıraraq toplu əlavə edin"
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
                value={searchInput}
                placeholder="Search values..."
                onChange={e=> setSearchInput(e.target.value)}
              />
             
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-sm text-gray-500">Yüklənir...</div>
              ) : currentValues.length === 0 ? (
                <div className="text-sm text-muted-foreground">No values</div>
              ) : (
                currentValues.map((v, idx) => {
                const apiValues = langValueRecords[selectedLanguage] || []
                const localVals = localNewValues[selectedLanguage] || []
                
                let rec: { attributeValueId?: number; id?: number } | undefined
                if (idx < apiValues.length) {
                  rec = apiValues[idx]
                } else {
                  rec = { attributeValueId: undefined }
                }
                
                const uniqueId = rec?.attributeValueId ?? rec?.id
                const isDeleting = uniqueId ? deletingIds.has(uniqueId) : false
                
                return (
                  <div
                    key={`${v}_${idx}`}
                    className="border rounded p-2 flex items-center justify-between"
                  >
                    <span className="text-sm">{v}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={()=>handleStartEditValue(selectedLanguage, idx)}
                        disabled={isDeleting}
                      ><Edit className="h-4 w-4" /></Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={()=>handleDeleteValue(selectedLanguage, idx)}
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
              })
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage===1 || loading}
                  onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}
                ><ChevronLeft /></Button>
                <span className="text-ml ml-2 mr-2">
                  Səhifə {currentPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage===totalPages || loading}
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