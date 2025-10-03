"use client"
import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Calendar, Trash2 } from "lucide-react"

interface ProcessPageProps {
  vacancyData?: any
}

export default function ProcessPage({ vacancyData }: ProcessPageProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Static process data based on vacancy - will be dynamic later
  const processData = [
    {
      id: 1,
      proposer: "GÜNAY NURİYEVA KAMAL QIZI -- Nuriyeva.Gunay@venta.az",
      operation: "",
      changes: "Vakansiya yaradıldı",
      status: "Aktiv",
      daysInProcess: "Gün təyin edilməyib",
      operationDuration: "15:30 dəq.",
      date: "2025-09-30 17:33:42",
      hasPermission: false
    },
    {
      id: 2,
      proposer: "MƏDİNƏ QULUYEVA RADİL QIZI -- Guluyeva.Medine@venta.az",
      operation: "Status dəyişikliyi",
      changes: "Vakansiya məlumatları yeniləndi",
      status: "Yeniləndi",
      daysInProcess: "5 gün",
      operationDuration: "8:15 dəq.",
      date: "2024-10-16 16:24:15",
      hasPermission: true
    },
    {
      id: 3,
      proposer: "ƏSLİ ÇOLAQOVA HACI QIZI -- Colaqova.Esli@venta.az",
      operation: "Elan dəyişikliyi",
      changes: "Maaş aralığı dəyişdirildi",
      status: "Dəyişdirildi",
      daysInProcess: "2 gün",
      operationDuration: "10:20 dəq.",
      date: "2024-10-16 11:20:30",
      hasPermission: true
    }
  ]

  const getStatusColor = (status: string) => {
    if (status.includes("Aktiv")) return "bg-green-600"
    if (status.includes("Yeniləndi")) return "bg-blue-600"
    if (status.includes("Dəyişdirildi")) return "bg-orange-600"
    if (status.includes("təyin edilməyib")) return "bg-gray-400"
    return "bg-gray-400"
  }

  const getChangesColor = (changes: string) => {
    if (changes.includes("yaradıldı")) return "text-green-600"
    return "text-gray-700"
  }

  const getDaysColor = (days: string) => {
    if (days.includes("təyin edilməyib")) return "text-yellow-600"
    return "text-gray-700"
  }

  const filteredData = processData.filter(item =>
    item.proposer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.changes.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Card className="p-6">
        {/* Header with search */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Prosess Aktivlikləri
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
                <TableHead className="min-w-[250px]">Təklif verən</TableHead>
                <TableHead className="min-w-[150px]">Əməliyyatı etdi</TableHead>
                <TableHead className="min-w-[150px]">Dəyişiklik etdi</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Prosesdəki günlər</TableHead>
                <TableHead className="min-w-[140px]">Əməliyyat aparılarkən müddət</TableHead>
                <TableHead className="min-w-[140px]">Tarix</TableHead>
                <TableHead className="min-w-[100px]">Status Dəyiş</TableHead>
                <TableHead className="min-w-[100px]">Status tarix dəyiş</TableHead>
                <TableHead className="min-w-[100px]">Status Sil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell className="text-sm">
                    <div className="max-w-[250px] truncate" title={item.proposer}>
                      {item.proposer}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.operation || "-"}
                  </TableCell>
                  <TableCell className={`text-sm ${getChangesColor(item.changes)}`}>
                    {item.changes}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={`${getStatusColor(item.status)} text-white text-xs`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-sm ${getDaysColor(item.daysInProcess)}`}>
                    {item.daysInProcess}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.operationDuration}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.date}
                  </TableCell>
                  <TableCell>
                    {item.hasPermission ? (
                      <Button size="sm" variant="outline" className="text-xs">
                        <Edit className="w-3 h-3 mr-1" />
                        Dəyiş
                      </Button>
                    ) : (
                      <span className="text-red-600 text-xs">İcazəniz yoxdur</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.hasPermission ? (
                      <Button size="sm" variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Tarix
                      </Button>
                    ) : (
                      <Calendar className="w-4 h-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.hasPermission ? (
                      <Button size="sm" variant="outline" className="text-xs text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Sil
                      </Button>
                    ) : (
                      <span className="text-red-600 text-xs">İcazəniz yoxdur</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Cəmi {filteredData.length} aktivlik</span>
            <span>Son yenilənmə: {new Date().toLocaleString('az-AZ')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

