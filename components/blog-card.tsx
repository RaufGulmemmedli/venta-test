"use client"

import { useTranslations } from "next-intl"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import Image from "next/image"

interface Blog {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  status: "published" | "draft"
  image: string
}

interface BlogCardProps {
  blog: Blog
  onEdit: (blog: Blog) => void
  onDelete: (blog: Blog) => void
  viewMode: "grid" | "list"
}

export function BlogCard({ blog, onEdit, onDelete, viewMode }: BlogCardProps) {
  const t = useTranslations("blogs")
  const tCommon = useTranslations("common")

  if (viewMode === "list") {
    return (
      <Card className="flex flex-row">
        <div className="w-48 relative">
          <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover rounded-l-lg" />
        </div>
        <div className="flex-1">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="line-clamp-1">{blog.title}</CardTitle>
                <CardDescription className="line-clamp-2">{blog.excerpt}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(blog)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {tCommon("edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(blog)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {tCommon("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>By {blog.author}</span>
              <span>•</span>
              <span>{blog.publishedAt}</span>
            </div>
            <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
          </CardFooter>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(blog)}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(blog)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
        </div>
        <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
        <CardDescription className="line-clamp-3">{blog.excerpt}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <div>By {blog.author}</div>
          <div>{blog.publishedAt}</div>
        </div>
        <Button variant="outline" size="sm">
          {t("readMore")}
        </Button>
      </CardFooter>
    </Card>
  )
}
