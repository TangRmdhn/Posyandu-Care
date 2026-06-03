import { NextRequest, NextResponse } from 'next/server'
import { calculateNutritionalStatus } from '@/lib/zscore'
import { z } from 'zod'

const schema = z.object({
  berat_badan: z.number(),
  tinggi_badan: z.number(),
  tgl_lahir: z.string(),
  jenis_kelamin: z.enum(['L', 'P']),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const zscoreResult = calculateNutritionalStatus(result.data)
  return NextResponse.json(zscoreResult)
}
