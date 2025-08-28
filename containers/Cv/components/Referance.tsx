"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { Trash2, Plus } from "lucide-react"

export default function Referance() {
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
                <h2 className="text-lg font-bold">Referanslar</h2>
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
                            <h3 className="text-sm font-medium pb-2">
                              Adı Soyadı 
                            </h3>
                            <h3 className="text-sm font-medium pb-2">
                              Əlaqə nömrəsi
                            </h3>
                            <div className="flex items-center justify-between pb-2"><h3 className="text-sm font-medium pb-2">
                            Kim? 
                            </h3>
                                <Button variant="default" style={{ width: "20px", height: "20px" }}>
                                    <Plus />
                                </Button></div>

                            
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <Input placeholder="Adı Soyadı" type="text" />
                            <Input placeholder="Əlaqə nömrəsi" type="text" />
                            <Dropdown
                                options={[
                                    { value: "option1", label: "Option 1" },
                                    { value: "option2", label: "Option 2" },
                                ]}
                                placeholder="Kim?"
                            />

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

