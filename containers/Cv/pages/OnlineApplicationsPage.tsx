"use client"
import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileText, User } from "lucide-react"

interface OnlineApplicationsPageProps {
  cvData?: any
}

export default function OnlineApplicationsPage({ cvData }: OnlineApplicationsPageProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Static online applications data based on the image - will be dynamic later
  const applications = [
    {
      id: 1,
      user: "Rəşad Əliyev - rashad.aliyev@example.com",
      vacancy: "Senior Frontend Developer - Tech Solutions LLC",
      acceptedEmployee: "Əli Məmmədov",
      note: "React təcrübəsi yaxşıdır",
      date: "2024-10-15 14:30"
    },
    {
      id: 2,
      user: "Leyla Məmmədova - leyla.mammadova@example.com",
      vacancy: "Backend Developer - Digital Innovations",
      acceptedEmployee: "Nərgiz Əliyeva",
      note: "Python uzmanı",
      date: "2024-10-14 16:45"
    },
    {
      id: 3,
      user: "Tofiq Həsənov - tofiq.hasenov@example.com",
      vacancy: "Full Stack Developer - StartupHub",
      acceptedEmployee: "Rəşad Quliyev",
      note: "AWS sertifikatı var",
      date: "2024-10-13 11:20"
    }
  ]

  const filteredApplications = applications.filter(application =>
    application.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.vacancy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.acceptedEmployee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.note.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Card className="p-6">
        {/* Header with search */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Onlayn Müraciətlər
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
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="min-w-[200px]">İstifadəçi</TableHead>
                <TableHead className="min-w-[200px]">Vakansiya</TableHead>
                <TableHead className="min-w-[150px]">Qəbul etmiş əməkdaş</TableHead>
                <TableHead className="min-w-[150px]">Qeyd</TableHead>
                <TableHead className="min-w-[120px]">Tarix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <TableRow key={application.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{application.id}</TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium text-gray-900">
                        {application.user}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {application.vacancy}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          {application.acceptedEmployee}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {application.note}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {application.date}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
            <span>Cəmi {filteredApplications.length} müraciət</span>
            <span>Son yenilənmə: {new Date().toLocaleString('az-AZ')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
