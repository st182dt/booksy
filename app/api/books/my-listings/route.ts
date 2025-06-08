import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const db = await getDatabase()
    const books = db.collection("books")

    const userBooks = await books.find({ userId: session.userId }).sort({ dateAdded: -1 }).toArray()

    return NextResponse.json(userBooks)
  } catch (error) {
    console.error("Error fetching user books:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
