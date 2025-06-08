"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { Book } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink, Calendar, User, Edit, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react"

interface BookDetailModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
  onUpdate?: () => void
}

export default function BookDetailModal({ book, isOpen, onClose, currentUserId, onUpdate }: BookDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isImageFullscreen, setIsImageFullscreen] = useState(false)
  const [isImageHovered, setIsImageHovered] = useState(false)
  const [isArrowHovered, setIsArrowHovered] = useState(false)

  const isOwner = currentUserId === book.userId

  // Safely get images array
  const getImages = () => {
    if (!book.imageUrl) return ["/placeholder.svg?height=400&width=300"]

    if (Array.isArray(book.imageUrl)) {
      const validImages = book.imageUrl.filter((url) => url && url.trim() !== "")
      return validImages.length > 0 ? validImages : ["/placeholder.svg?height=400&width=300"]
    }

    return book.imageUrl.trim() !== "" ? [book.imageUrl] : ["/placeholder.svg?height=400&width=300"]
  }

  const images = getImages()
  const currentImage = imageError ? "/placeholder.svg?height=400&width=300" : images[currentImageIndex]

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "New":
        return "bg-green-500 text-white"
      case "Like New":
        return "bg-blue-500 text-white"
      case "Good":
        return "bg-yellow-500 text-white"
      case "Fair":
        return "bg-orange-500 text-white"
      case "Poor":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    setImageError(false)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    setImageError(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/books/${book._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate?.()
        onClose()
      }
    } catch (error) {
      console.error("Error deleting book:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-1 sm:p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[98vh] overflow-y-auto shadow-xl border border-gray-200 mx-2 sm:mx-4 md:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold gradient-text">Book Details</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="relative">
                  <div
                    className="relative h-72 sm:h-80 md:h-96 lg:h-[450px] xl:h-[550px] rounded-lg overflow-hidden group cursor-pointer"
                    onMouseEnter={() => setIsImageHovered(true)}
                    onMouseLeave={() => setIsImageHovered(false)}
                    onClick={() => setIsImageFullscreen(true)}
                  >
                    {currentImage && currentImage.trim() !== "" ? (
                      <>
                        <Image
                          src={currentImage || "/placeholder.svg"}
                          alt={book.title}
                          fill
                          className="object-cover"
                          onError={() => setImageError(true)}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                        />

                        {/* Magnifying Glass Icon - Only show when hovering image and NOT hovering arrows */}
                        <AnimatePresence>
                          {isImageHovered && !isArrowHovered && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none"
                            >
                              <div className="bg-white/90 rounded-full p-3 sm:p-4 md:p-5 shadow-lg">
                                <Search className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gray-700" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm sm:text-base">No image available</span>
                      </div>
                    )}

                    {/* Image Navigation */}
                    {images.length > 1 && (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute left-3 sm:left-4 md:left-5 top-1/2 transform -translate-y-1/2 z-10"
                          onMouseEnter={() => setIsArrowHovered(true)}
                          onMouseLeave={() => setIsArrowHovered(false)}
                        >
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              prevImage()
                            }}
                            className="bg-white hover:bg-gray-100 text-black shadow-lg border-0 h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full p-0 transition-all duration-200"
                          >
                            <ChevronLeft
                              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 font-bold"
                              strokeWidth={4}
                            />
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute right-3 sm:right-4 md:right-5 top-1/2 transform -translate-y-1/2 z-10"
                          onMouseEnter={() => setIsArrowHovered(true)}
                          onMouseLeave={() => setIsArrowHovered(false)}
                        >
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              nextImage()
                            }}
                            className="bg-white hover:bg-gray-100 text-black shadow-lg border-0 h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full p-0 transition-all duration-200"
                          >
                            <ChevronRight
                              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 font-bold"
                              strokeWidth={4}
                            />
                          </Button>
                        </motion.div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 md:w-32 h-1.5 sm:h-2 bg-black/30 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentImageIndex + 1) / images.length) * 100}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        </div>

                        {/* Image Counter - Made bigger */}
                        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-black/60 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 md:mt-6">
                    <Badge
                      className={`${getConditionColor(book.condition)} text-sm sm:text-base md:text-lg lg:text-xl font-semibold px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 lg:py-2.5 h-6 sm:h-7 md:h-8 lg:h-10 shadow-lg border-0`}
                    >
                      {book.condition}
                    </Badge>
                    <Badge className="bg-white text-purple-700 font-bold text-sm sm:text-base md:text-lg lg:text-xl px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 lg:py-2.5 h-6 sm:h-7 md:h-8 lg:h-10 shadow-lg border-2 border-purple-200">
                      ${book.price}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2 sm:mb-3 md:mb-4 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
                      {book.description}
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 md:mr-4 flex-shrink-0" />
                      <span>Sold by: {book.sellerName}</span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 md:mr-4 flex-shrink-0" />
                      <span>Listed: {new Date(book.dateAdded).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 md:pt-6">
                    {isOwner ? (
                      <>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full font-semibold text-sm sm:text-base md:text-lg lg:text-xl py-2 sm:py-3 md:py-4 h-10 sm:h-12 md:h-14 lg:h-16 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                            onClick={() => {
                              window.location.href = `/edit-book/${book._id}`
                            }}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                            Edit Book
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full sm:w-auto font-semibold text-sm sm:text-base md:text-lg lg:text-xl py-2 sm:py-3 md:py-4 h-10 sm:h-12 md:h-14 lg:h-16 px-4 sm:px-6 md:px-8 bg-red-500 hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </motion.div>
                      </>
                    ) : (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                        <Button
                          onClick={() => window.open(book.sellerProfile, "_blank")}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold text-sm sm:text-base md:text-lg lg:text-xl py-2 sm:py-3 md:py-4 h-10 sm:h-12 md:h-14 lg:h-16"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                          Contact Seller
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {isImageFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-2 sm:p-4"
            onClick={() => setIsImageFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentImage || "/placeholder.svg"}
                alt={book.title}
                width={1200}
                height={800}
                className="object-contain max-h-[90vh] w-auto"
                onError={() => setImageError(true)}
                sizes="100vw"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/80 hover:bg-white/90 h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setIsImageFullscreen(false)}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
