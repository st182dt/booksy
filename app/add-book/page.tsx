"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ArrowLeft, BookOpen, X } from "lucide-react"
import Image from "next/image"

interface ImageFile {
  file: File
  preview: string
  id: string
}

export default function AddBookPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [animatingImages, setAnimatingImages] = useState<Set<string>>(new Set())
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [defaultSellerProfile, setDefaultSellerProfile] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setIsAuthenticated(true)
        // Set default seller profile if available
        if (userData.lastUsedSellerProfile) {
          setDefaultSellerProfile(userData.lastUsedSellerProfile)
        }
      } else {
        router.push("/")
      }
    } catch (error) {
      router.push("/")
    } finally {
      setIsPageLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: ImageFile = {
          file,
          preview: e.target?.result as string,
          id: Math.random().toString(36).substr(2, 9),
        }
        setImageFiles((prev) => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the parent click handler
    setImageFiles((prev) => prev.filter((img) => img.id !== id))
    if (selectedImageId === id) {
      setSelectedImageId(null)
    }
  }

  const handleImageClick = (clickedImageId: string) => {
    if (selectedImageId === null) {
      // First click - select the image
      setSelectedImageId(clickedImageId)
    } else if (selectedImageId === clickedImageId) {
      // Clicking the same image - deselect
      setSelectedImageId(null)
    } else {
      // Second click - swap the images
      swapImages(selectedImageId, clickedImageId)
      setSelectedImageId(null)
    }
  }

  const swapImages = (firstImageId: string, secondImageId: string) => {
    const firstIndex = imageFiles.findIndex((img) => img.id === firstImageId)
    const secondIndex = imageFiles.findIndex((img) => img.id === secondImageId)

    if (firstIndex !== -1 && secondIndex !== -1) {
      // Add both images to animating set for the pop animation
      setAnimatingImages(new Set([firstImageId, secondImageId]))

      // Perform the swap immediately
      const newImages = [...imageFiles]
      const temp = newImages[firstIndex]
      newImages[firstIndex] = newImages[secondIndex]
      newImages[secondIndex] = temp
      setImageFiles(newImages)

      // Remove from animating set after pop animation completes
      setTimeout(() => {
        setAnimatingImages(new Set())
      }, 300)
    }
  }

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (selectedImageId && !target.closest(".photo-card")) {
        setSelectedImageId(null)
      }
    }

    if (selectedImageId) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selectedImageId])

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) throw new Error("No images selected")

    const uploadPromises = imageFiles.map(async (imageFile) => {
      const formData = new FormData()
      formData.append("image", imageFile.file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      return data.url
    })

    return Promise.all(uploadPromises)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const sellerProfile = formData.get("sellerProfile") as string

      // Upload images
      const imageUrls = await uploadImages()

      const bookData = {
        title: formData.get("title") as string,
        condition: formData.get("condition") as string,
        price: Number.parseFloat(formData.get("price") as string),
        description: formData.get("description") as string,
        sellerProfile: sellerProfile,
        imageUrl: imageUrls,
      }

      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      })

      if (response.ok) {
        // Update user's last used seller profile
        await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastUsedSellerProfile: sellerProfile }),
        })

        router.push("/my-listings")
      }
    } catch (error) {
      console.error("Error adding book:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto text-purple-600 mb-4" />
          <h1 className="text-3xl font-bold gradient-text mb-2">Add New Book</h1>
          <p className="text-gray-600">Share your textbook with other students</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-gray-200"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-gray-700 font-medium">
              Book Title *
            </Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Enter the book title"
              className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="condition" className="text-gray-700 font-medium">
                Condition *
              </Label>
              <Select name="condition" required>
                <SelectTrigger className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price" className="text-gray-700 font-medium">
                Price ($) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-700 font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Describe the book's condition, edition, any highlights, etc."
              className="mt-1 min-h-[100px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <Label htmlFor="sellerProfile" className="text-gray-700 font-medium">
              Your Social Media Profile *
            </Label>
            <Input
              id="sellerProfile"
              name="sellerProfile"
              type="url"
              required
              defaultValue={defaultSellerProfile}
              placeholder="https://facebook.com/yourprofile or https://instagram.com/yourprofile"
              className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <Label htmlFor="images" className="text-gray-700 font-medium">
              Book Photos * (Click to select and reorder - first photo will be the main one)
            </Label>
            <div className="mt-1 space-y-4">
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Upload Area */}
              <Label
                htmlFor="images"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload book photos</span>
                  <span className="text-xs text-gray-500 mt-1">You can select multiple images</span>
                </div>
              </Label>

              {/* Image Preview Grid */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {imageFiles.map((image, index) => {
                      const isSelected = selectedImageId === image.id
                      const isAnimating = animatingImages.has(image.id)
                      const isHovered = hoveredImageId === image.id
                      const isFirstPhoto = index === 0

                      return (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{
                            opacity: 1,
                            scale: isAnimating ? [1, 0.9, 1] : 1,
                          }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            scale: { duration: 0.25, ease: "easeOut" },
                            opacity: { duration: 0.2 },
                          }}
                          className={`
                            relative photo-card rounded-lg overflow-hidden cursor-pointer
                            transition-all duration-200 ease-out
                            ${
                              isSelected
                                ? "ring-4 ring-purple-500 ring-offset-2 shadow-lg"
                                : isHovered
                                  ? "ring-2 ring-purple-300 ring-offset-1 shadow-md"
                                  : "ring-1 ring-gray-200 hover:ring-2 hover:ring-purple-200 hover:shadow-sm"
                            }
                          `}
                          onClick={() => handleImageClick(image.id)}
                          onMouseEnter={() => setHoveredImageId(image.id)}
                          onMouseLeave={() => setHoveredImageId(null)}
                        >
                          <div className="aspect-[3/4] relative">
                            <Image
                              src={image.preview || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              fill
                              className={`
                                object-cover pointer-events-none transition-all duration-200
                                ${isHovered && !isSelected ? "brightness-105" : ""}
                                ${isSelected ? "brightness-110" : ""}
                              `}
                            />

                            {/* Main Photo Badge */}
                            {isFirstPhoto && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute top-2 left-2"
                              >
                                <Badge className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 shadow-lg">
                                  Main
                                </Badge>
                              </motion.div>
                            )}

                            {/* Delete Button */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute top-2 right-2 z-10"
                            >
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7 shadow-lg hover:scale-110 transition-transform"
                                onClick={(e) => removeImage(image.id, e)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </motion.div>

                            {/* Selection Indicator */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-purple-500/10 flex items-center justify-center"
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                                  className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg"
                                >
                                  ✓
                                </motion.div>
                              </motion.div>
                            )}

                            {/* Hover Overlay */}
                            {isHovered && !isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-purple-500/5"
                              />
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* Instructions */}
              {selectedImageId && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-700 font-medium">
                      📸 Photo selected! Click another photo to swap positions, or click the same photo to cancel.
                    </p>
                  </div>
                </motion.div>
              )}

              {imageFiles.length > 1 && !selectedImageId && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      💡 Tip: Click any photo to select it, then click another to reorder them. The first photo will be
                      your main image.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || imageFiles.length === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold"
          >
            {isLoading ? "Adding Book..." : "Add Book to Marketplace"}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
