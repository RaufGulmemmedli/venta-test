"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { Plus, PlusCircle } from "lucide-react"

export default function CommunicationTools() {
    return (
        <div>
            <h2 className="text-lg font-bold">Əlaqə vasitələri</h2>
            <div className="space-y-6 p-6">
                {/* 1. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4">
                        <h3 className="text-sm font-medium">Mobil   <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Whatsapp</h3>
                        <h3 className="text-sm font-medium">E-poçt</h3>
                        <h3 className="text-sm font-medium">Şəhər nömrəsi</h3>
                       
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Input placeholder="Mobil" type="text" />
                        <Input placeholder="Whatsapp" type="text" />
                        <Input placeholder="E-poçt" type="text" />
                        <Input placeholder="Şəhər nömrəsi" type="text" />
                    </div>
                </div>
                <div>
                    <div className="grid grid-cols-4 gap-4">
                        <h3 className="text-sm font-medium">Mobil 2   <span className="text-red-500">*</span></h3>
                      
                       
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                       <Input placeholder="Mobil 2" type="text" />
                    </div>
                </div>
            </div>
        </div>
    )
}
