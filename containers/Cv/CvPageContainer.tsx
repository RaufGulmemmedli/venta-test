"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import FinSearch from "./components/FinSearch"

export default function CvPageContainer() {
    const t = useTranslations("cvPage")
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">Manage your customer database and user accounts.</p>
                </div>
                <Button onClick={() => router.push("/cv-create")}>
                    <Plus className="mr-2 h-4 w-4" /> Yarat
                </Button>
            </div>
            <FinSearch />
        </div>
    )
}
