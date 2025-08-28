"use client"
import React, { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import CreateAttributeModal from "@/containers/Cv/pages/CreateAttributeModal"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"

export default function AttributeContainer() {
    const t = useTranslations("attribute")
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(1)

    const data = useMemo(() => ([
        { id: 73, name: "Üz tanıma", category: "Electronics", parent: "-", editable: true, section: "Additional", type: "Select", showInTable: true, required: true, showInPrint: true, addable: true },
        { id: 74, name: "Zəmanət", category: "Electronics", parent: "-", editable: true, section: "Additional", type: "Select", showInTable: true, required: false, showInPrint: false, addable: true },
        { id: 77, name: "Yaddaş tipi", category: "Electronics", parent: "-", editable: false, section: "Main", type: "Select", showInTable: false, required: true, showInPrint: true, addable: false },
        { id: 1078, name: "test_en", category: "Electronics", parent: "Üz tanıma", editable: false, section: "Additional", type: "Select", showInTable: true, required: false, showInPrint: false, addable: false },
        { id: 1079, name: "test2", category: "Electronics", parent: "Yaddas", editable: false, section: "Main", type: "Select", showInTable: false, required: false, showInPrint: true, addable: true },
        { id: 73, name: "Üz tanıma", category: "Electronics", parent: "-", editable: true, section: "Additional", type: "Select", showInTable: true, required: true, showInPrint: true, addable: true },
        { id: 1079, name: "test2", category: "Electronics", parent: "Yaddas", editable: false, section: "Main", type: "Select", showInTable: false, required: false, showInPrint: true, addable: true },
    ]), [])

    const filtered = data.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const current = filtered.slice((page - 1) * pageSize, page * pageSize)
    const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages))

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-6" style={{ marginBottom: "1.5rem" }}>
                <div className="flex-1 max-w-sm">
                    <input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                        placeholder="Atribut axtar..."
                        className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <Button
                    onClick={() => setOpen(true)}
                    className="text-white"
                    style={{ backgroundColor: "#f34040ff", transition: "background-color 0.3s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fd6060cc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f34040ff")}
                >
                    {t("addAttribute")}
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table className="text-sm">
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="px-3 py-2">ID</TableHead>
                            <TableHead className="px-3 py-2">Ad</TableHead>
                            <TableHead className="px-3 py-2">Kateqoriya</TableHead>
                            <TableHead className="px-3 py-2">Üst atribut</TableHead>
                            <TableHead className="px-3 py-2">Dəyişilə bilər</TableHead>
                            <TableHead className="px-3 py-2 ">Əməliyyatlar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {current.map(row => (
                            <TableRow key={row.id} className="hover:bg-gray-50">
                                <TableCell className="px-3 py-2">{row.id}</TableCell>
                                <TableCell className="px-3 py-2 font-medium">{row.name}</TableCell>
                                <TableCell className="px-3 py-2">{row.category}</TableCell>
                                <TableCell className="px-3 py-2">{row.parent}</TableCell>
                                <TableCell className="px-3 py-2">{row.editable ? "Bəli" : "Xeyr"}</TableCell>
                                <TableCell className="px-3 py-2 text-right flex gap-2"> <Edit className="w-4 h-4 inline-block" /> <Trash className="w-4 h-4 inline-block" /></TableCell>

                            </TableRow>
                        ))}
                        {!current.length && (
                            <TableRow>
                                <TableCell colSpan={9} className="px-3 py-6 text-center text-sm text-gray-500">Nəticə yoxdur</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50 text-xs">
                    <div className="flex items-center gap-2">
                        <span>Səhifədəki sətir sayı:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                            className="border rounded px-2 py-1 text-xs"
                        >
                            {[10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => goPage(page - 1)} disabled={page === 1} className="px-2 py-1 rounded disabled:opacity-40 hover:bg-gray-200">‹</button>
                        {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                            const p = i + 1; return (
                                <button key={p} onClick={() => goPage(p)} className={`px-2 py-1 rounded ${p === page ? "bg-black text-white" : "hover:bg-gray-200"}`}>{p}</button>
                            )
                        })}
                        <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="px-2 py-1 rounded disabled:opacity-40 hover:bg-gray-200">›</button>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-[75vw] max-w-[1600px] h-[88vh] overflow-y-auto">
                    <CreateAttributeModal onClose={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    )
}