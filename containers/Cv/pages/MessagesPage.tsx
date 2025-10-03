"use client"
import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, Clock, Phone, MapPin, ExternalLink } from "lucide-react"

interface MessagesPageProps {
  cvData?: any
}

export default function MessagesPage({ cvData }: MessagesPageProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Static messages data based on the image - will be dynamic later
  const messages = [
    {
      id: 1,
      recipient: "Aygün Tağıyeva Qulu",
      curator: "GÜNAY NURİYEVA KAMAL QIZI",
      message: "Salam Hörmətli Aygün Tağıyeva Qulu. Sizə xidmət göstərməkdən məmnuniyyət duyuruq. Sizin üçün seçilmiş kurator GÜNAY NURİYEVA KAMAL QIZI -dur. Hər hansı sualınız olarsa əlaqə saxlamaq üçün daxili nömrəmi və əlaqə metodunu +994516388838 sizinlə bölüşməkdən məmnunluq duyuram. https://maps.app.goo.gl/6LoztxijbciwCiZY",
      messageNumber: "7",
      timestamp: "30.09.2025 17:33",
      phoneNumber: "+994 77 389 80 88",
      status: "Göndərildi",
      hasMapLink: true
    },
    {
      id: 2,
      recipient: "Leyla Məmmədova",
      curator: "ƏSLİ ÇOLAQOVA HACI QIZI",
      message: "Salam Hörmətli Leyla Məmmədova. Müsahibə üçün sizinlə əlaqə saxlayırıq. Müsahibə tarixi: 25.10.2024 saat 14:00. Ətraflı məlumat üçün +994516388839 nömrəsi ilə əlaqə saxlaya bilərsiniz.",
      messageNumber: "5",
      timestamp: "28.09.2025 14:20",
      phoneNumber: "+994 77 389 80 89",
      status: "Oxundu",
      hasMapLink: false
    }
  ]

  const getStatusColor = (status: string) => {
    if (status === "Göndərildi") return "bg-blue-600"
    if (status === "Oxundu") return "bg-green-600"
    if (status === "Cavab gözləyir") return "bg-yellow-600"
    return "bg-gray-400"
  }

  const filteredMessages = messages.filter(message =>
    message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.curator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4 h-[50vh] flex flex-col">
      <Card className="p-6 flex-1 flex flex-col overflow-hidden">
        {/* Header with search */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Göndərilən İsmarıclar
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Axtar:</span>
            <Input
              placeholder="İsmarıclarda axtar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Search className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4 flex-1 overflow-y-auto">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <Card 
                key={message.id} 
                className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Message Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      {message.recipient}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">Kurator:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {message.curator}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={`${getStatusColor(message.status)} text-white text-xs`}
                    >
                      {message.status}
                    </Badge>
                    <span className="text-2xl font-bold text-gray-400">
                      {message.messageNumber}
                    </span>
                  </div>
                </div>

                {/* Message Content */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>

                {/* Message Footer */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{message.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{message.phoneNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {message.hasMapLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => window.open('https://maps.app.goo.gl/6LoztxijbciwCiZY', '_blank')}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Xəritədə göstər
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ətraflı
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                İsmarıc tapılmadı
              </h3>
              <p className="text-gray-600">
                Axtarış şərtlərinə uyğun ismarıc tapılmadı
              </p>
            </Card>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Cəmi {filteredMessages.length} ismarıc</span>
            <span>Son yenilənmə: {new Date().toLocaleString('az-AZ')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
