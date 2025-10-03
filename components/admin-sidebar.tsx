"use client"

import { useState, useMemo, Children } from "react"
import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  UserPlus,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Bell,
  Home,
  Briefcase,
  GraduationCap,
  Building2,
  Layers,
  Route,
  Activity,
  Building,
  Network,
  School,
  DoorOpen,
  Sliders,
  UserCog,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function AdminSidebar({ className }: SidebarProps) {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const menuItems = [
    {
      title: t("dashboard"),
      icon: (props: React.SVGProps<SVGSVGElement>) => <LayoutDashboard {...props} className="text-red-500" />,
      href: "/dashboard",
    },
    {
      title: t("homePage"),
      icon: (props: React.SVGProps<SVGSVGElement>) => <Home {...props} className="text-red-500" />,
      href: "/home-page",
    },
    {
      title: t("cvPage"),
      icon: (props: React.SVGProps<SVGSVGElement>) => <FileText {...props} className="text-red-500" />,
      href: "/cv",

    },
    {
      title: t("vacancyPage"),
      icon: (props: React.SVGProps<SVGSVGElement>) => <Briefcase {...props} className="text-red-500" />,
      href: "/vacancy",
    },
    {
      title: t("trainingPage"),
      icon: (props: React.SVGProps<SVGSVGElement>) => <GraduationCap {...props} className="text-red-500" />,
      href: "/training",
    },
    {
      title: "Administrator",
      icon: (props: React.SVGProps<SVGSVGElement>) => <UserCog {...props} className="text-red-500" />,
      href: "#",
      children: [
        {
          title: "İstifadəçilər",
          icon: (props: React.SVGProps<SVGSVGElement>) => <Users {...props} className="text-red-500" />,
          href: "/admin/users",
        },
      ]
    },
    {
      title: t("settings"),
      icon: (props: React.SVGProps<SVGSVGElement>) => <Settings {...props} className="text-red-500" />,
      href: "#",
      children: [
        {
          title: t("atribut"),
          icon: (props: React.SVGProps<SVGSVGElement>) => <Sliders {...props} className="text-red-500" />,
          href: "/settings/attribute",
        },
        {
          title: t("section"),
          icon: (props: React.SVGProps<SVGSVGElement>) => <Layers {...props} className="text-red-500" />,
          href: "/settings/section",
        },
        {
          title: t("step"),
          icon: (props: React.SVGProps<SVGSVGElement>) => <Route {...props} className="text-red-500" />,
          href: "/settings/step",
        },
        {
          title: t("activity"),
          icon: (props: React.SVGProps<SVGSVGElement>) => <Activity {...props} className="text-red-500" />,
          href: "/cv/activity",
        },{
          title: t("company"),
          icon: (props: React.SVGProps<SVGSVGElement>) => <Building2 {...props} className="text-red-500" />,
          href: "/cv/company",
        },
        {
          title: t("department"),
          icon: (props: React.SVGProps<SVGSVGElement>) => <Network {...props} className="text-red-500" />,
          href: "/cv/department",
        },{
          title: t("trainingRooms"),
          icon: (props: React.SVGProps<SVGSVGElement>) => <School {...props} className="text-red-500" />,
          href: "#",
          children: [
            {
              title: t("trainingFloors"),
              icon: (props: React.SVGProps<SVGSVGElement>) => <Building {...props} className="text-red-500" />,
              href: "/training/floor",
            },
            {
              title: t("trainingRooms"),
              icon: (props: React.SVGProps<SVGSVGElement>) => <DoorOpen {...props} className="text-red-500" />,
              href: "/training/room",
            },
            {
              title: t("trainingRoomParameters"),
              icon: (props: React.SVGProps<SVGSVGElement>) => <Sliders {...props} className="text-red-500" />,
              href: "/training/room-parameters",
            },
          ],
        }
      ]
    },

    // {
    //   title: t("blogs"),
    //   icon: FileText,
    //   href: "/blogs",
    // },
    // {
    //   title: t("assignUser"),
    //   icon: UserPlus,
    //   href: "/assign-user",
    // },
  ]

  const settingsItems = [
    // {
    //   title: t("profile"),
    //   icon: User,
    //   href: "/settings/profile",
    // },
    // {
    //   title: t("security"),
    //   icon: Shield,
    //   href: "/settings/security",
    // },
    {
      title: t("notifications"),
      icon: Bell,
      href: "/settings/notifications",
    },
  ]

  const handleLogout = () => {
    router.push("/login")
  }

  // helpers
  const isActive = (href: string) => {
    // Keep it simple: locale prefix may exist, so match by inclusion
    return pathname?.includes(href)
  }

  const isExactActive = (href: string) => {
    // Active for exact page (tolerate locale prefix)
    return pathname === href || pathname?.endsWith(href)
  }

  // Derive which groups should be open initially (e.g., CV when on any /cv/* path)
  const initialOpenByKey = useMemo(() => {
    const map = new Map<string, boolean>()
    menuItems.forEach((item) => {
      const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0
      if (hasChildren) map.set((item as any).href, isActive((item as any).href))
    })
    return map
  }, [pathname])

  // Track open state per group href (only a couple expected)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const getGroupOpen = (href: string) =>
    openGroups[href] ?? initialOpenByKey.get(href) ?? false

  const toggleGroup = (href: string, open: boolean) =>
    setOpenGroups((prev) => ({ ...prev, [href]: open }))

  return (
    <div className={cn("pb-12 w-64 ", className)} >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h1 className="mb-2 px-4 text-lg font-semibold tracking-tight text-red-600">VENTA Company</h1>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuNode key={item.href} item={item as any} level={0} />
            ))}

            {/* <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("settings")}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {settingsItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible> */}

            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


function MenuNode({ item, level }: { item: any; level: number }) {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => pathname?.includes(href)
  const isExactActive = (href: string) => pathname === href || pathname?.endsWith(href)

  const hasChildren = Array.isArray(item.children) && item.children.length > 0
  const groupKey = item.href

  const hasActiveDescendant = (node: any): boolean => {
    if (!Array.isArray(node.children)) return false
    return node.children.some((c: any) => {
      if (c.href && isActive(c.href)) return true
      return hasActiveDescendant(c)
    })
  }

  const openByUrl = hasChildren && (isActive(groupKey) || hasActiveDescendant(item))
  const [open, setOpen] = useState(openByUrl)

  if (!hasChildren) {
    return (
      <Button
        key={item.href}
        variant={isExactActive(item.href) ? "secondary" : "ghost"}
        className="w-full justify-start text-base"
        style={{ fontSize: '16px' }}
        onClick={() => router.push(item.href)}
      >
        <item.icon className="mr-2 h-5 w-5" />
        {item.title}
      </Button>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant={open || isActive(groupKey) ? "secondary" : "ghost"} 
          className="w-full justify-start text-base"
          style={{ fontSize: '16px' }}
        >
          <item.icon className="mr-2 h-5 w-5" />
          {item.title}
          <ChevronDown className="ml-auto h-5 w-5 transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        {item.children.map((child: any) => (
          <div key={child.href} className="pl-6">
            <MenuNode item={child} level={level + 1} />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
