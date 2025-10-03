"use client"
import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, User } from "lucide-react"

interface NotesPageProps {
  cvData?: any
}

export default function NotesPage({ cvData }: NotesPageProps) {
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteText, setNoteText] = useState("")

  // Static notes data - will be dynamic later
  const staticNotes = [
    {
      id: 1,
      author: "MƏDİNƏ QULUYEVA RADİL QIZI",
      date: "16.10.2024 16:24",
      text: "İcazəsi olmayan səhifəya giriş cəhdi"
    },
    {
      id: 2,
      author: "ƏSLİ ÇOLAQOVA HACI QIZI",
      date: "16.10.2024 11:20",
      text: "Xanım universiteta getdiyi üçün saat 2 a qədər çalışmaq istəyirdi. İş saatı 5 da bitdiyi üçün uyğun olmadı."
    },
    {
      id: 3,
      author: "NƏRMİN İSMAYILOVA PAŞA QIZI",
      date: "14.10.2024 10:38",
      text: "Şərtlər uyğun olmadığını bildirdi."
    },
    {
      id: 4,
      author: "AYSEL İBRAHIMOVA SURXAY QIZI",
      date: "04.10.2024 12:21",
      text: "Təlimə çağrıldı və zəng edildi, ismarıc göndərildi."
    }
  ]

  const handleSaveNote = () => {
    // TODO: API call to save note
    console.log("Saving note:", noteText)
    setNoteText("")
    setShowNoteForm(false)
  }

  return (
    <div className="space-y-4 relative">
      {/* Note Input Form - Only show when button clicked */}
      {!showNoteForm && (
        <div className="sticky bottom-4 flex justify-end mt-4">
          <Button
            onClick={() => setShowNoteForm(true)}
            className="bg-green-600 hover:bg-green-700 w-12 h-12 shadow-lg"
          
               size="sm"
          >
            <Plus className="w-4 h-4" /> Qeyd əlavə et
          </Button>
        </div>
      )}
      
      {showNoteForm && (
        <Card className="p-4 border-2 border-blue-500 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Səbəbini yazın yaxud seçin</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNoteForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Qeydiniz
            </label>
            <Textarea
              placeholder="Qeydiniz"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNoteText("")
                setShowNoteForm(false)
              }}
            >
              İmtina
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNote}
              disabled={!noteText.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Yadda saxla
            </Button>
          </div>
        </Card>
      )}

      {/* Notes Timeline */}
      <div className="flex flex-col gap-4">
        {staticNotes.map((note) => (
          <Card 
            key={note.id} 
            className="p-4 bg-blue-50 border-l-4 border-blue-400 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm text-gray-900">
                {note.author}
              </h4>
              <span className="text-xs text-gray-600">
                {note.date}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {note.text}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
