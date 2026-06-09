import { z } from 'zod'

export const artikelSchema = z.object({
  judul: z.string().min(3, 'Judul minimal 3 karakter'),
  ringkasan: z.string().optional(),
  konten: z.string().min(10, 'Konten minimal 10 karakter'),
  kategori: z.string().optional(),
})

export const ARTIKEL_KATEGORI = ['Gizi', 'Imunisasi', 'Stunting', 'ASI/MPASI', 'Tumbuh Kembang', 'Kesehatan Ibu'] as const

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
