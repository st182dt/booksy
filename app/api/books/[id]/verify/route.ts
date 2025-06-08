import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.admin) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid book ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const books = db.collection("books")

    const result = await books.updateOne({ _id: new ObjectId(id) }, { $unset: { toVerify: "" } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Book verified successfully" })
  } catch (error) {
    console.error("Error verifying book:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
