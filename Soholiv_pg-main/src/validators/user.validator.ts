import { z } from 'zod'
import { UserRole } from '@prisma/client'

// ============================================
// USER MANAGEMENT VALIDATORS
// ============================================

export const userCreateSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.nativeEnum(UserRole).default(UserRole.USER),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
})

export const userUpdateSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(UserRole).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
    isActive: z.boolean().optional(),
})

export const userQuerySchema = z.object({
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type UserQueryInput = z.infer<typeof userQuerySchema>
