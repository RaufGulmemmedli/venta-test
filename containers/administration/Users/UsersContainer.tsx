"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash, Mail, Phone, Shield, User, UserCheck, UserX, Users } from "lucide-react"
import { useUserManagement, useDeleteUser, useToggleUserStatus } from "@/lib/hooks/useUser"
import { CreateUserModal } from "@/containers/administration/Users/components/CreateUserModal"

export default function UsersContainer() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  
  const {
    users,
    pagination,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    isActiveFilter,
    setIsActiveFilter,
    refetch
  } = useUserManagement()

  const deleteUserMutation = useDeleteUser()
  const toggleStatusMutation = useToggleUserStatus()

  const handleDeleteUser = async (id: number) => {
    if (confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) {
      await deleteUserMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const isActive = currentStatus !== 'Aktiv'
    await toggleStatusMutation.mutateAsync({ id, isActive })
  }

  const getStatusColor = (status: string) => {
    return status === "Aktiv" ? "bg-green-600" : "bg-red-600"
  }

  const getRoleBadge = (rol: string) => {
    if (rol === "Admin") return "bg-purple-600"
    if (rol === "Moderator") return "bg-blue-600"
    return "bg-gray-600"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yüklənir...</div>
      </div>
    )
  }

 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İstifadəçi İdarəetməsi</h1>
          <p className="text-muted-foreground mt-1">Sistem istifadəçilərini idarə edin</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Yeni İstifadəçi
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cəmi İstifadəçi</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{pagination.totalCount}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktiv</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter(u => u.status === "Aktiv").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passiv</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter(u => u.status === "Passiv").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Adminlər</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter(u => u.role === "Admin").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="İstifadəçi axtar (ad, fin kod, e-mail)..."
                className="pl-10"
              />
            </div>
            <Select
              value={isActiveFilter === undefined ? "all" : isActiveFilter.toString()}
              onValueChange={(value) => {
                if (value === "all") {
                  setIsActiveFilter(undefined)
                } else {
                  setIsActiveFilter(value === "true")
                }
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hamısı</SelectItem>
                <SelectItem value="true">Aktiv</SelectItem>
                <SelectItem value="false">Passiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            İstifadəçi Siyahısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Fin Kod</TableHead>
                  <TableHead>Ad</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Vəzifə</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      İstifadəçi tapılmadı
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell className="font-mono text-sm">{user.finCode}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {user.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.position || '-'}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadge(user.role || 'İstifadəçi')} text-white`}>
                          {user.role || 'İstifadəçi'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(user.status || 'Aktiv')} text-white`}>
                          {user.status || 'Aktiv'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleToggleStatus(user.id, user.status || 'Aktiv')}
                          >
                            {user.status === 'Aktiv' ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          refetch()
        }}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <CreateUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null)
            refetch()
          }}
          editingUser={editingUser}
        />
      )}
    </div>
  )
}
