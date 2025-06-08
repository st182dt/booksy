"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Book } from "@/lib/types"
import BookCard from "@/components/BookCard"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Filter, ArrowUpDown, ChevronDown } from "lucide-react"

// Define all possible book conditions
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"] as const
type BookCondition = (typeof CONDITIONS)[number]

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("dateAdded")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedConditions, setSelectedConditions] = useState<BookCondition[]>([...CONDITIONS])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (currentUserId !== undefined) {
      fetchBooks()
    }
  }, [currentUserId, isAdmin])

  useEffect(() => {
    filterAndSortBooks()
  }, [books, searchTerm, sortBy, sortOrder, selectedConditions])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        console.log("User data:", userData) // Debug log
        setCurrentUserId(userData.userId)
        setIsAdmin(userData.admin || false)
      } else {
        setCurrentUserId("")
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setCurrentUserId("")
      setIsAdmin(false)
    }
  }

  const fetchBooks = async () => {
    try {
      const baseUrl = typeof window === "undefined" ? "http://localhost:3000" : ""
      const response = await fetch(`${baseUrl}/api/books`, {
        cache: "no-store",
        credentials: "include", // Ensure cookies are sent
      })
      if (!response.ok) {
        throw new Error("Failed to fetch books")
      }
      const data = await response.json()
      console.log("Fetched books:", data.length) // Debug log
      console.log("Books with toVerify:", data.filter((book: Book) => book.toVerify).length) // Debug log
      setBooks(data)
    } catch (error) {
      console.error("Failed to fetch books:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortBooks = () => {
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        selectedConditions.includes(book.condition as BookCondition),
    )

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "condition":
          // Fixed condition order: New -> Like New -> Good -> Fair -> Poor
          const conditionOrder: Record<string, number> = {
            New: 0,
            "Like New": 1,
            Good: 2,
            Fair: 3,
            Poor: 4,
          }
          const aConditionValue = conditionOrder[a.condition] ?? 999
          const bConditionValue = conditionOrder[b.condition] ?? 999
          comparison = aConditionValue - bConditionValue
          break
        case "price":
          comparison = a.price - b.price
          break
        case "dateAdded":
        default:
          // For date, A-Z means newest first (most recent)
          comparison = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          break
      }

      // For date, we already handled the A-Z logic above, so don't reverse it
      if (sortBy === "dateAdded") {
        return sortOrder === "asc" ? comparison : -comparison
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredBooks(filtered)
  }

  const toggleSortOrder = () => {
    setIsAnimating(true)
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))

    // Reset animation after a short delay
    setTimeout(() => {
      setIsAnimating(false)
    }, 150)
  }

  const toggleCondition = (condition: BookCondition) => {
    setSelectedConditions((prev) => {
      if (prev.includes(condition)) {
        // Don't allow deselecting the last condition
        if (prev.length === 1) return prev
        return prev.filter((c) => c !== condition)
      } else {
        return [...prev, condition]
      }
    })
  }

  const selectAllConditions = () => {
    setSelectedConditions([...CONDITIONS])
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 sm:border-3 md:border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pendingBooks = books.filter((book) => book.toVerify)

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-4 lg:px-0">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 sm:py-8 md:py-10 lg:py-12"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold gradient-text mb-2 sm:mb-3 md:mb-4 px-2">
          Find Your Perfect Textbook
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-4">
          Buy and sell used school books with ease. Save money and help the environment!
        </p>
      </motion.div>

      {/* Results Count - Now above search panel */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <p className="text-base sm:text-lg font-semibold text-gray-700 bg-white/80 backdrop-blur-md rounded-full px-6 py-2 inline-block shadow-sm border border-gray-200">
          {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} found
          {isAdmin && pendingBooks.length > 0 && (
            <span className="ml-2 text-yellow-600">({pendingBooks.length} pending verification)</span>
          )}
        </p>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg border border-gray-200 mx-2 sm:mx-0"
      >
        {/* Mobile Layout (< sm) */}
        <div className="block sm:hidden space-y-3">
          {/* Search - Full Width */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-700">Search:</Label>
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-sm h-9 border-gray-300 focus:border-purple-500 focus:ring-purple-500 w-full"
              />
            </div>
          </div>

          {/* Order and Sort Row */}
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-medium text-gray-700">Order:</Label>
              <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                <Button
                  variant="outline"
                  onClick={toggleSortOrder}
                  className="w-full h-9 text-sm border-gray-300 hover:border-purple-300 hover:bg-purple-50 justify-start pl-3"
                >
                  <motion.div
                    animate={{ scale: isAnimating ? 1.2 : 1 }}
                    transition={{
                      duration: 0.15,
                      ease: "easeInOut",
                      type: "spring",
                      stiffness: 400,
                      damping: 10,
                    }}
                  >
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                  </motion.div>
                  {sortOrder === "asc" ? "A-Z" : "Z-A"}
                </Button>
              </motion.div>
            </div>

            <div className="col-span-3 space-y-1">
              <Label className="text-xs font-medium text-gray-700">Sort:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500 w-full">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="dateAdded">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter - Full Width */}
          <div className="w-full space-y-1 relative">
            <Label className="text-xs font-medium text-gray-700">Filter:</Label>
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full h-9 text-sm border-gray-300 hover:border-purple-300 hover:bg-purple-50 px-2 ${
                isFilterOpen ? "bg-purple-50 border-purple-300" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="flex items-center min-w-0">
                  <Filter className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Condition ({selectedConditions.length})</span>
                </span>
                <motion.div
                  animate={{ rotate: isFilterOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="ml-1 flex-shrink-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </div>
            </Button>

            {/* Mobile Filter Dropdown */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3"
                >
                  <div className="flex items-center justify-start mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllConditions}
                      className="text-purple-600 h-6 text-xs font-medium p-1"
                    >
                      Select All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {CONDITIONS.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-condition-${condition}`}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={() => toggleCondition(condition)}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`mobile-condition-${condition}`}
                          className="text-xs font-medium leading-none cursor-pointer flex-1"
                        >
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tablet Layout (sm to lg) */}
        <div className="hidden sm:block lg:hidden">
          <div className="space-y-4">
            {/* Search - Full Width */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Search:</Label>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 w-full"
                />
              </div>
            </div>

            {/* Order and Sort - Top Row */}
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-2 space-y-1">
                <Label className="text-sm font-medium text-gray-700">Order:</Label>
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button
                    variant="outline"
                    onClick={toggleSortOrder}
                    className="w-full border-gray-300 hover:border-purple-300 hover:bg-purple-50 justify-start pl-3"
                  >
                    <motion.div
                      animate={{ scale: isAnimating ? 1.2 : 1 }}
                      transition={{
                        duration: 0.15,
                        ease: "easeInOut",
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                    </motion.div>
                    {sortOrder === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                </motion.div>
              </div>

              <div className="col-span-3 space-y-1">
                <Label className="text-sm font-medium text-gray-700">Sort by:</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    <SelectItem value="dateAdded">Date Added</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter - Bottom Row, Full Width */}
            <div className="w-full space-y-1 relative">
              <Label className="text-sm font-medium text-gray-700">Filter:</Label>
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full border-gray-300 hover:border-purple-300 hover:bg-purple-50 px-3 ${
                  isFilterOpen ? "bg-purple-50 border-purple-300" : ""
                }`}
              >
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="flex items-center min-w-0">
                    <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Condition ({selectedConditions.length})</span>
                  </span>
                  <motion.div
                    animate={{ rotate: isFilterOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="ml-2 flex-shrink-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </div>
              </Button>

              {/* Tablet Filter Dropdown */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4"
                  >
                    <div className="flex items-center justify-start mb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllConditions}
                        className="text-purple-600 h-8 text-sm font-medium"
                      >
                        Select All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CONDITIONS.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tablet-condition-${condition}`}
                            checked={selectedConditions.includes(condition)}
                            onCheckedChange={() => toggleCondition(condition)}
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`tablet-condition-${condition}`}
                            className="text-sm font-medium leading-none cursor-pointer flex-1"
                          >
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Desktop Layout (lg+) */}
        <div className="hidden lg:block">
          <div className="space-y-4">
            {/* Search - Full Width */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Search:</Label>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 w-full"
                />
              </div>
            </div>

            <div className="flex gap-4 items-end">
              {/* Order - Smaller Width, Left Aligned */}
              <div className="w-2/12 space-y-1">
                <Label className="text-sm font-medium text-gray-700">Order:</Label>
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button
                    variant="outline"
                    onClick={toggleSortOrder}
                    className="w-full h-9 text-sm border-gray-300 hover:border-purple-300 hover:bg-purple-50 justify-start pl-3"
                  >
                    <motion.div
                      animate={{ scale: isAnimating ? 1.2 : 1 }}
                      transition={{
                        duration: 0.15,
                        ease: "easeInOut",
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                    </motion.div>
                    {sortOrder === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                </motion.div>
              </div>

              {/* Sort - Equal Width */}
              <div className="w-5/12 space-y-1">
                <Label className="text-sm font-medium text-gray-700">Sort by:</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    <SelectItem value="dateAdded">Date Added</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter - Equal Width */}
              <div className="w-5/12 space-y-1 relative">
                <Label className="text-sm font-medium text-gray-700">Filter:</Label>
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`w-full h-9 border-gray-300 hover:border-purple-300 hover:bg-purple-50 px-3 ${
                    isFilterOpen ? "bg-purple-50 border-purple-300" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="flex items-center min-w-0">
                      <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Condition ({selectedConditions.length})</span>
                    </span>
                    <motion.div
                      animate={{ rotate: isFilterOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="ml-2 flex-shrink-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </div>
                </Button>

                {/* Desktop Filter Dropdown */}
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4"
                    >
                      <div className="flex items-center justify-start mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={selectAllConditions}
                          className="text-purple-600 h-8 text-sm font-medium"
                        >
                          Select All
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {CONDITIONS.map((condition) => (
                          <div key={condition} className="flex items-center space-x-3">
                            <Checkbox
                              id={`desktop-condition-${condition}`}
                              checked={selectedConditions.includes(condition)}
                              onCheckedChange={() => toggleCondition(condition)}
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor={`desktop-condition-${condition}`}
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
                            >
                              {condition}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Books Grid - Wider cards (fewer columns) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filteredBooks.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 px-2 sm:px-0"
        >
          {filteredBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onUpdate={fetchBooks}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredBooks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 sm:py-10 md:py-12 px-4"
        >
          <p className="text-lg sm:text-xl text-gray-600 mb-2">No books found matching your criteria.</p>
          <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters.</p>
        </motion.div>
      )}
    </div>
  )
}
