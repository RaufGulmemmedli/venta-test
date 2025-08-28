"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { Trash2, Plus } from "lucide-react"

export default function SocialMediaConnection() {
    const [rows, setRows] = useState([
        { id: 1, platform: "", username: "", url: "" },
    ])

    const addRow = () => {
        setRows([...rows, { id: rows.length + 1, platform: "", username: "", url: "" }])
    }

    const removeRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id))
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Sosial Media Əlaqələri</h2>
                <Button
                    style={{ backgroundColor: "#17a2b8" }}
                    onClick={addRow}
                >
                    <Plus />
                </Button>
            </div>
            <div className="space-y-6 p-6">
                {rows.map((row) => (
                    <div key={row.id}>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="flex items-center justify-between pb-2"><h3 className="text-sm font-medium pb-2">
                               Sosial media tipi    
                            </h3>
                                <Button variant="default" style={{ width: "20px", height: "20px" }}>
                                    <Plus />
                                </Button></div>

                            <h3 className="text-sm font-medium pb-2">
                             Sosial media keçid linki  
                            </h3>
                            
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <Dropdown
                                options={[
                                    { value: "option1", label: "Option 1" },
                                    { value: "option2", label: "Option 2" },
                                ]}
                                placeholder="Sosial media tipi seçin"
                            />
                            <Input placeholder="Sosial media keçid linki" type="text" />

                            <Button
                                variant="default"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    border: "1px solid red",
                                    backgroundColor: "white",
                                }}
                                onClick={() => removeRow(row.id)}
                            >
                                <Trash2 color="red" />
                            </Button>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

