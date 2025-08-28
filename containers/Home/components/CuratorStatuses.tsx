"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

interface Users {
    id: number
    name: string
    status: "active" | "inactive"
}

export default function FinSearch() {
    const [user, setUser] = useState<Users[]>([
        {
            id: 1,
            name: "User 1",
            status: "active",
        },
        {
            id: 2,
            name: "User 2",
            status: "inactive",
        },
        {
            id: 3,
            name: "User 3",
            status: "active",
        },
        {
            id: 4,
            name: "User 4",
            status: "inactive",
        },
        {
            id: 5,
            name: "User 5",
            status: "active",
        },
        {
            id: 6,
            name: "User 6",
            status: "inactive",
        },
        {
            id: 7,
            name: "User 7",
            status: "active",
        },
        {
            id: 8,
            name: "User 8",
            status: "inactive",
        },
    ])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold mb-4">Kurator statusları</h2>
                <div className="grid grid-cols-4 gap-4">
                    {user.map((u) => (
                        <div key={u.id} className="border p-4 rounded-md">
                            <div className="flex items-center space-x-2 mb-2 justify-between">
                                <h3 className="text-sm font-medium">{u.name}</h3>
                                <input type="checkbox" className="h-4 w-4" />
                            </div>
                            <div className="flex space-x-2">
                                <Input type="number" placeholder="Otaq" className="w-full" />
                                <Input type="number" placeholder="Masa" className="w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}