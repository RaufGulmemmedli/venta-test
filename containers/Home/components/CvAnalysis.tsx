"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { useState } from "react"

export default function CvAnalysis() {
    const [data, setData] = useState(null)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold mb-4">Cv Analizi və exportu</h2>
                <Button variant="orange">Bütün CVlər Excell</Button>
            </div>
            <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4">
                    <h3 className="text-sm font-medium">Fin Kod</h3>
                    <h3 className="text-sm font-medium">Ad</h3>
                    <h3 className="text-sm font-medium">Soyad</h3>
                    <h3 className="text-sm font-medium">Status</h3>
                </div>
                {/* Inputs and Dropdown */}
                <div className="grid grid-cols-4 gap-4">
                    <Input placeholder="Fin Kod" />
                    <Input placeholder="Ad" />
                    <Input placeholder="Soyad" />
                    <Dropdown
                        options={[
                            { value: "active", label: "Aktiv" },
                            { value: "inactive", label: "Passiv" },
                            { value: "both", label: "Hər ikisi" },
                        ]}
                        placeholder="Status seçin"
                    />
                </div>
            </div>
        </div>
    )
}