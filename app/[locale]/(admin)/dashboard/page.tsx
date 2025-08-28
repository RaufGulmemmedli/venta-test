"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function DashboardPage() {
  const t = useTranslations("dashboard")

  const stats = [
    {
      title: t("totalUsers"),
      value: "2,543",
      change: "+12.5%",
      trend: "up",
      icon: Users,
    },
    {
      title: t("totalBlogs"),
      value: "1,234",
      change: "+8.2%",
      trend: "up",
      icon: FileText,
    },
    {
      title: t("revenue"),
      value: "$45,231",
      change: "+23.1%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: t("growth"),
      value: "12.5%",
      change: "-2.4%",
      trend: "down",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")} {"Admin "}</h1>
        <p className="text-muted-foreground">Dashboard</p>
      </div> 

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions performed in your admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New user registered", time: "2 minutes ago", type: "user" },
                { action: "Blog post published", time: "5 minutes ago", type: "blog" },
                { action: "Customer updated", time: "10 minutes ago", type: "customer" },
                { action: "Settings modified", time: "15 minutes ago", type: "settings" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Add New Customer</div>
              <div className="text-sm text-muted-foreground">Create a new customer profile</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Create Blog Post</div>
              <div className="text-sm text-muted-foreground">Write and publish a new blog</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Assign User Role</div>
              <div className="text-sm text-muted-foreground">Manage user permissions</div>
            </button>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
