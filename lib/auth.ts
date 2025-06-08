import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { Session } from "./types"

const secretKey = process.env.JWT_SECRET

if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is required")
}

const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: Session) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    })
    return payload as Session
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return await decrypt(session)
}

export async function setSession(session: Session) {
  const token = await encrypt(session)
  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
