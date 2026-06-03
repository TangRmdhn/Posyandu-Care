import { z } from 'zod'

export const registerAnakSchema = z.object({
  nama_anak: z.string().min(2, 'Child name is required'),
  nik: z.string().length(16, 'NIK must be exactly 16 digits').regex(/^\d+$/, 'NIK must be numeric'),
  tgl_lahir: z.string().refine(
    (val) => {
      const date = new Date(val)
      return date <= new Date() // VR-03: date cannot be in the future
    },
    'Date of birth cannot be in the future'
  ),
  tempat_lahir: z.string().min(2, 'Place of birth is required'),
  jenis_kelamin: z.enum(['L', 'P'], { message: 'Gender is required' }),
  rt: z.string().min(1, 'RT is required'),
  rw: z.string().min(1, 'RW is required'),
})

export type RegisterAnakInput = z.infer<typeof registerAnakSchema>
