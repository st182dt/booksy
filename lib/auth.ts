import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { Session } from "./types"

const secretKey = process.env.JWT_SECRET

if (!secretKey) {
  console.error("JWT_SECRET environment variable is missing")
  throw new Error("JWT_SECRET environment variable is required")
}

const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: Session) {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(key)
  } catch (error) {
    console.error("JWT encryption failed:", error)
    throw new Error("Failed to create session token")
  }
}

export async function decrypt(input: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    })
    return payload as Session
  } catch (error) {
    console.error("JWT decryption failed:", error)
    return null
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value
    if (!session) return null
    return await decrypt(session)
  } catch (error) {
    console.error("Failed to get session:", error)
    return null
  }
}

export async function setSession(session: Session) {
  try {
    const token = await encrypt(session)
    const cookieStore = await cookies()
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })
  } catch (error) {
    console.error("Failed to set session:", error)
    throw new Error("Failed to create session")
  }
}

export async function clearSession() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session")
  } catch (error) {
    console.error("Failed to clear session:", error)
  }
}
