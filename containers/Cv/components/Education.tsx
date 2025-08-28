"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { Trash2, Plus } from "lucide-react"

export default function Education() {
    const [rows, setRows] = useState([
        { id: 1, degree: "", institution: "", year: "" },
    ])

    const addRow = () => {
        setRows([...rows, { id: rows.length + 1, degree: "", institution: "", year: "" }])
    }

    const removeRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id))
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Təhsil</h2>
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
                        <div  className="space-y-6 p-6">
                            <div>
                            <div className="grid grid-cols-4 gap-4">
                                <h3 className="text-sm font-medium pb-2">
                                    Təhsil dərəcəsi  <span className="text-red-500">*</span>
                                </h3>
                                <div className="flex items-center justify-between pb-2"><h3 className="text-sm font-medium pb-2">
                                    Təhsil müəssisəsi adı<span className="text-red-500">*</span>
                                </h3>
                                    <Button variant="default" style={{ width: "20px", height: "20px" }}>
                                        <Plus />
                                    </Button></div>

                                <h3 className="text-sm font-medium pb-2">
                                    İxtisas
                                </h3>
                                <h3 className="text-sm font-medium pb-2">
                                    Təhsilin başladığı il <span className="text-red-500">*</span>
                                </h3>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <Dropdown
                                    options={[
                                        { value: "option1", label: "Option 1" },
                                        { value: "option2", label: "Option 2" },
                                    ]}
                                    placeholder="Təhsil dərəcəsi"
                                />
                                <Dropdown
                                    options={[
                                        { value: "option1", label: "Option 1" },
                                        { value: "option2", label: "Option 2" },
                                    ]}
                                    placeholder="  Təhsil müəssisəsi seçin"
                                />
                                <Input placeholder="İxtisas" type="text" />
                                <Input placeholder="Təhsilin başladığı il" type="date" />

                            </div> </div>
                            <div>
                            <div className="grid grid-cols-4 gap-4">
                                <h3 className="text-sm font-medium pb-2">
                                    Təhsilin bitdiyi il
                                </h3>

                                <h3 className="text-sm font-medium pb-2">
                                    Hal-hazırda təhsil alır? <span className="text-red-500">*</span>
                                </h3>
                            </div>
                           
                                <div className="grid grid-cols-4 gap-4">
                                    <Input placeholder="Təhsilin bitdiyi il" type="date" />
                                    <Dropdown
                                        options={[
                                            { value: "option1", label: "Option 1" },
                                            { value: "option2", label: "Option 2" },
                                        ]}
                                        placeholder="Hal-hazırda təhsil alır?"
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
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

