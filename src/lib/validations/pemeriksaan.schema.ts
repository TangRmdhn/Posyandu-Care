import { z } from 'zod'

export const pemeriksaanSchema = z.object({
  id_anak: z.string().uuid().optional(),
  id_reservasi: z.string().uuid().optional(),
  berat_badan: z
    .number()
    .min(0.5, 'Weight seems too low — please verify')    // VR-01
    .max(50, 'Weight seems too high — please verify'),   // VR-01
  tinggi_badan: z
    .number()
    .min(30, 'Height seems too low — please verify')    // VR-02
    .max(150, 'Height seems too high — please verify'), // VR-02
  lingkar_kepala: z.number().min(20).max(70).optional(),
  lingkar_lengan_atas: z.number().min(5).max(40).optional(),
})

export const saranMedisSchema = z.object({
  id_pemeriksaan: z.string().uuid(),
  saran_medis: z.string().min(10, 'Medical advice must be at least 10 characters'),
  pemberian_bantuan_medis: z.string().optional(),
})

export type PemeriksaanInput = z.infer<typeof pemeriksaanSchema>
export type SaranMedisInput = z.infer<typeof saranMedisSchema>
