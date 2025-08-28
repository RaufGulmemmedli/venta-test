import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
  <aside className="hidden w-64 overflow-y-auto border-r md:block bg-[#ffe8f3]">
        <AdminSidebar />
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
