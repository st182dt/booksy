import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const db = await getDatabase()
    const books = db.collection("books")

    // Get pagination parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(url.searchParams.get("limit") || "20"), 50) // Max 50 items per page
    const skip = (page - 1) * limit

    let query = {}

    // If user is not an admin, only show verified books
    if (!session?.admin) {
      query = { $or: [{ toVerify: { $ne: true } }, { toVerify: { $exists: false } }] }
    }

    const allBooks = await books.find(query).sort({ dateAdded: -1 }).skip(skip).limit(limit).toArray()

    // Don't expose sensitive data to non-admins
    const sanitizedBooks = allBooks.map((book) => {
      // Remove sensitive fields for non-admins and non-owners
      if (!session?.admin && session?.userId !== book.userId) {
        return {
          ...book,
          userId: undefined, // Don't expose user IDs
        }
      }
      return book
    })

    return NextResponse.json(sanitizedBooks)
  } catch (error) {
    console.error("Error fetching books:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ message: `Internal server error: ${errorMessage}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const bookData = await request.json()
    console.log("Received book data:", bookData) // Debug log

    // Basic validation with better error messages
    if (!bookData.title || typeof bookData.title !== "string") {
      return NextResponse.json({ message: "Title is required and must be a string" }, { status: 400 })
    }

    if (bookData.title.length > 200) {
      return NextResponse.json({ message: "Title must be less than 200 characters" }, { status: 400 })
    }

    if (!["New", "Like New", "Good", "Fair", "Poor"].includes(bookData.condition)) {
      return NextResponse.json(
        { message: "Invalid condition. Must be one of: New, Like New, Good, Fair, Poor" },
        { status: 400 },
      )
    }

    if (typeof bookData.price !== "number" || isNaN(bookData.price) || bookData.price < 0) {
      return NextResponse.json({ message: "Price must be a valid positive number" }, { status: 400 })
    }

    if (bookData.price > 10000) {
      return NextResponse.json({ message: "Price cannot exceed $10,000" }, { status: 400 })
    }

    if (!bookData.description || typeof bookData.description !== "string") {
      return NextResponse.json({ message: "Description is required and must be a string" }, { status: 400 })
    }

    if (bookData.description.length < 10) {
      return NextResponse.json({ message: "Description must be at least 10 characters long" }, { status: 400 })
    }

    if (bookData.description.length > 1000) {
      return NextResponse.json({ message: "Description must be less than 1000 characters" }, { status: 400 })
    }

    if (!bookData.sellerProfile || typeof bookData.sellerProfile !== "string") {
      return NextResponse.json({ message: "Seller profile URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(bookData.sellerProfile)
    } catch {
      return NextResponse.json({ message: "Seller profile must be a valid URL" }, { status: 400 })
    }

    if (!bookData.imageUrl || !Array.isArray(bookData.imageUrl) || bookData.imageUrl.length === 0) {
      return NextResponse.json({ message: "At least one image is required" }, { status: 400 })
    }

    // Validate image URLs
    for (const imageUrl of bookData.imageUrl) {
      if (!imageUrl || typeof imageUrl !== "string") {
        return NextResponse.json({ message: "All image URLs must be valid strings" }, { status: 400 })
      }
    }

    // Sanitize inputs
    const sanitizedTitle = bookData.title.replace(/[<>]/g, "").trim()
    const sanitizedDescription = bookData.description.replace(/[<>]/g, "").trim()

    const db = await getDatabase()
    const books = db.collection("books")

    const newBook = {
      title: sanitizedTitle,
      condition: bookData.condition,
      price: Number(bookData.price), // Ensure it's a number
      description: sanitizedDescription,
      sellerProfile: bookData.sellerProfile,
      imageUrl: bookData.imageUrl,
      userId: session.userId,
      sellerName: session.name,
      dateAdded: new Date(),
      toVerify: true, // All new books need verification
    }

    console.log("Creating book:", newBook) // Debug log

    const result = await books.insertOne(newBook)

    return NextResponse.json(
      {
        message: "Book submitted for verification. It will be available to other users once approved by an admin.",
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding book:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ message: `Internal server error: ${errorMessage}` }, { status: 500 })
  }
}
