import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { UserRole } from '@prisma/client'
import { getActiveUserRestriction } from '@/lib/restrictions'

if (!process.env.NEXTAUTH_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('NEXTAUTH_SECRET is required')
    }
    console.warn('NEXTAUTH_SECRET is not set. Using insecure defaults for development.')
}

if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV !== 'production') {
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
}

// Extend NextAuth types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            role: UserRole
        }
    }

    interface User {
        id: string
        email: string
        name: string
        role: UserRole
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: UserRole
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required')
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                if (!user) {
                    throw new Error('No user found with this email')
                }

                if (!user.isActive) {
                    throw new Error('Your account has been deactivated')
                }

                const restriction = await getActiveUserRestriction(user.id)
                if (restriction) {
                    if (restriction.type === 'SUSPENSION') {
                        throw new Error('Your account is temporarily suspended')
                    }
                    throw new Error('Your account has been blocked')
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error('Invalid password')
                }

                // Update last login
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                })

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id
                session.user.role = token.role
            }
            return session
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },

    secret: process.env.NEXTAUTH_SECRET,
}
