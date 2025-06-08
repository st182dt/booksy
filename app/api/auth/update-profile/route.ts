import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const { lastUsedSellerProfile } = await request.json()

    if (!lastUsedSellerProfile) {
      return NextResponse.json({ message: "Missing seller profile" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection("users")

    const result = await users.updateOne(
      { _id: new ObjectId(session.userId) },
      { $set: { lastUsedSellerProfile, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
