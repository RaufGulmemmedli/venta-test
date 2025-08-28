"use client"
import React, { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CvTitleCreatePage } from "@/containers/Cv/pages/CreateTitleModal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash } from "lucide-react"

export default function SectionContainer() {
  const [open, setOpen] = useState(false)
  const t = useTranslations("section")

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold">{t("title")}</h2>
        <Button
          onClick={() => setOpen(true)}
          className="text-white"
          style={{ backgroundColor: "#f34040ff", transition: "background-color 0.3s" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fd6060cc")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f34040ff")}
        >
      {t("addSection")}
        </Button>
      </div>
    <div className="text-sm text-muted-foreground">{/* TODO: list */}</div>

      <div className="border rounded-lg overflow-hidden">
  <Table className="text-sm">
    <TableHeader>
      <TableRow className="bg-gray-50 hover:bg-gray-50">
        <TableHead className="px-3 py-2">ID</TableHead>
        <TableHead className="px-3 py-2">Ad</TableHead>
        <TableHead className="px-3 py-2">Kateqoriya</TableHead>
        <TableHead className="px-3 py-2">Üst atribut</TableHead>
        <TableHead className="px-3 py-2">Dəyişilə bilər</TableHead>
        <TableHead className="px-3 py-2">Əməliyyatlar</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {/* Example rows */}
      <TableRow>
        <TableCell className="px-3 py-2">1</TableCell>
        <TableCell className="px-3 py-2">Example Name</TableCell>
        <TableCell className="px-3 py-2">Example Category</TableCell>
        <TableCell className="px-3 py-2">-</TableCell>
        <TableCell className="px-3 py-2">Bəli</TableCell>
        <TableCell className="px-3 py-2 text-right flex gap-2">
          <Edit className="w-4 h-4 inline-block" />
          <Trash className="w-4 h-4 inline-block" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[70vw] max-w-[900px] h-[70vh] overflow-y-auto">
          <CvTitleCreatePage />
        </DialogContent>
      </Dialog>
    </div>
  )
}
