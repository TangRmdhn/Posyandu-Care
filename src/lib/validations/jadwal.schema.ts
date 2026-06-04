import { z } from 'zod'

export const jadwalSchema = z.object({
  tgl_pelaksanaan: z
    .string()
    .min(1, 'Tanggal wajib diisi')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Tanggal tidak valid'),
  jam: z.string().min(1, 'Jam wajib diisi'),
  lokasi: z.string().min(2, 'Lokasi wajib diisi'),
  kuota: z.coerce.number().int('Kuota harus bilangan bulat').min(1, 'Kuota minimal 1').max(500, 'Kuota maksimal 500'),
  catatan: z.string().optional(),
})

export const JADWAL_STATUSES = ['open', 'closed', 'done', 'cancelled'] as const
export type JadwalStatus = (typeof JADWAL_STATUSES)[number]
