import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/mongodb"
import { setSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ email })

    if (!user) {
      // Add a small delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      // Add a small delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Update last login time
    await users.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    // Include admin status in session
    await setSession({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      admin: user.admin || false,
    })

    return NextResponse.json({ message: "Login successful" }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
