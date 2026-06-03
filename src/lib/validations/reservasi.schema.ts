import { z } from 'zod'

export const reservasiSchema = z.object({
  id_anak: z.string().uuid(),
  id_jadwal: z.string().uuid(),
})

export type ReservasiInput = z.infer<typeof reservasiSchema>
