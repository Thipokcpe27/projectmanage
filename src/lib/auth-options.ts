import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // ดึงข้อมูลผู้ใช้จาก DB
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { department: true },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.departmentId = dbUser.departmentId
          session.user.department = dbUser.department
          session.user.isActive = dbUser.is_active
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // ตรวจสอบว่าผู้ใช้มีอยู่ใน DB หรือไม่
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      // ถ้ายังไม่มี ให้สร้างใหม่ด้วย role READONLY
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name || 'Unknown',
            role: 'READONLY',
            image: user.image,
            is_active: true,
          },
        })
      }

      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
