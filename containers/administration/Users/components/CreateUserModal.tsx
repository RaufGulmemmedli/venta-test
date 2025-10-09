"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "lucide-react"
import { useCreateUser, useUpdateUser } from "@/lib/hooks/useUser"
import { CreateUserRequest, UpdateUserRequest, User as UserType } from "@/lib/services/userServices"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingUser?: UserType | null
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingUser
}) => {
  const [formData, setFormData] = useState<Partial<CreateUserRequest>>({
    name: "",
    finCode: "",
    serialNumber: "",
    phoneNumber: "",
    internalNumber: "",
    email: "",
    password: ""
  })

  const [additionalData, setAdditionalData] = useState({
    role: "İstifadəçi",
    status: "Aktiv",
    company: "VENTA",
    position: "",
    structureCode: "",
    desk: "",
    image: null as File | null
  })

  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        finCode: editingUser.finCode,
        serialNumber: editingUser.serialNumber,
        phoneNumber: editingUser.phoneNumber,
        internalNumber: editingUser.internalNumber,
        email: editingUser.email,
        password: ""
      })
      setAdditionalData({
        role: editingUser.role || "İstifadəçi",
        status: editingUser.status || "Aktiv",
        company: editingUser.company || "VENTA",
        position: editingUser.position || "",
        structureCode: editingUser.structureCode || "",
        desk: editingUser.desk || "",
        image: null
      })
    } else {
      // Reset form when creating new user
      setFormData({
        name: "",
        finCode: "",
        serialNumber: "",
        phoneNumber: "",
        internalNumber: "",
        email: "",
        password: ""
      })
      setAdditionalData({
        role: "İstifadəçi",
        status: "Aktiv",
        company: "VENTA",
        position: "",
        structureCode: "",
        desk: "",
        image: null
      })
    }
  }, [editingUser, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.finCode || !formData.email || !formData.phoneNumber || !formData.serialNumber || !formData.internalNumber) {
      alert("Fin kod, Ad, E-mail, Telefon, Seriya nömrəsi və Daxili nömrə doldurulmalıdır!")
      return
    }

    // For new users, password is required
    if (!editingUser && !formData.password) {
      alert("Yeni istifadəçi üçün şifrə tələb olunur!")
      return
    }

    try {
      if (editingUser) {
        // Update existing user
        const updateData: UpdateUserRequest = {
          id: editingUser.id,
          name: formData.name!,
          finCode: formData.finCode!,
          serialNumber: formData.serialNumber!,
          phoneNumber: formData.phoneNumber!,
          internalNumber: formData.internalNumber!,
          email: formData.email!,
          role: additionalData.role,
          status: additionalData.status,
          company: additionalData.company,
          position: additionalData.position,
          structureCode: additionalData.structureCode,
          desk: additionalData.desk
        }

        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password
        }

        await updateUserMutation.mutateAsync(updateData)
      } else {
        // Create new user
        const createData: CreateUserRequest = {
          name: formData.name!,
          finCode: formData.finCode!,
          serialNumber: formData.serialNumber!,
          phoneNumber: formData.phoneNumber!,
          internalNumber: formData.internalNumber!,
          email: formData.email!,
          password: formData.password!
        }

        await createUserMutation.mutateAsync(createData)
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAdditionalDataChange = (field: string, value: string) => {
    setAdditionalData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAdditionalData(prev => ({ ...prev, image: file }))
  }

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-red-600" />
            {editingUser ? 'İstifadəçini Redaktə Et' : 'Yeni İstifadəçi Yarat'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Fin Kod */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Fin kod<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Fin Kod"
                value={formData.finCode || ""}
                onChange={(e) => handleInputChange('finCode', e.target.value)}
                className="border-gray-300"
                required
              />
            </div>

            {/* Seriya Nömrəsi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Seriya nömrəsi<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Seriya nömrəsi"
                value={formData.serialNumber || ""}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                className="border-gray-300"
                required
              />
            </div>

            {/* Ad */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ad<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Ad"
                value={formData.name || ""}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="border-gray-300"
                required
              />
            </div>

            {/* Telefon */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Telefon<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Telefon"
                value={formData.phoneNumber || ""}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="border-gray-300"
                required
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
                value={formData.email || ""}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-gray-300"
                required
              />
            </div>

            {/* Daxili Nömrə */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Daxili nömrə<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Daxili nömrə"
                value={formData.internalNumber || ""}
                onChange={(e) => handleInputChange('internalNumber', e.target.value)}
                className="border-gray-300"
                required
              />
            </div>

            {/* Şifrə */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Şifrə{!editingUser && <span className="text-red-600">*</span>}
              </label>
              <Input
                type="password"
                placeholder={editingUser ? "Yeni şifrə (boş buraxılsın)" : "Şifrə"}
                value={formData.password || ""}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="border-gray-300"
                required={!editingUser}
              />
            </div>

            {/* Vəzifə */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Vəzifə</label>
              <Input
                placeholder="Vəzifə"
                value={additionalData.position}
                onChange={(e) => handleAdditionalDataChange('position', e.target.value)}
                className="border-gray-300"
              />
            </div>

            {/* Şirkət */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Şirkət</label>
              <Select
                value={additionalData.company}
                onValueChange={(value) => handleAdditionalDataChange('company', value)}
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

            {/* Struktur */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Struktur</label>
              <Input
                placeholder="Struktur"
                value={additionalData.structureCode}
                onChange={(e) => handleAdditionalDataChange('structureCode', e.target.value)}
                className="border-gray-300"
              />
            </div>

            {/* Masa */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Masa</label>
              <Input
                placeholder="Masa"
                value={additionalData.desk}
                onChange={(e) => handleAdditionalDataChange('desk', e.target.value)}
                className="border-gray-300"
              />
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Rol</label>
              <Select
                value={additionalData.role}
                onValueChange={(value) => handleAdditionalDataChange('role', value)}
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
                value={additionalData.status}
                onValueChange={(value) => handleAdditionalDataChange('status', value)}
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
                onChange={handleFileChange}
                className="border-gray-300"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              İmtina
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isLoading ? 'Yadda saxlanılır...' : 'Yadda saxla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
