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
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const bookData = await request.json()

    // Basic validation
    if (!bookData.title || typeof bookData.title !== "string" || bookData.title.length > 200) {
      return NextResponse.json({ message: "Invalid title" }, { status: 400 })
    }

    if (!["New", "Like New", "Good", "Fair", "Poor"].includes(bookData.condition)) {
      return NextResponse.json({ message: "Invalid condition" }, { status: 400 })
    }

    if (typeof bookData.price !== "number" || bookData.price < 0 || bookData.price > 10000) {
      return NextResponse.json({ message: "Invalid price" }, { status: 400 })
    }

    if (
      !bookData.description ||
      typeof bookData.description !== "string" ||
      bookData.description.length < 10 ||
      bookData.description.length > 1000
    ) {
      return NextResponse.json({ message: "Description must be between 10-1000 characters" }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedTitle = bookData.title.replace(/[<>]/g, "").trim()
    const sanitizedDescription = bookData.description.replace(/[<>]/g, "").trim()

    const db = await getDatabase()
    const books = db.collection("books")

    const newBook = {
      title: sanitizedTitle,
      condition: bookData.condition,
      price: bookData.price,
      description: sanitizedDescription,
      sellerProfile: bookData.sellerProfile,
      imageUrl: bookData.imageUrl,
      userId: session.userId,
      sellerName: session.name,
      dateAdded: new Date(),
      toVerify: true, // All new books need verification
    }

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
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
