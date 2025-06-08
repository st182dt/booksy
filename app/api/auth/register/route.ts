import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/mongodb"
import { setSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Input validation
    if (!email || !password || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (typeof email !== "string" || !email.includes("@") || email.length > 255) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 100) {
      return NextResponse.json({ message: "Password must be between 8-100 characters" }, { status: 400 })
    }

    if (typeof name !== "string" || name.length < 2 || name.length > 50) {
      return NextResponse.json({ message: "Name must be between 2-50 characters" }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedName = name.replace(/[<>]/g, "").trim()

    const db = await getDatabase()
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password with higher cost factor for better security
    const hashedPassword = await bcrypt.hash(password, 14)

    // Create user
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      name: sanitizedName,
      createdAt: new Date(),
      admin: false,
    })

    // Set session
    await setSession({
      userId: result.insertedId.toString(),
      email,
      name: sanitizedName,
      admin: false,
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
