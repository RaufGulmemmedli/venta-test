"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { Plus, PlusCircle } from "lucide-react"

export default function MilitaryService() {
    return (
        <div>
            <h2 className="text-lg font-bold">Hərbi xidmət</h2>
            <div className="space-y-6 p-6">
                {/* 1. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4">
                        <h3 className="text-sm font-medium">Hərbi mükəlləfiyyətdə  <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Rütbə</h3>
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-sm font-medium">Olmayıbsa səbəbi</h3>
                            <Button variant="default" style={{ width: "20px", height: "20px" }}>
                                <Plus />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Dropdown
                            options={[
                                { value: "option1", label: "Option 1" },
                                { value: "option2", label: "Option 2" },
                            ]}
                            placeholder="Məhkumluq seçin"
                        />
                        <Dropdown
                            options={[
                                { value: "option1", label: "Option 1" },
                                { value: "option2", label: "Option 2" },
                            ]}
                            placeholder="Rütbə seçin"
                        />
                        <Input placeholder="Olmayıbsa səbəbi" type="text" />
                    </div>
                </div>
            </div>
        </div>
    )
}
