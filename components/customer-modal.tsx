"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Customer {
  id: string
  name: string
  email: string
  status: boolean
  createdAt: string
}

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (customer: Omit<Customer, "id">) => void
  customer?: Customer | null
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const t = useTranslations("homePage")
  const tCommon = useTranslations("common")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: true,
    createdAt: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        status: customer.status,
        createdAt: customer.createdAt,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        status: true,
        createdAt: new Date().toISOString().split("T")[0],
      })
    }
  }, [customer, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? t("editCustomer") : t("addCustomer")}</DialogTitle>
          <DialogDescription>
            {customer ? "Make changes to the customer information here." : "Add a new customer to your database."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t("name")}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t("status")}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
                />
                <Label htmlFor="status">{formData.status ? "Active" : "Inactive"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit">{tCommon("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
