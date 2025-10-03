"use client"

import { useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function FinSearch() {
    const [selectedOption, setSelectedOption] = useState<string | null>(null)

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <div >
                    <h3 className="text-lg font-semibold mb-2">Milliyət</h3>
                    <Select onValueChange={(value) => setSelectedOption(value)}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="azerbaijan"  className="cursor-pointer">Azərbaycan</SelectItem>
                            <SelectItem value="foreign" className="cursor-pointer">Xarici vətəndaş</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {selectedOption && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Fin Kod və ya sənəd nömrəsi daxil edin</h3>
                        <Input
                            placeholder={
                                selectedOption === "azerbaijan"
                                    ? "Fin Kod"
                                    : "Xarici pasport nömrəsi"
                            }
                            style={{width:"380px"}}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}