"use client"
import React, { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import CreateAttributModal from "@/containers/settings/pages/CreateAttributModal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, ChevronLeft, ChevronRight, Edit, File, Replace, Search, Trash, X } from "lucide-react"
import AlertDialogComponent from "@/components/AlertDiolog/AlertDiolog"
import AttributsReorderDialog from "@/containers/settings/pages/AttributsReorderDialog"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { useSections } from "@/lib/hooks/useSection"
import { useAttributs, useDeleteAttribut ,useEditAttributStatus} from "@/lib/hooks/useAttribut"
import AttributeValuesModal from "@/containers/settings/pages/AttributeValuesModal"
const VALUE_TYPE_MAP: Record<number, string> = {
  1: "String",
  2: "Number",
  3: "Radio",
  4: "TextArea",
  5: "Select",
  6: "Multiselect",
  7: "Date",
  8: "DateRange",
  9: "Checkbox",
  10: "Range",
  11: "Color",
  12: "Phone",
  13: "Datetime",
  14: "Email",
  15: "Price"
}
export default function AttributContainer() {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [reorderOpen, setReorderOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all')
  const [statusFilterSection, setStatusFilterSection] = useState<string>('all')
  const [statusFilterAttribut, setStatusFilterAttribut] = useState<'all' | 'cv' | 'vacancy'>('all')
  const [valuesOpen, setValuesOpen] = useState(false)
  const [currentAttributeId, setCurrentAttributeId] = useState<number | null>(null)
  const [valuesFromCreate, setValuesFromCreate] = useState(false) // NEW: açılış mənbəyini izləmək üçün

  const { data: sections = [], isLoading: sectionsLoading } = useSections(undefined)

  React.useEffect(() => {
    const h = setTimeout(() => setSearch(searchInput.trim()), 500)
    return () => clearTimeout(h)
  }, [searchInput])

  const queryParams = {
    pageNumber,
    pageSize,
    value: search || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'true',
    type: statusFilterAttribut === 'all' ? undefined : statusFilterAttribut === 'cv' ? "cv" : "vacancy",
    sectionId: statusFilterSection === 'all' ? undefined : Number(statusFilterSection),
  }

  const { data: attributs = [], isLoading, isError } = useAttributs(queryParams)

  const { data: nextPageAttributs = [] } = useAttributs(
    { ...queryParams, pageNumber: pageNumber + 1 },
    { enabled: attributs.length === pageSize }
  )

  const canGoNext = attributs.length === pageSize && nextPageAttributs.length > 0

  useEffect(() => {
    if (!isLoading && !isError && attributs.length === 0 && pageNumber > 1) {
      setPageNumber(p => Math.max(1, p - 1))
    }
  }, [attributs, isLoading, isError, pageNumber])

  const deleteAttribut = useDeleteAttribut()
  const editStatus = useEditAttributStatus()
  const t = useTranslations("attribute")

  const getAttributTitle = (s: any) => {
    const trs = Array.isArray(s?.translations) ? s.translations : []
    const pick = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').trim().toLowerCase() === 'az')
      || trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').trim().toLowerCase() === 'en')
      || trs[0]
    return (pick?.title ?? pick?.name ?? '').trim() || `#${s?.id}`
  }

  const getAttrName = (s: any) => {
    const arr = Array.isArray(s?.setCreateAttributeRequest) ? s.setCreateAttributeRequest : []
    const byLang = (lng: string) =>
      arr.find((tr: any) => String(tr?.language ?? '').trim().toLowerCase() === lng)
    const pick = byLang('az') || byLang('en') || arr[0]
    return (pick?.name ?? '').trim() || `#${s?.id}`
  }

  const openValues = (id: number) => {
    // File ikonundan açılırsa yalnız dəyər modalı açılsın
    setValuesFromCreate(false)
    setOpen(false)          // hər ehtimala qarşı create modal bağlı olsun
    setEditId(null)         // edit moddan çıx
    setCurrentAttributeId(id)
    setValuesOpen(true)
  }

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <div className="flex items-center gap-2">
            <Button
              className="text-white flex items-center justify-center h-10 w-10 p-0"
              style={{ backgroundColor: "#f39f40ff", transition: "background-color 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e2aa69ff")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f39f40ff")}
              title="Sıralama"
              onClick={() => setReorderOpen(true)}
            >
              <Replace className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => { setEditId(null); setOpen(true) }}
              className="text-white"
              style={{ backgroundColor: "#f34040ff", transition: "background-color 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fd6060cc")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f34040ff")}
            >{t("addAttribute")}</Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-1/2 lg:w-1/3">
            <Input
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPageNumber(1) }}
              placeholder={t("search_placeholder") || "Axtar..."}
              className="bg-white dark:bg-background pl-3 h-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2 w-56">
            <Dropdown
              className="w-full"
              options={[
                { value: 'all', label: t("all") || "Hamısı" },
                ...((sections as any[]).map((s) => {
                  const trs = Array.isArray(s?.translations) ? s.translations : []
                  const az = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').trim().toLowerCase() === 'az')
                  const en = trs.find((tr: any) => String(tr?.language ?? tr?.lang ?? '').trim().toLowerCase() === 'en')
                  const label = (az?.title || en?.title || trs[0]?.title || s?.stepName || `#${s?.id}`) as string
                  return { value: String(s.id), label }
                }))
              ]}
              value={statusFilterSection}
              onChange={(val: string) => { setStatusFilterSection(val); setPageNumber(1) }}
              placeholder={sectionsLoading ? (t("loading") || "Yüklənir...") : (t("selectSection") || "Section seçin")}
              disabled={sectionsLoading}
            />
          </div>
          <div className="flex gap-2 w-56">
            <Dropdown
              className="w-full"
              options={[
                { value: 'all', label: t("all") || "Hamısı" },
                { value: 'cv', label: t("cv") || "Cv" },
                { value: 'vacancy', label: t("vacancy") || "Vakansia" },
              ]}
              value={statusFilterAttribut}
              onChange={(val: string) => { setStatusFilterAttribut(val as any); setPageNumber(1) }}
            />
          </div>
          <div className="flex gap-2 w-56">
            <Dropdown
              className="w-full"
              options={[
                { value: 'all', label: t("all") || "Hamısı" },
                { value: 'true', label: t("active") || "Aktiv" },
                { value: 'false', label: t("passive") || "Passiv" },
              ]}
              value={statusFilter}
              onChange={(val: string) => { setStatusFilter(val as any); setPageNumber(1) }}
            />
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden mb-4">
          <Table className="text-sm w-full">
            <TableHeader>
             <TableRow className="bg-gray-50 hover:bg-gray-50">
    <TableHead className="px-3 py-2 text-lg">{t("table.id")}</TableHead>
    <TableHead className="px-3 py-2 text-lg">{t("table.name")}</TableHead>
    <TableHead className="px-3 py-2 text-lg">{t("table.sectionName")}</TableHead>
    <TableHead className="px-3 py-2 text-lg">{t("table.valuable")}</TableHead>
    <TableHead className="px-3 py-2 text-lg">{t("table.visible")}</TableHead>
    <TableHead className="px-3 py-2 text-lg">{t("table.important")}</TableHead>
    <TableHead className="px-3 py-2 text-lg">{t("table.type")}</TableHead>
    <TableHead className="px-3 py-2 text-lg">{t("table.status")}</TableHead>
    <TableHead className="px-3 py-2 text-right sticky right-0 bg-white/90 backdrop-blur z-10">
      {t("table.actions")}
    </TableHead>
  </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={10} className="px-3 py-6 text-center">Yüklənir...</TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={10} className="px-3 py-6 text-center text-red-600">Xəta baş verdi</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && attributs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="px-3 py-6 text-center text-muted-foreground">Məlumat yoxdur</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && attributs.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="px-3 py-4 text-base">{s.id}</TableCell>
                  <TableCell className="px-3 py-4 text-base font-medium">{getAttrName(s)}</TableCell>
                  <TableCell className="px-3 py-4 text-base">{s.sectionName }</TableCell>
                 
                  <TableCell className="px-3 py-4">
                    {s.isValuable ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    {s.isVisiable ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    {s.isImportand ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-base">
                    {VALUE_TYPE_MAP[Number(s.valueType)] || s.valueType || "-"}
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    <Switch
                      checked={!!s.isActive}
                      disabled={editStatus.isPending}
                      onCheckedChange={(val) => {
                        editStatus.mutate({ id: s.id, isActive: val })
                      }}
                    />
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right sticky right-0 bg-white/90 backdrop-blur">
                    <div className="inline-flex gap-2">
                      {[5, 6].includes(Number(s.valueType)) && (
                        <File
                          style={{ width: "20px", height: "20px", cursor: "pointer" }}
                          onClick={() => openValues(s.id)}
                         
                        />
                      )}
                      <Edit
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => { setEditId(s.id); setOpen(true) }}
                      />
                      <Trash
                        className="w-5 h-5 cursor-pointer text-red-600"
                        onClick={() => { setDeleteId(s.id); setDeleteOpen(true) }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 text-sm">
            <span>Səhifə ölçüsü:</span>
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

        <Dialog open={open} onOpenChange={(o) => { if (!o) setEditId(null); setOpen(o) }}>
          <DialogContent className="w-[80vw] max-w-[1200px] h-[70vh] overflow-y-auto">
            <CreateAttributModal
              id={editId ?? undefined}
              onClose={() => { setOpen(false) }}
              onOpenValues={(attrId:number)=>{
                // Create modal-dan Next
                setValuesFromCreate(true)
                setOpen(false)
                setEditId(attrId)
                setCurrentAttributeId(attrId)
                setValuesOpen(true)
              }}
            />
          </DialogContent>
        </Dialog>

        <AttributsReorderDialog open={reorderOpen} onOpenChange={setReorderOpen} />

        <AlertDialogComponent
          open={deleteOpen}
          setOpen={(o) => { if (!o) setDeleteId(null); setDeleteOpen(o) }}
          title={t("deleteTitle")}
          description={t("deleteDescription")}
          onCancel={() => { setDeleteOpen(false); setDeleteId(null) }}
          onConfirm={() => {
            if (deleteId != null) {
              deleteAttribut.mutate(deleteId, {
                onSettled: () => {
                  setDeleteOpen(false)
                  setDeleteId(null)
                }
              })
            }
          }}
        />

        <AttributeValuesModal
          open={valuesOpen}
          attributeId={currentAttributeId}
          onClose={(updated)=>{
            setValuesOpen(false)
            if (updated) {
              // burada refetch çağırın (məs: queryClient.invalidateQueries([...]))
            } else if (!updated && currentAttributeId && valuesFromCreate) {
              // Yalnız Create modal-dan gəlmişiksə geri dön
              setOpen(true)
              setEditId(currentAttributeId)
            }
          }}
        />
      </div>
    </>
  )
}