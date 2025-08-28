"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table"

interface Data {
    id: number
    Fin: string
    FullName: string
    DbCv: string
    ReceivingCurator: string
    Button: string
}

interface Column {
    key: string
    label: string
    sortable?: boolean
}

export default function Applicants() {
    const [data, setData] = useState<Data[]>([
        {
            id: 1,
            Fin: "ABC123",
            FullName: "John Doe",
            DbCv: "CV1.pdf",
            ReceivingCurator: "Curator 1",
            Button: "Edit",
        },
        {
            id: 2,
            Fin: "DEF456",
            FullName: "Jane Smith",
            DbCv: "CV2.pdf",
            ReceivingCurator: "Curator 2",
            Button: "Edit",
        },
        {
            id: 3,
            Fin: "GHI789",
            FullName: "Alice Johnson",
            DbCv: "CV3.pdf",
            ReceivingCurator: "Curator 3",
            Button: "Edit",
        },
        {
            id: 4,
            Fin: "JKL012",
            FullName: "Bob Brown",
            DbCv: "CV4.pdf",
            ReceivingCurator: "Curator 4",
            Button: "Edit",
        },
    ])

    const columns: Column[] = [
        {
            key: "Fin",
            label: "Fin kod",
        },
        {
            key: "FullName",
            label: "Ad soyad",
        },
        {
            key: "DbCv",
            label: "Bazadaki Cv-i",
        },
        {
            key: "ReceivingCurator",
            label: "Qəbul edən kurator",
        },
        {
            key: "Button",
            label: "Düymə",
        },
    ]

    return (
        <div>
            <h2 className="text-lg font-bold mb-4">Mənə müraciət edənlər</h2>
            <DataTable columns={columns} data={data} />
        </div>
    )
}