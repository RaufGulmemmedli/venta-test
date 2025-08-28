"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image";
import VentaImage from "@/public/ventaImg.png";

export default function LoginPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fin: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fin) {
      newErrors.fin = t("finRequired")
    } else if (!/\S+@\S+\.\S+/.test(formData.fin)) {
      newErrors.fin = t("invalidFin")
    }

    // if (!formData.password) {
    //   newErrors.password = t("passwordRequired")
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: t("loginSuccess"),
        description: "Welcome to the admin panel",
      })
      router.push("/dashboard")
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Image src={VentaImage} alt="Venta Logo" className="h-16 w-28" />
        </div>
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{t("login")}</CardTitle>
            <CardDescription>{t("text")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="Fin">Fin</Label>
                <Input
                  id="fin"
                  type="fin"
                  placeholder="A1B2C3D"
                  value={formData.fin}
                  onChange={(e) => handleInputChange("fin", e.target.value)}
                  className={errors.fin ? "border-red-500" : ""}
                />
                {errors.fin && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.fin}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.password}</AlertDescription>
                  </Alert>
                )}
              </div> */}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white hover:opacity-80"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : t("loginButton")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
