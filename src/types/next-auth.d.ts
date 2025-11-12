import { Role } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
      departmentId?: string | null
      department?: {
        id: string
        code: string
        name: string
      } | null
      isActive: boolean
    }
  }

  interface User {
    id: string
    role: Role
    departmentId?: string | null
    isActive: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    departmentId?: string | null
    isActive: boolean
  }
}
