"use client"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import NotesPage from "./NotesPage"
import ProcessPage from "./ProcessPage"
import TrainingPage from "./TrainingPage"
import InvitedPage from "./InvitedPage"
import OnlineApplicationsPage from "./OnlineApplicationsPage"
import MessagesPage from "./MessagesPage"

interface CvInfoModalProps {
  open: boolean
  onClose: () => void
  cvData?: any
  embedded?: boolean
}

export default function CvInfoModal({ open, onClose, cvData, embedded = false }: CvInfoModalProps) {
  const [activeTab, setActiveTab] = useState("note")

  const content = (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">CV Məlumatları</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex justify-start w-full mb-6 overflow-x-auto">
            <TabsTrigger value="note" className="flex items-center gap-2">

              <h2>Qeydlər</h2>
            </TabsTrigger>
            <TabsTrigger value="process" className="flex items-center gap-2">
              <h2>Prosess</h2>

            </TabsTrigger>
            <TabsTrigger value="Training" className="flex items-center gap-2">
              <h2>Təlimlər</h2>

            </TabsTrigger>
            <TabsTrigger value="Invited" className="flex items-center gap-2">
              <h2>Çağırılanlar</h2>
            </TabsTrigger>
            <TabsTrigger value="Messages" className="flex items-center gap-2">
              <h2>Göndərilən ismarıclar</h2>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <h2>Onlayn müraciətlər</h2>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="note">
            <NotesPage cvData={cvData} />
          </TabsContent>

          <TabsContent value="process">
            <ProcessPage cvData={cvData} />
          </TabsContent>

          <TabsContent value="Training">
            <TrainingPage cvData={cvData} />
          </TabsContent>

          <TabsContent value="Invited">
            <InvitedPage cvData={cvData} />
          </TabsContent>

          <TabsContent value="Messages">
            <MessagesPage cvData={cvData} />
          </TabsContent>

          <TabsContent value="documents">
            <OnlineApplicationsPage cvData={cvData} />
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


