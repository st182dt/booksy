import { type NextRequest, NextResponse } from "next/server"

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

if (!IMGUR_CLIENT_ID) {
  throw new Error("IMGUR_CLIENT_ID environment variable is required")
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // const session = await getSession()
    // if (!session) {
    //   return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    // }

    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type. Only JPEG, PNG, WebP, and GIF allowed" }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: "File too large. Maximum size is 5MB" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Upload to Imgur
    const imgurResponse = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64,
        type: "base64",
      }),
    })

    if (!imgurResponse.ok) {
      throw new Error("Failed to upload to Imgur")
    }

    const imgurData = await imgurResponse.json()

    return NextResponse.json({
      url: imgurData.data.link,
      deleteHash: imgurData.data.deletehash,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}
