"use client"
import React, { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import NotesPage from "./NotesPage"
import ProcessPage from "./ProcessPage"

interface VacancyInfoModalProps {
  open: boolean
  onClose: () => void
  vacancyData?: any
  embedded?: boolean
}

export default function VacancyInfoModal({ open, onClose, vacancyData, embedded = false }: VacancyInfoModalProps) {
  const [activeTab, setActiveTab] = useState("note")

  const content = (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Vakansiya Məlumatları</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex justify-start w-full mb-6 overflow-x-auto">
          <TabsTrigger value="note" className="flex items-center gap-2">
            <h2>Qeydlər</h2>
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center gap-2">
            <h2>Prosess</h2>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="note">
          <NotesPage vacancyData={vacancyData} />
        </TabsContent>

        <TabsContent value="process">
          <ProcessPage vacancyData={vacancyData} />
        </TabsContent>
      </Tabs>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[70vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  )
}

