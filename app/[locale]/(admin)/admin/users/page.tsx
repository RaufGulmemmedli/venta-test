"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash, Mail, Phone, Shield, User, UserCheck, UserX, Users } from "lucide-react"
import { toast } from "sonner"

interface UserData {
  id: number
  finKod: string
  ad: string
  seriyaNomresi: string
  telefon: string
  email: string
  vazife: string
  sifre: string
  sirket: string
  status: string
  strukturKod: string
  masa: string
  rol: string
  daxiliNomre: string
  sekil?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([
    {
      id: 1,
      finKod: "FIN001",
      ad: "Aygün Tağıyeva",
      seriyaNomresi: "AA1234567",
      telefon: "+994 50 123 45 67",
      email: "aygun.tagiyeva@venta.az",
      vazife: "HR Manager",
      sifre: "••••••••",
      sirket: "VENTA",
      status: "Aktiv",
      strukturKod: "HR-001",
      masa: "Masa 12",
      rol: "Admin",
      daxiliNomre: "101"
    }
  ])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newUser, setNewUser] = useState<Partial<UserData>>({
    status: "Aktiv",
    rol: "İstifadəçi"
  })

  const handleCreateUser = () => {
    if (!newUser.finKod || !newUser.ad || !newUser.email) {
      toast.error("Fin kod, Ad və E-mail doldurulmalıdır!")
      return
    }

    const user: UserData = {
      id: users.length + 1,
      finKod: newUser.finKod || "",
      ad: newUser.ad || "",
      seriyaNomresi: newUser.seriyaNomresi || "",
      telefon: newUser.telefon || "",
      email: newUser.email || "",
      vazife: newUser.vazife || "",
      sifre: newUser.sifre || "",
      sirket: newUser.sirket || "",
      status: newUser.status || "Aktiv",
      strukturKod: newUser.strukturKod || "",
      masa: newUser.masa || "",
      rol: newUser.rol || "İstifadəçi",
      daxiliNomre: newUser.daxiliNomre || ""
    }

    setUsers([...users, user])
    setNewUser({ status: "Aktiv", rol: "İstifadəçi" })
    setIsCreateModalOpen(false)
    toast.success("İstifadəçi uğurla yaradıldı!")
  }

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id))
    toast.success("İstifadəçi silindi!")
  }

  const filteredUsers = users.filter(user =>
    user.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.finKod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    return status === "Aktiv" ? "bg-green-600" : "bg-red-600"
  }

  const getRoleBadge = (rol: string) => {
    if (rol === "Admin") return "bg-purple-600"
    if (rol === "Moderator") return "bg-blue-600"
    return "bg-gray-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{users.length}</h3>
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
                  {users.filter(u => u.rol === "Admin").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İstifadəçi axtar (ad, fin kod, e-mail)..."
              className="pl-10"
            />
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
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      İstifadəçi tapılmadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell className="font-mono text-sm">{user.finKod}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.ad.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{user.ad}</span>
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
                          {user.telefon}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.vazife}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadge(user.rol)} text-white`}>
                          {user.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(user.status)} text-white`}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700">
                            <Edit className="h-3 w-3" />
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
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-red-600" />
              Yeni İstifadəçi Yarat
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Fin Kod */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Fin kod<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Fin Kod"
                value={newUser.finKod || ""}
                onChange={(e) => setNewUser({...newUser, finKod: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Seriya Nömrəsi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Seriya nömrəsi<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Seriya nömrəsi"
                value={newUser.seriyaNomresi || ""}
                onChange={(e) => setNewUser({...newUser, seriyaNomresi: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Ad */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ad<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Ad"
                value={newUser.ad || ""}
                onChange={(e) => setNewUser({...newUser, ad: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Telefon */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Telefon<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Telefon"
                value={newUser.telefon || ""}
                onChange={(e) => setNewUser({...newUser, telefon: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                E-mail<span className="text-red-600">*</span>
              </label>
              <Input
                type="email"
                placeholder="E-mail"
                value={newUser.email || ""}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Vəzifə */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Vəzifə</label>
              <Input
                placeholder="Vəzifə"
                value={newUser.vazife || ""}
                onChange={(e) => setNewUser({...newUser, vazife: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Şifrə */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Şifrə</label>
              <Input
                type="password"
                placeholder="Şifrə"
                value={newUser.sifre || ""}
                onChange={(e) => setNewUser({...newUser, sifre: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Şirkət */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Şirkət</label>
              <Select
                value={newUser.sirket || ""}
                onValueChange={(val) => setNewUser({...newUser, sirket: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VENTA">VENTA</SelectItem>
                  <SelectItem value="VENTA Group">VENTA Group</SelectItem>
                  <SelectItem value="VENTA Tech">VENTA Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bonus tipi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Struktur</label>
              <Input
                placeholder="Struktur"
                value={newUser.strukturKod || ""}
                onChange={(e) => setNewUser({...newUser, strukturKod: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Masa */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Masa</label>
              <Input
                placeholder="Masa"
                value={newUser.masa || ""}
                onChange={(e) => setNewUser({...newUser, masa: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Daxili Nömrə */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Daxili nömrə</label>
              <Input
                placeholder="Daxili nömrə"
                value={newUser.daxiliNomre || ""}
                onChange={(e) => setNewUser({...newUser, daxiliNomre: e.target.value})}
                className="border-gray-300"
              />
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Rol</label>
              <Select
                value={newUser.rol || ""}
                onValueChange={(val) => setNewUser({...newUser, rol: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                  <SelectItem value="İstifadəçi">İstifadəçi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={newUser.status || "Aktiv"}
                onValueChange={(val) => setNewUser({...newUser, status: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktiv">Aktiv</SelectItem>
                  <SelectItem value="Passiv">Passiv</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Şəkil */}
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-700">Şəkil</label>
              <Input
                type="file"
                accept="image/*"
                className="border-gray-300"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNewUser({ status: "Aktiv", rol: "İstifadəçi" })
                setIsCreateModalOpen(false)
              }}
            >
              İmtina
            </Button>
            <Button
              onClick={handleCreateUser}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              Yadda saxla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

