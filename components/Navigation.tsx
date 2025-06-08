"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, User, Plus, LogOut, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AuthModal from "./AuthModal"

export default function Navigation() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      window.location.reload()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-600" />
              <span className="text-base sm:text-lg md:text-xl font-bold gradient-text">BookMarket</span>
            </Link>

            {/* Desktop Navigation - Absolutely Centered */}
            <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-6 xl:space-x-8">
                <Link
                  href="/"
                  className={`nav-link text-sm xl:text-base ${isActive("/") ? "text-purple-600 bg-purple-50" : ""}`}
                >
                  All Books
                </Link>

                {user && (
                  <Link
                    href="/my-listings"
                    className={`nav-link text-sm xl:text-base ${isActive("/my-listings") ? "text-purple-600 bg-purple-50" : ""}`}
                  >
                    My Listings
                  </Link>
                )}

                {user && (
                  <Link
                    href="/add-book"
                    className={`nav-button text-sm xl:text-base ${isActive("/add-book") ? "from-blue-600 to-purple-700" : ""}`}
                  >
                    <Plus className="h-3.5 w-3.5 xl:h-4 xl:w-4 mr-1.5 xl:mr-2" />
                    Add Book
                  </Link>
                )}
              </div>
            </div>

            {/* Auth Section - Desktop */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              {user ? (
                <div className="flex items-center space-x-3 xl:space-x-4">
                  <span className="text-gray-700 font-medium text-sm xl:text-base truncate max-w-32 xl:max-w-none">
                    Hello, {user.name}
                  </span>
                  <button onClick={handleLogout} className="nav-button-outline text-sm xl:text-base">
                    <LogOut className="h-3.5 w-3.5 xl:h-4 xl:w-4 mr-1.5 xl:mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="nav-button text-sm xl:text-base">
                  <User className="h-3.5 w-3.5 xl:h-4 xl:w-4 mr-1.5 xl:mr-2" />
                  Login
                </button>
              )}
            </div>

            {/* Mobile/Tablet Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md overflow-hidden"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3"
              >
                <Link
                  href="/"
                  className={`block font-semibold py-2 px-3 rounded-lg transition-all text-sm sm:text-base ${
                    isActive("/") ? "text-purple-600 bg-purple-50 font-bold" : "text-gray-700 hover:text-purple-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Books
                </Link>
                {user && (
                  <>
                    <Link
                      href="/my-listings"
                      className={`block font-semibold py-2 px-3 rounded-lg transition-all text-sm sm:text-base ${
                        isActive("/my-listings")
                          ? "text-purple-600 bg-purple-50 font-bold"
                          : "text-gray-700 hover:text-purple-600"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Listings
                    </Link>
                    <Link href="/add-book" className="block" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-sm sm:text-base h-9 sm:h-10 ${
                          isActive("/add-book") ? "from-blue-600 to-purple-700" : ""
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Add Book
                      </Button>
                    </Link>
                  </>
                )}
                {user ? (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full font-semibold text-sm sm:text-base h-9 sm:h-10"
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full font-semibold text-sm sm:text-base h-9 sm:h-10"
                  >
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Login
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false)
          checkAuth()
        }}
      />
    </>
  )
}
