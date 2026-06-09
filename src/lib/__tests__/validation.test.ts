import { describe, it, expect } from 'vitest'
import { slugify, artikelSchema } from '../validations/artikel.schema'
import { jadwalSchema } from '../validations/jadwal.schema'
import { registerAnakSchema } from '../validations/anak.schema'

describe('slugify', () => {
  it('lowercases and dashes', () => {
    expect(slugify('Gizi Seimbang untuk Balita!')).toBe('gizi-seimbang-untuk-balita')
  })
  it('trims leading/trailing separators', () => {
    expect(slugify('  --Stunting--  ')).toBe('stunting')
  })
})

describe('jadwalSchema', () => {
  const base = { tgl_pelaksanaan: '2026-07-01', jam: '08:00', lokasi: 'Balai RW 04', kuota: 30 }
  it('accepts valid input', () => {
    expect(jadwalSchema.safeParse(base).success).toBe(true)
  })
  it('rejects kuota < 1', () => {
    expect(jadwalSchema.safeParse({ ...base, kuota: 0 }).success).toBe(false)
  })
  it('coerces a numeric string kuota', () => {
    const r = jadwalSchema.safeParse({ ...base, kuota: '25' })
    expect(r.success && r.data.kuota).toBe(25)
  })
})

describe('registerAnakSchema', () => {
  const base = {
    nama_anak: 'Budi', nik: '1234567890123456', tgl_lahir: '2025-01-01',
    tempat_lahir: 'Bandung', jenis_kelamin: 'L', rt: '001', rw: '004',
  }
  it('accepts valid input', () => {
    expect(registerAnakSchema.safeParse(base).success).toBe(true)
  })
  it('rejects a 15-digit NIK', () => {
    expect(registerAnakSchema.safeParse({ ...base, nik: '123456789012345' }).success).toBe(false)
  })
  it('rejects a future birth date', () => {
    expect(registerAnakSchema.safeParse({ ...base, tgl_lahir: '2999-01-01' }).success).toBe(false)
  })
})

describe('artikelSchema', () => {
  it('requires konten length', () => {
    expect(artikelSchema.safeParse({ judul: 'Judul ok', konten: 'short' }).success).toBe(false)
    expect(artikelSchema.safeParse({ judul: 'Judul ok', konten: 'konten yang cukup panjang' }).success).toBe(true)
  })
})
