import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerOrangTuaSchema = z.object({
  nama: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  no_hp: z.string().regex(/^[0-9]{10,13}$/, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterOrangTuaInput = z.infer<typeof registerOrangTuaSchema>
