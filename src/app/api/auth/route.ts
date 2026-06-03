import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { registerOrangTuaSchema } from '@/lib/validations/auth.schema'

// POST /api/auth — register new ortu account
export async function POST(request: NextRequest) {
  const body = await request.json()

  const result = registerOrangTuaSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { email, password, nama, no_hp } = result.data
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nama, no_hp },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (data.user) {
    await supabase
      .from('profiles')
      .update({ no_hp })
      .eq('id', data.user.id)
  }

  return NextResponse.json({ success: true, userId: data.user?.id }, { status: 201 })
}
