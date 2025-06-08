export interface Book {
  _id?: string
  title: string
  condition: "New" | "Like New" | "Good" | "Fair" | "Poor"
  imageUrl: string | string[]
  sellerName: string
  sellerProfile: string
  dateAdded: Date
  description: string
  userId: string
  price: number
  toVerify?: boolean
}

export interface User {
  _id?: string
  email: string
  name: string
  password: string
  createdAt: Date
  lastUsedSellerProfile?: string
  admin?: boolean
}

export interface Session {
  userId: string
  email: string
  name: string
  admin?: boolean
}
