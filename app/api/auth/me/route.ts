import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    // Get user data including lastUsedSellerProfile and admin status
    const db = await getDatabase()
    const users = db.collection("users")
    const user = await users.findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      name: session.name,
      lastUsedSellerProfile: user.lastUsedSellerProfile || "",
      admin: user.admin || false,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
