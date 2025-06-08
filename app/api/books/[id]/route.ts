import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Validate ObjectId format to prevent injection
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid book ID format" }, { status: 400 })
    }

    const db = await getDatabase()
    const books = db.collection("books")

    const book = await books.findOne({ _id: new ObjectId(id) })

    if (!book) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error("Error fetching book:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Validate ObjectId format to prevent injection
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid book ID format" }, { status: 400 })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const bookData = await request.json()
    const db = await getDatabase()
    const books = db.collection("books")

    // Check if user owns the book
    const existingBook = await books.findOne({ _id: new ObjectId(id) })
    if (!existingBook || existingBook.userId !== session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const result = await books.updateOne({ _id: new ObjectId(id) }, { $set: { ...bookData, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Book updated successfully" })
  } catch (error) {
    console.error("Error updating book:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Validate ObjectId format to prevent injection
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid book ID format" }, { status: 400 })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const db = await getDatabase()
    const books = db.collection("books")

    // Check if user owns the book
    const existingBook = await books.findOne({ _id: new ObjectId(id) })
    if (!existingBook || existingBook.userId !== session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const result = await books.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Book deleted successfully" })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
