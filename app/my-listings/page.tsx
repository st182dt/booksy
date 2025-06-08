"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Book } from "@/lib/types"
import BookCard from "@/components/BookCard"
import { BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MyListingsPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchBooks()
  }, [])

  const checkAuthAndFetchBooks = async () => {
    try {
      const authResponse = await fetch("/api/auth/me")
      if (!authResponse.ok) {
        router.push("/")
        return
      }

      const userData = await authResponse.json()
      setCurrentUserId(userData.userId)
      setIsAdmin(userData.admin || false)

      const booksResponse = await fetch("/api/books/my-listings")
      if (booksResponse.ok) {
        const data = await booksResponse.json()
        setBooks(data)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pendingBooks = books.filter((book) => book.toVerify)
  const approvedBooks = books.filter((book) => !book.toVerify)

  return (
    <div className="space-y-8 px-2 sm:px-4 lg:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <BookOpen className="h-16 w-16 mx-auto text-purple-600 mb-4" />
        <h1 className="text-3xl font-bold gradient-text mb-2">My Listings</h1>
        <p className="text-gray-600">Manage your books on the marketplace</p>
      </motion.div>

      {/* Results Count - Above the grid */}
      {books.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-base sm:text-lg font-semibold text-gray-700 bg-white/80 backdrop-blur-md rounded-full px-6 py-2 inline-block shadow-sm border border-gray-200">
            {books.length} book{books.length !== 1 ? "s" : ""} listed
            {pendingBooks.length > 0 && (
              <span className="ml-2 text-yellow-600">({pendingBooks.length} pending verification)</span>
            )}
          </p>
        </motion.div>
      )}

      {/* Pending Verification Notice */}
      {pendingBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mx-2 sm:mx-0"
        >
          <div className="flex items-center justify-center text-center">
            <div className="text-yellow-800">
              <h3 className="font-semibold mb-1">Books Pending Verification</h3>
              <p className="text-sm">
                {pendingBooks.length} of your book{pendingBooks.length !== 1 ? "s are" : " is"} waiting for admin
                approval. They will appear in the marketplace once verified.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {books.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={books.length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
          >
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onUpdate={checkAuthAndFetchBooks}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto shadow-lg border border-gray-200">
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No books listed yet</h3>
            <p className="text-gray-500">
              Start by adding your first book to the marketplace using the navigation menu above!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
