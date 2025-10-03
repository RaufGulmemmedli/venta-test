"use client"
import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Phone, Settings, CheckCircle, XCircle } from "lucide-react"

interface InvitedPageProps {
  cvData?: any
}

export default function InvitedPage({ cvData }: InvitedPageProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Static invited candidates data based on the image - will be dynamic later
  const invitedCandidates = [
    {
      id: 1,
      personalInfo: "Rəşad Əliyev - +994 50 123 45 67",
      vacancyInfo: "Frontend Developer - Tech Solutions LLC",
      startDate: "2024-10-15",
      endDate: "2024-10-20",
      status: "Müsahibə təyin edildi",
      note: "React təcrübəsi var",
      called: true,
      accepted: true
    },
    {
      id: 2,
      personalInfo: "Leyla Məmmədova - +994 55 987 65 43",
      vacancyInfo: "Backend Developer - Digital Innovations",
      startDate: "2024-10-14",
      endDate: "2024-10-19",
      status: "Gözləyir",
      note: "Python uzmanı",
      called: true,
      accepted: false
    },
    {
      id: 3,
      personalInfo: "Tofiq Həsənov - +994 70 456 78 90",
      vacancyInfo: "Full Stack Developer - StartupHub",
      startDate: "2024-10-13",
      endDate: "2024-10-18",
      status: "Qəbul edildi",
      note: "AWS sertifikatı var",
      called: true,
      accepted: true
    }
  ]

  const getStatusColor = (status: string) => {
    if (status.includes("təyin edildi")) return "bg-blue-600"
    if (status.includes("Gözləyir")) return "bg-yellow-600"
    if (status.includes("Qəbul")) return "bg-green-600"
    if (status.includes("Rədd")) return "bg-red-600"
    return "bg-gray-400"
  }

  const filteredCandidates = invitedCandidates.filter(candidate =>
    candidate.personalInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.vacancyInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.note.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Card className="p-6">
        {/* Header with search and settings */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            Çağırılan Namizədlər
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Axtar:</span>
            <Input
              placeholder="Axtarış..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Search className="w-4 h-4 text-gray-400" />
            <Button size="sm" variant="outline" className="w-8 h-8 p-0 rounded-full bg-blue-100 hover:bg-blue-200">
              <Settings className="w-4 h-4 text-blue-600" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="min-w-[200px]">Şəxsin Məlumatları</TableHead>
                <TableHead className="min-w-[200px]">Vakansiya Məlumatları</TableHead>
                <TableHead className="min-w-[180px]">Başlanğıc tarixi - Bitmə tarixi</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Qeyd</TableHead>
                <TableHead className="min-w-[100px]">Çağırdı</TableHead>
                <TableHead className="min-w-[100px]">Qəbul etdi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{candidate.id}</TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium text-gray-900">
                        {candidate.personalInfo}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {candidate.vacancyInfo}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="space-y-1">
                        <div className="text-gray-700">
                          <strong>Başlanğıc:</strong> {candidate.startDate}
                        </div>
                        <div className="text-gray-700">
                          <strong>Bitmə:</strong> {candidate.endDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`${getStatusColor(candidate.status)} text-white text-xs`}
                      >
                        {candidate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {candidate.note}
                    </TableCell>
                    <TableCell className="text-center">
                      {candidate.called ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {candidate.accepted ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No data available in table
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Cəmi {filteredCandidates.length} namizəd</span>
            <span>Son yenilənmə: {new Date().toLocaleString('az-AZ')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
