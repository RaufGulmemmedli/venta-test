"use client"
import React, { useState } from "react"
import { useTranslations } from "next-intl"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/Dropdown"
import { useRouter } from "next/navigation"

export const CvTitleCreatePage: React.FC = () => {
  const t = useTranslations("section")
  const tc = useTranslations("common")
  const [inputValue, setInputValue] = useState("")
  const [dropdownValue, setDropdownValue] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.back()
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col flex-1">
            <label className="mb-1 text-sm font-medium text-black" htmlFor="cv-title">{t("form.titleLabel")}</label>
            <Input
              id="cv-title"
              placeholder={t("form.titlePlaceholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
              style={{ backgroundColor: "white" }}
              required
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="mb-1 text-sm font-medium text-black" htmlFor="cv-type">{t("form.typeLabel")}</label>
            <Dropdown
              value={dropdownValue}
              onChange={setDropdownValue}
              options={[
                { value: "op  tion1", label: "Cv" },
                { value: "option2", label: "Vakansiya" },
              ]}
              placeholder={tc("selectPlaceholder")}
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="mb-1 text-sm font-medium text-black" htmlFor="cv-type">{t("form.stepLabel")}</label>
            <Dropdown
              
              options={[
                { value: "option1", label: "Step1" },
                { value: "option2", label: "Step2" },
                { value: "option3", label: "Step3" },
              ]}
              placeholder={tc("selectPlaceholder")}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="bg-blue-500 text-white"
          >
            {tc("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={!inputValue || !dropdownValue}
            className="bg-green-600 hover:bg-green-700 text-white"
            style={{ backgroundColor: "#5BE244" }}
          >
            {tc("save")}
          </Button>
        </div>
      </form>
    </div>
  )
}
