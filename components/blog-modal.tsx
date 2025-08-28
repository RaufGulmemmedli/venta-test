"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface BlogModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (blog: Omit<Blog, "id">) => void
  blog?: Blog | null
}

export function BlogModal({ isOpen, onClose, onSave, blog }: BlogModalProps) {
  const t = useTranslations("blogs")
  const tCommon = useTranslations("common")
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    publishedAt: new Date().toISOString().split("T")[0],
    status: "draft" as const,
    image: "/placeholder.svg?height=200&width=400",
  })

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author,
        publishedAt: blog.publishedAt,
        status: blog.status,
        image: blog.image,
      })
    } else {
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "",
        publishedAt: new Date().toISOString().split("T")[0],
        status: "draft",
        image: "/placeholder.svg?height=200&width=400",
      })
    }
  }, [blog, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blog ? t("editBlog") : t("addBlog")}</DialogTitle>
          <DialogDescription>
            {blog ? "Make changes to the blog post here." : "Create a new blog post for your website."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author" className="text-right">
                Author
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="excerpt" className="text-right">
                Excerpt
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="col-span-3"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="col-span-3"
                rows={6}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "published" | "draft") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publishedAt" className="text-right">
                Published Date
              </Label>
              <Input
                id="publishedAt"
                type="date"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit">{tCommon("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
