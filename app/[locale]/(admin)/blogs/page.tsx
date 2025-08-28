"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { BlogCard } from "@/components/blog-card"
import { BlogModal } from "@/components/blog-modal"
import { Plus, Grid, List } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function BlogsPage() {
  const t = useTranslations("blogs")
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: "1",
      title: "Getting Started with Next.js",
      excerpt: "Learn how to build modern web applications with Next.js and React.",
      content: "Full content here...",
      author: "John Doe",
      publishedAt: "2024-01-15",
      status: "published",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "2",
      title: "Advanced TypeScript Patterns",
      excerpt: "Explore advanced TypeScript patterns for better code organization.",
      content: "Full content here...",
      author: "Jane Smith",
      publishedAt: "2024-01-14",
      status: "draft",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "3",
      title: "Building Responsive UIs",
      excerpt: "Create beautiful and responsive user interfaces with Tailwind CSS.",
      content: "Full content here...",
      author: "Bob Johnson",
      publishedAt: "2024-01-13",
      status: "published",
      image: "/placeholder.svg?height=200&width=400",
    },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog)
    setIsModalOpen(true)
  }

  const handleDelete = (blog: Blog) => {
    setBlogs(blogs.filter((b) => b.id !== blog.id))
    toast({
      title: "Blog deleted",
      description: `"${blog.title}" has been removed.`,
    })
  }

  const handleSave = (blogData: Omit<Blog, "id">) => {
    if (editingBlog) {
      setBlogs(blogs.map((b) => (b.id === editingBlog.id ? { ...blogData, id: editingBlog.id } : b)))
      toast({
        title: "Blog updated",
        description: "Blog post has been updated successfully.",
      })
    } else {
      const newBlog = {
        ...blogData,
        id: Date.now().toString(),
      }
      setBlogs([...blogs, newBlog])
      toast({
        title: "Blog created",
        description: "New blog post has been created successfully.",
      })
    }
    setIsModalOpen(false)
    setEditingBlog(null)
  }

  const handleAddNew = () => {
    setEditingBlog(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">Create and manage your blog posts and articles.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addBlog")}
          </Button>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} onEdit={handleEdit} onDelete={handleDelete} viewMode={viewMode} />
        ))}
      </div>

      <BlogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBlog(null)
        }}
        onSave={handleSave}
        blog={editingBlog}
      />
    </div>
  )
}
