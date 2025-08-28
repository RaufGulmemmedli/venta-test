"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"

export function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()

  const changeLanguage = (locale: string) => {
    const segments = pathname.split("/")
    segments[1] = locale
    router.push(segments.join("/"))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("az")}>Azərbaycan</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("ru")}>Russian</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
