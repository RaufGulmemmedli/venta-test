"use client"
import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, GraduationCap, Download, Eye } from "lucide-react"

interface TrainingPageProps {
  cvData?: any
}

export default function TrainingPage({ cvData }: TrainingPageProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Static training data based on the image - will be dynamic later
  const trainings = [
    {
      id: 1,
      trainingName: "React Development Bootcamp",
      address: "Bakı, Azərbaycan - Tech Center",
      startDate: "2024-09-15",
      endDate: "2024-09-29",
      reason: "Texniki bacarıqların artırılması",
      executionDate: "2024-09-29",
      certificate: "React Certified Developer",
      hasCertificate: true
    },
    {
      id: 2,
      trainingName: "Node.js Backend Development",
      address: "Onlayn - Zoom Platform",
      startDate: "2024-08-20",
      endDate: "2024-09-10",
      reason: "Backend development bacarıqları",
      executionDate: "2024-09-10",
      certificate: "Node.js Backend Specialist",
      hasCertificate: true
    },
    {
      id: 3,
      trainingName: "Database Design və SQL",
      address: "Bakı, Azərbaycan - University Campus",
      startDate: "2024-10-25",
      endDate: "2024-11-01",
      reason: "Database management bilikləri",
      executionDate: "2024-11-01",
      certificate: "SQL Database Expert",
      hasCertificate: false
    }
  ]

  const filteredTrainings = trainings.filter(training =>
    training.trainingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.certificate.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Card className="p-6">
        {/* Header with search */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Təlimlər
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
                <TableHead className="min-w-[200px]">Təlim adı</TableHead>
                <TableHead className="min-w-[200px]">Adres</TableHead>
                <TableHead className="min-w-[180px]">Başlanğıc tarixi - Bitmə tarixi</TableHead>
                <TableHead className="min-w-[150px]">Səbəb</TableHead>
                <TableHead className="min-w-[120px]">İcra tarixi</TableHead>
                <TableHead className="min-w-[120px]">Sertifikat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainings.length > 0 ? (
                filteredTrainings.map((training) => (
                  <TableRow key={training.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{training.id}</TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium text-gray-900">
                        {training.trainingName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {training.address}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="space-y-1">
                        <div className="text-gray-700">
                          <strong>Başlanğıc:</strong> {training.startDate}
                        </div>
                        <div className="text-gray-700">
                          <strong>Bitmə:</strong> {training.endDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {training.reason}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {training.executionDate}
                    </TableCell>
                    <TableCell>
                      {training.hasCertificate ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {training.certificate}
                          </Badge>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            Yüklə
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Sertifikat yoxdur</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
            <span>Cəmi {filteredTrainings.length} təlim</span>
            <span>Son yenilənmə: {new Date().toLocaleString('az-AZ')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
