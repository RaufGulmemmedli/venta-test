"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { Trash2, Plus, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function WorkExperience() {
    const [rows, setRows] = useState([
        { id: 1, position: "", company: "", startDate: "", endDate: "" },
    ])

    const addRow = () => {
        setRows([...rows, { id: rows.length + 1, position: "", company: "", startDate: "", endDate: "" }])
    }

    const removeRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id))
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">İş Təcrübəsi</h2>
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
                        <div className="space-y-6 p-6">
                            <div>
                                <div className="grid grid-cols-4 gap-4">
                                    <h3 className="text-sm font-medium pb-2">
                                        Şirkət adı
                                    </h3>
                                    <h3 className="text-sm font-medium pb-2">
                                        Vəzifəsi
                                    </h3>

                                    <h3 className="text-sm font-medium pb-2">
                                        Başlama tarixi
                                    </h3>
                                    <h3 className="text-sm font-medium pb-2">
                                        Bitmə tarixi
                                    </h3>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <Input placeholder="Şirkət adı" type="text" />
                                    <Dropdown
                                        options={[
                                            { value: "option1", label: "Option 1" },
                                            { value: "option2", label: "Option 2" },
                                        ]}
                                        placeholder="Vəzifə seçin"
                                    />
                                    <Input placeholder="Başlama tarixi" type="date" />
                                    <Input placeholder="Bitmə tarixi" type="date" />

                                </div> </div>
                            <div>
                                <div className="grid grid-cols-4 gap-4">
                                    <h3 className="text-sm font-medium pb-2">
                                        İşdən çıxma səbəbi
                                    </h3>

                                    <h3 className="text-sm font-medium pb-2">
                                        Hal hazırda işləyir

                                    </h3>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <Dropdown
                                        options={[
                                            { value: "option1", label: "Option 1" },
                                            { value: "option2", label: "Option 2" },
                                        ]}
                                        placeholder="Hal-hazırda təhsil alır?"
                                    />
                                    <Checkbox style={{ width: "30px", height: "30px" }} />

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

