"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Book } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, User, Eye, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import BookDetailModal from "./BookDetailModal"

interface BookCardProps {
  book: Book
  currentUserId?: string
  isAdmin?: boolean
  onUpdate?: () => void
}

export default function BookCard({ book, currentUserId, isAdmin, onUpdate }: BookCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

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

  // Safely get the first image URL
  const getDisplayImage = () => {
    if (!book.imageUrl) return "/placeholder.svg?height=200&width=300"

    if (Array.isArray(book.imageUrl)) {
      const firstImage = book.imageUrl.find((url) => url && url.trim() !== "")
      return firstImage || "/placeholder.svg?height=200&width=300"
    }

    return book.imageUrl.trim() !== "" ? book.imageUrl : "/placeholder.svg?height=200&width=300"
  }

  const displayImage = imageError ? "/placeholder.svg?height=200&width=300" : getDisplayImage()

  const handleVerifyBook = async () => {
    if (!isAdmin || isProcessing) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/books/${book._id}/verify`, {
        method: "POST",
      })

      if (response.ok) {
        onUpdate?.()
      } else {
        console.error("Failed to verify book")
      }
    } catch (error) {
      console.error("Error verifying book:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDenyBook = async () => {
    if (!isAdmin || isProcessing) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/books/${book._id}/deny`, {
        method: "POST",
      })

      if (response.ok) {
        onUpdate?.()
      } else {
        console.error("Failed to deny book")
      }
    } catch (error) {
      console.error("Error denying book:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group w-full"
      >
        <div className="relative h-48 xs:h-52 sm:h-56 md:h-60 lg:h-64 overflow-hidden">
          <Image
            src={displayImage || "/placeholder.svg"}
            alt={book.title}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              book.toVerify ? "grayscale" : ""
            }`}
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Verification Status Indicator - Question mark in center */}
          {book.toVerify && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-yellow-500 text-white rounded-full p-4 shadow-lg">
                <HelpCircle className="h-8 w-8" />
              </div>
            </div>
          )}

          {/* Condition Badge */}
          <div className="absolute top-2 sm:top-3 md:top-3 right-2 sm:right-3 md:right-3">
            <Badge
              className={`${getConditionColor(book.condition)} text-sm sm:text-base md:text-lg font-semibold px-2 sm:px-3 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-2 h-6 sm:h-7 md:h-8 lg:h-9 shadow-lg border-0`}
            >
              {book.condition === "Like New" ? "Like New" : book.condition}
            </Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute top-2 sm:top-3 md:top-3 left-2 sm:left-3 md:left-3">
            <Badge className="bg-white text-purple-700 font-bold text-sm sm:text-base md:text-lg px-2 sm:px-3 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-2 h-6 sm:h-7 md:h-8 lg:h-9 shadow-lg border-2 border-purple-200">
              ${book.price}
            </Badge>
          </div>

          {/* Admin Controls for Books Needing Verification - Bottom corners */}
          {isAdmin && book.toVerify && (
            <>
              {/* Accept Button - Bottom Left */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-2 sm:bottom-3 md:bottom-3 left-2 sm:left-3 md:left-3"
              >
                <Button
                  onClick={handleVerifyBook}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 shadow-lg"
                >
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  Accept
                </Button>
              </motion.div>

              {/* Deny Button - Bottom Right */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-2 sm:bottom-3 md:bottom-3 right-2 sm:right-3 md:right-3"
              >
                <Button
                  onClick={handleDenyBook}
                  disabled={isProcessing}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 shadow-lg"
                >
                  <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  Deny
                </Button>
              </motion.div>
            </>
          )}
        </div>

        <div className="p-3 sm:p-4 md:p-5">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 line-clamp-2 text-gray-800 leading-tight">
            {book.title}
          </h3>

          <div className="space-y-1.5 sm:space-y-2 md:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            <div className="flex items-center">
              <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1.5 sm:mr-2 md:mr-2 flex-shrink-0" />
              <span className="truncate">{book.sellerName}</span>
            </div>

            <div className="flex items-center">
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1.5 sm:mr-2 md:mr-2 flex-shrink-0" />
              <span className="truncate">{new Date(book.dateAdded).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-2.5 md:gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                onClick={() => setIsDetailModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold text-xs sm:text-sm h-8 sm:h-9 md:h-10"
              >
                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-1.5 md:mr-2" />
                <span className="hidden xs:inline">View Details</span>
                <span className="xs:hidden">View</span>
              </Button>
            </motion.div>

            {currentUserId !== book.userId && !book.toVerify && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(book.sellerProfile, "_blank")}
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
                >
                  <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <BookDetailModal
        book={book}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        currentUserId={currentUserId}
        onUpdate={onUpdate}
      />
    </>
  )
}
